import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  variable:'--font-poppins',
  subsets:['latin'],
  weight:['400','500','700','900'],
  style:['italic','normal']
})



export const metadata: Metadata = {
  title: "WikiTime",
  description: "WikiTime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <AuthProvider>
      <body className={`${poppins.className} h-full flex flex-col`}>
        <Header/>
        <main className="font-normal flex-grow flex items-center justify-center bg-gray-100">
            {children}
        </main>
        <Footer/>
      </body>
      </AuthProvider>
    </html>
  );
}
