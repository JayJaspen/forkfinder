export type UserType = 'visitor' | 'restaurant' | 'admin'

export interface Visitor {
  id: string
  name: string
  email: string
  county: string
  city: string
  created_at: string
}

export interface Restaurant {
  id: string
  org_number: string
  registered_name: string
  public_name: string
  logo_url: string | null
  county: string
  city: string
  street_address: string
  zip_code: string
  phone: string | null
  website: string | null
  description: string | null
  food_types: string[]
  invoice_type: 'email' | 'postal'
  invoice_email: string | null
  invoice_address: InvoiceAddress | null
  is_approved: boolean
  is_visible: boolean
  created_at: string
}

export interface InvoiceAddress {
  street: string
  zip_code: string
  city: string
}

export interface RestaurantLocation {
  id: string
  restaurant_id: string
  county: string
  city: string
}

export interface Amenity {
  id: string
  name: string
  icon: string
}

export interface OpeningHour {
  id: string
  restaurant_id: string
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export interface LunchMenu {
  id: string
  restaurant_id: string
  date: string
  items: MenuItem[]
  price_included: boolean
  lunch_price: number | null
  notes: string | null
}

export interface MenuItem {
  name: string
  description: string
  price: number | null
  vegetarian: boolean
  vegan: boolean
}

export interface RestaurantView {
  id: string
  visitor_id: string
  restaurant_id: string
  viewed_at: string
}

export interface RestaurantWithDetails extends Restaurant {
  amenities?: string[]
  locations?: RestaurantLocation[]
  opening_hours?: OpeningHour[]
  lunch_menus?: LunchMenu[]
}
