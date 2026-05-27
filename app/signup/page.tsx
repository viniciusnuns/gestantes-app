import { SignupForm } from '@/components/auth/SignupForm'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left side - Form */}
          <div className="flex flex-col items-center md:items-start order-2 md:order-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Comece sua jornada
            </h1>
            <p className="text-gray-600 mb-8">
              Crie sua conta para acessar conteúdos personalizados
            </p>
            <SignupForm />
          </div>

          {/* Right side - Image */}
          <div className="flex justify-center order-1 md:order-2">
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/pregnant-yoga.webp"
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
