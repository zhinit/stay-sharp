use crossterm::event::{
    read, Event, KeyCode, KeyEventKind, KeyModifiers,
    KeyboardEnhancementFlags, PopKeyboardEnhancementFlags, PushKeyboardEnhancementFlags
};
use crossterm::execute;
use crossterm::terminal::{disable_raw_mode, enable_raw_mode, size};
use std::io::{stdout, Write};

fn visual_pos(input: &str, byte_offset: usize, term_width: u16) -> (u16, u16) {
    let mut col: u16 = 0;
    let mut row: u16 = 0;
    for ch in input[..byte_offset].chars() {
        if ch == '\n' {
            row += 1;
            col = 0;
        } else {
            col += 1;
            if col >= term_width {
                row += 1;
                col = 0;
            }
        }
    }
    (col, row)
}

fn redraw(input: &str, cursor: usize, cursor_row: &mut u16, term_width: u16) {
    if *cursor_row > 0 {
        print!("\x1B[{}A", cursor_row);
    }
    print!("\r\x1B[J");

    for ch in input.chars() {
        if ch == '\n' {
            print!("\r\n");
        } else {
            print!("{}", ch);
        }
    }

    let (_, end_row) = visual_pos(input, input.len(), term_width);
    let (cur_col, cur_row) = visual_pos(input, cursor, term_width);

    let rows_back = end_row - cur_row;
    if rows_back > 0 {
        print!("\x1B[{}A", rows_back);
    }
    print!("\r");
    if cur_col > 0 {
        print!("\x1B[{}C", cur_col);
    }

    *cursor_row = cur_row;
    stdout().flush().unwrap();
}

fn get_user_input(question: &str, has_sep: bool) -> std::io::Result<String> {
    println!("{}", question);
    if has_sep {
        println!("--------------------");
    }

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
    let (term_width, _) = size()?;
    let mut cursor_row: u16 = 0;

    loop {
        if let Event::Key(key) = read()? {
            if key.kind != KeyEventKind::Press {
                continue;
            }

            match key.code {
                KeyCode::Char(c) => {
                    if key.modifiers.contains(KeyModifiers::CONTROL) {
                        if kitty {
                            execute!(stdout(), PopKeyboardEnhancementFlags)?;
                        }
                        disable_raw_mode()?;
                        println!("");
                        std::process::exit(0);
                    }

                    input.insert(cursor, c);
                    cursor += 1;
                    redraw(&input, cursor, &mut cursor_row, term_width);
                }
                KeyCode::Enter => {
                    if key.modifiers.contains(KeyModifiers::SHIFT) {
                        input.push('\n');
                        cursor = input.len();
                        redraw(&input, cursor, &mut cursor_row, term_width);
                    } else {
                        break;
                    }
                }
                KeyCode::Backspace => {
                    if cursor > 0 {
                        cursor -= 1;
                        input.remove(cursor);
                        redraw(&input, cursor, &mut cursor_row, term_width);
                    }
                }
                KeyCode::Left => {
                    if cursor > 0 {
                        cursor -= 1;
                        redraw(&input, cursor, &mut cursor_row, term_width);
                    }
                }
                KeyCode::Right => {
                    if cursor < input.len() {
                        cursor += 1;
                        redraw(&input, cursor, &mut cursor_row, term_width);
                    }
                }
                _ => {}
            }

        }
    }

    let (_, end_row) = visual_pos(&input, input.len(), term_width);
    if end_row > cursor_row {
        print!("\x1B[{}B", end_row - cursor_row);
    }
    print!("\r");
    stdout().flush()?;

    if kitty {
        execute!(stdout(), PopKeyboardEnhancementFlags)?;
    }
    disable_raw_mode()?;
    
    println!("");
    Ok(input)
}

fn get_chat_response(
    provider: &str,
    api_url: &str, 
    api_key: &str, 
    model: &str, 
    messages: &Vec<serde_json::Value>
) -> String {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .expect("Failed to build HTTP client");

    if provider == "claude" {
        let body = serde_json::json!({
            "model": model,
            "messages": messages,
            "max_tokens": 1024,
        });

        let response = client.post(format!("{}/v1/messages", api_url))
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .json(&body)
            .send()
            .expect("Failed to send request");

        let json: serde_json::Value = response.json()
            .expect("Failed to parse response");

        json["content"][0]["text"]
            .as_str()
            .unwrap_or("No response")
            .to_string()
    } else {
        let body = serde_json::json!({
            "model": model,
            "messages": messages,
            "reasoning": {"effort": "none"},
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
}

fn main() -> std::io::Result<()> {

    dotenvy::dotenv().ok();

    let provider = std::env::var("STAYSHARP_PROVIDER")
        .expect("Error: STAYSHARP_PROVIDER must be set");
    
    let api_url = std::env::var("STAYSHARP_API_URL")
        .expect("Error: STAYSHARP_API_URL must be set");

    let api_key = std::env::var("STAYSHARP_API_KEY")
        .expect("Error: STAYSHARP_API_KEY must be set");

    let model = std::env::var("STAYSHARP_MODEL")
        .expect("Error: STAYSHARP_MODEL must be set");


    let question1: &str = "Do you want to write code, read code, or keep it conceptual?";
    let question2: &str = "What topic(s) do you want to cover?";
    let question3: &str = "How difficult do you want the questions to be (ie easy, medium, hard)?";

    let question_mode: String = get_user_input(question1, false)?;
    let topics: String = get_user_input(question2, false)?;
    let difficulty: String = get_user_input(question3, false)?;

    println!("--------------------");

    let initial_prompt = format!(
        "Ask me a question where the type of question will be {}. \
        The topic should be related to {}. \
        The level of difficulty should be {}. \
        This answer to this should only be a few lines, \
        or a one liner if appropriate.",
        question_mode, topics, difficulty
    );

    let mut messages: Vec<serde_json::Value> = Vec::new();
    messages.push(serde_json::json!({"role": "user", "content": initial_prompt}));

    loop {
        // generate a question based on initial responses
        let curr_question = get_chat_response(&provider, &api_url, &api_key, &model, &messages);

        // send that question to the user and get their response
        let curr_answer = get_user_input(&curr_question, true)?;
        if curr_answer == "exit" {
            break;
        }
        println!("--------------------");

        // grade user and see if they have any clarifying questions or want to coninue
        let grade_prompt = format!(
            "Can you please grade this and give feedback. \
            What did they do right? What did they do Wrong? What topics did they not understand? \
            Respond to the person who answered the question in a friendly tone. \
            Please be brief. The response should be consise and to the point. The shorter the better.",
        );

        messages.push(serde_json::json!({"role": "assistant", "content": curr_question}));
        messages.push(serde_json::json!({"role": "user", "content": format!("{}\n{}", curr_answer, grade_prompt)}));
        let curr_grade = get_chat_response(&provider, &api_url, &api_key, &model, &messages);
        messages.push(serde_json::json!({"role": "assistant", "content": curr_grade}));
        println!("{}", curr_grade);
        
        loop {
            let curr_follow_up = get_user_input(
                "Do you have any clarifying questions? If not type \"n\" to get the next question",
                true
            )?;
            println!("--------------------");
            if curr_follow_up == "n" {
                break;
            }

            let follow_up_prompt = format!(
                "Please respond to the user's follow up question.
                Respond in a friendly tone. Please be brief.
                The response should be consise and to the point. The shorter the better.",
            );

            messages.push(serde_json::json!({"role": "user", "content": format!("{}\n{}", curr_follow_up, follow_up_prompt)}));

            let chat_follow_up_response = get_chat_response(&provider, &api_url, &api_key, &model, &messages);
            println!("{}", chat_follow_up_response);

            messages.push(serde_json::json!({"role": "assistant", "content": chat_follow_up_response}));
        }
        messages.push(serde_json::json!({"role": "user", "content": "Ask me another question."}));
    }

    Ok(())
}
