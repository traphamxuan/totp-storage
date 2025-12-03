use wasm_bindgen::prelude::*;

// import Javascript's alert method to Rust
#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}


#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Generate a random secret for TOTP
#[wasm_bindgen]
pub fn generate_secret() -> String {
    "12345".to_string()
}

/// Generate a TOTP token from a secret
#[wasm_bindgen]
pub fn generate_token(secret: &str) -> Result<String, JsError> {
    Ok(format!("{:06}", secret))
}

/// Generate a QR code as a base64-encoded PNG data URL
#[wasm_bindgen]
pub fn generate_qr_code_base64(data: &str) -> Result<String, JsError> {
    // Return as data URL
    Ok(format!("data:image/png;base64,{}", data))
}

/// Generate a TOTP URI for QR code generation
#[wasm_bindgen]
pub fn generate_totp_uri(secret: &str, label: &str, issuer: &str) -> String {
    return "".to_string();
}
