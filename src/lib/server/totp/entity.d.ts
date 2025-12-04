type Totp = {
    id: string;
    created_at?: string;
    used_at?: string;
    secret: string;
    metadata: TotpMetadata;
};
type TotpMetadata = {
    issuer: string;
    label: string;
    type: 'public' | 'challenge';
    challengeKey?: string;
};
