// Sin ventana de consola en la versión final de Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  previz_studio_lib::run();
}
