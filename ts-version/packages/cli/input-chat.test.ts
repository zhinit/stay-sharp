import { expect, test } from "bun:test";
import { createSystemPrompt } from "./input-chat.ts";

test("create system prompt contains key details for write mode", async () => {
	const prompt = await createSystemPrompt(
		Promise.resolve("w"),
		"python",
		"easy",
	);

	expect(prompt).toContain("write");
	expect(prompt).toContain("python");
	expect(prompt).toContain("easy");
});

test("create system prompt contains key details for read mode", async () => {
	const prompt = await createSystemPrompt(
		Promise.resolve("r"),
		"python",
		"easy",
	);

	expect(prompt).toContain("read");
	expect(prompt).toContain("describe the output");
	expect(prompt).toContain("subtle bugs");
	expect(prompt).toContain("python");
	expect(prompt).toContain("easy");
});

test("create system prompt contains key details for conceptual mode", async () => {
	const prompt = await createSystemPrompt(
		Promise.resolve("c"),
		"python",
		"easy",
	);

	expect(prompt).toContain("conceptual");
	expect(prompt).toContain("python");
	expect(prompt).toContain("easy");
});
