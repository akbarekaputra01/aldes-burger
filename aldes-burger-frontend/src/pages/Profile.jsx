import { User } from 'lucide-react'

function Profile() {
  return (
    <div className="bg-aldesCream min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-aldesRed text-aldesYellow flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-aldesRed">John Doe</h1>
            <p className="text-gray-600">john.doe@example.com</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-aldesRed mb-2">Saved Address</h2>
              <p className="text-gray-700">Home - Jl. Sudirman No. 123, Jakarta</p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-aldesRed px-4 py-2 text-aldesYellow font-semibold hover:opacity-90 transition"
            >
              Edit
            </button>
          </div>
        </section>

        <button
          type="button"
          className="w-full border border-aldesRed text-aldesRed py-3 rounded-lg font-semibold hover:bg-aldesRed hover:text-aldesYellow transition"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default Profile
