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
      <head>
        {/* Preconnect — estabelece conexão TCP antes do browser precisar dos recursos */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.facebook.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://odirmtmompghjgmhotml.supabase.co" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2243468039733508&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="bg-warm-50 text-text-primary">
        <RootInitializer>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </RootInitializer>
        {/* Microsoft Clarity — afterInteractive: carrega após a página ficar interativa */}
        {/* WebKit polyfill — beforeInteractive garante execução antes do OneSignal SDK
            em iOS Safari/WebView onde window.webkit pode não existir */}
        <Script id="webkit-polyfill" strategy="beforeInteractive">{`
          if (typeof window !== 'undefined' && !window.webkit) {
            window.webkit = { messageHandlers: {}, messagehandlers: {} };
          }
        `}</Script>
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xkv8n1zfqu");
            `,
          }}
        />
        {/* Meta Pixel — afterInteractive: carrega após a página ficar interativa */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','2243468039733508');
            `,
          }}
        />
      </body>
    </html>
  )
}
