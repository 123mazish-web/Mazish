import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  variable: "--font-luxury",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "MAZISH | The Hub of Fashion & Luxury in Bangladesh",
  description: "Discover premium, high-end fashion, luxury accessories, and statements starting with our curated sunglasses collection. Elevate your identity with Mazish.",
  openGraph: {
    title: "MAZISH | The Hub of Fashion & Luxury",
    description: "Discover premium sunglasses and luxury statements in Bangladesh.",
    images: [{ url: "/api/og" }],
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950">
        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
