import { useState } from 'react'
import { User, Mail, Phone, MapPin, Edit, Trash2, Plus, LogOut } from 'lucide-react'

function Profile() {
  const [addresses] = useState([
    { id: 1, text: 'Home - Jl. Sudirman No. 123, Jakarta' },
    { id: 2, text: 'Office - Tower A, 15th Floor, Jakarta' },
  ])

  return (
    <div className="flex min-h-screen flex-col items-center bg-aldesCream p-4 md:p-8">
      <div className="w-full max-w-2xl space-y-6">
        <section className="w-full rounded-3xl border border-aldesRed/10 bg-white p-6 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-aldesRed bg-aldesYellow">
              <span className="text-2xl font-bold text-black">JD</span>
            </div>
            <h1 className="mb-4 flex items-center justify-center gap-2 text-2xl font-bold text-aldesRed">
              <User className="h-5 w-5" />
              John Doe
            </h1>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-2 text-aldesRed">
                <Mail className="h-4 w-4" />
                <span>john.doe@email.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-aldesRed">
                <Phone className="h-4 w-4" />
                <span>+62 812 3456 7890</span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full rounded-3xl border border-aldesRed/10 bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-aldesRed">Saved Addresses</h2>
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="flex items-center justify-between gap-3 rounded-xl border border-aldesRed/10 bg-aldesCream/50 p-4">
                <div className="flex items-start gap-2 text-aldesRed">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <span>{address.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="text-aldesRed transition-opacity hover:opacity-70">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button type="button" className="text-aldesRed transition-opacity hover:opacity-70">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-aldesRed py-2 font-semibold text-aldesRed transition-colors hover:bg-aldesRed hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </button>
        </section>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-aldesRed py-3 font-bold text-aldesRed transition-colors hover:bg-aldesRed hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Profile
