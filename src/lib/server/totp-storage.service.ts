import { generate_token } from '@totp-store/totp-rs-bundler'
export interface TOTPEntry {
    id: string;
    secret: string;
    issuer: string;
    label: string;
    type?: 'public' | 'challenge';
    challengeKey?: string;
    createdAt: string;
}

export interface TOTPOptions {
    issuer?: string;
    label?: string;
    type?: 'public' | 'challenge';
    challengeKey?: string;
}

export class TotpService {
    private totpKeys: Map<string, TOTPEntry> = new Map();

    addTOTPEntry(secret: string, options?: TOTPOptions): string {
        const id = Math.random().toString(36).substring(2, 15);
        console.log('Adding TOTP entry with secret:', secret);
        this.totpKeys.set(id, {
            id,
            secret,
            issuer: options?.issuer || 'TOTP Store',
            label: options?.label || `Account ${id}`,
            type: options?.type || 'public',
            challengeKey: options?.challengeKey || '',
            createdAt: new Date().toISOString()
        });
        return id;
    }

    getTOTPEntry(id: string): TOTPEntry | undefined {
        return this.totpKeys.get(id);
    }

    listTOTPEntries(page: number = 1, limit: number = 100): { entries: TOTPEntry[]; total: number } {
        const startIndex = (page - 1) * limit;
        const entries = Array.from(this.totpKeys.values()).slice(startIndex, startIndex + limit);

        return { entries, total: this.totpKeys.size };
    }

    deleteTOTPEntry(id: string): boolean {
        return this.totpKeys.delete(id);
    }

    getSize(): number {
        return this.totpKeys.size;
    }

    generateToken(secret: string): { token: string; expiresIn: number; generatedAt: Date } {
        const token = generate_token(secret);
        const expiresIn = 30 - (Math.floor(Date.now() / 1000) % 30); // TOTP tokens expire every 30 seconds

        return {
            token,
            expiresIn,
            generatedAt: new Date()
        };
    }
}

// Export a singleton instance for backward compatibility
export const totpService = new TotpService();
