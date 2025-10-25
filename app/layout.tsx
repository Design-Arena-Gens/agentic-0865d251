import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion Clone",
  description: "A Notion-like workspace built with Next.js"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-slate-950">{children}</body>
    </html>
  );
}
