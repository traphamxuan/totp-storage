import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { OtpForm } from "@/components/totp/form";
import { OtpList } from "@/components/totp/list";
import { TotpProvider } from "@/components/totp"; // Import the TotpProvider from index
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  // In a real implementation, these would be managed with React state
  // and loaded from an API

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-between items-center border-b border-b-foreground/10 h-16 px-4">
          <div>
            <Link href="/" className="text-3xl font-bold text-foreground">
              TOTP Storage
            </Link>
          </div>
          <div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4">
            <TotpProvider> {/* TotpProvider will initialize the WASM module */}
              <div className="max-w-4xl mx-auto p-4 relative">
                <OtpForm />
                <OtpList />
              </div>
            </TotpProvider>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-4 py-8">
          <div className="bg-background rounded-lg shadow-md p-4 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground">
                  TOTP Storage is a secure solution for managing Time-based One-Time Password (TOTP) tokens
                  used in two-factor authentication (2FA) systems. Our platform enables automation testing
                  systems like Postman, Apidog, and others to access TOTP codes without disrupting the
                  original MFA authentication flow.
                </p>
                <p className="text-muted-foreground">
                  With TOTP Storage, you can securely store OTP codes for multiple accounts and access them
                  from anywhere you have internet connectivity. Perfect for development teams that need to
                  test authentication flows without manually entering codes.
                </p>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold mb-3">Key Features</h2>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Secure cloud-based OTP management</li>
                  <li>Seamless integration with automation testing tools</li>
                  <li>No disruption to existing MFA authentication flows</li>
                  <li>Access TOTP tokens from any device with internet</li>
                  <li>Support for multiple account management</li>
                </ul>
              </div>
            </div>
          </div>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}