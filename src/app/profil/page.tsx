'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import { COUNTIES_LIST, getCitiesForCounty } from '@/lib/sweden-data'
import type { Visitor } from '@/types'
import { CheckCircle } from 'lucide-react'

export default function ProfilPage() {
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [form, setForm] = useState({ name: '', county: '', city: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const cities = getCitiesForCounty(form.county)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: v } = await supabase.from('visitors').select('*').eq('id', user.id).single()
      if (v) { setVisitor(v); setForm({ name: v.name, county: v.county, city: v.city }) }
      setLoading(false)
    }
    load()
  }, [])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value, ...(field === 'county' ? { city: '' } : {}) }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('visitors').update({
      name: form.name, county: form.county, city: form.city
    }).eq('id', user.id)
    if (err) setError('Kunde inte spara. Försök igen.')
    else setSaved(true)
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-black pt-16 flex items-center justify-center text-white/30">Laddar...</div>

  return (
    <div className="min-h-screen bg-black pt-16">
      <Header userType="visitor" userName={visitor?.name} />
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-3xl font-serif mb-2">Min sida</h1>
        <div className="gold-divider max-w-16 mb-8" />

        <div className="luxury-card rounded-lg p-8">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>NAMN</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                className="luxury-input" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>LÄN</label>
              <select value={form.county} onChange={e => update('county', e.target.value)} className="luxury-select" required>
                <option value="">Välj län</option>
                {COUNTIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2 tracking-widest"
                style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }}>STAD</label>
              <select value={form.city} onChange={e => update('city', e.target.value)} className="luxury-select" required disabled={!form.county}>
                <option value="">Välj stad</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {error && <p className="text-red-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{error}</p>}
            {saved && (
              <div className="flex items-center gap-2 text-green-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <CheckCircle size={16} /> Sparat!
              </div>
            )}

            <button type="submit" disabled={saving} className="luxury-button w-full py-3">
              {saving ? 'SPARAR...' : 'SPARA ÄNDRINGAR'}
            </button>
          </form>
        </div>

        <div className="mt-6 luxury-card rounded-lg p-6">
          <h2 className="text-lg font-serif mb-4">Kontoinformation</h2>
          <p className="text-white/40 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            E-post: {visitor?.email || '–'}
          </p>
          <p className="text-white/40 text-sm mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Medlem sedan: {visitor?.created_at ? new Date(visitor.created_at).toLocaleDateString('sv-SE') : '–'}
          </p>
        </div>
      </div>
    </div>
  )
}
