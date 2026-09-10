import { getChatResponse } from "./input-chat.ts";
import { getUserInput } from "./input-user.ts";

async function main() {
	const questionType = await getUserInput(
		"Do you want to write code, read code, or keep it conceptual?",
		false,
	);
	const questionTopic = await getUserInput(
		"What topic(s) do you want to practice?",
		false,
	);
	const questionDifficulty = await getUserInput(
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
		let question = await getChatResponse(
			provider,
			apiUrl,
			apiKey,
			model,
			messages,
		);
		while (question === "Aborted") {
			question = await getChatResponse(
				provider,
				apiUrl,
				apiKey,
				model,
				messages,
			);
		}
		messages.push({ role: "assistant", content: question });

		const gradingPrompt =
			"\
      Please grade this and give feedback.\
      If the user got the answer corrct, tell them good job.\
      If the user did not get the answer correct, \
      tell them what they did right, what they did wrong, and what topics did they not understand.\
      Respond in a friendly tone. Please be brief. Short consise responses are best.\
    ";

		let answer = await getUserInput(question);
		messages.push({ role: "user", content: `${gradingPrompt} ${answer}` });

		let grade = await getChatResponse(
			provider,
			apiUrl,
			apiKey,
			model,
			messages,
		);
		while (grade === "Aborted") {
			messages.pop();
			answer = await getUserInput(question, true, answer);
			messages.push({ role: "user", content: `${gradingPrompt} ${answer}` });
			grade = await getChatResponse(provider, apiUrl, apiKey, model, messages);
		}

		messages.push({ role: "assistant", content: grade });
		console.log(grade);
		console.log("--------------------------------");

		while (true) {
			let followUp = await getUserInput(
				"Do you have any follow up questions? If not, type 'n' to get the next question",
			);
			if (followUp === "n") {
				break;
			}
			messages.push({ role: "user", content: followUp });

			let followUpAnswer = await getChatResponse(
				provider,
				apiUrl,
				apiKey,
				model,
				messages,
			);
			while (followUpAnswer === "Aborted") {
				messages.pop();
				followUp = await getUserInput(question, true, followUp);
				messages.push({ role: "user", content: followUp });
				followUpAnswer = await getChatResponse(
					provider,
					apiUrl,
					apiKey,
					model,
					messages,
				);
			}
			messages.push({ role: "assistant", content: followUpAnswer });
			console.log(followUpAnswer);
			console.log("--------------------------------");
		}
		messages.push({ role: "user", content: "Ask me another question." });
	}
}

main();
