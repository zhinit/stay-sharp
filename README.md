# What is Stay Sharp?

A CLI tool to make sure your skills stay sharp.

Waiting for your agent to finish working? Run stay sharp in the terminal to sharpen your brain while waiting and prevent skill atrophy!

Learning a new topic and just want practice to hammer in the concepts? Run stay sharp in the terminal to harden the skills you are learning!

Once installed, run `stay-sharp` in the terminal to get going.

# Using the CLI
## Learning Modes
There are 3 modes for learning in Stay Sharp.

Additionally, you will always be given an opportunity to ask as many follow-up questions as you like about the material. This ensures the agent won't try to move on before you are ready like what would happen with a general agent harness like when using Claude or Codex directly.

### 1) Writing Code
Get short coding problems. You will be asked to write short answers to coding problems. These are not LeetCode-length questions. Typical answers should be a few lines or sometimes just a one-liner. This allows you to practice many questions and really hammer in the material.

### 2) Reading Code
The CLI will provide you with a short snippet of code. You will describe the output and say if the code has subtle bugs or errors.

### 3) Conceptual
The CLI provides short conceptual questions that you will answer with words. This mode allows you to study topics that are not related to coding. Study topics like system design using this mode!

## Topics
Enter any topic you can imagine and the CLI will generate content for you to learn from!
Endless possibilities!


## Difficulty Level
Choose any difficulty level you want. But it is recommended to say easy medium or hard.

# Installation

## macOS / Linux

For macOS or Linux, run this in your terminal:

```sh
curl -fsSL https://raw.githubusercontent.com/zhinit/stay-sharp/main/install.sh | sh
```

If the installer tells you to update your PATH, add this line to `~/.zshrc` (or `~/.bashrc` if you use Bash):

```sh
export PATH="$HOME/.local/bin:$PATH"
```

## Windows

For Windows, run this in PowerShell:

```powershell
irm https://raw.githubusercontent.com/zhinit/stay-sharp/main/install.ps1 | iex
```

## Build from source

You will need Git and Bun installed. Run this in your terminal:

```sh
git clone https://github.com/zhinit/stay-sharp.git
cd stay-sharp/ts-version
bun install
bun run build
```

The executable will be in `dist/stay-sharp` (`dist/stay-sharp.exe` on Windows). You can run it from there or move it to a directory on your PATH.

# The configuration wizard

The first time you run stay-sharp, a configuration wizard will run. You can choose to use a local LLM, an API, or a monthly Claude/Codex membership.

**I would recommend using a Claude/Codex membership or a local LLM.**

Using a monthly Claude/Codex membership will use some tokens, but it should be an insignificant amount since it is simply a text conversation. Additionally there should be a high chance everything it says is correct even for hard problems.

A local LLM will be completely free and avoid using any of your tokens, but will sometimes not be 100% correct on medium and hard problems.

Using a provider API directly can be convienient if you want more customization. For example you could play around with different local LLMs or connect to chineese models. However, this will be needlessly expensive if you are paying for API usage. Especially if you already have a monthly subscription.

To run the configuration wizard when you like just add any of the 4 flags after stay-sharp as shown below.

- stay-sharp -w
- stay-sharp -c
- stay-sharp --wizard
- stay-sharp --config


# AI Disclosure

In the spirit of what this CLI is, I have handcoded the vast majority of this myself, with the following exceptions:

- I used the build and learn command for AI guidance to teach me how to do things while I wrote the code.
- I used Codex to write release.yml and the install scripts.
