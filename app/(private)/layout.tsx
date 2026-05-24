// import { AuthGate } from '@/components/guards/AuthGate'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Uncomment AuthGate after login/auth is working
  return <>{children}</>
}
