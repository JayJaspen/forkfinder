'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Header from '@/components/Header'
import { Trash2, CheckCircle, XCircle, Eye, Search, BarChart2 } from 'lucide-react'
import { COUNTIES_LIST, getCitiesForCounty } from '@/lib/sweden-data'
import type { Restaurant, Visitor } from '@/types'

type TabType = 'restaurants' | 'users' | 'stats'

interface RestaurantWithViews extends Restaurant { view_count?: number }
interface VisitorWithViews extends Visitor { view_count?: number }

export default function AdminPage() {
  const [tab, setTab] = useState<TabType>('restaurants')
  const [restaurants, setRestaurants] = useState<RestaurantWithViews[]>([])
  const [visitors, setVisitors] = useState<VisitorWithViews[]>([])
  const [stats, setStats] = useState<{ restaurant: string; visitor: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCounty, setFilterCounty] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [userFilterCounty, setUserFilterCounty] = useState('')
  const [userFilterCity, setUserFilterCity] = useState('')
  const [usersSearched, setUsersSearched] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const filterCities = getCitiesForCounty(filterCounty)
  const userFilterCities = getCitiesForCounty(userFilterCounty)

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.user_type !== 'admin') { router.push('/login'); return }
      setIsAdmin(true)
      await fetchRestaurants()
      setLoading(false)
    }
    checkAdmin()
  }, [])

  async function fetchRestaurants(county?: string, city?: string) {
    let q = supabase.from('restaurants').select('*').order('created_at', { ascending: false })
    if (city) q = q.eq('city', city)
    else if (county) q = q.eq('county', county)
    const { data } = await q
    setRestaurants(data || [])
  }

  async function fetchUsers() {
    let q = supabase.from('visitors').select('*').order('created_at', { ascending: false })
    if (userFilterCity) q = q.eq('city', userFilterCity)
    else if (userFilterCounty) q = q.eq('county', userFilterCounty)
    const { data } = await q
    setVisitors(data || [])
    setUsersSearched(true)
  }

  async function fetchStats() {
    const { data } = await supabase.from('restaurant_views')
      .select(`restaurant_id, visitor_id, restaurants(public_name), visitors(name)`)
    if (data) {
      const grouped: Record<string, { restaurant: string; visitor: string; count: number }> = {}
      data.forEach((row: any) => {
        const key = `${row.restaurant_id}_${row.visitor_id}`
        if (!grouped[key]) {
          grouped[key] = { restaurant: row.restaurants?.public_name || row.restaurant_id, visitor: row.visitors?.name || row.visitor_id, count: 0 }
        }
        grouped[key].count++
      })
      setStats(Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 50))
    }
  }

  async function toggleApprove(r: RestaurantWithViews) {
    const { error } = await supabase.from('restaurants').update({ is_approved: !r.is_approved, is_visible: !r.is_approved }).eq('id', r.id)
    if (!error) setRestaurants(prev => prev.map(x => x.id === r.id ? { ...x, is_approved: !r.is_approved, is_visible: !r.is_approved } : x))
  }

  async function deleteRestaurant(id: string) {
    if (!confirm('Är du säker på att du vill ta bort denna restaurang? Det går inte att ångra.')) return
    await supabase.from('restaurants').delete().eq('id', id)
    setRestaurants(prev => prev.filter(r => r.id !== id))
  }

  function handleTabChange(t: TabType) {
    setTab(t)
    if (t === 'stats') fetchStats()
  }

  const tabStyle = (t: TabType) =>
    `px-5 py-3 text-sm transition-all border-b-2 font-sans ${tab === t ? 'border-gold text-gold-DEFAULT' : 'border-transparent text-white/40 hover:text-white/70'}`

  if (!isAdmin || loading) return <div className="min-h-screen bg-black pt-16 flex items-center justify-center text-white/30">Laddar...</div>

  return (
    <div className="min-h-screen bg-black pt-16">
      <Header userType="admin" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-serif mb-2">Adminpanel</h1>
        <div className="gold-divider max-w-16 mb-6" />

        <div className="flex border-b border-white/10 mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <button className={tabStyle('restaurants')} style={{ color: tab === 'restaurants' ? '#d4af37' : undefined }} onClick={() => handleTabChange('restaurants')}>RESTAURANGER</button>
          <button className={tabStyle('users')} style={{ color: tab === 'users' ? '#d4af37' : undefined }} onClick={() => handleTabChange('users')}>ANVÄNDARE</button>
          <button className={tabStyle('stats')} style={{ color: tab === 'stats' ? '#d4af37' : undefined }} onClick={() => handleTabChange('stats')}>STATISTIK</button>
        </div>

        {/* TAB 1: RESTAURANTS */}
        {tab === 'restaurants' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <select value={filterCounty} onChange={e => { setFilterCounty(e.target.value); setFilterCity(''); fetchRestaurants(e.target.value, '') }}
                className="luxury-select w-auto">
                <option value="">Alla län</option>
                {COUNTIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterCity} onChange={e => { setFilterCity(e.target.value); fetchRestaurants(filterCounty, e.target.value) }}
                className="luxury-select w-auto" disabled={!filterCounty}>
                <option value="">Alla städer</option>
                {filterCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-white/30 text-sm self-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {restaurants.length} restauranger
              </span>
            </div>

            <div className="space-y-3">
              {restaurants.map(r => (
                <div key={r.id} className="luxury-card rounded-lg p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif text-lg">{r.public_name}</h3>
                      {r.is_approved ? (
                        <span className="text-xs text-green-400 border border-green-400/30 px-2 py-0.5 rounded" style={{ fontFamily: 'Montserrat, sans-serif' }}>GODKÄND</span>
                      ) : (
                        <span className="text-xs text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded" style={{ fontFamily: 'Montserrat, sans-serif' }}>VÄNTAR</span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {r.city}, {r.county} · {r.street_address}
                    </p>
                    <p className="text-white/20 text-xs mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Org: {r.org_number} · {r.registered_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleApprove(r)} title={r.is_approved ? 'Avgodkänn' : 'Godkänn'}
                      className={`p-2 rounded border transition-all ${r.is_approved ? 'border-green-400/30 text-green-400 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-400' : 'border-gold/30 hover:bg-gold/10'}`}
                      style={{ color: r.is_approved ? undefined : '#d4af37' }}>
                      {r.is_approved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    </button>
                    <button onClick={() => deleteRestaurant(r.id)} className="p-2 rounded border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {restaurants.length === 0 && (
                <div className="text-center py-12 text-white/20" style={{ fontFamily: 'Montserrat, sans-serif' }}>Inga restauranger hittades</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {tab === 'users' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <select value={userFilterCounty} onChange={e => { setUserFilterCounty(e.target.value); setUserFilterCity('') }}
                className="luxury-select w-auto">
                <option value="">Alla län</option>
                {COUNTIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={userFilterCity} onChange={e => setUserFilterCity(e.target.value)}
                className="luxury-select w-auto" disabled={!userFilterCounty}>
                <option value="">Alla städer</option>
                {userFilterCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={fetchUsers} className="luxury-button px-5 py-2 flex items-center gap-2 text-xs">
                <Search size={14} /> SÖK
              </button>
            </div>

            {!usersSearched ? (
              <div className="text-center py-16 text-white/20" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Tryck på Sök för att visa användare
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-white/30 text-xs mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>{visitors.length} användare hittade</p>
                {visitors.map(v => (
                  <div key={v.id} className="luxury-card rounded-lg px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-serif">{v.name}</p>
                      <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {v.email} · {v.city}, {v.county}
                      </p>
                    </div>
                    <span className="text-white/20 text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {new Date(v.created_at).toLocaleDateString('sv-SE')}
                    </span>
                  </div>
                ))}
                {visitors.length === 0 && (
                  <div className="text-center py-8 text-white/20" style={{ fontFamily: 'Montserrat, sans-serif' }}>Inga användare hittades</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STATS */}
        {tab === 'stats' && (
          <div>
            <h2 className="text-xl font-serif mb-4">Restaurangbesök per användare</h2>
            <p className="text-white/40 text-sm mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Antal gånger en användare öppnat en restaurangs sida.
            </p>
            {stats.length === 0 ? (
              <div className="text-center py-12 text-white/20" style={{ fontFamily: 'Montserrat, sans-serif' }}>Ingen statistik ännu</div>
            ) : (
              <div className="luxury-card rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/20 text-white/40" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <th className="text-left p-4 text-xs">RESTAURANG</th>
                      <th className="text-left p-4 text-xs">ANVÄNDARE</th>
                      <th className="text-right p-4 text-xs">BESÖK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((s, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-serif">{s.restaurant}</td>
                        <td className="p-4 text-white/60" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.visitor}</td>
                        <td className="p-4 text-right">
                          <span className="text-gold-DEFAULT font-semibold" style={{ color: '#d4af37' }}>{s.count}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
