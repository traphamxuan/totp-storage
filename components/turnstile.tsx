"use client";

import React, { forwardRef } from "react";
import TurnstileComponent from "react-turnstile";

// Define the props for the Turnstile component
interface TurnstileProps {
    siteKey: string;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact" | "flexible" | "invisible";
    tabIndex?: number;
    className?: string;
    onLoad?: () => void;
    onVerify?: (token: string) => void;
    onError?: (errorCode: string) => void;
    onExpire?: () => void;
    onTimeout?: () => void;
    onSuccess?: (token: string) => void;
}

// Define the ref interface
export interface TurnstileRef {
    reset: () => void;
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>((props, ref) => {
    const {
        siteKey,
        theme = "auto",
        size = 'flexible',
        tabIndex = 0,
        className = "",
        onVerify,
        onLoad,
        onError,
        onExpire,
        onTimeout,
        onSuccess,
    } = props;

    // Since the react-turnstile package doesn't expose a ref with reset method,
    // we'll create a wrapper that manages the key for resetting
    const [key, setKey] = React.useState(0);

    // Expose reset method via ref
    React.useImperativeHandle(ref, () => ({
        reset: () => {
            setKey(prev => prev + 1);
        }
    }));

    return (
        <TurnstileComponent
            key={key}
            sitekey={siteKey}
            theme={theme}
            size={size}
            tabIndex={tabIndex}
            className={className}
            onLoad={onLoad}
            onVerify={onVerify}
            onError={onError}
            onExpire={onExpire}
            onTimeout={onTimeout}
            onSuccess={onSuccess}
            refreshExpired="auto"
        />
    );
});

Turnstile.displayName = "Turnstile";

export default Turnstile;