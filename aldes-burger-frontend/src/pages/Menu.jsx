// export default Menu
import { CheckCircle, ChevronRight, Flame, Minus, Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuCardSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import api from '../lib/api'

// Import gambar Carousel
import promo1 from '../assets/promo1.png'
import promo2 from '../assets/promo2.png'

// Import gambar Menu
import img1 from '../assets/menus/1.png'
import img2 from '../assets/menus/2.png'
import img3 from '../assets/menus/3.png'
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

// Helper untuk mengurutkan tumpukan burger dari bawah ke atas
const getStackOrder = (name) => {
  const n = name.toLowerCase()
  if (n.includes('bottom') || n.includes('bawah')) return 1
  if (n.includes('lettuce') || n.includes('selada')) return 2
  if (n.includes('tomato') || n.includes('tomat')) return 3
  if (n.includes('pickle') || n.includes('acar') || n.includes('onion')) return 4
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) return 5
  if (n.includes('cheese') || n.includes('keju')) return 6
  if (n.includes('top') || n.includes('atas')) return 7
  return 99
}

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

  const [activeActionId, setActiveActionId] = useState(null)
  const [tempQty, setTempQty] = useState(1)
  
  // STATE BARU: Untuk menyimpan pesan sukses
  const [toastMessage, setToastMessage] = useState(null)
  
  const activeCardRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeCardRef.current && !activeCardRef.current.contains(event.target)) {
        setActiveActionId(null) 
      }
    }

    if (activeActionId !== null) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeActionId])

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

  const handleInitialClick = (item) => {
    const sectionKey = resolveSectionKey(item)

    // PERBAIKAN: Semua menu yang ada di kategori Burgers akan langsung dilempar ke Kitchen
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

    if (activeActionId === item.id) {
      setActiveActionId(null)
    } else {
      setActiveActionId(item.id)
      setTempQty(1)
    }
  }

  const handleDirectAddToCart = (item, qty) => {
    const sectionKey = resolveSectionKey(item)

    let itemIngredients = []
    if (sectionKey === 'burgers') {
      if (item.ingredients && item.ingredients.length > 0) {
        itemIngredients = item.ingredients
          .map(i => i.name)
          .sort((a, b) => getStackOrder(a) - getStackOrder(b));
      } else {
        const isChicken = item.name.toLowerCase().includes('chicken')
        itemIngredients = [
          'Bottom Bun', 
          'Lettuce', 
          'Tomato', 
          'Pickles', 
          isChicken ? 'Chicken Patty' : 'Beef Patty', 
          'Cheese', 
          'Top Bun'
        ]
      }
    }

    addToCart({
      id: `menu-${item.id}-${Date.now()}`,
      menu_id: item.id,
      name: item.name,
      qty: qty,
      base_price: item.price ?? 0,
      unit_price: item.price ?? 0,
      total_price: (item.price ?? 0) * qty,
      modifiers: [],
      stack_order: [],
      ingredients: itemIngredients,
      category: sectionKey,
      is_customized: false,
    })
    
    // Tutup opsi kuantitas
    setActiveActionId(null)

    // PERBAIKAN: Tampilkan pesan sukses (Toast)
    setToastMessage(`Successfully added ${qty}x ${item.name}`)
    // Sembunyikan otomatis setelah 3 detik
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
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
          }, 600) 
        } else if (currentIndex >= bannerSlides.length) {
          scrollBanner(0, false)
        } else {
          scrollBanner(currentIndex + 1, true)
        }
      }, 5000) 
    }
    return () => clearInterval(interval)
  }, [isDragging])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-aldesCream px-4 py-6 sm:px-6 lg:px-8 relative">
      
      {/* KODE BARU: Komponen Toast Notification (z-index maksimal agar tidak tertutup) */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-[999] flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-all">
          <CheckCircle className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

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
              className="relative min-w-full shrink-0 snap-center rounded-3xl shadow-sm overflow-hidden bg-aldesRed aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] transform-gpu"
            >
              <img 
                src={slide.image} 
                alt={slide.alt} 
                className="absolute inset-0 w-full h-full object-cover rounded-3xl pointer-events-none" 
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
              className={`h-2.5 cursor-pointer rounded-full transition-all duration-500 ease-out ${
                index === activeBannerIndex 
                  ? 'w-8 bg-aldesRed' 
                  : 'w-2.5 bg-aldesRed/30 hover:bg-aldesRed/60'
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
                  ref={activeActionId === item.id ? activeCardRef : null}
                  className={`group overflow-hidden flex flex-col rounded-3xl bg-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-xl ${
                    item.is_custom 
                      ? 'border-2 border-aldesYellow hover:shadow-aldesYellow/20' 
                      : 'border border-aldesCream hover:shadow-aldesRed/10'
                  }`}
                >
                  <div className="relative overflow-hidden">
                    {menuImages[item.id] ? (
                      <img 
                        src={menuImages[item.id]} 
                        alt={item.name} 
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
                      {item.is_custom ? (
                        <><Flame className="h-3.5 w-3.5" /> Kitchen</>
                      ) : section.key === 'sides' ? (
                        'Tasty Side'
                      ) : section.key === 'drinks' ? (
                        'Refreshment'
                      ) : (
                        'Signature Burger'
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-aldesRed">{item.name}</h3>
                    <p className="mt-2 text-sm text-aldesRed/80 flex-1">{item.description}</p>
                    <p className="mt-3 text-base font-semibold text-aldesRed">{currencyFormatter.format(item.price ?? 0)}</p>
                    
                    {/* PERBAIKAN: Hanya render opsi kuantitas untuk Sides dan Drinks */}
                    {activeActionId === item.id ? (
                      <div className="mt-4 flex items-center justify-between gap-2 h-10">
                        <div className="flex h-full items-center rounded-2xl bg-aldesCream px-1">
                          <button
                            type="button"
                            onClick={() => setTempQty((p) => Math.max(1, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-aldesRed transition hover:bg-white"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-aldesRed">{tempQty}</span>
                          <button
                            type="button"
                            onClick={() => setTempQty((p) => p + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-aldesRed transition hover:bg-white"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDirectAddToCart(item, tempQty)}
                          className="flex h-full flex-1 items-center justify-center gap-1 rounded-2xl bg-aldesYellow font-semibold text-black transition hover:brightness-95"
                        >
                          Confirm <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInitialClick(item)}
                        className={`cursor-pointer mt-4 flex h-10 w-full items-center justify-center gap-1 rounded-2xl px-4 font-semibold transition ${
                          item.is_custom
                            ? 'bg-aldesYellow text-black hover:brightness-95'
                            : 'bg-aldesRed text-white hover:brightness-110'
                        }`}
                      >
                        {section.key === 'burgers' ? (item.is_custom ? 'Customize' : 'Add') : 'Add'}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    
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