'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import { Plus, Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { format, addDays, startOfWeek } from 'date-fns'
import { sv } from 'date-fns/locale'
import { DAYS_OF_WEEK } from '@/lib/sweden-data'
import type { Restaurant, LunchMenu, MenuItem } from '@/types'

const EMPTY_ITEM: MenuItem = { name: '', description: '', price: null, vegetarian: false, vegan: false }

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [weekMenus, setWeekMenus] = useState<Record<string, LunchMenu | null>>({})
  const [activeDay, setActiveDay] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedDay, setSavedDay] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const supabase = createClient()
  const router = useRouter()

  // Get week dates
  const today = new Date()
  const weekStart = addDays(startOfWeek(today, { weekStartsOn: 1 }), weekOffset * 7)
  const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'))

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: r } = await supabase.from('restaurants').select('*').eq('id', user.id).single()
      if (!r) { router.push('/login'); return }
      setRestaurant(r)
      await loadWeekMenus(user.id)
      setLoading(false)
    }
    load()
  }, [weekOffset])

  async function loadWeekMenus(restaurantId: string) {
    const { data: menus } = await supabase.from('lunch_menus').select('*')
      .eq('restaurant_id', restaurantId)
      .gte('date', weekDates[0]).lte('date', weekDates[6])
    const menuMap: Record<string, LunchMenu | null> = {}
    weekDates.forEach(d => { menuMap[d] = menus?.find(m => m.date === d) || null })
    setWeekMenus(menuMap)
  }

  function getMenuForDay(dayIdx: number): { items: MenuItem[], price: number | null, notes: string } {
    const dateStr = weekDates[dayIdx]
    const menu = weekMenus[dateStr]
    return { items: menu?.items?.length ? menu.items : [{ ...EMPTY_ITEM }], price: menu?.lunch_price || null, notes: menu?.notes || '' }
  }

  function updateItem(dayIdx: number, itemIdx: number, field: keyof MenuItem, value: string | boolean | number | null) {
    const dateStr = weekDates[dayIdx]
    setWeekMenus(prev => {
      const current = prev[dateStr]
      const items = current?.items?.length ? [...current.items] : [{ ...EMPTY_ITEM }]
      items[itemIdx] = { ...items[itemIdx], [field]: value }
      return { ...prev, [dateStr]: { ...(current || { restaurant_id: restaurant!.id, date: dateStr, price_included: true, id: '' }), items, lunch_price: current?.lunch_price || null, notes: current?.notes || '' } as LunchMenu }
    })
  }

  function addItem(dayIdx: number) {
    const dateStr = weekDates[dayIdx]
    setWeekMenus(prev => {
      const current = prev[dateStr]
      const items = [...(current?.items || []), { ...EMPTY_ITEM }]
      return { ...prev, [dateStr]: { ...(current || { restaurant_id: restaurant!.id, date: dateStr, price_included: true, id: '' }), items, lunch_price: current?.lunch_price || null, notes: current?.notes || '' } as LunchMenu }
    })
  }

  function removeItem(dayIdx: number, itemIdx: number) {
    const dateStr = weekDates[dayIdx]
    setWeekMenus(prev => {
      const current = prev[dateStr]
      const items = (current?.items || []).filter((_, i) => i !== itemIdx)
      return { ...prev, [dateStr]: { ...current!, items } }
    })
  }

  function updateMeta(dayIdx: number, field: 'lunch_price' | 'notes', value: string | number | null) {
    const dateStr = weekDates[dayIdx]
    setWeekMenus(prev => {
      const current = prev[dateStr]
      return { ...prev, [dateStr]: { ...(current || { restaurant_id: restaurant!.id, date: dateStr, price_included: true, items: [], id: '' }), [field]: value } as LunchMenu }
    })
  }

  async function saveDay(dayIdx: number) {
    if (!restaurant) return
    setSaving(true); setSavedDay(null)
    const dateStr = weekDates[dayIdx]
    const menu = weekMenus[dateStr]
    const items = (menu?.items || []).filter(i => i.name.trim())

    const payload = { restaurant_id: restaurant.id, date: dateStr, items, lunch_price: menu?.lunch_price || null, notes: menu?.notes || null, price_included: true }

    if (menu?.id) {
      await supabase.from('lunch_menus').update(payload).eq('id', menu.id)
    } else {
      const { data } = await supabase.from('lunch_menus').insert(payload).select().single()
      if (data) setWeekMenus(prev => ({ ...prev, [dateStr]: data }))
    }
    setSavedDay(dateStr); setSaving(false)
    setTimeout(() => setSavedDay(null), 2000)
  }

  if (loading) return <div className="min-h-screen bg-black pt-16 flex items-center justify-center text-white/30">Laddar...</div>

  const currentMenu = getMenuForDay(activeDay)
  const currentDateStr = weekDates[activeDay]
  const isPast = new Date(currentDateStr) < new Date(format(today, 'yyyy-MM-dd'))

  return (
    <div className="min-h-screen bg-black pt-16">
      <Header userType="restaurant" userName={restaurant?.public_name} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Status banner */}
        {!restaurant?.is_approved && (
          <div className="flex items-center gap-2 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 mb-6 text-sm"
            style={{ fontFamily: 'Montserrat, sans-serif', color: '#f59e0b' }}>
            <AlertCircle size={16} />
            Din restaurang väntar på godkännande av admin innan den syns för besökare.
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif">Lunchmenyer</h1>
            <p className="text-white/40 text-sm mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {restaurant?.public_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(prev => prev - 1)}
              className="luxury-button-outline px-3 py-2 text-xs">‹ Föreg</button>
            <span className="text-white/50 text-xs px-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {format(weekStart, 'd MMM', { locale: sv })} – {format(addDays(weekStart, 6), 'd MMM', { locale: sv })}
            </span>
            <button onClick={() => setWeekOffset(prev => prev + 1)}
              className="luxury-button-outline px-3 py-2 text-xs">Nästa ›</button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {DAYS_OF_WEEK.map((day, i) => {
            const dateStr = weekDates[i]
            const hasMenu = weekMenus[dateStr]?.items?.some(item => item.name.trim())
            const isActive = activeDay === i
            return (
              <button key={i} onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded transition-all border ${
                  isActive ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-gold/30'
                }`}>
                <span className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: isActive ? '#d4af37' : 'rgba(255,255,255,0.5)' }}>
                  {day.slice(0, 3).toUpperCase()}
                </span>
                <span className="text-sm mt-0.5" style={{ color: isActive ? '#d4af37' : 'rgba(255,255,255,0.7)' }}>
                  {format(addDays(weekStart, i), 'd')}
                </span>
                {hasMenu && <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1" />}
              </button>
            )
          })}
        </div>

        {/* Day editor */}
        <div className="luxury-card rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif capitalize">
              {format(addDays(weekStart, activeDay), 'EEEE d MMMM', { locale: sv })}
            </h2>
            {savedDay === currentDateStr && (
              <span className="flex items-center gap-1 text-green-400 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <CheckCircle size={14} /> Sparat!
              </span>
            )}
          </div>

          {/* Price & notes */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs text-white/50 mb-1 tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.12em' }}>LUNCHPRIS (KR)</label>
              <input type="number" value={weekMenus[currentDateStr]?.lunch_price || ''} placeholder="t.ex. 119"
                onChange={e => updateMeta(activeDay, 'lunch_price', e.target.value ? Number(e.target.value) : null)}
                className="luxury-input" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-white/50 mb-1 tracking-widest" style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.12em' }}>NOTERING</label>
              <input type="text" value={weekMenus[currentDateStr]?.notes || ''} placeholder="t.ex. inkl. kaffe och bröd"
                onChange={e => updateMeta(activeDay, 'notes', e.target.value)}
                className="luxury-input" />
            </div>
          </div>

          {/* Menu items */}
          <div className="space-y-3 mb-4">
            {currentMenu.items.map((item, i) => (
              <div key={i} className="p-4 rounded border border-white/10 bg-white/5">
                <div className="flex gap-3 mb-2">
                  <input type="text" value={item.name} placeholder="Rättens namn *"
                    onChange={e => updateItem(activeDay, i, 'name', e.target.value)}
                    className="luxury-input flex-1 text-sm" />
                  <button onClick={() => removeItem(activeDay, i)} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                <input type="text" value={item.description} placeholder="Kort beskrivning (valfritt)"
                  onChange={e => updateItem(activeDay, i, 'description', e.target.value)}
                  className="luxury-input text-sm mb-2" />
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={item.vegetarian}
                      onChange={e => updateItem(activeDay, i, 'vegetarian', e.target.checked)}
                      className="accent-gold" />
                    <span className="text-xs text-white/50" style={{ fontFamily: 'Montserrat, sans-serif' }}>Vegetariskt</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={item.vegan}
                      onChange={e => updateItem(activeDay, i, 'vegan', e.target.checked)}
                      className="accent-gold" />
                    <span className="text-xs text-white/50" style={{ fontFamily: 'Montserrat, sans-serif' }}>Veganskt</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => addItem(activeDay)} className="luxury-button-outline flex-1 py-2 flex items-center justify-center gap-2 text-xs">
              <Plus size={14} /> LÄGG TILL RÄTT
            </button>
            <button onClick={() => saveDay(activeDay)} disabled={saving} className="luxury-button flex-1 py-2 flex items-center justify-center gap-2 text-xs">
              <Save size={14} /> {saving ? 'SPARAR...' : 'SPARA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
