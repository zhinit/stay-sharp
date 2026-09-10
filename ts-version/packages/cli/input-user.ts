import { emitKeypressEvents } from "node:readline";

type Key = { name: string; ctrl: boolean; meta: boolean; shift: boolean };

// with the kitty protocol on, these keys arrive as escape codes readline
// does not understand. the format is \x1b[<char code>;<modifier>u
// where modifier is 1 + (shift 1, alt 2, ctrl 4), so ;2 is shift, ;3 is alt, ;5 is ctrl
const KITTY_KEYS: Record<string, Key> = {
	"\x1b[99;5u": { name: "c", ctrl: true, meta: false, shift: false },
	"\x1b[106;5u": { name: "j", ctrl: true, meta: false, shift: false },
	"\x1b[127;3u": { name: "backspace", ctrl: false, meta: true, shift: false },
	"\x1b[13;2u": { name: "return", ctrl: false, meta: false, shift: true },
};

function isWordBoundary(ch: string): boolean {
	return ch === " " || ch === "\n";
}

function getCursorPosition(
	text: string,
	offset: number,
	termWidth: number,
): [number, number] {
	let col = 0;
	let row = 0;
	for (let i = 0; i < offset; i++) {
		if (text[i] === "\n") {
			row++;
			col = 0;
		} else {
			col++;
			if (col >= termWidth) {
				row++;
				col = 0;
			}
		}
	}
	return [col, row];
}

function redraw(
	text: string,
	cursor: number,
	cursorRow: number,
	termWidth: number,
): number {
	// move up to where input started
	if (cursorRow > 0) {
		// \x1b[nA moves cursor up n rows
		process.stdout.write(`\x1b[${cursorRow}A`);
	}
	// \r moves to column 0, \x1b[J clears from cursor to end of screen
	process.stdout.write("\r\x1b[J");

	// reprint the full buffer
	let col = 0;
	for (const ch of text) {
		if (ch === "\n") {
			process.stdout.write("\r\n");
			col = 0;
		} else {
			process.stdout.write(ch);
			col++;
			if (col >= termWidth) {
				process.stdout.write("\r\n");
				col = 0;
			}
		}
	}

	// move terminal cursor from end of buffer back to actual cursor position
	const [, endRow] = getCursorPosition(text, text.length, termWidth);
	const [curCol, curRow] = getCursorPosition(text, cursor, termWidth);

	const rowsBack = endRow - curRow;
	if (rowsBack > 0) {
		// \x1b[nA moves cursor up n rows
		process.stdout.write(`\x1b[${rowsBack}A`);
	}
	// \r moves to column 0
	process.stdout.write("\r");
	if (curCol > 0) {
		// \x1b[nC moves cursor right n columns
		process.stdout.write(`\x1b[${curCol}C`);
	}

	return curRow;
}

export async function getUserInput(
	questionForUser: string,
	hasPartition = true,
	prevUserInput = "",
): Promise<string> {
	console.log(questionForUser);
	if (hasPartition) console.log("--------------------------------");

	return new Promise((resolve) => {
		emitKeypressEvents(process.stdin);
		process.stdin.setRawMode(true);
		process.stdin.resume();
		// \x1b[>1u turns on the kitty keyboard protocol (flag 1)
		// with it on, keys like alt+backspace and shift+enter get their own escape codes
		process.stdout.write("\x1b[>1u");

		let userResponse = prevUserInput;
		let cursor = prevUserInput.length;
		const termWidth = process.stdout.columns;
		let cursorRow = redraw(userResponse, cursor, 0, termWidth);

		const handler = (str: string, rawKey: Key & { sequence: string }) => {
			// if readline did not recognize the sequence, check our kitty table
			const key = KITTY_KEYS[rawKey.sequence] ?? rawKey;
			switch (key.name) {
				case "return":
					if (key.shift) {
						userResponse = `${userResponse.slice(0, cursor)}\n${userResponse.slice(cursor)}`;
						cursor++;
						cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					} else {
						process.stdin.removeListener("keypress", handler);
						// \x1b[<u turns the kitty keyboard protocol off
						process.stdout.write("\x1b[<u");
						process.stdin.setRawMode(false);
						process.stdout.write("\n");
						if (hasPartition) console.log("--------------------------------");
						resolve(userResponse);
					}
					break;
				case "c":
					if (key.ctrl) {
						process.stdout.write("\x1b[<u");
						process.stdin.setRawMode(false);
						process.exit();
					} else {
						if (str) {
							userResponse =
								userResponse.slice(0, cursor) +
								str +
								userResponse.slice(cursor);
							cursor++;
							cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
						}
					}
					break;
				case "j":
					if (key.ctrl) {
						userResponse = `${userResponse.slice(0, cursor)}\n${userResponse.slice(cursor)}`;
						cursor++;
						cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					} else {
						if (str) {
							userResponse =
								userResponse.slice(0, cursor) +
								str +
								userResponse.slice(cursor);
							cursor++;
							cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
						}
					}
					break;
				case "backspace":
					if (key.meta && cursor > 0) {
						const start = cursor;
						while (cursor > 0 && isWordBoundary(userResponse[cursor - 1])) {
							cursor--;
						}
						while (cursor > 0 && !isWordBoundary(userResponse[cursor - 1])) {
							cursor--;
						}
						userResponse =
							userResponse.slice(0, cursor) + userResponse.slice(start);
						cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					} else if (cursor > 0) {
						userResponse =
							userResponse.slice(0, cursor - 1) + userResponse.slice(cursor);
						cursor--;
						cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					}
					break;
				case "up": {
					const [cursor_col] = getCursorPosition(
						userResponse,
						cursor,
						termWidth,
					);
					if (cursorRow > 0) {
						const target_col = cursor_col;
						let pos = 0;
						let r = 0;
						let c = 0;
						for (let i = 0; i < userResponse.length; i++) {
							if (r === cursorRow - 1 && c === target_col) {
								pos = i;
								break;
							}
							if (userResponse[i] === "\n") {
								if (r === cursorRow - 1) {
									pos = i;
									break;
								}
								r++;
								c = 0;
							} else {
								c++;
								if (c >= termWidth) {
									r++;
									c = 0;
								}
							}
						}
						cursor = pos;
						cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					}
					break;
				}
				case "left":
					if (key.meta) {
						while (cursor > 0 && isWordBoundary(userResponse[cursor - 1])) {
							cursor--;
						}
						while (cursor > 0 && !isWordBoundary(userResponse[cursor - 1])) {
							cursor--;
						}
					} else if (cursor > 0) {
						cursor--;
					}
					cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					break;
				case "down": {
					const [cursor_col] = getCursorPosition(
						userResponse,
						cursor,
						termWidth,
					);
					const [, end_row] = getCursorPosition(
						userResponse,
						userResponse.length,
						termWidth,
					);
					if (cursorRow < end_row) {
						const target_row = cursorRow + 1;
						const target_col = cursor_col;
						let pos = userResponse.length;
						let r = 0;
						let c = 0;
						for (let i = 0; i < userResponse.length; i++) {
							if (r === target_row && c === target_col) {
								pos = i;
								break;
							}
							if (r > target_row) {
								pos = i;
								break;
							}
							if (userResponse[i] === "\n") {
								if (r === target_row) {
									pos = i;
									break;
								}
								r++;
								c = 0;
							} else {
								c++;
								if (c >= termWidth) {
									r++;
									c = 0;
								}
							}
						}
						cursor = pos;
						cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					}
					break;
				}
				case "right":
					if (key.meta) {
						while (
							cursor < userResponse.length &&
							!isWordBoundary(userResponse[cursor])
						) {
							cursor++;
						}
						while (
							cursor < userResponse.length &&
							isWordBoundary(userResponse[cursor])
						) {
							cursor++;
						}
					} else if (cursor < userResponse.length) {
						cursor++;
					}
					cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					break;
				default:
					if (str) {
						userResponse =
							userResponse.slice(0, cursor) + str + userResponse.slice(cursor);
						cursor++;
						cursorRow = redraw(userResponse, cursor, cursorRow, termWidth);
					}
					break;
			}
		};
		process.stdin.on("keypress", handler);
	});
}
