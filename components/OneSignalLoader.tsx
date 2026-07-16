'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/customAuth'

export default function OneSignalLoader() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return
    const onboardingDone = localStorage.getItem('onboarding_completed') === 'true'
    if (onboardingDone) setShouldLoad(true)

    // Escuta o evento disparado quando o onboarding é concluído na mesma sessão
    const handleDone = () => setShouldLoad(true)
    window.addEventListener('gem:onboarding-completed', handleDone)
    return () => window.removeEventListener('gem:onboarding-completed', handleDone)
  }, [])

  if (!shouldLoad) return null

  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  return (
    <>
      <Script id="onesignal-init" strategy="afterInteractive">
        {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          window.OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "${appId}",
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
    </>
  )
}
