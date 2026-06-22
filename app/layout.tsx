import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Dealer — Nippon Motos',
  description: 'Plataforma inteligente de gestão Yamaha',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body
        className={`${inter.className} h-full`}
        style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
