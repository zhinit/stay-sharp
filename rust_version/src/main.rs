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
    return Ok(input);
}

fn main() -> std::io::Result<()> {
    let question1: &str = "Do you want to write code, read code, or keep it conceptual?";
    let question2: &str = "What topic(s) do you want to cover?";
    let question3: &str = "How difficult do you want the questions to be (ie easy, medium, hard)?";

    let question_mode: String = get_user_input(question1)?;
    let topics: String = get_user_input(question2)?;
    let difficulty: String = get_user_input(question3)?;

    println!("{}\n{}\n{}\n", question_mode, topics, difficulty);

    loop {
        // generate a question based on initial responses
        let curr_question: &str = "\nWhat is the difference between &str and String in rust?\n> ";

        // send that question to the user and get their response
        let answer = get_user_input(curr_question)?;
        if answer == "exit" {
            break;
        }

        // grade user and see if they have any clarifying questions or want to coninue
        println!("You answered: {}", answer);
        println!("Grade: A. You are correct because x y and z");
        
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
