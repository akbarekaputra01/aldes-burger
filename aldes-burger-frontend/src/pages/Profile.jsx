import { Award, Coins } from 'lucide-react'

function Profile() {
  return (
    <div className="bg-aldesCream min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-aldesYellow text-black font-bold flex items-center justify-center text-xl">
            JD
          </div>
          <div>
            <h1 className="text-2xl font-bold text-aldesRed">John Doe</h1>
            <p className="text-gray-600">john.doe@email.com</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">Aldes Coins</h2>
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-aldesYellow" />
              <p className="text-3xl font-bold text-aldesYellow">120</p>
            </div>
          </article>

          <article className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">Chef Badge</h2>
            <div className="flex items-start gap-3">
              <Award className="w-8 h-8 text-aldesRed mt-1" />
              <p className="font-semibold text-gray-700">Master Chef - 5 Custom Burgers Built</p>
            </div>
          </article>
        </section>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold text-aldesRed mb-3">Saved Addresses</h2>
          <div className="rounded-xl border border-aldesYellow bg-aldesCream p-4 text-gray-800">
            123 Burger Street, Patty District, New York, NY 10001
          </div>

          <button
            type="button"
            className="w-full border border-aldesRed text-aldesRed mt-6 py-3 rounded-lg font-semibold hover:bg-aldesRed hover:text-white transition"
          >
            Logout
          </button>
        </section>
      </div>
    </div>
  )
}

export default Profile
