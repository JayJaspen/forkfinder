'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react'
import { COUNTIES_LIST, getCitiesForCounty } from '@/lib/sweden-data'

export default function RegisterVisitorPage() {
  const [form, setForm] = useState({ name: '', email: '', county: '', city: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const cities = getCitiesForCounty(form.county)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value, ...(field === 'county' ? { city: '' } : {}) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Lösenorden matchar inte.'); return }
    if (form.password.length < 6) { setError('Lösenordet måste vara minst 6 tecken.'); return }
    setLoading(true); setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { user_type: 'visitor', name: form.name } }
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('visitors').insert({
        id: data.user.id, name: form.name, email: form.email,
        county: form.county, city: form.city
      })
    }
    router.push('/lunch')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <UtensilsCrossed size={28} style={{ color: '#d4af37' }} />
            <span className="text-2xl font-serif gold-text">ForkFinder</span>
          </Link>
          <div className="gold-divider max-w-24 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-light">Skapa konto</h1>
          <p className="text-white/40 text-sm mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Hitta din nästa favoritlunch</p>
        </div>

        <div className="luxury-card rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'NAMN', field: 'name', type: 'text', placeholder: 'Ditt namn' },
              { label: 'E-POSTADRESS', field: 'email', type: 'email', placeholder: 'din@email.se' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="block text-xs text-white/50 mb-2 tracking-widest"
                  style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>{label}</label>
                <input type={type} value={form[field as keyof typeof form]}
                  onChange={e => update(field, e.target.value)}
                  className="luxury-input" placeholder={placeholder} required />
              </div>
            ))}

            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>LÄN</label>
              <select value={form.county} onChange={e => update('county', e.target.value)}
                className="luxury-select" required>
                <option value="">Välj län</option>
                {COUNTIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>STAD</label>
              <select value={form.city} onChange={e => update('city', e.target.value)}
                className="luxury-select" required disabled={!form.county}>
                <option value="">Välj stad</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>LÖSENORD</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="luxury-input pr-10" placeholder="Minst 6 tecken" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>BEKRÄFTA LÖSENORD</label>
              <input type={showPw ? 'text' : 'password'} value={form.confirm}
                onChange={e => update('confirm', e.target.value)}
                className="luxury-input" placeholder="Upprepa lösenord" required />
            </div>

            {error && <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>{error}</p>}

            <button type="submit" disabled={loading} className="luxury-button w-full py-3 mt-2">
              {loading ? 'SKAPAR KONTO...' : 'SKAPA KONTO'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Har du redan konto?{' '}
          <Link href="/login" style={{ color: '#d4af37' }} className="hover:underline">Logga in</Link>
        </p>
      </div>
    </div>
  )
}
