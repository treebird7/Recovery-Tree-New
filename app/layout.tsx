import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rooting Routine - Recovery Walks",
  description: "Daily nature walks with recovery step work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
