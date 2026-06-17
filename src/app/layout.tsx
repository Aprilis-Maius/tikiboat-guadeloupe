import { Bebas_Neue, Poppins } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let locale = "fr";
  try { locale = await getLocale(); } catch { /* admin routes without locale */ }

  return (
    <html lang={locale} className={`scroll-smooth ${bebasNeue.variable} ${poppins.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
