import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    display: "swap", // ensures text stays visible while loading
    weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
    title: "IMAGO",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.className + " nice-scroll"}>
            <body>{children}</body>
        </html>
    );
}
