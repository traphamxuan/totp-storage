import { public_totp } from "@/src/lib/server/generated/prisma/client";

export type TotpMetadata = {
    issuer: string;
    label: string;
    type: 'public' | 'challenge';
    challengeKey?: string;
};

export class Totp {
    id: string;
    issuer: string;
    label: string;
    secret: string;
    type: 'public' | 'challenge';
    challengeKey?: string;
    createdAt: string;

    constructor(totp: public_totp) {
        this.id = totp.id
        const metadata = totp.metadata as TotpMetadata | null
        this.issuer = metadata?.issuer || ''
        this.label = metadata?.label || ''
        this.secret = totp.secret
        this.type = metadata?.type || 'public'
        this.challengeKey = metadata?.challengeKey
        this.createdAt = new Date(totp.created_at).toISOString()
    }
}
