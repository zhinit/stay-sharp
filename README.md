# What is Stay Sharp?

A CLI tool to make sure your skills stay sharp.

Waiting for your agent to finish working? Run stay sharp in the terminal to sharpen your brain while waiting and prevent skill atrophy!

Learning a new topic and just want practice to hammer in the concepts? Run stay sharp in the terminal to harden the skills you are learning!

# Installation

Homebrew installation is coming soon.

For now, build from source on macOS or Linux. You will need Git and Bun installed.

```sh
git clone https://github.com/zhinit/stay-sharp.git
cd stay-sharp/ts-version
bun install
bun build --compile packages/cli/index.ts --outfile dist/stay-sharp
mkdir -p ~/.local/bin
cp dist/stay-sharp ~/.local/bin/stay-sharp
```

Add this line to `~/.zshrc` (or `~/.bashrc` if you use Bash):

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Open a new terminal.

Once installed, run `stay-sharp` in the terminal.

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
Choose any difficulty level you want.


