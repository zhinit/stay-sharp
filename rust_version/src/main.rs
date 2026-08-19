use crossterm::event::{
    read, Event, KeyCode, KeyModifiers,
    KeyboardEnhancementFlags, PopKeyboardEnhancementFlags, PushKeyboardEnhancementFlags
};
use crossterm::execute;
use crossterm::terminal::{disable_raw_mode, enable_raw_mode};
use std::io::{stdout, Write};

fn main() -> std::io::Result<()> {
    enable_raw_mode()?;
    execute!(
        stdout(),
        PushKeyboardEnhancementFlags(KeyboardEnhancementFlags::DISAMBIGUATE_ESCAPE_CODES)
    )?;

    let mut input = String::new();

    loop {
        if let Event::Key(key) = read()? {
            match key.code {
                KeyCode::Char(c) => {
                    input.push(c);
                    print!("{}", c);
                    stdout().flush()?;
                }
                KeyCode::Enter => {
                    if key.modifiers.contains(KeyModifiers::SHIFT) {
                        input.push('\n');
                        print!("\r\n");
                        stdout().flush()?;
                    } else {
                        break;
                    }
                }
                _ => {}
            }

        }
    }

    execute!(stdout(), PopKeyboardEnhancementFlags)?;
    disable_raw_mode()?;
    
    println!();
    println!("You typed: {}", input);
    Ok(())
}
