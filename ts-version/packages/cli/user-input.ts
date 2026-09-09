import { emitKeypressEvents } from "node:readline";

export async function getUserInput(
	questionForUser: string,
	hasPartition = true,
): Promise<string> {
	console.log(questionForUser);
	if (hasPartition) console.log("--------------------------------");

	return new Promise((resolve) => {
		let userResponse = "";
		emitKeypressEvents(process.stdin);
		process.stdin.setRawMode(true);
		process.stdin.resume();

		const handler = (str: string, key: { name: string; ctrl: boolean }) => {
			switch (key.name) {
				case "return":
					process.stdin.removeListener("keypress", handler);
					process.stdin.setRawMode(false);
					process.stdout.write("\n");
					if (hasPartition) console.log("--------------------------------");
					resolve(userResponse);
					break;
				case "c":
					if (key.ctrl) {
						process.stdin.setRawMode(false);
						process.exit();
					} else {
						if (str) {
							userResponse += str;
							process.stdout.write(str);
						}
					}
					break;
				default:
					if (str) {
						userResponse += str;
						process.stdout.write(str);
					}
					break;
			}
		};
		process.stdin.on("keypress", handler);
	});
}
