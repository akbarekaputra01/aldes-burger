import { ChevronRight, Flame } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuCardSkeleton } from '../components/Skeletons'
import api from '../lib/api'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const sectionDefinitions = [
  { key: 'burgers', label: 'Burgers' },
  { key: 'sides', label: 'Side Dishes' },
  { key: 'drinks', label: 'Drinks' },
]

const sideKeywords = ['fries', 'side', 'nugget', 'onion ring', 'salad']
const drinkKeywords = ['drink', 'cola', 'coke', 'tea', 'coffee', 'juice', 'soda', 'water']

const resolveSectionKey = (menu) => {
  const name = menu.name?.toLowerCase() ?? ''

  if (menu.category_id === 2 || sideKeywords.some((keyword) => name.includes(keyword))) {
    return 'sides'
  }

  if (menu.category_id === 3 || drinkKeywords.some((keyword) => name.includes(keyword))) {
    return 'drinks'
  }

  return 'burgers'
}

const bannerSlides = [
  { title: '25% OFF FOR NEW CUSTOMERS!', subtitle: 'Use code: ALDES25' },
  { title: 'BUY 2 GET 1 SIDES', subtitle: 'Only this weekend at Aldes Burger.' },
  { title: 'FREE DELIVERY', subtitle: 'For total checkout above Rp 150.000.' },
]

function Menus() {
  const navigate = useNavigate()
  const [menus, setMenus] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [activeBannerIndex, setActiveBannerIndex] = useState(0)
  const bannerRef = useRef(null)

  useEffect(() => {
    const loadMenus = async () => {
      setIsFetching(true)
      const { data } = await api.get('/menus')
      setMenus(data)
      setIsFetching(false)
    }

    loadMenus()
      .catch(() => setMenus([]))
      .finally(() => setIsFetching(false))
  }, [])

  const menusBySection = useMemo(() => {
    const grouped = {
      burgers: [],
      sides: [],
      drinks: [],
    }

    menus.forEach((menu) => {
      grouped[resolveSectionKey(menu)].push(menu)
    })

    return grouped
  }, [menus])

  const visibleSections = useMemo(
    () => sectionDefinitions.filter((section) => menusBySection[section.key]?.length > 0),
    [menusBySection],
  )

  const goToKitchen = (item) => {
    navigate('/kitchen', {
      state: {
        menuId: item.id,
        menu: item,
      },
    })
  }

  const scrollBanner = (index) => {
    if (!bannerRef.current) return
    const viewportWidth = bannerRef.current.clientWidth
    bannerRef.current.scrollTo({ left: viewportWidth * index, behavior: 'smooth' })
  }

  useEffect(() => {
    const node = bannerRef.current
    if (!node) return undefined

    const handleScroll = () => {
      const viewportWidth = node.clientWidth || 1
      const nextIndex = Math.round(node.scrollLeft / viewportWidth)
      setActiveBannerIndex(Math.max(0, Math.min(nextIndex, bannerSlides.length - 1)))
    }

    node.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => node.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-aldesCream px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          {bannerSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => scrollBanner(index)}
              className={`h-2.5 w-2.5 cursor-pointer rounded-full transition ${
                index === activeBannerIndex ? 'scale-110 bg-aldesRed' : 'bg-aldesRed/30 hover:bg-aldesRed/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeBannerIndex}
            />
          ))}
        </div>
        <div ref={bannerRef} className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
          {bannerSlides.map((slide) => (
            <article key={slide.title} className="min-w-full snap-center rounded-3xl bg-aldesRed p-8 text-white shadow-sm">
              <p className="text-2xl font-black sm:text-3xl">{slide.title}</p>
              <p className="mt-2 text-sm sm:text-base">{slide.subtitle}</p>
            </article>
          ))}
        </div>
      </section>

      {isFetching ? (
        sectionDefinitions.map((section) => (
          <section key={section.key}>
            <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">{section.label}</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => <MenuCardSkeleton key={`${section.key}-skeleton-${index}`} />)}
            </div>
          </section>
        ))
      ) : (
        visibleSections.map((section) => (
          <section key={section.key}>
            <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">{section.label}</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {menusBySection[section.key].map((item) => (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-3xl bg-white shadow-sm ${
                    item.is_custom ? 'border-2 border-aldesYellow' : 'border border-transparent'
                  }`}
                >
                  <div className="h-40 bg-aldesCream" />
                  <div className="p-4">
                    <div className={`mb-3 inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-xs font-bold ${item.is_custom ? 'bg-aldesYellow text-black' : 'bg-aldesCream text-aldesRed'}`}>
                      {item.is_custom ? <><Flame className="h-3.5 w-3.5" /> Kitchen Route</> : 'Signature Menu'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                    <p className="mt-3 text-base font-semibold text-aldesRed">{currencyFormatter.format(item.price ?? 0)}</p>
                    <button
                      type="button"
                      onClick={() => goToKitchen(item)}
                      className={`cursor-pointer mt-4 flex w-full items-center justify-center gap-1 rounded-2xl px-4 py-2 font-semibold transition ${
                        item.is_custom
                          ? 'bg-aldesYellow text-black hover:brightness-95'
                          : 'bg-aldesRed text-white hover:brightness-110'
                      }`}
                    >
                      {item.is_custom ? 'Customize' : 'Add'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  )
}

export default Menus
