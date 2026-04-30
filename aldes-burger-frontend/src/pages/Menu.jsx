import { ChevronRight, Flame } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuCardSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

// Import gambar Carousel
import promo1 from '../assets/promo1.png'
import promo2 from '../assets/promo2.png'

// Import gambar Menu
import img1 from '../assets/menus/1.jpg'
import img2 from '../assets/menus/2.jpg'
import img3 from '../assets/menus/3.jpg'
import img4 from '../assets/menus/4.png'
import img5 from '../assets/menus/5.png'
import img6 from '../assets/menus/6.png'
import img7 from '../assets/menus/7.png'
import img8 from '../assets/menus/8.png'
import img9 from '../assets/menus/9.png'

// Mapping gambar berdasarkan ID menu dari database
const menuImages = {
  1: img1,
  3: img2,
  2: img3,
  4: img4,
  5: img5,
  6: img6,
  7: img7,
  8: img8,
  9: img9,
}

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
  { id: 1, image: promo1, alt: 'Spesial Promo Weekend' },
  { id: 2, image: promo2, alt: 'Aldes Burger Opening Offerings' },
]

const extendedSlides = [...bannerSlides, { ...bannerSlides[0], id: 'clone' }]

function Menu() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [menu, setMenu] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  
  const [activeBannerIndex, setActiveBannerIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const bannerRef = useRef(null)

  useEffect(() => {
    const loadMenu = async () => {
      setIsFetching(true)
      const { data } = await api.get('/menus')
      setMenu(data)
      setIsFetching(false)
    }

    loadMenu()
      .catch(() => setMenu([]))
      .finally(() => setIsFetching(false))
  }, [])

  const menuBySection = useMemo(() => {
    const grouped = {
      burgers: [],
      sides: [],
      drinks: [],
    }

    menu.forEach((menu) => {
      grouped[resolveSectionKey(menu)].push(menu)
    })

    return grouped
  }, [menu])

  const visibleSections = useMemo(
    () => sectionDefinitions.filter((section) => menuBySection[section.key]?.length > 0),
    [menuBySection],
  )

  const handleMenuAdd = (item) => {
    const sectionKey = resolveSectionKey(item)

    if (sectionKey === 'burgers') {
      navigate('/kitchen', {
        state: {
          menuId: item.id,
          menu: item,
          category: sectionKey,
        },
      })
      return
    }

    addToCart({
      id: `menu-${item.id}`,
      menu_id: item.id,
      name: item.name,
      qty: 1,
      base_price: item.price ?? 0,
      unit_price: item.price ?? 0,
      total_price: item.price ?? 0,
      modifiers: [],
      stack_order: [],
      ingredients: [],
      category: sectionKey,
      is_customized: false,
    })
  }

  const scrollBanner = (index, smooth = true) => {
    if (!bannerRef.current) return
    const viewportWidth = bannerRef.current.clientWidth
    
    bannerRef.current.style.scrollBehavior = smooth ? 'smooth' : 'auto'
    bannerRef.current.scrollLeft = viewportWidth * index
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - bannerRef.current.offsetLeft)
    setScrollLeft(bannerRef.current.scrollLeft)
    if (bannerRef.current) bannerRef.current.style.scrollBehavior = 'auto'
  }

  const handleMouseLeave = () => setIsDragging(false)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - bannerRef.current.offsetLeft
    const walk = (x - startX) * 2
    bannerRef.current.scrollLeft = scrollLeft - walk
  }

  useEffect(() => {
    const node = bannerRef.current
    if (!node) return undefined

    const handleScroll = () => {
      const viewportWidth = node.clientWidth || 1
      const currentIndex = Math.round(node.scrollLeft / viewportWidth)
      
      if (currentIndex >= bannerSlides.length) {
        setActiveBannerIndex(0)
      } else {
        setActiveBannerIndex(currentIndex)
      }
    }

    node.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => node.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let interval
    if (!isDragging) {
      interval = setInterval(() => {
        if (!bannerRef.current) return
        const viewportWidth = bannerRef.current.clientWidth
        const currentIndex = Math.round(bannerRef.current.scrollLeft / viewportWidth)

        if (currentIndex === bannerSlides.length - 1) {
          scrollBanner(currentIndex + 1, true)
          setTimeout(() => {
            if (bannerRef.current) scrollBanner(0, false)
          }, 500) 
        } else if (currentIndex >= bannerSlides.length) {
          scrollBanner(0, false)
        } else {
          scrollBanner(currentIndex + 1, true)
        }
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [isDragging])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-aldesCream px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <div 
          ref={bannerRef} 
          className={`flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {extendedSlides.map((slide, index) => (
            <article 
              key={`${slide.id}-${index}`} 
              className="min-w-full shrink-0 snap-center rounded-3xl shadow-sm overflow-hidden bg-aldesRed flex items-center justify-center"
            >
              <img 
                src={slide.image} 
                alt={slide.alt} 
                className="w-full h-48 sm:h-64 md:h-[360px] lg:h-[420px] object-cover pointer-events-none" 
              />
            </article>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          {bannerSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                scrollBanner(index, true)
                setActiveBannerIndex(index)
              }}
              className={`h-2.5 w-2.5 cursor-pointer rounded-full transition ${
                index === activeBannerIndex ? 'scale-110 bg-aldesRed' : 'bg-aldesRed/30 hover:bg-aldesRed/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeBannerIndex}
            />
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
              {menuBySection[section.key].map((item) => (
                <article
                  key={item.id}
                  // PERBAIKAN: Menambahkan 'group', 'transition-all', 'hover:-translate-y-1.5', dan 'hover:shadow-xl'
                  className={`group overflow-hidden flex flex-col rounded-3xl bg-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl ${
                    item.is_custom 
                      ? 'border-2 border-aldesYellow hover:shadow-aldesYellow/20' 
                      : 'border border-aldesCream hover:shadow-aldesRed/10'
                  }`}
                >
                  {/* Container gambar dengan overflow-hidden agar saat gambar membesar tidak keluar kotak */}
                  <div className="relative overflow-hidden">
                    {menuImages[item.id] ? (
                      <img 
                        src={menuImages[item.id]} 
                        alt={item.name} 
                        // PERBAIKAN: Menambahkan 'transition-transform' dan 'group-hover:scale-105' pada gambar
                        className="h-48 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" 
                      />
                    ) : (
                      <div className="h-48 w-full bg-aldesCream flex items-center justify-center">
                        <span className="text-aldesRed/50 font-semibold">Image Not Found</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <div className={`mb-3 self-start inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-xs font-bold ${item.is_custom ? 'bg-aldesYellow text-black' : 'bg-aldesCream text-aldesRed'}`}>
                      {item.is_custom ? <><Flame className="h-3.5 w-3.5" /> Kitchen Route</> : 'Signature Menu'}
                    </div>
                    <h3 className="text-lg font-bold text-aldesRed">{item.name}</h3>
                    <p className="mt-2 text-sm text-aldesRed/80 flex-1">{item.description}</p>
                    <p className="mt-3 text-base font-semibold text-aldesRed">{currencyFormatter.format(item.price ?? 0)}</p>
                    <button
                      type="button"
                      onClick={() => handleMenuAdd(item)}
                      className={`cursor-pointer mt-4 flex w-full items-center justify-center gap-1 rounded-2xl px-4 py-2 font-semibold transition ${
                        section.key === 'burgers'
                          ? item.is_custom
                            ? 'bg-aldesYellow text-black hover:brightness-95'
                            : 'bg-aldesRed text-white hover:brightness-110'
                          : 'bg-aldesYellow text-black hover:brightness-95'
                      }`}
                    >
                      {section.key === 'burgers' ? (item.is_custom ? 'Customize' : 'Add') : 'Add'}
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

export default Menu