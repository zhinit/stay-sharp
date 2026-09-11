import { homedir } from "node:os";
import { join } from "node:path";

export type Config = {
	provider: string;
	apiUrl: string;
	apiKey: string;
	model: string;
};

export function getConfigPath() {
	return join(homedir(), ".config/stay-sharp/config.json");
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
