import { useState } from 'react'
import { Edit, LogOut, Mail, MapPin, Phone, Plus, Trash2, User } from 'lucide-react'

function Profile() {
  const [addresses] = useState([
    { id: 1, text: 'Home - Jl. Sudirman No. 123, Jakarta' },
    { id: 2, text: 'Office - Tower A, 15th Floor, Jakarta' },
  ])

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-aldesRed via-[#cf2f23] to-[#ea6a2a] px-6 py-8 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.23em] text-white/80">Aldes Membership</p>
          <h1 className="mt-2 text-3xl font-black">John Doe</h1>
        </div>
        <div className="-mt-8 px-6 pb-6">
          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border-4 border-white bg-aldesYellow text-aldesRed shadow-lg">
            <User className="h-8 w-8" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-aldesRed/10 bg-white px-4 py-3 text-sm text-slate-700">
              <p className="mb-1 flex items-center gap-2 font-bold text-aldesRed">
                <Mail className="h-4 w-4" /> Email
              </p>
              john.doe@email.com
            </div>
            <div className="rounded-2xl border border-aldesRed/10 bg-white px-4 py-3 text-sm text-slate-700">
              <p className="mb-1 flex items-center gap-2 font-bold text-aldesRed">
                <Phone className="h-4 w-4" /> Phone
              </p>
              +62 812 3456 7890
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-aldesRed">Saved Addresses</h2>
          <button type="button" className="rounded-xl bg-aldesYellow/70 px-3 py-1 text-xs font-black text-aldesRed">
            Primary 2/5
          </button>
        </div>
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start justify-between gap-3 rounded-2xl border border-aldesRed/10 bg-white p-4">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin className="mt-0.5 h-4 w-4 text-aldesRed" />
                <span>{address.text}</span>
              </div>
              <div className="flex items-center gap-2 text-aldesRed">
                <button type="button" className="rounded-lg border border-aldesRed/20 p-1.5 hover:bg-aldesYellow/40">
                  <Edit className="h-4 w-4" />
                </button>
                <button type="button" className="rounded-lg border border-aldesRed/20 p-1.5 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="btn-secondary mt-4 flex w-full items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </section>

      <button type="button" className="btn-secondary flex items-center justify-center gap-2">
        <LogOut className="h-5 w-5" /> Log Out
      </button>
    </main>
  )
}

export default Profile
