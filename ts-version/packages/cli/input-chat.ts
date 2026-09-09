type OpenAIChatResponse = {
	choices: { message: { content: string } }[];
};

type ClaudeChatResponse = {
	content: { text: string }[];
};

export async function getChatResponse(
	provider: string,
	apiUrl: string,
	apiKey: string,
	model: string,
	messages: { role: string; content: string }[],
): Promise<string> {
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
	}
}
