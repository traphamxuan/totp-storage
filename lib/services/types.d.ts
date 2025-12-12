interface CreateTotpPayload {
    issuer: string;
    label: string;
    secret?: string;
}

interface ListTOTPResponse {
    entries: Totp[];
    total: number;
}

interface EnrollmentResult {
    secret: string;
    issuer: string;
    label: string;
    qrCodeDataUrl: string;
}

interface TokenGenerationResult {
    token: string;
    expiresIn: number; // seconds until token expires
    generatedAt: Date;
}

interface SortColumn {
    field: string;
    order: 'asc' | 'desc';
}

type Pagination = {
    page: number;
    size: number;
    sort?: SortColumn[]; // Only sort field with SortColumn[] type
};

interface TotpInterface {
    create(payload: CreateTotpPayload, turnstileToken?: string): Promise<Totp | null>;
    list(
        filter: Record<keyof CreateTotpPayload, string>,
        pagination: Pagination,
        search?: string,
        ownerId?: string
    ): Promise<ListTOTPResponse>;
    get(id: string, ownerId?: string): Promise<{ token: string } | null>;
    delete(id: string, ownerId?: string): Promise<boolean>;
    mark(ids: string[], ownerId?: string): Promise<void>;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
