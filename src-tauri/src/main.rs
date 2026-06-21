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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![platform])
        .run(tauri::generate_context!())
        .expect("failed to run MailGUI233");
}
