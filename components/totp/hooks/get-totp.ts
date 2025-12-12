import { Totp } from "@/lib/entities";
import { APIPublicTotp } from "@/lib/services";
import { useState } from "react";

type TotpList = {
    totps: Totp[];
    total: number;
    filter: Record<keyof CreateTotpPayload, string>;
    page: Pagination;
    search: string;
    loading: boolean;
}

export const useGetTotp = () => {
    const [totpList, setTotps] = useState<TotpList>({
        totps: [],
        total: 0,
        page: {
            size: 5,
            page: 1
        },
        filter: {
            issuer: "",
            label: "",
            secret: ""
        },
        search: "",
        loading: false,
    });
    const totpApi = new APIPublicTotp();
    const onFetch = async (filter: Record<keyof CreateTotpPayload, string>, page: Pagination, search: string) => {
        if (totpList.loading) return;
        const totpState = { ...totpList, loading: true };
        setTotps({ ...totpState });
        try {
            const response = await totpApi.list(filter, page, search);
            totpState.filter = filter;
            totpState.page = page;
            totpState.search = search;
            totpState.totps = response.entries;
            totpState.total = response.total;
        } catch (error) {
            console.error("Error loading OTP entry:", error);
        } finally {
            setTotps({ ...totpState, loading: false });
        }
    };

    const addTotp = (data: Totp) => {
        setTotps(prev => ({ ...prev, totps: [data, ...prev.totps], total: prev.total + 1 }));
    };

    return {
        data: totpList,
        onFetch,
        addTotp,
    }
};