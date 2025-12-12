"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useGetTotp } from "../hooks/get-totp";
import init from '@totp-store/totp-rs-web'; // Import WASM initialization
import { Totp } from "@/lib/entities";

// Define the context type
type TotpContextType = ReturnType<typeof useGetTotp> & {
    isWasmReady: boolean;
    initError: string | null;
};

// Create the context with undefined as default
const TotpContext = createContext<TotpContextType | undefined>(undefined);

// Provider component
export function TotpProvider({ children }: { children: React.ReactNode }) {
    const totpHook = useGetTotp();
    const [isWasmReady, setIsWasmReady] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    // Initialize WASM module
    const initWasm = useCallback(async () => {
        try {
            // Initialize the WASM module directly
            await init();
            console.log("WASM module initialized successfully");
            setIsWasmReady(true);
        } catch (error) {
            console.error("Error initializing WASM module:", error);
            setInitError("Failed to initialize security module. Please refresh the page to try again.");
        }
    }, []);

    useEffect(() => {
        initWasm();
    }, []);

    // Show error state if WASM initialization failed
    if (initError) {
        return (
            <div className="max-w-4xl mx-auto p-4 relative">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{initError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading state while WASM is initializing
    if (!isWasmReady) {
        return (
            <div className="max-w-4xl mx-auto p-4 relative">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-muted-foreground">Initializing security module...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <TotpContext.Provider value={{ ...totpHook, isWasmReady, initError }}>
            {children}
        </TotpContext.Provider>
    );
}

// Custom hook to use the context
export function useTotpContext() {
    const context = useContext(TotpContext);
    if (context === undefined) {
        throw new Error("useTotpContext must be used within a TotpProvider");
    }
    return context;
}