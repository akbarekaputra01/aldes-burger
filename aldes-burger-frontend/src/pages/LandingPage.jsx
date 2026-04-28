import { ChefHat, Flame, Sliders, Star, Truck, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getToken } from '../utils/auth'

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
  const isAuthenticated = Boolean(getToken())

  return (
    <main className="bg-aldesCream text-gray-800 selection:bg-aldesRed selection:text-white">
      {/* HERO SECTION */}
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pt-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-aldesYellow/20 px-4 py-1.5 text-sm font-bold tracking-wide text-aldesRed ring-1 ring-aldesYellow/30">
            <Flame className="h-4 w-4 animate-pulse" /> Freshly grilled daily
          </div>
          <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl lg:leading-[1.1]">
            Your Burger, <br className="hidden lg:block" />
            <span className="text-aldesRed">Your Rules.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl">
            Build every layer exactly how you like it—extra cheese, no onions, double patty, <span className="font-semibold text-gray-800">zero compromise.</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="group flex cursor-pointer items-center justify-center rounded-full bg-aldesRed px-8 py-3.5 font-bold text-white shadow-lg shadow-aldesRed/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-aldesRed/50 active:translate-y-0"
            >
              Start Customizing
            </Link>
            <Link
              to={isAuthenticated ? '/transactions' : '/login'}
              className="flex cursor-pointer items-center justify-center rounded-full border-2 border-aldesRed/20 bg-white px-8 py-3.5 font-bold text-aldesRed transition-all duration-300 hover:-translate-y-1 hover:border-aldesRed hover:bg-aldesRed/5 active:translate-y-0"
            >
              {isAuthenticated ? 'Track Orders' : 'Login to Track'}
            </Link>
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="group relative overflow-hidden rounded-[2rem] shadow-2xl shadow-gray-300/50">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80"
            alt="Epic burger hero"
            className="h-full min-h-[320px] w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-gray-200/40 sm:p-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">The Universal Kitchen</h2>
            <p className="mt-3 text-lg text-gray-600">Every ingredient can be modified as <strong className="text-aldesRed">ADD</strong> (extra) or <strong className="text-gray-800">REMOVE</strong> (no ingredient).</p>
          </div>
          
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="group cursor-pointer rounded-3xl bg-aldesCream p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-aldesYellow/10 hover:shadow-lg hover:shadow-aldesYellow/20">
              <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <ChefHat className="h-7 w-7 text-aldesRed" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Chef-ready</h3>
              <p className="mt-2 text-base text-gray-600 leading-relaxed">Your notes are clear for kitchen staff with structured modifiers.</p>
            </article>

            <article className="group cursor-pointer rounded-3xl bg-aldesCream p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-aldesYellow/10 hover:shadow-lg hover:shadow-aldesYellow/20">
              <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Sliders className="h-7 w-7 text-aldesRed" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Flexible Controls</h3>
              <p className="mt-2 text-base text-gray-600 leading-relaxed">No tomato? Extra cheese? One tap and your recipe updates instantly.</p>
            </article>

            <article className="group cursor-pointer rounded-3xl bg-aldesCream p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-aldesYellow/10 hover:shadow-lg hover:shadow-aldesYellow/20">
              <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Flame className="h-7 w-7 text-aldesRed" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Always Fresh</h3>
              <p className="mt-2 text-base text-gray-600 leading-relaxed">We grill to order so every bite is hot, juicy, and made for you.</p>
            </article>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
          <p className="mt-3 text-gray-600">Three simple steps to your perfect meal.</p>
        </div>
        
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <article key={step.id} className="group relative rounded-3xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200">
                <div className="absolute -top-5 left-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-aldesYellow text-aldesRed shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  <span className="text-aldesRed/50 mr-1">{step.id}.</span> {step.title}
                </h3>
                <p className="mt-3 text-base text-gray-600 leading-relaxed">{step.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <article className="relative overflow-hidden rounded-[2.5rem] bg-white p-10 text-center shadow-xl shadow-gray-200/50 sm:p-14">
          <Quote className="absolute -left-4 -top-4 h-32 w-32 rotate-12 text-aldesCream opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-aldesYellow">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-current drop-shadow-sm" />
              ))}
            </div>
            <p className="mt-6 text-xl font-medium italic leading-relaxed text-gray-800 sm:text-2xl">
              “Aldes Burger is my go-to app. I can remove what I don’t like and add what I love. Super easy and always delicious!”
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-aldesCream border-2 border-aldesYellow flex items-center justify-center font-bold text-aldesRed">
                R
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-gray-900">Rachel</p>
                <p className="text-sm font-medium text-gray-500">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  )
}

export default LandingPage