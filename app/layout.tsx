import type { Metadata } from 'next'
import { Roboto, Saira_Condensed } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

// Mesma dupla do site da Yamaha: título condensado e quadrado, texto em Roboto.
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-body' })
const saira = Saira_Condensed({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Smart Dealer · Yamaha',
  description: 'Inteligência de gestão para a rede Yamaha',
}

const themeScript = `(function(){try{var t=localStorage.getItem('sd-theme-yamaha')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${roboto.variable} ${saira.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
