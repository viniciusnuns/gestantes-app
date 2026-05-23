import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Form */}
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bem-vinda de volta
            </h1>
            <p className="text-gray-600 mb-8">
              Entre na sua conta para continuar sua jornada
            </p>
            <LoginForm />
          </div>

          {/* Right side - Image */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/pregnant-yoga.png"
                alt="Mulher grávida fazendo yoga com alegria"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
