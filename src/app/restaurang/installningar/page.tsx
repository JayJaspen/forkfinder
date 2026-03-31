'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import { COUNTIES_LIST, getCitiesForCounty, AMENITIES, DAYS_OF_WEEK, FOOD_TYPES } from '@/lib/sweden-data'
import type { Restaurant, OpeningHour } from '@/types'
import { CheckCircle, Upload } from 'lucide-react'

export default function RestaurantInstallningarPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [form, setForm] = useState({ publicName: '', phone: '', website: '', description: '', county: '', city: '', streetAddress: '', zipCode: '', foodTypes: [] as string[], selectedAmenities: [] as string[] })
  const [hours, setHours] = useState<OpeningHour[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'hours' | 'amenities'>('info')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const cities = getCitiesForCounty(form.county)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: r } = await supabase.from('restaurants').select('*').eq('id', user.id).single()
      if (r) {
        setRestaurant(r)
        setLogoUrl(r.logo_url)
        setForm({ publicName: r.public_name, phone: r.phone || '', website: r.website || '', description: r.description || '', county: r.county, city: r.city, streetAddress: r.street_address, zipCode: r.zip_code, foodTypes: r.food_types || [], selectedAmenities: [] })
        const { data: amen } = await supabase.from('restaurant_amenities').select('amenity_id').eq('restaurant_id', user.id)
        if (amen) setForm(prev => ({ ...prev, selectedAmenities: amen.map((a: any) => a.amenity_id) }))
        const { data: hoursData } = await supabase.from('opening_hours').select('*').eq('restaurant_id', user.id).order('day_of_week')
        if (hoursData && hoursData.length > 0) {
          setHours(hoursData)
        } else {
          setHours(Array.from({ length: 7 }, (_, i) => ({ id: '', restaurant_id: user.id, day_of_week: i, open_time: '11:00', close_time: '14:00', is_closed: i >= 5 })))
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  function update(field: string, value: string | string[]) {
    setForm(prev => ({ ...prev, [field]: value, ...(field === 'county' ? { city: '' } : {}) }))
  }

  function toggleFoodType(ft: string) {
    setForm(prev => ({ ...prev, foodTypes: prev.foodTypes.includes(ft) ? prev.foodTypes.filter(f => f !== ft) : [...prev.foodTypes, ft] }))
  }

  function toggleAmenity(id: string) {
    setForm(prev => ({ ...prev, selectedAmenities: prev.selectedAmenities.includes(id) ? prev.selectedAmenities.filter(a => a !== id) : [...prev.selectedAmenities, id] }))
  }

  function updateHour(idx: number, field: keyof OpeningHour, value: string | boolean) {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h))
  }

  async function uploadLogo(file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setLogoUploading(true)
    const ext = file.name.split('.').pop()
    const path = `logos/${user.id}.${ext}`
    const { error } = await supabase.storage.from('restaurant-assets').upload(path, file, { upsert: true })
    if (!error) {
      const { data: urlData } = supabase.storage.from('restaurant-assets').getPublicUrl(path)
      const url = urlData.publicUrl
      setLogoUrl(url)
      await supabase.from('restaurants').update({ logo_url: url }).eq('id', user.id)
    }
    setLogoUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('restaurants').update({
      public_name: form.publicName, phone: form.phone || null, website: form.website || null,
      description: form.description || null, county: form.county, city: form.city,
      street_address: form.streetAddress, zip_code: form.zipCode, food_types: form.foodTypes,
    }).eq('id', user.id)

    await supabase.from('restaurant_amenities').delete().eq('restaurant_id', user.id)
    if (form.selectedAmenities.length > 0) {
      await supabase.from('restaurant_amenities').insert(form.selectedAmenities.map(id => ({ restaurant_id: user.id, amenity_id: id })))
    }

    for (const h of hours) {
      if (h.id) {
        await supabase.from('opening_hours').update({ open_time: h.open_time, close_time: h.close_time, is_closed: h.is_closed }).eq('id', h.id)
      } else {
        const { data: newH } = await supabase.from('opening_hours').insert({ restaurant_id: user.id, day_of_week: h.day_of_week, open_time: h.open_time, close_time: h.close_time, is_closed: h.is_closed }).select().single()
        if (newH) setHours(prev => prev.map((old, i) => old.day_of_week === h.day_of_week ? newH : old))
      }
    }

    setSaved(true); setSaving(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const labelClass = "block text-xs text-white/50 mb-2 tracking-widest"
  const labelStyle = { fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.15em' }
  const tabStyle = (t: string) => `px-4 py-2 text-xs transition-all border-b-2 ${activeTab === t ? 'border-gold text-gold-DEFAULT' : 'border-transparent text-white/40 hover:text-white/70'}`

  if (loading) return <div className="min-h-screen bg-black pt-16 flex items-center justify-center text-white/30">Laddar...</div>

  return (
    <div className="min-h-screen bg-black pt-16">
      <Header userType="restaurant" userName={restaurant?.public_name} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif mb-2">Inställningar</h1>
        <div className="gold-divider max-w-16 mb-6" />

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {[['info', 'RESTAURANGINFO'], ['hours', 'ÖPPETTIDER'], ['amenities', 'BEKVÄMLIGHETER']].map(([k, label]) => (
            <button key={k} className={tabStyle(k)} style={{ color: activeTab === k ? '#d4af37' : undefined }}
              onClick={() => setActiveTab(k as typeof activeTab)}>{label}</button>
          ))}
        </div>

        <form onSubmit={handleSave} className="luxury-card rounded-lg p-6 space-y-5">
          {activeTab === 'info' && (
            <>
              {/* Logo */}
              <div>
                <label className={labelClass} style={labelStyle}>LOGOTYP</label>
                <div className="flex items-center gap-4">
                  {logoUrl ? <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain rounded border border-gold/20" /> : <div className="w-20 h-20 rounded border border-white/10 flex items-center justify-center text-white/20"><span className="text-2xl">{restaurant?.public_name?.charAt(0)}</span></div>}
                  <div>
                    <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                    <button type="button" onClick={() => fileRef.current?.click()} className="luxury-button-outline px-4 py-2 text-xs flex items-center gap-2">
                      <Upload size={14} /> {logoUploading ? 'LADDAR UPP...' : 'BYTA LOGOTYP'}
                    </button>
                  </div>
                </div>
              </div>

              {[
                { label: 'PUBLIKT NAMN', field: 'publicName', type: 'text', required: true },
                { label: 'TELEFON', field: 'phone', type: 'tel', required: false },
                { label: 'HEMSIDA', field: 'website', type: 'url', required: false },
              ].map(({ label, field, type, required }) => (
                <div key={field}>
                  <label className={labelClass} style={labelStyle}>{label}</label>
                  <input type={type} value={form[field as keyof typeof form] as string}
                    onChange={e => update(field, e.target.value)} className="luxury-input" required={required} />
                </div>
              ))}

              <div>
                <label className={labelClass} style={labelStyle}>BESKRIVNING</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)}
                  className="luxury-input min-h-24 resize-none" placeholder="Berätta om er restaurang..." rows={3} />
              </div>

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
              <div>
                <label className={labelClass} style={labelStyle}>GATUADRESS</label>
                <input type="text" value={form.streetAddress} onChange={e => update('streetAddress', e.target.value)} className="luxury-input" required />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>POSTNUMMER</label>
                <input type="text" value={form.zipCode} onChange={e => update('zipCode', e.target.value)} className="luxury-input" required />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>MATTYPER</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {FOOD_TYPES.map(ft => (
                    <button key={ft} type="button" onClick={() => toggleFoodType(ft)}
                      className={`text-xs py-2 px-3 rounded border transition-all text-left ${form.foodTypes.includes(ft) ? 'border-gold bg-gold/10' : 'border-white/10 text-white/40 hover:border-gold/30'}`}
                      style={{ fontFamily: 'Montserrat, sans-serif', color: form.foodTypes.includes(ft) ? '#d4af37' : undefined }}>
                      {ft}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <span className="w-24 text-sm text-white/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>{day}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hours[i]?.is_closed || false}
                      onChange={e => updateHour(i, 'is_closed', e.target.checked)} className="accent-gold" />
                    <span className="text-xs text-white/40" style={{ fontFamily: 'Montserrat, sans-serif' }}>Stängt</span>
                  </label>
                  {!hours[i]?.is_closed && (
                    <>
                      <input type="time" value={hours[i]?.open_time || '11:00'}
                        onChange={e => updateHour(i, 'open_time', e.target.value)}
                        className="luxury-input w-auto flex-none" style={{ width: '120px' }} />
                      <span className="text-white/30 text-sm">–</span>
                      <input type="time" value={hours[i]?.close_time || '14:00'}
                        onChange={e => updateHour(i, 'close_time', e.target.value)}
                        className="luxury-input w-auto flex-none" style={{ width: '120px' }} />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="grid grid-cols-1 gap-3">
              {AMENITIES.map(am => (
                <label key={am.id} className="flex items-center gap-3 cursor-pointer p-3 rounded border border-white/5 hover:border-gold/20 transition-colors">
                  <input type="checkbox" checked={form.selectedAmenities.includes(am.id)}
                    onChange={() => toggleAmenity(am.id)} className="accent-gold" />
                  <span className="text-sm text-white/70">{am.name}</span>
                </label>
              ))}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-green-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <CheckCircle size={16} /> Sparade! Ändringar synliga för besökare.
            </div>
          )}

          <button type="submit" disabled={saving} className="luxury-button w-full py-3">
            {saving ? 'SPARAR...' : 'SPARA ÄNDRINGAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
