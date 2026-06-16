import type { Metadata } from 'next'
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              window.OneSignalDeferred.push(async function(OneSignal) {
                await OneSignal.init({
                  appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}",
                  serviceWorkerPath: '/OneSignalSDKWorker.js',
                  autoResubscribe: false,
                  notifyButton: { enable: false },
                  promptOptions: {
                    slidedown: { enabled: false, prompts: [] }
                  }
                });
                // Garantia extra: fecha qualquer slidedown que apareça
                try { OneSignal.Slidedown.close(); } catch(e) {}
              });
            `,
          }}
        />
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer />
      </head>
      <body className="bg-warm-50 text-text-primary">
        <RootInitializer>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </RootInitializer>
      </body>
    </html>
  )
}
