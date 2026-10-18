import type { Metadata, Viewport } from "next";
import { Archivo, Outfit } from "next/font/google";
import Link from "next/link";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const body = Outfit({ variable: "--font-body", subsets: ["latin"] });
const heading = Archivo({ variable: "--font-heading", subsets: ["latin"], style: "italic", weight: ["800", "900"] });

export const metadata: Metadata = {
  title: "RunSphere: build your running habit",
  description: "Free weekly running challenges, streaks and plans for beginner university runners in Malaysia. SDG 3.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Runs before the page paints: applies the saved theme (or the device's) so there's no flash.
const themeScript = `try{var t=localStorage.getItem("runsphere:theme");document.documentElement.dataset.theme=t||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <header className="sticky top-0 z-10 bg-ink/90 backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
            <Link href="/" className="display swoosh text-2xl uppercase">
              RunSphere
            </Link>
            <ThemeToggle />
          </div>
        </header>
        {/* pb leaves room for the floating bottom nav */}
        <main className="mx-auto max-w-xl px-4 pt-3 pb-32">{children}</main>
        <Nav />
      </body>
    </html>
  );
}
