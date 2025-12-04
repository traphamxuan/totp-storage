interface EnrollmentOptions {
    issuer?: string;
    label?: string;
    secret?: string; // If provided, use this secret instead of generating a new one
}

interface EnrollmentResult {
    id: string;
    secret: string;
    issuer: string;
    label: string;
    qrCodeUrl: string;
    qrCodeDataUrl: string;
    createdAt: Date;
}

interface TokenGenerationResult {
    token: string;
    expiresIn: number; // seconds until token expires
    generatedAt: Date;
}

interface TOTPEntry {
    id: string;
    issuer: string;
    label: string;
    secret: string;
    type: 'public' | 'challenge';
    challengeKey?: string;
    createdAt: string;
}

interface TokenResponse {
    token: string;
    expiresIn: number;
}

interface ListTOTPResponse {
    entries: TOTPEntry[];
    total: number;
}

// Define API response structure
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}