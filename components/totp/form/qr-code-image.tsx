import { generateQrCode } from "@/lib/services";
import { useEffect, useState } from "react";

export const QrCodeImage = ({ secret, issuer, label }: { secret: string, issuer: string, label: string }) => {

    const [qrDataUrl, setQrData] = useState('');

    useEffect(() => {
        if (qrDataUrl !== '') {
            setQrData('');
        }
        if (secret) {
            generateQrCode(secret, label, issuer)
                .then(qrData => {
                    setQrData(qrData);
                })
        }
    }, [secret, label, issuer])
    if (!secret) return null;

    if (!qrDataUrl) {
        return <div className="p-4 border rounded-lg bg-muted h-64 flex items-center justify-center">
            <p className="text-muted-foreground text-center">
                Generating QR code...
            </p>
        </div>
    }

    return <div className="p-4 border rounded-lg bg-muted h-fit">
        <h3 className="text-lg font-medium mb-2">QR Code</h3>
        <img
            src={qrDataUrl}
            alt="TOTP QR Code"
            className="mx-auto w-48 h-48 object-contain"
        />
        <p className="text-sm text-muted-foreground mt-2 text-center">
            Scan this QR code with your authenticator app
        </p>
    </div>
};
