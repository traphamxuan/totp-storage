"use client";

import { useCallback, useRef } from "react";
import { APIPublicTotp, generateSecret, generateToken } from "@/lib/services";
import { useAppForm } from "../hooks/form";
import Turnstile, { TurnstileRef } from "@/components/turnstile";
import { useStore } from "@tanstack/react-form";
import { QrCodeImage } from "./qr-code-image";
import { QRCodeUploader } from "./qr-code-uploader";
import { useTotpContext } from "@/components/totp"; // Changed to use the correct path
import { Totp } from "@/lib/entities";

export function OtpForm() {
    const turnstileRef = useRef<TurnstileRef>(null);
    const { addTotp } = useTotpContext(); // Changed from useGetTotp() to useTotpContext()

    const form = useAppForm({
        defaultValues: {
            secret: '',
            label: '',
            issuer: '',
            turnstileToken: '',
        },
        validators: {
            onChangeAsync: async ({ value }) => {
                if (!value.secret) {
                    form.reset();
                    return
                }

                if (!value.turnstileToken) {
                    return 'Turnstile token is required';
                }
                try {
                    await generateToken(value.secret);
                } catch (error) {
                    return error;
                }
            },
            onSubmitAsync: async ({ value }) => {
                const totpApi = new APIPublicTotp();
                let totp: Totp | null = null;
                try {
                    totp = await totpApi.create(
                        {
                            secret: value.secret,
                            label: value.label,
                            issuer: value.issuer,
                        },
                        value.turnstileToken,
                    )
                } catch (error) {
                    return error
                }
                if (!totp) return;
                addTotp(totp);
                // Reset the form and Turnstile widget
                form.reset();
                turnstileRef.current?.reset();
            },
        },
    })

    const isSecretValid = useStore(form.store, (state) => state.values.secret.length > 0);
    const submitLabel = useStore(form.store, (state) => {
        if (state.isSubmitSuccessful) {
            return 'Add TOTP Key';
        } else if (state.isSubmitting) {
            return 'Adding...';
        } else if (state.isValidating) {
            return 'Validating secret...';
        } else if (state.errors?.length) {
            return `${state.errors[0]}`;
        } else if (state.values.turnstileToken.length <= 0) {
            return 'Checking if you are human';
        }
        return 'Add TOTP Key';
    });

    const handleQRDecoded = useCallback((secret: string, issuer: string, label: string) => {
        form.setFieldValue('secret', secret);
        form.setFieldValue('issuer', issuer, { dontValidate: true });
        form.setFieldValue('label', label, { dontValidate: true });
    }, [form]);

    return (
        <div className="bg-background rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New TOTP Key</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit(e);
            }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Input Fields */}
                    <div className="space-y-4">
                        <form.AppField
                            name='secret'
                            children={field => <div className="flex gap-2">
                                <div className="flex-1">
                                    <field.Label htmlFor="secret" className="block text-sm font-medium mb-1">
                                        Secret (Optional - Enter to generate QR code)
                                    </field.Label>
                                    <field.Input
                                        type="text"
                                        id="secret"
                                        value={field.state.value}
                                        onChange={(e) => field.setValue(e.target.value)}
                                        placeholder="Enter TOTP secret or paste QR code URI"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <field.Button
                                        type="button"
                                        id='secret'
                                        disabled={field.state.meta.isValidating}
                                        onClick={async () => {
                                            field.setValue(await generateSecret())
                                        }}
                                        className="px-3 h-[42px]"
                                        title="Generate new secret"
                                    >
                                        ↻
                                    </field.Button>
                                </div>
                            </div>}
                        />

                        <QRCodeUploader onQRDecoded={handleQRDecoded} />

                        {isSecretValid && (
                            <div className="border-t border-border pt-4 mt-4 space-y-4">
                                <form.AppField
                                    name='issuer'
                                    children={field => <div className="flex gap-2">
                                        <div className="flex-1">
                                            <field.Label htmlFor="issuer" className="block text-sm font-medium mb-1">
                                                Issuer (Optional)
                                            </field.Label>
                                            <field.Input
                                                type="text"
                                                id="issuer"
                                                value={field.state.value}
                                                onChange={(e) => field.setValue(e.target.value)}
                                                placeholder="e.g., Google, GitHub"
                                            />
                                        </div>
                                    </div>}
                                />

                                <form.AppField
                                    name='label'
                                    children={field =>
                                        <div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <field.Label htmlFor="label" className="block text-sm font-medium mb-1">
                                                        Label (Optional)
                                                    </field.Label>
                                                    <field.Input
                                                        type="text"
                                                        id="label"
                                                        value={field.state.value}
                                                        onChange={(e) => field.setValue(e.target.value)}
                                                        placeholder="e.g., john@example.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>}
                                />

                                <form.AppField
                                    name='turnstileToken'
                                    children={field =>
                                        <Turnstile
                                            ref={turnstileRef}
                                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                                            onSuccess={(token) => {
                                                field.setValue(token);
                                            }}
                                            onError={(errorCode) => {
                                                field.setValue('');
                                                form.setErrorMap({
                                                    'onChange': errorCode,
                                                })
                                            }}
                                            onExpire={() => {
                                                field.setValue('');
                                            }}
                                            onTimeout={() => {
                                                field.setValue('');
                                            }}
                                            onLoad={() => {
                                                field.setValue('');
                                            }}
                                        />
                                    }
                                />

                                <form.AppForm>
                                    <form.Button
                                        type="submit"
                                        disabled={!form.state.isValid || form.state.isSubmitting || form.state.isValidating}
                                        className="w-full"
                                    >
                                        {submitLabel}
                                    </form.Button>
                                </form.AppForm>
                            </div>
                        )}
                    </div>

                    {/* Right Column - QR Code Display */}
                    <form.Subscribe
                        selector={(state) => state.values}
                        children={({ secret, issuer, label }) => (
                            <div className="flex flex-col justify-start">
                                <QrCodeImage secret={secret} issuer={issuer} label={label} />
                            </div>
                        )}
                    />
                </div>
            </form>
        </div>
    );
}