import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calisthenics Trainer",
  description: "Calisthenics training platform for structured bodyweight progression",
};

import { Toaster } from "sonner";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
