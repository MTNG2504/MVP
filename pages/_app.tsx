import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/clerk-react";
import "@/index.css";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function MyApp({ Component, pageProps }: AppProps) {
  if (!publishableKey) {
    throw new Error(
      "Missing Clerk key. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (or VITE_CLERK_PUBLISHABLE_KEY for backward compatibility)."
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
