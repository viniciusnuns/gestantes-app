import AchievementProvider from '@/components/AchievementProvider'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <AchievementProvider>{children}</AchievementProvider>
}
