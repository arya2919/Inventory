'use client'

import { FormEvent, useEffect, useState } from 'react'

export default function SettingsPage() {
  const [threshold, setThreshold] = useState('5')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load settings')
        setThreshold(String(json.defaultLowStockThreshold))
        setOrgName(json.organizationName)
      })
      .catch((err) => setError(err.message))
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved('')
    setLoading(true)
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultLowStockThreshold: threshold }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(json.error || 'Save failed')
      return
    }
    setSaved('Settings saved.')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-gray-500 mb-6">{orgName}</p>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg space-y-4">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{saved}</div>}

        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1.5">Default low stock threshold</span>
          <input
            type="number"
            min={0}
            required
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="mt-1.5 block text-xs text-gray-500">
            Used when a product does not have its own threshold. A product is low stock when quantity on hand is at or
            below this value.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
