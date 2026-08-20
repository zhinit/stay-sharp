use crossterm::event::{
    read, Event, KeyCode, KeyEventKind, KeyModifiers,
    KeyboardEnhancementFlags, PopKeyboardEnhancementFlags, PushKeyboardEnhancementFlags
};
use crossterm::execute;
use crossterm::terminal::{disable_raw_mode, enable_raw_mode};
use std::io::{stdout, Write};

fn redraw_from(input: &str, cursor:usize) {
    let tail = &input[cursor..];
    print!("{}\x1B[K", tail);
    let chars_after = tail.chars().count();
    if chars_after > 0 {
        print!("\x1B[{}D", chars_after);
    }
    stdout().flush().unwrap();
}

fn get_user_input(question: &str) -> std::io::Result<String> {
    println!("{}", question);

    let kitty = crossterm::terminal::supports_keyboard_enhancement().unwrap_or(false);

    enable_raw_mode()?;
    if kitty {
        execute!(
            stdout(),
            PushKeyboardEnhancementFlags(KeyboardEnhancementFlags::DISAMBIGUATE_ESCAPE_CODES)
        )?;
    }

    let mut input = String::new();
    let mut cursor: usize = 0;

    loop {
        if let Event::Key(key) = read()? {
            if key.kind != KeyEventKind::Press {
                continue;
            }

            match key.code {
                KeyCode::Char(c) => {
                    input.insert(cursor, c);
                    cursor += 1;
                    print!("{}", c);
                    redraw_from(&input, cursor);
                }
                KeyCode::Enter => {
                    if key.modifiers.contains(KeyModifiers::SHIFT) {
                        input.push('\n');
                        cursor = input.len();
                        print!("\r\n");
                        stdout().flush()?;
                    } else {
                        break;
                    }
                }
                KeyCode::Backspace => {
                    if cursor > 0 {
                        cursor -= 1;
                        input.remove(cursor);
                        print!("\x08");
                        redraw_from(&input, cursor);
                    }
                }
                KeyCode::Left => {
                    if cursor > 0 {
                        cursor -= 1;
                        print!("\x1B[D");
                        stdout().flush()?;

                    }
                }
                KeyCode::Right => {
                    if cursor < input.len() {
                        cursor += 1;
                        print!("\x1B[C");
                        stdout().flush()?;
                    }
                }
                _ => {}
            }

        }
    }

    if kitty {
        execute!(stdout(), PopKeyboardEnhancementFlags)?;
    }
    disable_raw_mode()?;
    
    println!();
    Ok(input)
}

fn get_chat_response(api_url: &str, api_key: &str, model: &str, prompt: &str) -> String {
    let client = reqwest::blocking::Client::new();
    let body = serde_json::json!({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
    });

    let response = client.post(format!("{}/v1/chat/completions", api_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .send()
        .expect("Failed to send request");

    let json: serde_json::Value = response.json()
        .expect("Failed to parse response");

    json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string()
}

fn main() -> std::io::Result<()> {

    dotenvy::dotenv().ok();
    
    let api_url = std::env::var("STAYSHARP_API_URL")
        .expect("Error: STAYSHARP_API_URL must be set");

    let api_key = std::env::var("STAYSHARP_API_KEY")
        .expect("Error: STAYSHARP_API_KEY must be set");

    let model = std::env::var("STAYSHARP_MODEL")
        .expect("Error: STAYSHARP_MODEL must be set");


    let question1: &str = "Do you want to write code, read code, or keep it conceptual?";
    let question2: &str = "What topic(s) do you want to cover?";
    let question3: &str = "How difficult do you want the questions to be (ie easy, medium, hard)?";

    let question_mode: String = get_user_input(question1)?;
    let topics: String = get_user_input(question2)?;
    let difficulty: String = get_user_input(question3)?;

    let initial_prompt = format!(
        "Ask me a coding question where the type of question will be {}. \
        The topic should be related to {}. \
        The level of difficulty should be {}. \
        This answer to this should only be a few lines of code, \
        or a one liner if appropriate.",
        question_mode, topics, difficulty
    );

    loop {
        // generate a question based on initial responses
        let curr_question = get_chat_response(&api_url, &api_key, &model, &initial_prompt);

        // send that question to the user and get their response
        let answer = get_user_input(&curr_question)?;
        if answer == "exit" {
            break;
        }

        // grade user and see if they have any clarifying questions or want to coninue
        let grade_prompt = format!(
            "Here is a question: {}. \
            Here is the response to that question: {}.\
            Can you please grade this and give feedback. \
            What did they do right? What did they do Wrong? What topics did they not understand? \
            Respond to the person who answered the question in a friendly tone. \
            Please be brief.",
            curr_question, answer
        );

        let chat_feedback = get_chat_response(&api_url, &api_key, &model, &grade_prompt);
        println!("{}", chat_feedback);
        
        loop {
            let follow_up_response = get_user_input(
                "Do you have any clarifying questions? If not \"n\" to get the next question"
            )?;
            if follow_up_response == "n" {
                break;
            }
            println!("You answered: {}", follow_up_response);
        }
    }

    Ok(())
}
