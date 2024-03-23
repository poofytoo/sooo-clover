/* eslint-disable @next/next/no-page-custom-font */

import { Gabarito } from "next/font/google";

export const gab = Gabarito({ subsets: ["latin"] });

import "./reset.css";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={gab.className}>{children}</body>
    </html>
  );
}
