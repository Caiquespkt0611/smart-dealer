'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export type HeroSlide = {
  img: string
  pos?: string
  title: React.ReactNode
  sub: string
  href: string
  cta: string
}

/* O carrossel da home do site da Yamaha, com os números da loja no lugar da moto do mês. */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0)
  const pausado = useRef(false)
  const n = slides.length

  useEffect(() => {
    if (n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => { if (!pausado.current) setI(v => (v + 1) % n) }, 7000)
    return () => clearInterval(t)
  }, [n])

  const ir = (d: number) => setI(v => (v + d + n) % n)

  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-[#070633] h-[420px] md:h-[460px]"
      onMouseEnter={() => { pausado.current = true }}
      onMouseLeave={() => { pausado.current = false }}
      aria-roledescription="carrossel"
    >
      {slides.map((s, k) => (
        <div
          key={k}
          className="absolute inset-0"
          style={{ opacity: k === i ? 1 : 0, transition: 'opacity 600ms ease-out' }}
          aria-hidden={k !== i}
        >
          <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: s.pos ?? 'center', transform: k === i ? 'scale(1)' : 'scale(1.03)', transition: 'transform 1200ms ease-out' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(7,6,51,.90) 0%, rgba(7,6,51,.62) 40%, rgba(7,6,51,0) 75%)' }} />
          <div className="absolute inset-0 md:hidden" style={{ background: 'rgba(7,6,51,.45)' }} />
          <div className="relative h-full flex flex-col justify-center px-6 md:px-24 max-w-[760px] text-white">
            <h2 className="yh-title text-white text-[clamp(38px,4.6vw,72px)]">{s.title}</h2>
            <p className="mt-4 text-[16px] md:text-[18px] leading-relaxed text-white/85 max-w-[520px]">{s.sub}</p>
            <Link href={s.href} tabIndex={k === i ? 0 : -1}
              className="mt-7 inline-flex w-fit items-center gap-2 h-12 px-6 rounded-full bg-[#fff] text-[#070633] font-semibold text-[15px] hover:bg-[#E9E9FF] active:scale-[.98]"
              style={{ transition: 'background-color 150ms ease-out, transform 120ms ease-out' }}>
              {s.cta} <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      ))}

      {n > 1 && (
        <>
          <button onClick={() => ir(-1)} aria-label="Anterior" className="yh-arrow absolute left-4 md:left-6 top-1/2 -translate-y-1/2 hidden md:grid">
            <ArrowLeft size={22} />
          </button>
          <button onClick={() => ir(1)} aria-label="Próximo" className="yh-arrow absolute right-4 md:right-6 top-1/2 -translate-y-1/2 hidden md:grid">
            <ArrowRight size={22} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {slides.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Ir para o destaque ${k + 1}`}
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: k === i ? '#2C2CFF' : '#fff',
                  boxShadow: k === i ? '0 0 0 3px rgba(255,255,255,.95)' : 'none',
                  transition: 'background-color 200ms ease-out',
                }} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
