#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn platform() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else {
        "desktop"
    }
}

#[tauri::command]
fn get_auto_start() -> bool {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("reg")
            .args([
                "query",
                r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                "/v",
                "MailGUI233",
            ])
            .status()
            .map(|status| status.success())
            .unwrap_or(false)
    }

    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

#[tauri::command]
fn set_auto_start(enabled: bool) -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let run_key = r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run";

        if enabled {
            let exe = std::env::current_exe()
                .map_err(|error| format!("Cannot resolve executable path: {error}"))?;
            let command = format!("\"{}\"", exe.display());
            let status = std::process::Command::new("reg")
                .args(["add", run_key, "/v", "MailGUI233", "/t", "REG_SZ", "/d", &command, "/f"])
                .status()
                .map_err(|error| format!("Cannot enable auto start: {error}"))?;

            if !status.success() {
                return Err("Cannot enable auto start through Windows Run registry key.".to_string());
            }
        } else {
            let status = std::process::Command::new("reg")
                .args(["delete", run_key, "/v", "MailGUI233", "/f"])
                .status()
                .map_err(|error| format!("Cannot disable auto start: {error}"))?;

            if !status.success() {
                return Ok(false);
            }
        }

        Ok(get_auto_start())
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = enabled;
        Ok(false)
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![platform, get_auto_start, set_auto_start])
        .run(tauri::generate_context!())
        .expect("failed to run MailGUI233");
}
