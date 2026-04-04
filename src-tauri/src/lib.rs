use std::path::PathBuf;
use tauri::{Manager};
use tauri::path::BaseDirectory;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn gleichgewicht() {
    println!("Ola, Bazbo!");
}

struct ImageData {
    my_img_path: PathBuf,
}

#[tauri::command]
fn get_image_path(state: tauri::State<'_, ImageData>) -> String {
    state.my_img_path.to_string_lossy().to_string().into()
}

// #[tauri::command]
// fn get_gpu_image(state: tauri::State<'_, ImageData>) -> Result<Image<'static>, String> {
//     let img_reader = image::ImageReader::open(&state.my_img_path)
//         .map_err(|e| e.to_string())?;
//
//     let decoded = img_reader.decode()
//         .map_err(|e| e.to_string())?;
//
//     let rgba = decoded.to_rgba8();
//     let (width, height) = rgba.dimensions();
//
//     Ok(Image::new_owned(rgba.into_raw(), width, height))
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let resource_path = app.path().resolve("razvo-resources/garbled rock.png", BaseDirectory::Resource).unwrap();
            app.manage(ImageData {
                my_img_path: resource_path
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, gleichgewicht, get_image_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
