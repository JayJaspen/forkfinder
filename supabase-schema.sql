-- ============================================================
-- ForkFinder.se – Supabase Schema
-- Kör detta i Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- VISITORS
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  county TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can view own profile" ON public.visitors FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Visitors can update own profile" ON public.visitors FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert visitor" ON public.visitors FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can view all visitors" ON public.visitors FOR SELECT USING (
  (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- RESTAURANTS
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  org_number TEXT NOT NULL,
  registered_name TEXT NOT NULL,
  public_name TEXT NOT NULL,
  logo_url TEXT,
  county TEXT NOT NULL,
  city TEXT NOT NULL,
  street_address TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  description TEXT,
  food_types TEXT[] DEFAULT '{}',
  invoice_type TEXT NOT NULL DEFAULT 'email',
  invoice_email TEXT,
  invoice_address JSONB,
  is_approved BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved restaurants" ON public.restaurants FOR SELECT USING (is_approved = TRUE AND is_visible = TRUE);
CREATE POLICY "Restaurant can view own" ON public.restaurants FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Restaurant can update own" ON public.restaurants FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Restaurant can insert own" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin full access restaurants" ON public.restaurants FOR ALL USING (
  (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- RESTAURANT LOCATIONS (extra orter)
CREATE TABLE IF NOT EXISTS public.restaurant_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  county TEXT NOT NULL,
  city TEXT NOT NULL
);
ALTER TABLE public.restaurant_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view locations" ON public.restaurant_locations FOR SELECT USING (TRUE);
CREATE POLICY "Restaurant can manage own locations" ON public.restaurant_locations FOR ALL USING (auth.uid() = restaurant_id);

-- AMENITIES (bekvämligheter)
CREATE TABLE IF NOT EXISTS public.amenities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL
);
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view amenities" ON public.amenities FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage amenities" ON public.amenities FOR ALL USING (
  (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

INSERT INTO public.amenities (id, name, icon) VALUES
  ('wifi', 'WiFi', 'Wifi'),
  ('parking', 'Parkering', 'Car'),
  ('accessible', 'Handikappsanpassat', 'Accessibility'),
  ('family', 'Barnvänligt', 'Baby'),
  ('alcohol', 'Alkoholtillstånd', 'Wine'),
  ('outdoor', 'Uteservering', 'Sun'),
  ('takeaway', 'Take Away', 'ShoppingBag'),
  ('vegetarian', 'Vegetariskt alternativ', 'Leaf'),
  ('vegan', 'Veganskt alternativ', 'Leaf'),
  ('gluten_free', 'Glutenfritt alternativ', 'Shield')
ON CONFLICT (id) DO NOTHING;

-- RESTAURANT AMENITIES (koppling)
CREATE TABLE IF NOT EXISTS public.restaurant_amenities (
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  amenity_id TEXT REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (restaurant_id, amenity_id)
);
ALTER TABLE public.restaurant_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view restaurant amenities" ON public.restaurant_amenities FOR SELECT USING (TRUE);
CREATE POLICY "Restaurant can manage own amenities" ON public.restaurant_amenities FOR ALL USING (auth.uid() = restaurant_id);

-- OPENING HOURS (öppettider)
CREATE TABLE IF NOT EXISTS public.opening_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view opening hours" ON public.opening_hours FOR SELECT USING (TRUE);
CREATE POLICY "Restaurant can manage own hours" ON public.opening_hours FOR ALL USING (auth.uid() = restaurant_id);

-- LUNCH MENUS (lunchmenyer)
CREATE TABLE IF NOT EXISTS public.lunch_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  items JSONB DEFAULT '[]',
  price_included BOOLEAN DEFAULT TRUE,
  lunch_price NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, date)
);
ALTER TABLE public.lunch_menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lunch menus" ON public.lunch_menus FOR SELECT USING (TRUE);
CREATE POLICY "Restaurant can manage own menus" ON public.lunch_menus FOR ALL USING (auth.uid() = restaurant_id);

-- RESTAURANT VIEWS (statistik)
CREATE TABLE IF NOT EXISTS public.restaurant_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID REFERENCES public.visitors(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.restaurant_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can insert own views" ON public.restaurant_views FOR INSERT WITH CHECK (auth.uid() = visitor_id);
CREATE POLICY "Admin can view all stats" ON public.restaurant_views FOR SELECT USING (
  (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- STORAGE BUCKET for restaurant logos
-- Run this separately in Supabase Storage dashboard or via SQL:
INSERT INTO storage.buckets (id, name, public) VALUES ('restaurant-assets', 'restaurant-assets', TRUE) ON CONFLICT DO NOTHING;
CREATE POLICY "Anyone can view restaurant assets" ON storage.objects FOR SELECT USING (bucket_id = 'restaurant-assets');
CREATE POLICY "Restaurants can upload own assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Restaurants can update own assets" ON storage.objects FOR UPDATE USING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');

-- ============================================================
-- Skapa admin-användare manuellt:
-- 1. Registrera en användare via /registrera/anvandare
-- 2. Kör sedan i SQL Editor:
--    UPDATE auth.users SET raw_user_meta_data = '{"user_type":"admin","name":"Admin"}' WHERE email = 'din@email.se';
-- ============================================================
