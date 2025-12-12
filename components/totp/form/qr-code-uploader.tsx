"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { decodeQRCodeFromBase64 } from "@/lib/services";
import { useCallback, useEffect } from "react";

interface QRCodeUploaderProps {
    onQRDecoded: (secret: string, issuer: string, label: string) => void;
}

export function QRCodeUploader({ onQRDecoded }: QRCodeUploaderProps) {
    const handleQRUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageFile(file);
        }
    }, []);

    const handleImageFile = useCallback(async (file: File) => {
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const imageData = e.target?.result as string;
                // Decode the QR code to extract the secret
                const decodedContent = await decodeQRCodeFromBase64(imageData);
                // Check if it's a TOTP URI
                if (decodedContent.startsWith('otpauth://totp/')) {
                    const url = new URL(decodedContent);
                    const secret = url.searchParams.get('secret') || '';
                    const issuer = url.searchParams.get('issuer') || '';
                    const label = decodeURIComponent(url.pathname.substring(1));

                    onQRDecoded(secret, issuer, label);
                } else {
                    alert('Decoded content is not a valid TOTP URI');
                }
            } catch (error) {
                console.error("Error decoding QR code:", error);
                alert("Failed to decode QR code. Please try another image.");
            }
        };
        reader.readAsDataURL(file);
    }, [onQRDecoded]);

    const handlePaste = useCallback((event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.indexOf("image") !== -1) {
                const file = item.getAsFile();
                if (file) {
                    handleImageFile(file);
                    break;
                }
            }
        }
    }, [handleImageFile]);

    useEffect(() => {
        window.addEventListener("paste", handlePaste);
        return () => {
            window.removeEventListener("paste", handlePaste);
        };
    }, [handlePaste]);

    return (
        <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-1">
                Or upload a QR code image
            </Label>
            <Input
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
            />
        </div>
    );
}