import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { AuthModalProvider } from "@/lib/auth-modal-context";
import { BecomeHostModalProvider } from "@/lib/become-host-modal-context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbnb",
  description: "Browse, book, and host stays — a fullstack Airbnb clone.",
  manifest: "/assets/fevicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/assets/fevicon/favicon.ico" },
      { url: "/assets/fevicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/fevicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/assets/fevicon/apple-touch-icon.png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <AuthProvider>
            <ToastProvider>
              <AuthModalProvider>
                <BecomeHostModalProvider>
                  <Navbar />
                  <main className="flex-1 pb-16 md:pb-0">{children}</main>
                  <Footer />
                  <MobileTabBar />
                </BecomeHostModalProvider>
              </AuthModalProvider>
            </ToastProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
