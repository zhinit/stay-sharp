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

export async function getChatResponse(
	provider: string,
	apiUrl: string,
	apiKey: string,
	model: string,
	messages: { role: string; content: string }[],
): Promise<string> {
	const spinnerId = startSpinner();
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
			});

			if (!response.ok) {
				return `Request failed with status code ${response.status}`;
			}

			const payload = (await response.json()) as OpenAIChatResponse;

			return payload.choices[0]?.message?.content ?? "No Response";
		}
	} catch {
		return "Request failed without status code";
	} finally {
		process.stdout.write("\r\x1b[K");
		clearInterval(spinnerId);
	}
}
