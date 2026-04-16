import { MapPin, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AddressBook() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState({
    label: '',
    receiver: '',
    phone: '',
    detail: '',
    notes: '',
  })

  const saveAddress = (event) => {
    event.preventDefault()
    navigate('/profile')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4 py-8">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Address Snapshot</p>
            <h1 className="mt-1 text-2xl font-black text-gray-900">Add / Edit Delivery Address</h1>
            <p className="mt-1 text-sm text-gray-500">Keep this focused page for checkout-ready address details.</p>
          </div>
          <div className="rounded-2xl bg-yellow-100 p-3 text-red-600"><MapPin className="h-6 w-6" /></div>
        </div>

        <form onSubmit={saveAddress} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={draft.label} onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))} placeholder="Label (Home, Office)" required className="rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />
            <input value={draft.receiver} onChange={(event) => setDraft((prev) => ({ ...prev, receiver: event.target.value }))} placeholder="Receiver name" required className="rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />
          </div>

          <input value={draft.phone} onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone number" required className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />

          <textarea value={draft.detail} onChange={(event) => setDraft((prev) => ({ ...prev, detail: event.target.value }))} rows={4} placeholder="Full address" required className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />

          <textarea value={draft.notes} onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))} rows={2} placeholder="Delivery notes (optional)" className="w-full rounded-2xl border border-red-100 bg-amber-50/40 px-4 py-3 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100" />

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate('/profile')} className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">Save Address</button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default AddressBook
