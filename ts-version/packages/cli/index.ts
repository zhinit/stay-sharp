type OpenAIChatResponse = {
	choices: { message: { content: string } }[];
};

type ClaudeChatResponse = {
	content: { text: string }[];
};

async function getChatResponse(
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
	} catch (e) {
		return "Request failed without status code";
	}
}

async function main() {
	const questionType = prompt(
		"Do you want to write code, read code, or keep it conceptual?",
	);
	const questionTopic = prompt("What topic(s) do you want to practice?");
	const questionDifficulty = prompt(
		"How difficult do you want the questions to be (ie easy, medium, or hard)?",
	);

	const provider = process.env.STAYSHARP_PROVIDER ?? "";
	const apiUrl = process.env.STAYSHARP_API_URL ?? "";
	const apiKey = process.env.STAYSHARP_API_KEY ?? "";
	const model = process.env.STAYSHARP_MODEL ?? "";

	const initialPrompt = `
    Ask me a question where the type of question will be ${questionType}.
    The topic should be related to ${questionTopic}.
    The level of difficulty should be ${questionDifficulty},
    The answer to this should only be a few lines, 
    or a one liner if appropriate.
  `;

	const messages: { role: string; content: string }[] = [];
	messages.push({ role: "user", content: initialPrompt });
	const answer = await getChatResponse(
		provider,
		apiUrl,
		apiKey,
		model,
		messages,
	);
	console.log(answer);
}

main();
