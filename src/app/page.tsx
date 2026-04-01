import Link from 'next/link'
import { UtensilsCrossed, MapPin, Clock, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gold/20"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={22} style={{ color: '#d4af37' }} />
            <span className="text-xl font-serif font-semibold tracking-wider gold-text">ForkFinder</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-white/60 hover:text-white transition-colors text-sm"
              style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.78rem', letterSpacing: '0.08em' }}>
              LOGGA IN
            </Link>
            <Link href="/registrera/anvandare" className="luxury-button px-4 py-2 text-xs">
              REGISTRERA
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center pt-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #d4af37 0, #d4af37 1px, transparent 0, transparent 50%)`,
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-3xl mx-auto text-center relative z-10 py-24 fade-in-up">
          <p className="text-xs tracking-widest text-gold-DEFAULT mb-4 font-sans"
            style={{ fontFamily: 'Montserrat, sans-serif', color: '#d4af37', letterSpacing: '0.25em' }}>
            SVERIGES BÄSTA RESTAURANGGUIDE
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight">
            Hitta dagens{' '}
            <span className="gold-text font-semibold">bästa lunch</span>
          </h1>
          <p className="text-lg text-white/50 mb-12 max-w-xl mx-auto font-light"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
            Lunchmenyer och kvällsmenyer från de bästa restaurangerna nära dig – sorterat på stad och kategori.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lunch" className="luxury-button px-8 py-3">
              HITTA LUNCH NU
            </Link>
            <Link href="/registrera/restaurang"
              className="luxury-button-outline px-8 py-3">
              ÄR DU RESTAURANG?
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="gold-divider mx-12" />

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <MapPin size={28} style={{ color: '#d4af37' }} />, title: 'Filtrera på stad', desc: 'Välj din stad och se alla restauranger med dagens lunchmeny direkt.' },
            { icon: <Clock size={28} style={{ color: '#d4af37' }} />, title: 'Alltid aktuellt', desc: 'Restaurangerna uppdaterar sin veckomeny själva – du ser alltid rätt.' },
            { icon: <Star size={28} style={{ color: '#d4af37' }} />, title: 'Hela veckan', desc: 'Se inte bara dagens – bläddra fritt mellan veckans alla dagar.' },
          ].map((f, i) => (
            <div key={i} className="luxury-card rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="text-lg font-serif mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="gold-divider max-w-xs mx-auto mb-16" />
        <h2 className="text-3xl font-serif mb-4">Är du restaurangägare?</h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300 }}>
          Registrera din restaurang och nå tusentals hungriga matgäster varje dag.
        </p>
        <Link href="/registrera/restaurang" className="luxury-button px-10 py-3">
          REGISTRERA RESTAURANG
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-8 px-6 text-center">
        <span className="text-white/20 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          © 2025 ForkFinder.se – Sveriges bästa restaurangguide
        </span>
      </footer>
    </div>
  )
}
