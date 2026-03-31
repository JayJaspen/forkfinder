import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ForkFinder.se – Sveriges bästa restaurangguide',
  description: 'Hitta dagens lunch och kvällsmenyer på restauranger i hela Sverige. Filtrera på stad och kategori.',
  keywords: 'lunch, restaurang, lunchmeny, mat, Sverige, restaurangguide',
  openGraph: {
    title: 'ForkFinder.se',
    description: 'Sveriges bästa lunch- och restaurangguide',
    type: 'website',
    locale: 'sv_SE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
