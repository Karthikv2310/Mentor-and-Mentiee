import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DemoSwitcher from "@/components/DemoSwitcher";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NMAMIT Mentor–Mentee Portal | NMAM Institute of Technology, Nitte",
  description:
    "Institutional mentoring, proctor management, MSE-1 academic intervention, and student progress platform for NMAM Institute of Technology, Nitte.",
  keywords: [
    "NMAMIT",
    "Nitte",
    "Student Mentoring",
    "Class Proctor",
    "Faculty Advisor",
    "Engineering College Mentoring",
  ],
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <Suspense fallback={null}>
          <DemoSwitcher />
        </Suspense>
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
