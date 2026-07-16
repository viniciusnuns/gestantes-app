import RootInitializer from '@/app/RootInitializer'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RootInitializer>{children}</RootInitializer>
}
