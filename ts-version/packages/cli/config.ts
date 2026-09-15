import { homedir, totalmem } from "node:os";
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

function getConfirmation(question: string): boolean {
	const validAnswers = new Set(["y", "yes", "n", "no"]);
	let answer = "";
	while (!validAnswers.has(answer)) {
		answer = (prompt(question) ?? "").toLowerCase();
	}
	return answer === "y" || answer === "yes";
}

function recommendModel(ramGb: number): string {
	if (ramGb <= 16) return "gemma4:12b";
	else return "gemma4:31b";
}

async function downloadOllama(): Promise<Config> {
	const osType = process.platform;

	// check for existing ollama and install if it doesnt exist
	const ollamaPath = Bun.which("ollama");
	if (!ollamaPath) {
		console.log("installing ollama");
		let proc: ReturnType<typeof Bun.spawn> | null = null;
		switch (osType) {
			case "darwin": {
				proc = Bun.spawn([
					"sh",
					"-c",
					"curl -fsSL https://ollama.com/install.sh | sh",
				]);
				break;
			}
			case "linux": {
				proc = Bun.spawn([
					"sh",
					"-c",
					"curl -fsSL https://ollama.com/install.sh | sh",
				]);
				break;
			}
			case "win32": {
				proc = Bun.spawn([
					"sh",
					"-c",
					"irm https://ollama.com/install.ps1 | iex",
				]);
				break;
			}
			default:
				break;
		}
		if (!proc) {
			console.log("installing ollama failed");
			process.exit();
		}
		await proc.exited;
		if (proc.exitCode !== 0) {
			console.log("installing ollama failed");
			process.exit();
		}
	} else {
		console.log("Using existing version of ollama");
	}

	// check for existiing models and RAM
	// download appropriate model if needed
	const ramGb = Math.floor(totalmem() / 1024 ** 3);
	const model = recommendModel(ramGb);
	let models = "";
	if (ollamaPath) {
		const proc = Bun.spawn(["ollama", "list"]);
		models = await proc.stdout.text();
	}
	if (!models.includes(model)) {
		const proc = Bun.spawn(["ollama", "pull", model]);
		const exitCode = await proc.exited;
		if (exitCode !== 0) {
			console.log("Failed to download model");
			process.exit();
		}
	}
	return {
		provider: "ollama",
		apiUrl: "http://localhost:11434",
		apiKey: "na",
		model: model,
	};
}

export async function runConfigWizard() {
	const llmService = getAndValidateUserInput(
		"What LLM Service would you like to use?\n\
    Please respond with 'Subscription', 'API', or 'Local'",
		new Set(["subscription", "api", "local"]),
	);

	let config: Config = {
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
		case "local": {
			const isDownloadConfirmed = getConfirmation(
				"Is it okay to setup ollama and a local llm on your computer?\n\
        This will be downloaded onto your computer based on your available RAM.\n\
        If it is not already downloaded.\n\
        Please responde with 'Yes', or 'No'",
			);
			if (!isDownloadConfirmed) process.exit();
			config = await downloadOllama();
		}
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
