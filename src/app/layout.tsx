import type { Metadata } from "next";
import { ClientLayout } from "../components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alpha Estates | Modern Real Estate Platform",
  description:
    "Find your perfect home with Alpha Estates. Modern real estate platform with advanced search, verified listings, and expert support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen antialiased" suppressHydrationWarning={true}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
