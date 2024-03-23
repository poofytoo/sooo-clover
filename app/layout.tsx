import { gab } from "@/utils";

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
