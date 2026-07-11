'use client'

import { ChevronDown, Lock } from 'lucide-react'
import { CARD_INSTALLMENTS } from '@/lib/checkout-config'

const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12']
const YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i))

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

const selectCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent cursor-pointer'
const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white'

interface CardFieldsProps {
  cardNumber: string
  setCardNumber: (v: string) => void
  cardHolder: string
  setCardHolder: (v: string) => void
  cardMonth: string
  setCardMonth: (v: string) => void
  cardYear: string
  setCardYear: (v: string) => void
  cardCvv: string
  setCardCvv: (v: string) => void
  installmentCount: number
  setInstallmentCount: (v: number) => void
}

export default function CardFields({
  cardNumber, setCardNumber,
  cardHolder, setCardHolder,
  cardMonth, setCardMonth,
  cardYear, setCardYear,
  cardCvv, setCardCvv,
  installmentCount, setInstallmentCount,
}: CardFieldsProps) {
  return (
    <div className="space-y-2.5">
      <div className="h-px bg-gray-100" />

      <div className="relative">
        <input type="text" value={cardNumber}
          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="Número do cartão" inputMode="numeric"
          className={`${inputCls} pr-10`} autoComplete="cc-number" />
        <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      <input type="text" value={cardHolder}
        onChange={e => setCardHolder(e.target.value.toUpperCase())}
        placeholder="Nome igual no cartão" className={inputCls} autoComplete="cc-name" />

      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <select value={cardMonth} onChange={e => setCardMonth(e.target.value)} className={selectCls} autoComplete="cc-exp-month">
            <option value="">Mês</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={cardYear} onChange={e => setCardYear(e.target.value)} className={selectCls} autoComplete="cc-exp-year">
            <option value="">Ano</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <input type="text" value={cardCvv}
          onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="CVV" inputMode="numeric" className={inputCls} autoComplete="cc-csc" />
      </div>

      <div className="relative">
        <select value={installmentCount} onChange={e => setInstallmentCount(Number(e.target.value))} className={selectCls}>
          {CARD_INSTALLMENTS.map(opt => (
            <option key={opt.count} value={opt.count}>
              {opt.count === 1
                ? `1x de R$ ${opt.total.toFixed(2).replace('.', ',')} (à vista)`
                : `${opt.count}x de R$ ${opt.value.toFixed(2).replace('.', ',')}`}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
