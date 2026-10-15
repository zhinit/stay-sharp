import {
	getConfigObject,
	getConfigPath,
	getHasConfig,
	runConfigWizard,
} from "./config.ts";

import {
	classifyQuestionType,
	createSystemPrompt,
	getChatResponse,
	getUniqueChatResponse,
	withSpinner,
} from "./input-chat.ts";

import { getUserInput } from "./input-user.ts";

async function main() {
	const args = Bun.argv.slice(2);
	let wizardFlag = false;
	const wizardFlags = new Set(["-w", "--wizard", "-c", "--config"]);
	for (const arg of args) {
		if (wizardFlags.has(arg)) wizardFlag = true;
	}

	const configPath = getConfigPath();
	const hasConfig = await getHasConfig(configPath);
	if (!hasConfig || wizardFlag) {
		await runConfigWizard();
	}

	const { provider, apiUrl, apiKey, model } = await getConfigObject(configPath);

	const questionTypeRaw = await getUserInput(
		"Do you want to write code, read code, or keep it conceptual?",
		false,
	);
	const questionTypePromise = classifyQuestionType(
		provider,
		apiUrl,
		apiKey,
		model,
		questionTypeRaw,
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

	const systemPrompt = await createSystemPrompt(
		questionTypePromise,
		questionTopic,
		questionDifficulty,
	);

	const messages: { role: string; content: string }[] = [];
	messages.push({ role: "user", content: "Ask me a question." });

	const prevQuestions = new Set<string>();

	let question = await withSpinner(
		getChatResponse(provider, apiUrl, apiKey, model, systemPrompt, messages),
	);
	while (question === "Aborted") {
		question = await withSpinner(
			getChatResponse(provider, apiUrl, apiKey, model, systemPrompt, messages),
		);
	}
	prevQuestions.add(question);

	let nextQuestionPromise: Promise<string> = Promise.resolve("");

	let firstLoopFlag = true;
	while (true) {
		question = firstLoopFlag
			? question
			: await withSpinner(nextQuestionPromise);
		messages.push({ role: "assistant", content: question });
		prevQuestions.add(question);

		nextQuestionPromise = getUniqueChatResponse(
			provider,
			apiUrl,
			apiKey,
			model,
			systemPrompt,
			[
				...messages,
				{
					role: "user",
					content:
						"Ask me another question. Read through all previous questions to make sure not to ask a repeat.",
				},
			],
			prevQuestions,
			true,
		);

		const gradingPrompt =
			"\
      Please grade this and give feedback.\
      If the user got the answer correct, tell them good job.\
      If the user did not get the answer correct, \
      tell them what they did right, what they did wrong, and what topics did they not understand.\
      Respond in a friendly tone. Please be brief. Short consise responses are best.\
      If the user responded with idk or similar, tell them it's okay and give a short description of the answer.\
      If the user responded with nonsense. Tell the user they are hallarious. Be patronizing about it.`\
      DO NOT GIVE THE USER ANOTHER QUESTION YET UNDER ANY CIRCUMSTANCE OR YOU ARE FIRED!\
    ";

		let answer = await getUserInput(question);
		messages.push({ role: "user", content: `${gradingPrompt} ${answer}` });

		let grade = await withSpinner(
			getChatResponse(provider, apiUrl, apiKey, model, systemPrompt, messages),
		);
		while (grade === "Aborted") {
			messages.pop();
			answer = await getUserInput(question, true, answer);
			messages.push({ role: "user", content: `${gradingPrompt} ${answer}` });
			grade = await withSpinner(
				getChatResponse(
					provider,
					apiUrl,
					apiKey,
					model,
					systemPrompt,
					messages,
				),
			);
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
			followUp += ". DO NOT GIVE THE USER ANOTHER QUESTION YET!";
			messages.push({ role: "user", content: followUp });

			let followUpAnswer = await withSpinner(
				getChatResponse(
					provider,
					apiUrl,
					apiKey,
					model,
					systemPrompt,
					messages,
				),
			);
			while (followUpAnswer === "Aborted") {
				messages.pop();
				followUp = await getUserInput(question, true, followUp);
				messages.push({ role: "user", content: followUp });
				followUpAnswer = await withSpinner(
					getChatResponse(
						provider,
						apiUrl,
						apiKey,
						model,
						systemPrompt,
						messages,
					),
				);
			}
			messages.push({ role: "assistant", content: followUpAnswer });
			console.log(followUpAnswer);
			console.log("--------------------------------");
		}
		firstLoopFlag = false;
	}
}

main();
