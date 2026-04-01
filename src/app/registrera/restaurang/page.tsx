'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { UtensilsCrossed, Eye, EyeOff, Plus, X } from 'lucide-react'
import { COUNTIES_LIST, getCitiesForCounty, FOOD_TYPES } from '@/lib/sweden-data'

interface ExtraLocation { county: string; city: string }

export default function RegisterRestaurantPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    orgNumber: '', registeredName: '', publicName: '', county: '', city: '',
    streetAddress: '', zipCode: '', phone: '', website: '',
    foodTypes: [] as string[], password: '', confirm: '',
    invoiceType: 'email' as 'email' | 'postal',
    invoiceEmail: '', invoiceStreet: '', invoiceZip: '', invoiceCity: '',
  })
  const [extraLocations, setExtraLocations] = useState<ExtraLocation[]>([])
  const [addingLocation, setAddingLocation] = useState(false)
  const [newLoc, setNewLoc] = useState<ExtraLocation>({ county: '', city: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const cities = getCitiesForCounty(form.county)
  const newLocCities = getCitiesForCounty(newLoc.county)

  function update(field: string, value: string | string[]) {
    setForm(prev => ({ ...prev, [field]: value, ...(field === 'county' ? { city: '' } : {}) }))
  }

  function toggleFoodType(ft: string) {
    setForm(prev => ({
      ...prev, foodTypes: prev.foodTypes.includes(ft)
        ? prev.foodTypes.filter(f => f !== ft) : [...prev.foodTypes, ft]
    }))
  }

  function addLocation() {
    if (newLoc.county && newLoc.city) {
      setExtraLocations(prev => [...prev, newLoc])
      setNewLoc({ county: '', city: '' })
      setAddingLocation(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Lösenorden matchar inte.'); return }
    if (form.password.length < 6) { setError('Lösenordet måste vara minst 6 tecken.'); return }
    setLoading(true); setError('')

    const email = form.invoiceEmail || `${form.orgNumber}@restaurant.forkfinder`

    const res = await fetch('/api/register-restaurant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: form.password,
        publicName: form.publicName,
        restaurantData: {
          org_number: form.orgNumber,
          registered_name: form.registeredName,
          public_name: form.publicName,
          county: form.county, city: form.city,
          street_address: form.streetAddress, zip_code: form.zipCode,
          phone: form.phone || null, website: form.website || null,
          food_types: form.foodTypes,
          invoice_type: form.invoiceType,
          invoice_email: form.invoiceType === 'email' ? form.invoiceEmail : null,
          invoice_address: form.invoiceType === 'postal'
            ? { street: form.invoiceStreet, zip_code: form.invoiceZip, city: form.invoiceCity } : null,
          is_approved: false, is_visible: false,
        },
        extraLocations,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError('Fel vid sparande: ' + data.error); setLoading(false); return }

    // Logga in med de nya uppgifterna
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: form.password })
    if (signInError) { setError(signInError.message); setLoading(false); return }

    router.push('/restaurang/dashboard')
    router.refresh()
  }

  const labelClass = "block text-xs text-white/50 mb-2 tracking-widest"
  const labelStyle = { fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <UtensilsCrossed size={28} style={{ color: '#d4af37' }} />
            <span className="text-2xl font-serif gold-text">ForkFinder</span>
          </Link>
          <div className="gold-divider max-w-24 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-light">Registrera restaurang</h1>
          <p className="text-white/40 text-sm mt-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Steg {step} av 3
          </p>
        </div>

        <div className="luxury-card rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Company info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif gold-text mb-4">Företagsinformation</h2>
                {[
                  { label: 'ORGANISATIONSNUMMER', field: 'orgNumber', placeholder: '556xxx-xxxx' },
                  { label: 'REGISTRERAT FÖRETAGSNAMN', field: 'registeredName', placeholder: 'AB Restaurang Sverige' },
                  { label: 'PUBLIKT NAMN (visas för besökare)', field: 'publicName', placeholder: 'Restaurang Smaken' },
                  { label: 'GATUADRESS', field: 'streetAddress', placeholder: 'Storgatan 12' },
                  { label: 'POSTNUMMER', field: 'zipCode', placeholder: '123 45' },
                  { label: 'TELEFON', field: 'phone', placeholder: '08-123 45 67' },
                  { label: 'HEMSIDA', field: 'website', placeholder: 'https://restaurangen.se' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className={labelClass} style={labelStyle}>{label}</label>
                    <input type="text" value={form[field as keyof typeof form] as string}
                      onChange={e => update(field, e.target.value)}
                      className="luxury-input" placeholder={placeholder}
                      required={!['phone', 'website'].includes(field)} />
                  </div>
                ))}

                <div>
                  <label className={labelClass} style={labelStyle}>LÄN</label>
                  <select value={form.county} onChange={e => update('county', e.target.value)} className="luxury-select" required>
                    <option value="">Välj län</option>
                    {COUNTIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>STAD</label>
                  <select value={form.city} onChange={e => update('city', e.target.value)} className="luxury-select" required disabled={!form.county}>
                    <option value="">Välj stad</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Extra locations */}
                <div className="border-t border-gold/10 pt-4 mt-4">
                  <p className="text-sm font-serif mb-3">Fler orter</p>
                  {extraLocations.map((loc, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-white/60 mb-1">
                      <span style={{ fontFamily: 'Montserrat, sans-serif' }}>{loc.city}, {loc.county}</span>
                      <button type="button" onClick={() => setExtraLocations(prev => prev.filter((_, j) => j !== i))}>
                        <X size={14} className="text-white/40 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                  {addingLocation ? (
                    <div className="space-y-2 mt-2">
                      <select value={newLoc.county} onChange={e => setNewLoc({ county: e.target.value, city: '' })} className="luxury-select">
                        <option value="">Välj län</option>
                        {COUNTIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={newLoc.city} onChange={e => setNewLoc(prev => ({ ...prev, city: e.target.value }))} className="luxury-select" disabled={!newLoc.county}>
                        <option value="">Välj stad</option>
                        {newLocCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button type="button" onClick={addLocation} className="luxury-button flex-1 py-2 text-xs">LÄGG TILL</button>
                        <button type="button" onClick={() => setAddingLocation(false)} className="luxury-button-outline flex-1 py-2 text-xs">AVBRYT</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setAddingLocation(true)}
                      className="flex items-center gap-1 text-gold-DEFAULT text-xs mt-2 hover:underline"
                      style={{ color: '#d4af37', fontFamily: 'Montserrat, sans-serif' }}>
                      <Plus size={14} /> Finns i fler städer
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => setStep(2)} className="luxury-button w-full py-3 mt-4"
                  disabled={!form.orgNumber || !form.registeredName || !form.publicName || !form.county || !form.city}>
                  NÄSTA STEG
                </button>
              </div>
            )}

            {/* STEP 2: Food types */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif gold-text mb-4">Typ av mat</h2>
                <p className="text-white/40 text-xs mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Välj alla kategorier som stämmer för er restaurang.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {FOOD_TYPES.map(ft => (
                    <button key={ft} type="button" onClick={() => toggleFoodType(ft)}
                      className={`text-xs py-2 px-3 rounded border transition-all text-left ${
                        form.foodTypes.includes(ft)
                          ? 'border-gold bg-gold/10 text-gold-DEFAULT'
                          : 'border-white/10 text-white/50 hover:border-gold/30'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif', color: form.foodTypes.includes(ft) ? '#d4af37' : undefined }}>
                      {ft}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="luxury-button-outline flex-1 py-3">TILLBAKA</button>
                  <button type="button" onClick={() => setStep(3)} className="luxury-button flex-1 py-3" disabled={form.foodTypes.length === 0}>NÄSTA STEG</button>
                </div>
              </div>
            )}

            {/* STEP 3: Account & billing */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-serif gold-text mb-4">Konto & fakturering</h2>
                <div>
                  <label className={labelClass} style={labelStyle}>FAKTURERINGSMETOD</label>
                  <div className="flex gap-3">
                    {(['email', 'postal'] as const).map(type => (
                      <button key={type} type="button" onClick={() => update('invoiceType', type)}
                        className={`flex-1 py-2 rounded border text-xs transition-all ${
                          form.invoiceType === type ? 'border-gold bg-gold/10' : 'border-white/10 text-white/50'
                        }`} style={{ fontFamily: 'Montserrat, sans-serif', color: form.invoiceType === type ? '#d4af37' : undefined }}>
                        {type === 'email' ? 'E-POSTFAKTURA' : 'POSTFAKTURA'}
                      </button>
                    ))}
                  </div>
                </div>
                {form.invoiceType === 'email' && (
                  <div>
                    <label className={labelClass} style={labelStyle}>FAKTURAADRESS (E-POST)</label>
                    <input type="email" value={form.invoiceEmail} onChange={e => update('invoiceEmail', e.target.value)}
                      className="luxury-input" placeholder="faktura@restaurangen.se" required />
                  </div>
                )}
                {form.invoiceType === 'postal' && (
                  <div className="space-y-3">
                    <div className="text-xs text-gold-DEFAULT/70 p-3 rounded border border-gold/20 bg-gold/5"
                      style={{ fontFamily: 'Montserrat, sans-serif', color: '#d4af37' }}>
                      OBS: Postfaktura tillkommer en administrativ avgift på 39 kr/faktura.
                    </div>
                    {[
                      { label: 'GATUADRESS', field: 'invoiceStreet', placeholder: 'Fakturavägen 1' },
                      { label: 'POSTNUMMER', field: 'invoiceZip', placeholder: '123 45' },
                      { label: 'ORT', field: 'invoiceCity', placeholder: 'Stockholm' },
                    ].map(({ label, field, placeholder }) => (
                      <div key={field}>
                        <label className={labelClass} style={labelStyle}>{label}</label>
                        <input type="text" value={form[field as keyof typeof form] as string}
                          onChange={e => update(field, e.target.value)}
                          className="luxury-input" placeholder={placeholder} required />
                      </div>
                    ))}
                    <div>
                      <label className={labelClass} style={labelStyle}>E-POSTADRESS (för inloggning)</label>
                      <input type="email" value={form.invoiceEmail} onChange={e => update('invoiceEmail', e.target.value)}
                        className="luxury-input" placeholder="info@restaurangen.se" required />
                    </div>
                  </div>
                )}
                <div>
                  <label className={labelClass} style={labelStyle}>LÖSENORD</label>
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
                  <label className={labelClass} style={labelStyle}>BEKRÄFTA LÖSENORD</label>
                  <input type={showPw ? 'text' : 'password'} value={form.confirm}
                    onChange={e => update('confirm', e.target.value)}
                    className="luxury-input" placeholder="Upprepa lösenord" required />
                </div>

                {error && <p className="text-red-400 text-sm text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>{error}</p>}

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(2)} className="luxury-button-outline flex-1 py-3">TILLBAKA</button>
                  <button type="submit" disabled={loading} className="luxury-button flex-1 py-3">
                    {loading ? 'REGISTRERAR...' : 'REGISTRERA'}
                  </button>
                </div>
              </div>
            )}
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
