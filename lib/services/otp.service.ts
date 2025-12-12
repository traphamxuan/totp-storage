import {
    generate_secret,
    generate_token,
    generate_totp_uri,
    generate_qr_code_base64,
    decode_qr_code_base64
} from '@totp-store/totp-rs-web';

export async function generateSecret(): Promise<string> {
    return generate_secret();
}

export async function generateQrCode(secret: string, label: string = '', issuer: string = ''): Promise<string> {
    const qrCodeUrl = generate_totp_uri(secret, label, issuer);
    const qrCodeDataUrl = await generate_qr_code_base64(qrCodeUrl);
    return qrCodeDataUrl;
}

export async function generateToken(secret: string): Promise<TokenGenerationResult> {
    const token = await generate_token(secret);
    const expiresIn = 30 - (Math.floor(Date.now() / 1000) % 30); // TOTP tokens expire every 30 seconds

    return {
        token,
        expiresIn,
        generatedAt: new Date()
    };
}

export function getTimeRemaining(): number {
    return 30 - (Math.floor(Date.now() / 1000) % 30);
}

export async function decodeQRCodeFromBase64(imageData: string): Promise<string> {
    try {
        return await decode_qr_code_base64(imageData);
    } catch (error) {
        throw new Error(`Failed to decode QR code: ${error}`);
    }
}