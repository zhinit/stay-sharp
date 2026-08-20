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

fn main() -> std::io::Result<()> {
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
    println!("You typed: {}", input);
    Ok(())
}
