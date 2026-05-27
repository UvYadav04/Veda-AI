import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "../store/StoreProvider";
import { Toaster } from "react-hot-toast";
import { useWebSocket } from "@/hooks/useWebSocket";

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment Creator",
  description: "A professional exam and assessment generator powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-main)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-md)",
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
