import {
	getConfigObject,
	getConfigPath,
	getHasConfig,
	runConfigWizard,
} from "./config.ts";

import {
	classifyQuestionType,
	createGradingPrompt,
	createQuestionPrompt,
	getChatResponse,
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

	let messages: { role: string; content: string }[] = [];
	const prevQuestions: string[] = [];
	let questionPrompt = await createQuestionPrompt(
		questionTypePromise,
		questionTopic,
		questionDifficulty,
		prevQuestions,
	);

	messages = [{ role: "user", content: questionPrompt }];

	let question = await withSpinner(
		getChatResponse(provider, apiUrl, apiKey, model, messages),
	);
	while (question === "Aborted") {
		question = await withSpinner(
			getChatResponse(provider, apiUrl, apiKey, model, messages),
		);
	}
	prevQuestions.push(question);

	let nextQuestionPromise: Promise<string> = Promise.resolve("");

	let firstLoopFlag = true;
	while (true) {
		question = firstLoopFlag
			? question
			: await withSpinner(nextQuestionPromise);
		prevQuestions.push(question);

		questionPrompt = await createQuestionPrompt(
			questionTypePromise,
			questionTopic,
			questionDifficulty,
			prevQuestions,
		);
		messages = [{ role: "user", content: questionPrompt }];

		nextQuestionPromise = getChatResponse(
			provider,
			apiUrl,
			apiKey,
			model,
			messages,
			true,
		);

		let answer = await getUserInput(question);
		let gradingPrompt = createGradingPrompt(question, answer);
		messages = [{ role: "user", content: gradingPrompt }];

		let grade = await withSpinner(
			getChatResponse(provider, apiUrl, apiKey, model, messages),
		);
		while (grade === "Aborted") {
			answer = await getUserInput(question, true, answer);
			gradingPrompt = createGradingPrompt(question, answer);
			messages = [{ role: "user", content: gradingPrompt }];
			grade = await withSpinner(
				getChatResponse(provider, apiUrl, apiKey, model, messages),
			);
		}

		messages.push({ role: "assistant", content: grade });
		console.log(grade);
		console.log("--------------------------------");

		while (true) {
			const followUpUserPrompt =
				"Do you have any follow up questions? If not, type 'n' to get the next question";

			let followUp = await getUserInput(followUpUserPrompt);
			if (followUp === "n") break;

			messages.push({
				role: "user",
				content: `${followUp} DO NOT GIVE THE USER ANOTHER QUESTION YET!`,
			});

			let followUpAnswer = await withSpinner(
				getChatResponse(provider, apiUrl, apiKey, model, messages),
			);

			while (followUpAnswer === "Aborted") {
				messages.pop();

				followUp = await getUserInput(followUpUserPrompt, true, followUp);
				if (followUp === "n") break;

				messages.push({
					role: "user",
					content: `${followUp} DO NOT GIVE THE USER ANOTHER QUESTION YET!`,
				});

				followUpAnswer = await withSpinner(
					getChatResponse(provider, apiUrl, apiKey, model, messages),
				);
			}
			if (followUp === "n") break;
			messages.push({ role: "assistant", content: followUpAnswer });

			console.log(followUpAnswer);
			console.log("--------------------------------");
		}
		firstLoopFlag = false;
	}
}

main();
