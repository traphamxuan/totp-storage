mod utils;

use base64::{engine::general_purpose, Engine as _};
use hmac::{Hmac, Mac};
use image::codecs::png::PngEncoder;
use image::ColorType;
use image::ImageEncoder;
use qrcode::QrCode;
use sha1::Sha1;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

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
    // Generate 20 random bytes (160 bits) for the secret
    let mut key_bytes = [0u8; 20];
    getrandom::getrandom(&mut key_bytes).expect("Failed to generate random bytes");

    // Encode as base32 string (standard for TOTP secrets)
    base32::encode(base32::Alphabet::Rfc4648 { padding: false }, &key_bytes)
}

/// Generate a TOTP token from a secret
#[wasm_bindgen]
pub fn generate_token(secret: &str) -> Result<String, JsError> {
    // Decode the base32 secret
    let decoded_secret = base32::decode(base32::Alphabet::Rfc4648 { padding: false }, secret)
        .ok_or_else(|| JsError::new("Invalid secret: failed to decode base32"))?;

    // Get the current Unix time and calculate the counter value
    let timestamp = js_sys::Date::now() as u64 / 1000;
    let counter = timestamp / 30; // 30-second intervals

    // Convert counter to 8-byte array (big-endian)
    let counter_bytes = counter.to_be_bytes();

    // Create HMAC-SHA1 instance and calculate the hash
    let mut mac = Hmac::<Sha1>::new_from_slice(&decoded_secret)
        .map_err(|_| JsError::new("Invalid key length"))?;
    mac.update(&counter_bytes);
    let result = mac.finalize();
    let hash = result.into_bytes();

    // Perform dynamic truncation to get a 4-byte string
    let offset = (hash[hash.len() - 1] & 0x0F) as usize;
    let binary = ((hash[offset] & 0x7F) as u32) << 24
        | ((hash[offset + 1] & 0xFF) as u32) << 16
        | ((hash[offset + 2] & 0xFF) as u32) << 8
        | (hash[offset + 3] & 0xFF) as u32;

    // Generate a 6-digit OTP
    let otp = binary % 1_000_000;
    Ok(format!("{:06}", otp))
}

/// Generate a QR code as a base64-encoded PNG data URL
#[wasm_bindgen]
pub fn generate_qr_code_base64(data: &str) -> Result<String, JsError> {
    // Generate QR code
    let code =
        QrCode::new(data.as_bytes()).map_err(|_| JsError::new("Failed to generate QR code"))?;

    // Render QR code to image buffer
    let image = code.render::<image::Luma<u8>>().build();

    // Encode image to PNG format in memory
    let mut buffer = Vec::new();

    let mut cursor = Cursor::new(&mut buffer);
    let encoder = PngEncoder::new(&mut cursor);

    encoder
        .write_image(
            image.as_raw(),
            image.width(),
            image.height(),
            ColorType::L8.into(),
        )
        .map_err(|_| JsError::new("Failed to encode PNG"))?;

    // Encode as base64
    let base64_data = general_purpose::STANDARD.encode(&buffer);

    // Return as data URL
    Ok(format!("data:image/png;base64,{}", base64_data))
}

/// Generate a TOTP URI for QR code generation
#[wasm_bindgen]
pub fn generate_totp_uri(secret: &str, label: &str, issuer: &str) -> String {
    format!(
        "otpauth://totp/{}?secret={}&issuer={}",
        urlencoding::encode(label),
        secret,
        urlencoding::encode(issuer)
    )
}
