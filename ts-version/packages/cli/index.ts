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
	} catch {
		return "Request failed without status code";
	}
}

function getUserInput(questionForUser: string, hasPartition = true): string {
	console.log(questionForUser);
	if (hasPartition) console.log("--------------------------------");
	const userResponse = prompt("") ?? "Error getting user input :(";
	if (hasPartition) console.log("--------------------------------");
	return userResponse;
}

async function main() {
	const questionType = getUserInput(
		"Do you want to write code, read code, or keep it conceptual?",
		false,
	);
	const questionTopic = getUserInput(
		"What topic(s) do you want to practice?",
		false,
	);
	const questionDifficulty = getUserInput(
		"How difficult do you want the questions to be (ie easy, medium, or hard)?",
		false,
	);
	console.log("--------------------------------");

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

	while (true) {
		const question = await getChatResponse(
			provider,
			apiUrl,
			apiKey,
			model,
			messages,
		);
		messages.push({ role: "assistant", content: question });

		const gradingPrompt =
			"\
      Please grade this and give feedback.\
      If the user got the answer corrct, tell them good job.\
      If the user did not get the answer correct, \
      tell them what they did right, what they did wrong, and what topics did they not understand.\
      Respond in a friendly tone. Please be brief. Short consise responses are best.\
    ";

		const answer = getUserInput(question);
		messages.push({ role: "user", content: `${gradingPrompt} ${answer}` });

		const grade = await getChatResponse(
			provider,
			apiUrl,
			apiKey,
			model,
			messages,
		);
		messages.push({ role: "assistant", content: grade });
		console.log(grade);
		console.log("--------------------------------");

		while (true) {
			const followUp = getUserInput(
				"Do you have any follow up questions? If not, type 'n' to get the next question",
			);
			if (followUp === "n") {
				break;
			}
			messages.push({ role: "user", content: followUp });

			const followUpAnswer = await getChatResponse(
				provider,
				apiUrl,
				apiKey,
				model,
				messages,
			);
			messages.push({ role: "assistant", content: followUpAnswer });
			console.log(followUpAnswer);
			console.log("--------------------------------");
		}
		messages.push({ role: "user", content: "Ask me another question." });
	}
}

main();
