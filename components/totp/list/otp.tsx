"use client";

import { useState, useEffect, useRef } from "react";
import { generateToken } from "@/lib/services/otp.service";
import { Totp } from "@/lib/entities";
import { APIPublicTotp } from "@/lib/services/public-totp.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OtpProps {
    entry: Totp;
}

export function Otp({ entry }: OtpProps) {
    const [token, setToken] = useState("");
    const [expiresIn, setExpiresIn] = useState(30);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const tokenTimerRef = useRef<NodeJS.Timeout | null>(null);
    const api = new APIPublicTotp();

    // Generate initial token and start timers
    useEffect(() => {
        generateCurrentToken();
        startTimers();

        // Cleanup timers on unmount
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (tokenTimerRef.current) clearInterval(tokenTimerRef.current);
        };
    }, [entry]);

    const startTimers = () => {
        // Timer to update cooldown visualization
        timerRef.current = setInterval(() => {
            setExpiresIn((prev) => {
                const newValue = Math.max(0, prev - 1);
                // When timer reaches 0, reset to 30 and fetch new token
                if (newValue === 0) {
                    generateCurrentToken();
                    return 30;
                }
                return newValue;
            });
        }, 1000);

        // Timer to regenerate token every 30 seconds
        tokenTimerRef.current = setInterval(() => {
            generateCurrentToken();
        }, 30000);
    };

    const generateCurrentToken = async () => {
        try {
            if (entry && entry.id) {
                const result = await generateToken(entry.secret);
                if (result) {
                    setToken(result.token);
                    // Reset expiresIn when we get a new token
                    setExpiresIn(result.expiresIn);
                }
            }
        } catch (error) {
            console.error("Failed to generate token:", error);
        }
    };

    const copyToken = async () => {
        if (!token) return;
        try {
            await navigator.clipboard.writeText(token);
            // In a real implementation, we would track copied entries here
        } catch (error) {
            console.error("Failed to copy token:", error);
        }
    };

    const syncEntry = async () => {
        try {
            await generateCurrentToken();
        } catch (error) {
            console.error("Failed to sync entry:", error);
        }
    };

    const registerAndOpenLink = async () => {
        try {
            // Register the TOTP entry with the external service
            const success = await api.register(entry.id, entry.secret);
            if (success) {
                // Open new tab to the TOTP URL
                window.open(`https://totp-token.xarest.com/totp/${entry.id}`, '_blank');
            }
        } catch (error) {
            console.error("Failed to register entry:", error);
        }
    };

    return (
        <div className="flex items-center justify-end space-x-2">
            {/* Show token and cooldown */}
            <span
                onClick={copyToken}
                className="cursor-pointer font-mono text-lg bg-gray-100 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-900 px-3 py-1 rounded flex items-center"
                title="Click to copy"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") copyToken();
                }}
            >
                {token || "------"}
            </span>

            {/* Cooldown visualization */}
            <div className="relative w-6 h-6">
                <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="#e5e7eb" strokeWidth="2" />
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="62.83"
                        strokeDashoffset={62.83 * (1 - expiresIn / 30)}
                        transform="rotate(-90 12 12)"
                    />
                </svg>
            </div>

            {/* Menu button */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="text-gray-600 hover:text-gray-900 ml-2 focus:outline-none"
                        title="Menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={registerAndOpenLink}>
                        Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={syncEntry}>
                        Sync
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}