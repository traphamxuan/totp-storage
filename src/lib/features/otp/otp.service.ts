import { generate_secret, generate_token, generate_totp_uri, generate_qr_code_base64, decode_qr_code_base64 } from '@totp-store/totp-rs-web';

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

export function generateSecret(): string {
    return generate_secret();
}

export async function enrollTOTP(options?: EnrollmentOptions): Promise<EnrollmentResult> {
    // Use provided secret or generate a new one
    const secret = options?.secret || generate_secret();

    // Set defaults for issuer and label
    const issuer = options?.issuer || 'TOTP Store';
    const label = options?.label || `Account ${generateId()}`;

    // Generate QR code URL and data URL
    const qrCodeUrl = generate_totp_uri(secret, label, issuer);
    const qrCodeDataUrl = await generate_qr_code_base64(qrCodeUrl);

    // Create enrollment result
    const enrollmentResult: EnrollmentResult = {
        id: generateId(),
        secret,
        issuer,
        label,
        qrCodeUrl,
        qrCodeDataUrl,
        createdAt: new Date()
    };

    return enrollmentResult;
}

export function generateToken(secret: string): TokenGenerationResult {
    const token = generate_token(secret);
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

export function decodeQRCodeFromBase64(imageData: string): string {
    try {
        return decode_qr_code_base64(imageData);
    } catch (error) {
        throw new Error(`Failed to decode QR code: ${error}`);
    }
}

