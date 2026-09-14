import { homedir } from "node:os";
import { join } from "node:path";
import { getChatResponse } from "./input-chat.ts";

export type Config = {
	provider: string;
	apiUrl: string;
	apiKey: string;
	model: string;
};

export function getConfigPath() {
	return join(homedir(), ".config/stay-sharp/config.json");
}

export async function getHasConfig(configPath: string): Promise<boolean> {
	return await Bun.file(configPath).exists();
}

export async function getConfigObject(configPath: string): Promise<Config> {
	const configFile = Bun.file(configPath);
	const data = await configFile.json();
	return {
		provider: data.provider,
		apiUrl: data.apiUrl,
		apiKey: data.apiKey,
		model: data.model,
	};
}

function getAndValidateUserInput(
	question: string,
	validAnswers: Set<string>,
): string {
	let answer = "";
	while (!validAnswers.has(answer)) {
		answer = (prompt(question) ?? "").toLowerCase();
	}
	return answer;
}

function isValidUrl(url: string) {
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === "http:" || urlObj.protocol === "https:";
	} catch {
		return false;
	}
}

function getAndValidateUrl(question: string): string {
	let url = "";
	while (!isValidUrl(url)) {
		url = prompt(question) ?? "";
		if (!isValidUrl(url)) console.log("Sorry, that is not a valid url");
	}
	return url;
}

export async function runConfigWizard() {
	const llmService = getAndValidateUserInput(
		"What LLM Service would you like to use?\n\
    Please respond with 'Subscription', or 'API'",
		new Set(["subscription", "api"]),
	);

	const config: Config = {
		provider: "",
		apiUrl: "",
		apiKey: "",
		model: "",
	};
	switch (llmService) {
		case "subscription":
			config.provider = getAndValidateUserInput(
				"Are you using Claude or Codex?\n\
        Please response with 'Claude' or 'Codex'",
				new Set(["claude", "codex"]),
			);
			config.provider += "-cli";
			break;
		case "api":
			config.provider = getAndValidateUserInput(
				"Which API are you using?\n\
        Please response with 'Claude' or 'Other'",
				new Set(["claude", "other"]),
			);
			config.provider += "-api";
			config.apiUrl = getAndValidateUrl("What is your API url?");
			config.apiKey = prompt("What is your API key?") ?? "";
			config.model = prompt("What is your model name") ?? "";
			break;
	}

	const testChatResponse = await getChatResponse(
		config.provider,
		config.apiUrl,
		config.apiKey,
		config.model,
		"test system prompt",
		[
			{
				role: "user",
				content:
					"This is a test. If you successfully recieved this message,\
          simply return 'Y' and nothing else",
			},
		],
	);

	if (testChatResponse === "Y") {
		const configFilePath = getConfigPath();
		await Bun.write(configFilePath, JSON.stringify(config));
		console.log(`LLM successfully connected.\n\
                Config file saved to ${configFilePath}\n\
                --------------------------------`);
	} else {
		console.log(`Failed to recieve a valid message from the llm.\n\
                The message received was:\n\
                ${testChatResponse}`);
		process.exit();
	}

	return;
}
