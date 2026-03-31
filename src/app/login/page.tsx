'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Fel e-post eller lösenord.'); setLoading(false); return }
    const userType = data.user?.user_metadata?.user_type
    if (userType === 'restaurant') router.push('/restaurang/dashboard')
    else if (userType === 'admin') router.push('/admin')
    else router.push('/lunch')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <UtensilsCrossed size={28} style={{ color: '#d4af37' }} />
            <span className="text-2xl font-serif gold-text">ForkFinder</span>
          </Link>
          <div className="gold-divider max-w-24 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-light">Välkommen tillbaka</h1>
          <p className="text-white/40 text-sm mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Logga in på ditt konto
          </p>
        </div>

        <div className="luxury-card rounded-lg p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>
                E-POSTADRESS
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="luxury-input" placeholder="din@email.se" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>
                LÖSENORD
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="luxury-input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="luxury-button w-full py-3 mt-2">
              {loading ? 'LOGGAR IN...' : 'LOGGA IN'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-3">
          <p className="text-white/30 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Inget konto?
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/registrera/anvandare" className="text-gold-DEFAULT text-xs hover:underline"
              style={{ color: '#d4af37', fontFamily: 'Montserrat, sans-serif' }}>
              Registrera som användare
            </Link>
            <Link href="/registrera/restaurang" className="text-gold-DEFAULT text-xs hover:underline"
              style={{ color: '#d4af37', fontFamily: 'Montserrat, sans-serif' }}>
              Registrera restaurang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
