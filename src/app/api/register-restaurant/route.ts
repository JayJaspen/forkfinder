import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()

  // Skapa auth-användare server-side (kringgår RLS helt)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: body.email,
    password: body.password,
    user_metadata: { user_type: 'restaurant', public_name: body.publicName },
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Sätt in restaurang (service role kringgår RLS)
  const { error: dbError } = await supabase.from('restaurants').insert({
    ...body.restaurantData,
    id: authData.user.id,
  })

  if (dbError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  // Sätt in extra orter om sådana finns
  if (body.extraLocations?.length > 0) {
    await supabase.from('restaurant_locations').insert(
      body.extraLocations.map((loc: { county: string; city: string }) => ({
        restaurant_id: authData.user.id,
        county: loc.county,
        city: loc.city,
      }))
    )
  }

  return NextResponse.json({ success: true })
}
