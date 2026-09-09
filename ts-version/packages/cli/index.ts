function main() {
	const questionType = prompt(
		"Do you want to write code, read code, or keep it conceptual?",
	);
	const questionTopic = prompt("What topic do you want to practice?");
	const questionDifficulty = prompt(
		"How difficult do you want the questions to be (easy, medium, or hard)?",
	);

	const provider = process.env.STAYSHARP_PROVIDER;
	const apiUrl = process.env.STAYSHARP_API_URL;
	const apiKey = process.env.STAYSHARP_API_KEY;
	const model = process.env.STAYSHARP_MODEL;

	console.log(questionType, questionTopic, questionDifficulty);
	console.log(provider, apiUrl, apiKey, model);
}

main();
