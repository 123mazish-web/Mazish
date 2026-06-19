import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavigationEvents from "@/components/NavigationEvents";
import Script from "next/script";

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
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-zinc-950"
        suppressHydrationWarning
      >
        {/* Google Tag Manager (Script Injection via next/script) */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TF4VDBZV');`}
        </Script>

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TF4VDBZV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {/* Route Tracking for GTM */}
        <NavigationEvents />

        <CartProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
