import { MapPin, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

const initialAddresses = [
  { id: 1, label: 'Home', detail: 'Jl. Sudirman No.123, Jakarta', deleted: false },
  { id: 2, label: 'Office', detail: 'Wisma Aldes Lt.12, Jakarta', deleted: false },
]

function AddressBook() {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [draft, setDraft] = useState({ label: '', detail: '' })
  const [openForm, setOpenForm] = useState(false)

  const activeAddresses = addresses.filter((item) => !item.deleted)

  const saveAddress = (event) => {
    event.preventDefault()
    if (!draft.label || !draft.detail) return
    setAddresses((prev) => [...prev, { id: Date.now(), ...draft, deleted: false }])
    setDraft({ label: '', detail: '' })
    setOpenForm(false)
  }

  const softDelete = (id) => {
    setAddresses((prev) => prev.map((item) => (item.id === id ? { ...item, deleted: true } : item)))
  }

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-6">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-gray-800">Address Book</h1>
          <button type="button" onClick={() => setOpenForm((prev) => !prev)} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">
            <Plus className="h-4 w-4" /> Add New Address
          </button>
        </div>

        {openForm && (
          <form onSubmit={saveAddress} className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={draft.label}
                onChange={(event) => setDraft((prev) => ({ ...prev, label: event.target.value }))}
                placeholder="Label (Home, Office)"
                className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
              />
              <input
                value={draft.detail}
                onChange={(event) => setDraft((prev) => ({ ...prev, detail: event.target.value }))}
                placeholder="Full address"
                className="rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"
              />
            </div>
            <button type="submit" className="mt-3 rounded-2xl bg-gray-900 px-4 py-2 text-sm font-medium text-white">Save Address</button>
          </form>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeAddresses.map((address) => (
            <article key={address.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600"><MapPin className="h-3.5 w-3.5" />{address.label}</p>
              <p className="mt-3 text-sm text-gray-700">{address.detail}</p>
              <button type="button" onClick={() => softDelete(address.id)} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-red-600 transition hover:text-red-700">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AddressBook
