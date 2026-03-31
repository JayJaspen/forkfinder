'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import { MapPin, Phone, Globe, Clock, ChevronLeft, ChevronRight, X, Wifi, Car, Baby, Wine, ShoppingBag, Sun, Leaf, Shield } from 'lucide-react'
import { COUNTIES_LIST, getCitiesForCounty, AMENITIES } from '@/lib/sweden-data'
import type { Restaurant, LunchMenu, OpeningHour, Visitor } from '@/types'
import { format, addDays, subDays, isToday } from 'date-fns'
import { sv } from 'date-fns/locale'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi: <Wifi size={14} />, parking: <Car size={14} />, family: <Baby size={14} />,
  alcohol: <Wine size={14} />, outdoor: <Sun size={14} />, takeaway: <ShoppingBag size={14} />,
  vegetarian: <Leaf size={14} />, vegan: <Leaf size={14} />, gluten_free: <Shield size={14} />, accessible: <span>♿</span>,
}

interface RestaurantCard extends Restaurant {
  amenities: string[]
  lunch_menus: LunchMenu[]
  opening_hours: OpeningHour[]
}

export default function LunchPage() {
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCounty, setSelectedCounty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantCard | null>(null)
  const supabase = createClient()

  const cities = getCitiesForCounty(selectedCounty)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: v } = await supabase.from('visitors').select('*').eq('id', user.id).single()
      if (v) { setVisitor(v); setSelectedCounty(v.county); setSelectedCity(v.city) }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedCity) return
    fetchRestaurants()
  }, [selectedCity, selectedDate])

  async function fetchRestaurants() {
    setLoading(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const { data } = await supabase
      .from('restaurants')
      .select(`*, restaurant_amenities(amenity_id), lunch_menus(*)`)
      .eq('is_approved', true).eq('is_visible', true).eq('city', selectedCity)
    if (data) {
      const enriched = data.map((r: any) => ({
        ...r,
        amenities: (r.restaurant_amenities || []).map((a: any) => a.amenity_id),
        lunch_menus: (r.lunch_menus || []).filter((m: LunchMenu) => m.date === dateStr),
        opening_hours: [],
      }))
      setRestaurants(enriched)
    }
    setLoading(false)
  }

  async function openRestaurant(r: RestaurantCard) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('restaurant_views').insert({ visitor_id: user.id, restaurant_id: r.id })
    }
    const { data: hours } = await supabase.from('opening_hours').select('*').eq('restaurant_id', r.id)
    const { data: menus } = await supabase.from('lunch_menus').select('*').eq('restaurant_id', r.id)
      .gte('date', format(new Date(), 'yyyy-MM-dd'))
    setSelectedRestaurant({ ...r, opening_hours: hours || [], lunch_menus: menus || [] })
  }

  const dateLabel = isToday(selectedDate) ? 'Idag' : format(selectedDate, 'EEEE d MMMM', { locale: sv })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i - (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1))
    return d
  })

  return (
    <div className="min-h-screen bg-black pt-16">
      <Header userType="visitor" userName={visitor?.name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif">
              <span className="gold-text">Lunch</span> {dateLabel.toLowerCase()}
            </h1>
            <p className="text-white/40 text-sm mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {selectedCity || 'Välj en stad'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={selectedCounty} onChange={e => { setSelectedCounty(e.target.value); setSelectedCity('') }}
              className="luxury-select w-auto">
              <option value="">Välj län</option>
              {COUNTIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
              className="luxury-select w-auto" disabled={!selectedCounty}>
              <option value="">Välj stad</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Week nav */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <button onClick={() => setSelectedDate(prev => subDays(prev, 1))}
            className="p-2 text-white/40 hover:text-gold-DEFAULT transition-colors flex-shrink-0"
            style={{ color: undefined }}>
            <ChevronLeft size={20} />
          </button>
          {weekDays.map((day, i) => {
            const isSel = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            return (
              <button key={i} onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded transition-all ${
                  isSel ? 'gold-gradient text-black' : 'text-white/50 hover:text-white border border-white/10 hover:border-gold/30'
                }`}>
                <span className="text-xs font-sans" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                  {format(day, 'EEE', { locale: sv })}
                </span>
                <span className="text-sm font-semibold">{format(day, 'd')}</span>
              </button>
            )
          })}
          <button onClick={() => setSelectedDate(prev => addDays(prev, 1))}
            className="p-2 text-white/40 hover:text-white transition-colors flex-shrink-0">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Restaurant grid */}
        {loading ? (
          <div className="text-center py-16 text-white/30" style={{ fontFamily: 'Montserrat, sans-serif' }}>Laddar...</div>
        ) : !selectedCity ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-lg font-serif">Välj en stad för att se lunchmenyer</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-lg font-serif">Inga restauranger hittades i {selectedCity}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(r => (
              <div key={r.id} className="luxury-card rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openRestaurant(r)}>
                {/* Logo / header */}
                <div className="h-32 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center relative">
                  {r.logo_url ? (
                    <img src={r.logo_url} alt={r.public_name} className="max-h-20 max-w-40 object-contain" />
                  ) : (
                    <span className="text-4xl font-serif text-white/20">{r.public_name.charAt(0)}</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-serif mb-1">{r.public_name}</h3>
                  <div className="flex items-center gap-1 text-white/40 text-xs mb-3"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <MapPin size={11} />
                    <span>{r.street_address}, {r.city}</span>
                  </div>
                  {r.phone && (
                    <div className="flex items-center gap-1 text-white/40 text-xs mb-3"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <Phone size={11} /><span>{r.phone}</span>
                    </div>
                  )}
                  {r.website && (
                    <div className="flex items-center gap-1 text-white/40 text-xs mb-3"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <Globe size={11} />
                      <a href={r.website} target="_blank" rel="noreferrer"
                        className="hover:text-gold-DEFAULT transition-colors" style={{ color: undefined }}
                        onClick={e => e.stopPropagation()}>
                        {r.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                  {/* Today's lunch */}
                  <div className="border-t border-gold/10 pt-3 mt-3">
                    {r.lunch_menus.length > 0 && r.lunch_menus[0].items.length > 0 ? (
                      <>
                        <p className="text-xs text-gold-DEFAULT mb-2" style={{ color: '#d4af37', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.1em' }}>
                          DAGENS LUNCH {r.lunch_menus[0].lunch_price ? `– ${r.lunch_menus[0].lunch_price} kr` : ''}
                        </p>
                        {r.lunch_menus[0].items.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-sm text-white/70 truncate">{item.name}</p>
                        ))}
                        {r.lunch_menus[0].items.length > 2 && (
                          <p className="text-xs text-white/30 mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            + {r.lunch_menus[0].items.length - 2} rätter till
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-white/30 italic" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Ingen lunchmeny tillagd idag
                      </p>
                    )}
                  </div>

                  {/* Amenities */}
                  {r.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {r.amenities.slice(0, 4).map(id => {
                        const am = AMENITIES.find(a => a.id === id)
                        return am ? (
                          <span key={id} className="flex items-center gap-1 text-xs text-white/30 border border-white/10 rounded px-1.5 py-0.5"
                            style={{ fontFamily: 'Montserrat, sans-serif' }} title={am.name}>
                            {AMENITY_ICONS[id]}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restaurant detail modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="luxury-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif">{selectedRestaurant.public_name}</h2>
                  <p className="text-white/40 text-sm mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {selectedRestaurant.street_address}, {selectedRestaurant.zip_code} {selectedRestaurant.city}
                  </p>
                </div>
                <button onClick={() => setSelectedRestaurant(null)} className="text-white/40 hover:text-white ml-4">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-white/50" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {selectedRestaurant.phone && <span className="flex items-center gap-1"><Phone size={13} />{selectedRestaurant.phone}</span>}
                {selectedRestaurant.website && (
                  <a href={selectedRestaurant.website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 hover:text-gold-DEFAULT" style={{ color: undefined }}>
                    <Globe size={13} />{selectedRestaurant.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              {selectedRestaurant.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedRestaurant.amenities.map(id => {
                    const am = AMENITIES.find(a => a.id === id)
                    return am ? (
                      <span key={id} className="flex items-center gap-1 text-xs text-gold-DEFAULT border rounded px-2 py-1"
                        style={{ color: '#d4af37', borderColor: 'rgba(212,175,55,0.3)', fontFamily: 'Montserrat, sans-serif' }}>
                        {AMENITY_ICONS[id]} {am.name}
                      </span>
                    ) : null
                  })}
                </div>
              )}

              <div className="gold-divider mb-6" />

              {/* Weekly menu */}
              <h3 className="text-lg font-serif gold-text mb-4">Veckans lunchmenyer</h3>
              {weekDays.map((day, i) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const menu = selectedRestaurant.lunch_menus.find(m => m.date === dateStr)
                const dayName = format(day, 'EEEE d MMM', { locale: sv })
                return (
                  <div key={i} className="mb-4">
                    <p className="text-sm font-semibold text-white/60 mb-2 capitalize" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {dayName}
                      {menu?.lunch_price && <span className="text-gold-DEFAULT ml-2" style={{ color: '#d4af37' }}>{menu.lunch_price} kr</span>}
                    </p>
                    {menu && menu.items.length > 0 ? (
                      <div className="space-y-1 pl-3 border-l border-gold/20">
                        {menu.items.map((item, j) => (
                          <div key={j}>
                            <p className="text-sm">{item.name}
                              {item.vegetarian && <span className="text-xs text-green-400 ml-1">(V)</span>}
                              {item.vegan && <span className="text-xs text-green-400 ml-1">(VG)</span>}
                            </p>
                            {item.description && <p className="text-xs text-white/40">{item.description}</p>}
                          </div>
                        ))}
                        {menu.notes && <p className="text-xs text-white/30 italic mt-1">{menu.notes}</p>}
                      </div>
                    ) : (
                      <p className="text-xs text-white/20 pl-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>Ingen meny</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
