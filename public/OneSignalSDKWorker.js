importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// Força ativação imediata quando o SW for atualizado
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Incrementa badge quando chega notificação (Android/Chrome)
self.addEventListener('push', () => {
  if ('setAppBadge' in self.registration) {
    self.registration.setAppBadge(1).catch(() => {});
  }
});

// Limpa badge quando usuária toca na notificação
self.addEventListener('notificationclick', () => {
  if ('clearAppBadge' in self.registration) {
    self.registration.clearAppBadge().catch(() => {});
  }
});
