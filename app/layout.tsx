import type { Metadata } from 'next'
import Script from 'next/script'
import '../styles/globals.css'
import RootInitializer from '@/app/RootInitializer'

export const metadata: Metadata = {
  title: 'Gestar em Movimento',
  description: 'Wellness app para gestantes - Exercícios, comunidade e suporte durante a gravidez',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gestar em Movimento',
  },
  formatDetection: { telephone: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-warm-50 text-text-primary">
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <RootInitializer>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </RootInitializer>
      </body>
    </html>
  )
}
