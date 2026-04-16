import { useState } from 'react'
import { User, Mail, Phone, MapPin, Edit, Trash2, Plus, LogOut } from 'lucide-react'

function Profile() {
  const [addresses] = useState([
    { id: 1, text: 'Home - 123 Sudirman Street, Jakarta' },
    { id: 2, text: 'Office - Tower A, 15th Floor, Jakarta' },
  ])

  return (
    <div className="bg-aldesCream min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 w-full">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-aldesYellow flex items-center justify-center mb-4 border-2 border-aldesRed">
              <span className="text-black font-bold text-2xl">JD</span>
            </div>
            <h1 className="text-2xl font-bold text-aldesRed mb-4 flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              John Doe
            </h1>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-center gap-2 text-aldesRed">
                <Mail className="w-4 h-4 text-aldesRed" />
                <span>john.doe@email.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-aldesRed">
                <Phone className="w-4 h-4 text-aldesRed" />
                <span>+62 812 3456 7890</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 w-full">
          <h2 className="text-xl font-bold text-aldesRed mb-4">Saved Addresses</h2>
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-aldesCream p-4 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2 text-aldesRed">
                  <MapPin className="w-4 h-4 text-aldesRed mt-0.5" />
                  <span>{address.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="text-aldesRed hover:opacity-70 transition-opacity">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button type="button" className="text-aldesRed hover:opacity-70 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="w-full border-2 border-aldesRed text-aldesRed py-2 rounded-xl mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-aldesRed hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Address
          </button>
        </section>

        <button
          type="button"
          className="w-full border-2 border-aldesRed text-aldesRed hover:bg-aldesRed hover:text-white transition-colors py-3 rounded-xl font-bold flex justify-center items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Profile
