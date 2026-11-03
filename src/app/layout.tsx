import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StockFlow – Inventory Management',
  description: 'Simple inventory management for small businesses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
