
import "./reset.css";
import "./globals.css";

import { gab } from "@/utils";

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
