'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="flex flex-col items-center md:items-start space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Gestar em Movimento
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Seu corpo muda a cada semana. Vamos acompanhar essa jornada juntas com exercícios personalizados e orientações especialistas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link
                href="/signup"
                className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105 text-center"
              >
                Criar Conta
              </Link>
              <Link
                href="/login"
                className="bg-white border-2 border-primary-600 text-primary-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all text-center"
              >
                Fazer Login
              </Link>
            </div>

            <div className="pt-8 border-t border-gray-300 w-full md:w-auto">
              <p className="text-sm text-gray-600">
                ✨ Exercícios adaptados a cada semana de gestação<br/>
                💚 Acompanhamento personalizado<br/>
                🎯 Orientações de especialistas<br/>
                📱 Acesso onde quiser, quando quiser
              </p>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="hidden md:flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-lg">
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
