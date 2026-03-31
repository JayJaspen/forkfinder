'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Menu, X, LogOut, User, UtensilsCrossed } from 'lucide-react'

interface HeaderProps {
  userType?: 'visitor' | 'restaurant' | 'admin'
  userName?: string
}

export default function Header({ userType, userName }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gold/20"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={userType ? (userType === 'restaurant' ? '/restaurang/dashboard' : userType === 'admin' ? '/admin' : '/lunch') : '/'}>
            <div className="flex items-center gap-2 cursor-pointer">
              <UtensilsCrossed className="text-gold-DEFAULT" size={22} style={{ color: '#d4af37' }} />
              <span className="text-xl font-serif font-semibold tracking-wider gold-text">
                ForkFinder
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {!userType && (
              <>
                <Link href="/login" className="text-white/70 hover:text-gold-DEFAULT text-sm font-sans tracking-wide transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  LOGGA IN
                </Link>
                <Link href="/registrera/anvandare" className="luxury-button text-xs px-4 py-2">
                  REGISTRERA
                </Link>
              </>
            )}
            {userType === 'visitor' && (
              <>
                <Link href="/lunch" className="text-white/70 hover:text-gold-DEFAULT text-sm font-sans tracking-wide transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem' }}>
                  LUNCH
                </Link>
                <Link href="/profil" className="text-white/70 hover:text-gold-DEFAULT text-sm font-sans tracking-wide transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem' }}>
                  MIN SIDA
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-xs"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <LogOut size={14} />
                  <span>LOGGA UT</span>
                </button>
              </>
            )}
            {userType === 'restaurant' && (
              <>
                <Link href="/restaurang/dashboard" className="text-white/70 hover:text-gold-DEFAULT text-sm font-sans tracking-wide transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem' }}>
                  MENY
                </Link>
                <Link href="/restaurang/installningar" className="text-white/70 hover:text-gold-DEFAULT text-sm font-sans tracking-wide transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem' }}>
                  INSTÄLLNINGAR
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-xs"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <LogOut size={14} />
                  <span>LOGGA UT</span>
                </button>
              </>
            )}
            {userType === 'admin' && (
              <>
                <span className="text-gold-DEFAULT/70 text-xs font-sans" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  ADMIN
                </span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-xs"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <LogOut size={14} />
                  <span>LOGGA UT</span>
                </button>
              </>
            )}
            {userName && (
              <span className="text-white/40 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {userName}
              </span>
            )}
          </nav>

          {/* Mobile burger */}
          <button className="md:hidden text-gold-DEFAULT" style={{ color: '#d4af37' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gold/20 px-4 py-4 space-y-3" style={{ background: 'rgba(0,0,0,0.98)' }}>
          {!userType && (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block text-white/70 hover:text-white py-2 font-sans text-sm">Logga in</Link>
              <Link href="/registrera/anvandare" onClick={() => setMenuOpen(false)} className="block luxury-button text-center">Registrera</Link>
            </>
          )}
          {userType === 'visitor' && (
            <>
              <Link href="/lunch" onClick={() => setMenuOpen(false)} className="block text-white/70 hover:text-white py-2 font-sans text-sm">Lunch</Link>
              <Link href="/profil" onClick={() => setMenuOpen(false)} className="block text-white/70 hover:text-white py-2 font-sans text-sm">Min sida</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block text-white/50 hover:text-white py-2 font-sans text-sm">Logga ut</button>
            </>
          )}
          {userType === 'restaurant' && (
            <>
              <Link href="/restaurang/dashboard" onClick={() => setMenuOpen(false)} className="block text-white/70 hover:text-white py-2 font-sans text-sm">Lunchmenyer</Link>
              <Link href="/restaurang/installningar" onClick={() => setMenuOpen(false)} className="block text-white/70 hover:text-white py-2 font-sans text-sm">Inställningar</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block text-white/50 hover:text-white py-2 font-sans text-sm">Logga ut</button>
            </>
          )}
          {userType === 'admin' && (
            <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="block text-white/50 hover:text-white py-2 font-sans text-sm">Logga ut</button>
          )}
        </div>
      )}
    </header>
  )
}
