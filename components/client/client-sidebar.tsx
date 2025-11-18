import React from "react"
import Link from "next/link"

export function ClientSidebar() {
  return (
    <aside className="w-56 p-4 border-r">
      <nav className="space-y-2">
        <Link href="/client/dashboard" className="block px-2 py-1 rounded hover:bg-gray-100">Dashboard</Link>
        <Link href="/client/bookings" className="block px-2 py-1 rounded hover:bg-gray-100">Agendamentos</Link>
        <Link href="/client/plans" className="block px-2 py-1 rounded hover:bg-gray-100">Planos</Link>
        <Link href="/client/payments" className="block px-2 py-1 rounded hover:bg-gray-100">Pagamentos</Link>
      </nav>
    </aside>
  )
}

export default ClientSidebar
