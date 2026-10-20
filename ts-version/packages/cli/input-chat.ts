type OpenAIChatResponse = {
	choices: { message: { content: string } }[];
};

type ClaudeChatResponse = {
	content: { text: string }[];
};

function startSpinner(): Timer {
	const frames = ["🌚", "🌒", "🌓", "🌔", "🌝", "🌖", "🌗", "🌘"];
	let frame = 0;
	process.stdout.write(frames[frame] ?? "");
	const intervalId = setInterval(() => {
		process.stdout.write("\r\x1b[K");
		process.stdout.write(frames[++frame % frames.length] ?? "");
	}, 100);
	return intervalId;
}

export async function createQuestionPrompt(
	questionTypePromise: Promise<string>,
	questionTopic: string,
	questionDifficulty: string,
	prevQuestions: string[],
): Promise<string> {
	let questionPrompt = `
    These are the previous questions that have been asked: ${prevQuestions.join(", ")}.
    Previous questions have been provided only to identify material to avoid.
  `;

	const questionType = await questionTypePromise;
	switch (questionType) {
		case "w":
			questionPrompt += `
        Ask me to write some code.
        It should be a coding question related to ${questionTopic}.
        The level of difficulty should be ${questionDifficulty},
        The answer to this should only be a few lines, 
        or a one liner if appropriate.
      `;
			break;
		case "r":
			questionPrompt += `
        Ask me a question where you will write show me a code snippet that has already been written.
        It should be related to ${questionTopic}.
        I will read through the code snippet and describe the output,
        say if it will result in an error,
        or spot any subtle bugs.
        The level of difficulty should be ${questionDifficulty},
      `;
			break;
		default:
			questionPrompt += `
        Ask me a conceptual question relating to ${questionTopic}
        The level of difficulty should be ${questionDifficulty},
      `;
			break;
	}

	questionPrompt +=
		"Please be concise. Shorter is better. Do not restate what we are doing.";

	return questionPrompt;
}

export function createGradingPrompt(question: string, answer: string): string {
	return `\
    The user was given this question: ${question}
    This is the answer they gave: ${answer}
    Please grade their response and give feedback.\
    If the user got the answer correct, tell them good job.\
    If the user did not get the answer correct, \
    tell them what they did right, what they did wrong, and what topics did they not understand.\
    Respond in a friendly tone. Please be brief. Short consise responses are best.\
    If the user responded with idk or similar, tell them it's okay and give a short description of the answer.\
    If the user responded with nonsense. Tell the user they are hallarious. Be patronizing about it.
    DO NOT GIVE THE USER ANOTHER QUESTION. ONLY GRADE!
    `;
}

export async function classifyQuestionType(
	provider: string,
	apiUrl: string,
	apiKey: string,
	model: string,
	questionType: string,
): Promise<string> {
	const message = `
    Consider the following text: ${questionType}.
    This was a response to the following question.
    "Do you want to write code, read code, or keep it conceptual?"
    Based on this text. Does this user want to write code, read code, or answer conceptual questions
    If the user wants to write code respond with only the single character 'w'
    If the user wants to read code, meaning that they want to read through code
    and describe the output or spot subtle bugs, respond with only the single character 'r'.
    Otherwise respond with the single character 'c'.
  `;
	const messages: { role: string; content: string }[] = [];
	messages.push({ role: "user", content: message });

	try {
		if (provider === "claude-api") {
			const requestBody = {
				model: model,
				messages: messages,
				max_tokens: 1,
			};
			const response = await fetch(`${apiUrl}/v1/messages`, {
				method: "POST",
				headers: {
					"x-api-key": apiKey,
					"anthropic-version": "2023-06-01",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				return `Request failed with status code ${response.status}`;
			}

			const payload = (await response.json()) as ClaudeChatResponse;
			return payload.content[0]?.text ?? "No Response";
		} else if (provider === "claude-cli" || provider === "codex-cli") {
			const termCmd = provider === "claude-cli" ? "claude" : "codex";
			const termArg = provider === "claude-cli" ? "-p" : "exec";
			try {
				const proc = Bun.spawn([termCmd, termArg, message], {
					stderr: "pipe",
				});

				const [response, exitCode] = await Promise.all([
					proc.stdout.text(),
					proc.exited,
				]);

				if (exitCode !== 0)
					return `'claude -p' failed during execution: ${response.trim()}`;

				return response.trim()[0] ?? "c";
			} catch (error) {
				return error instanceof Error
					? `Failed to run command '${termCmd} ${termArg}': ${error.message}`
					: `Failed to run command '${termCmd} ${termArg}"`;
			}
		} else {
			const requestBody = {
				model: model,
				messages: messages,
				max_tokens: 1,
				reasoning: { effort: "none" },
			};
			const response = await fetch(`${apiUrl}/v1/chat/completions`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				return `Request failed with status code ${response.status}`;
			}

			const payload = (await response.json()) as OpenAIChatResponse;

			return payload.choices[0]?.message?.content ?? "No Response";
		}
	} catch (error) {
		return error instanceof Error && error.name === "AbortError"
			? "Aborted"
			: "Request failed without status code";
	}
}

export async function getChatResponse(
	provider: string,
	apiUrl: string,
	apiKey: string,
	model: string,
	messages: { role: string; content: string }[],
	silentFlag = false,
): Promise<string> {
	let abortHandler: ((data: number[]) => void) | undefined;
	const abortController = new AbortController();
	if (!silentFlag) {
		abortHandler = (data: number[]) => {
			switch (data[0]) {
				case 27: {
					// 27 is escape key
					if (data.length === 1) abortController.abort();
					break;
				}
				case 3: {
					// 3 is ctrl c
					abortController.abort();
					process.stdin.setRawMode(false);
					process.exit(0);
				}
			}
		};
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.on("data", abortHandler);
	}

	try {
		if (provider === "claude-api") {
			const requestBody = {
				model: model,
				messages: messages,
				max_tokens: 1024,
			};
			const response = await fetch(`${apiUrl}/v1/messages`, {
				method: "POST",
				headers: {
					"x-api-key": apiKey,
					"anthropic-version": "2023-06-01",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
				signal: abortController.signal,
			});

			if (!response.ok) {
				return `Request failed with status code ${response.status}`;
			}

			const payload = (await response.json()) as ClaudeChatResponse;
			return payload.content[0]?.text ?? "No Response";
		} else if (provider === "claude-cli" || provider === "codex-cli") {
			const termCmd = provider === "claude-cli" ? "claude" : "codex";
			const termArg = provider === "claude-cli" ? "-p" : "exec";
			try {
				const proc = Bun.spawn([termCmd, termArg, JSON.stringify(messages)], {
					signal: abortController.signal,
					stderr: "pipe",
				});

				const [response, exitCode] = await Promise.all([
					proc.stdout.text(),
					proc.exited,
				]);

				if (abortController.signal.aborted) return "Aborted";

				if (exitCode !== 0)
					return `'${termCmd} ${termArg}' failed during execution: ${response.trim()}`;

				return response.trim();
			} catch (error) {
				return error instanceof Error
					? `Failed to run command '${termCmd} ${termArg}': ${error.message}`
					: `Failed to run command '${termCmd} ${termArg}'`;
			}
		} else {
			const requestBody = {
				model: model,
				messages: messages,
				reasoning: { effort: "none" },
			};
			const response = await fetch(`${apiUrl}/v1/chat/completions`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
				signal: abortController.signal,
			});

			if (!response.ok) {
				return `Request failed with status code ${response.status}`;
			}

			const payload = (await response.json()) as OpenAIChatResponse;

			return payload.choices[0]?.message?.content ?? "No Response";
		}
	} catch (error) {
		return error instanceof Error && error.name === "AbortError"
			? "Aborted"
			: "Request failed without status code";
	} finally {
		if (!silentFlag) {
			process.stdout.write("\r\x1b[K");
			process.stdin.setRawMode(false);
			if (abortHandler) process.stdin.removeListener("data", abortHandler);
		}
	}
}

export async function withSpinner<T>(p: Promise<T>): Promise<T> {
	const spinnerId = startSpinner();
	try {
		return await p;
	} finally {
		clearInterval(spinnerId);
		process.stdout.write("\r\x1b[k"); // clears spinner from tui
	}
}
