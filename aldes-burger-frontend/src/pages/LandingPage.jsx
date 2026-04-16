import { ChefHat, Flame, Sliders, Star, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    id: 1,
    title: 'Pick a Base',
    description: 'Start with beef, chicken, or a custom build as your burger foundation.',
    icon: ChefHat,
  },
  {
    id: 2,
    title: 'Enter the Kitchen',
    description: 'Add extra ingredients or remove anything with our universal modifier system.',
    icon: Sliders,
  },
  {
    id: 3,
    title: 'We Deliver',
    description: 'Our team grills fast and delivers hot burgers directly to your address.',
    icon: Truck,
  },
]

function LandingPage() {
  return (
    <main className="bg-aldesCream text-gray-800">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-14">
        <div className="flex flex-col justify-center">
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
            <Flame className="h-4 w-4" /> Freshly grilled daily
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Your Burger, Your Rules.</h1>
          <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
            Build every layer exactly how you like it—extra cheese, no onions, double patty, zero compromise.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/menus"
              className="rounded-3xl bg-aldesRed px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110"
            >
              Start Customizing
            </Link>
            <Link
              to="/transactions"
              className="rounded-3xl border border-aldesRed/30 bg-white px-6 py-3 font-semibold text-aldesRed transition hover:bg-aldesYellow/20"
            >
              Track Orders
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl shadow-md">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80"
            alt="Epic burger hero"
            className="h-full min-h-[280px] w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black sm:text-3xl">The Universal Kitchen</h2>
          <p className="mt-2 text-gray-600">Every ingredient can be modified as ADD (extra) or REMOVE (no ingredient).</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl bg-aldesCream p-4">
              <ChefHat className="h-6 w-6 text-aldesRed" />
              <h3 className="mt-3 font-bold">Chef-ready Instructions</h3>
              <p className="mt-1 text-sm text-gray-600">Your notes are clear for kitchen staff with structured modifiers.</p>
            </article>
            <article className="rounded-2xl bg-aldesCream p-4">
              <Sliders className="h-6 w-6 text-aldesRed" />
              <h3 className="mt-3 font-bold">Flexible Controls</h3>
              <p className="mt-1 text-sm text-gray-600">No tomato? Extra cheese? One tap and your recipe updates instantly.</p>
            </article>
            <article className="rounded-2xl bg-aldesCream p-4">
              <Flame className="h-6 w-6 text-aldesRed" />
              <h3 className="mt-3 font-bold">Always Fresh</h3>
              <p className="mt-1 text-sm text-gray-600">We grill to order so every bite is hot, juicy, and made for you.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black sm:text-3xl">How It Works</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <article key={step.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-aldesYellow/25 text-aldesRed">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-lg font-bold">{step.id}. {step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <article className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}
          </div>
          <p className="mt-3 text-lg font-medium text-gray-700">
            “Aldes Burger is my go-to app. I can remove what I don’t like and add what I love. Super easy!”
          </p>
          <p className="mt-2 text-sm font-semibold text-gray-500">— Rachel, Jakarta</p>
        </article>
      </section>

      <footer className="border-t border-aldesRed/20 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-semibold text-gray-700">Aldes Burger © 2026</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-aldesRed">Instagram</a>
            <a href="#" className="hover:text-aldesRed">TikTok</a>
            <a href="#" className="hover:text-aldesRed">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
