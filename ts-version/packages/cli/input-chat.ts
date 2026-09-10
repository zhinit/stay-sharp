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

export async function createInitialPrompt(
	questionTypePromise: Promise<string>,
	questionTopic: string,
	questionDifficulty: string,
): Promise<string> {
	let initialPrompt = "";
	const questionType = await questionTypePromise;
	switch (questionType) {
		case "w":
			initialPrompt = `
        Ask me to write some code.
        It should be a coding question related to ${questionTopic}.
        The level of difficulty should be ${questionDifficulty},
        The answer to this should only be a few lines, 
        or a one liner if appropriate.
      `;
			break;
		case "r":
			initialPrompt = `
        Ask me a question where you will write show me a code snippet that has already been written.
        It should be related to ${questionTopic}.
        I will read through the code snippet and describe the output,
        say if it will result in an error,
        or spot any subtle bugs.
        The level of difficulty should be ${questionDifficulty},
      `;
			break;
		default:
			initialPrompt = `
        Ask me a conceptual question relating to ${questionTopic}
        The level of difficulty should be ${questionDifficulty},
      `;
			break;
	}
	initialPrompt +=
		"Please be concise. Shorter is better. Do not restate what we are doing.";

	return initialPrompt;
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
		if (provider === "claude") {
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
): Promise<string> {
	const spinnerId = startSpinner();

	const abortHandler = (data: number[]) => {
		// 27 is escape key
		if (data[0] === 27) {
			abortController.abort();
		}
	};
	const abortController = new AbortController();
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.on("data", abortHandler);

	try {
		if (provider === "claude") {
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
		process.stdout.write("\r\x1b[K");
		clearInterval(spinnerId);
		process.stdin.setRawMode(false);
		process.stdin.removeListener("data", abortHandler);
	}
}
