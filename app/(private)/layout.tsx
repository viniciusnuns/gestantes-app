import Script from 'next/script'

// import { AuthGate } from '@/components/guards/AuthGate'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Uncomment AuthGate after login/auth is working
  return (
    <>
      <Script id="onesignal-init" strategy="afterInteractive">
        {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          window.OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}",
              serviceWorkerPath: '/OneSignalSDKWorker.js',
              autoResubscribe: true,
              notifyButton: { enable: false },
              promptOptions: {
                slidedown: { enabled: false, prompts: [] }
              }
            });
            try { OneSignal.Slidedown.close(); } catch(e) {}
          });
        `}
      </Script>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  )
}
