import { CheckCircle, ChevronRight, Flame, Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MenuCardSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import { useTranslation } from '../context/LanguageContext'
import api from '../lib/api'
import useSWR from 'swr' 

// Import gambar Carousel
import promo1 from '../assets/promo1.jpg'
import promo2 from '../assets/promo2.jpg'

// Import gambar Menu
import img1 from '../assets/menus/1.jpg'
import img2 from '../assets/menus/2.jpg'
import img3 from '../assets/menus/3.jpg'
import img4 from '../assets/menus/4.jpg'
import img5 from '../assets/menus/5.jpg'
import img6 from '../assets/menus/6.jpg'
import img7 from '../assets/menus/7.jpg'
import img8 from '../assets/menus/8.jpg'
import img9 from '../assets/menus/9.jpg'

const menuImages = {
  1: img1, 3: img2, 2: img3, 4: img4, 5: img5, 6: img6, 7: img7, 8: img8, 9: img9
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const sectionDefinitions = [
  { key: 'burgers', labelKey: 'menu.burgers' },
  { key: 'sides', labelKey: 'menu.sideDishes' },
  { key: 'drinks', labelKey: 'menu.drinks' },
]

const sideKeywords = ['fries', 'side', 'nugget', 'onion ring', 'salad']
const drinkKeywords = ['drink', 'cola', 'coke', 'tea', 'coffee', 'juice', 'soda', 'water']

const getStackOrder = (name) => {
  const n = name.toLowerCase()
  if (n.includes('bottom') || n.includes('bawah')) return 1
  if (n.includes('lettuce') || n.includes('selada')) return 2
  if (n.includes('tomato') || n.includes('tomat')) return 3
  if (n.includes('pickle') || n.includes('acar') || n.includes('onion')) return 4
  if (n.includes('ketchup') || n.includes('mayo') || n.includes('sauce') || n.includes('saos')) return 5
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) return 6
  if (n.includes('cheese') || n.includes('keju')) return 7
  if (n.includes('top') || n.includes('atas')) return 8
  return 99
}

const resolveSectionKey = (menu) => {
  const name = menu.name?.toLowerCase() ?? ''
  if (menu.category_id === 2 || sideKeywords.some((keyword) => name.includes(keyword))) return 'sides'
  if (menu.category_id === 3 || drinkKeywords.some((keyword) => name.includes(keyword))) return 'drinks'
  return 'burgers'
}

const getMenuStock = (item) => {
  if (item.is_custom) {
    return 999
  }
  if (item.ingredients && item.ingredients.length > 0) {
    const stocks = item.ingredients.map((ing) => {
      const reqQty = Math.max(1, Number(ing.pivot?.quantity || 1))
      return Math.floor(Number(ing.stock ?? 0) / reqQty)
    })
    return Math.min(...stocks)
  }
  return Number(item.stock ?? 0)
}

const bannerSlides = [
  { id: 1, image: promo1, alt: 'Spesial Promo Weekend' },
  { id: 2, image: promo2, alt: 'Aldes Burger Opening Offerings' },
]

const extendedSlides = [...bannerSlides, { ...bannerSlides[0], id: 'clone' }]

const fetcher = (url) => api.get(url).then((res) => res.data)

function Menu() {
  const navigate = useNavigate()
  const { addToCart, cart } = useCart()
  const { t } = useTranslation()

  // --- AMBIL QUERY SEARCH DARI URL ---
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const { data: menu = [], isLoading: isFetching } = useSWR('/menus', fetcher, {
    revalidateOnFocus: true, 
  })
  
  const [activeBannerIndex, setActiveBannerIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const bannerRef = useRef(null)

  const [activeActionId, setActiveActionId] = useState(null)
  const [tempQty, setTempQty] = useState(1)
  
  const [toastMessage, setToastMessage] = useState(null)
  const activeCardRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeCardRef.current && !activeCardRef.current.contains(event.target)) {
        setActiveActionId(null) 
      }
    }
    if (activeActionId !== null) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeActionId])

  // --- FILTER MENU BERDASARKAN PENCARIAN ---
  const filteredMenu = useMemo(() => {
    if (!searchQuery) return menu

    const query = searchQuery.toLowerCase()
    return menu.filter(item => 
      item.name?.toLowerCase().includes(query) || 
      item.description?.toLowerCase().includes(query)
    )
  }, [menu, searchQuery])

  // --- GROUPING MENGGUNAKAN DATA YANG SUDAH DIFILTER ---
  const menuBySection = useMemo(() => {
    const grouped = { burgers: [], sides: [], drinks: [] }
    filteredMenu.forEach((item) => {
      grouped[resolveSectionKey(item)].push(item)
    })
    return grouped
  }, [filteredMenu])

  const visibleSections = useMemo(
    () => sectionDefinitions.filter((section) => menuBySection[section.key]?.length > 0),
    [menuBySection],
  )

  const handleInitialClick = (item) => {
    const isAuthenticated = localStorage.getItem('aldes_token');
    if (!isAuthenticated) { navigate('/login'); return; }

    const stock = getMenuStock(item)
    if (stock <= 0) return

    const sectionKey = resolveSectionKey(item)

    if (sectionKey === 'burgers') {
      navigate('/kitchen', { state: { menuId: item.id, menu: item, category: sectionKey } })
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
    const isAuthenticated = localStorage.getItem('aldes_token');
    if (!isAuthenticated) { navigate('/login'); return; }

    const sectionKey = resolveSectionKey(item)
    let itemIngredients = []
    
    if (sectionKey === 'burgers') {
      if (item.ingredients && item.ingredients.length > 0) {
        itemIngredients = item.ingredients
          .flatMap(i => {
            const pivotQty = Math.max(1, Number(i.pivot?.quantity || 1));
            return Array(pivotQty).fill(i.name);
          })
          .sort((a, b) => getStackOrder(a) - getStackOrder(b));
      } else {
        const isChicken = item.name.toLowerCase().includes('chicken')
        itemIngredients = [
          'Bottom Bun', 'Lettuce', 'Tomato', 'Pickles',
          'Special Sauce', isChicken ? 'Chicken Patty' : 'Beef Patty', 'Cheese', 'Top Bun'
        ]
      }
    }
    const maxStock = getMenuStock(item)
    const existingCartItem = (cart || []).find((c) => c.menu_id === item.id && !c.is_customized)
    const existingQty = existingCartItem ? existingCartItem.qty : 0

    if (existingQty + qty > maxStock) {
      alert(
        localStorage.getItem('aldes_lang') === 'id'
          ? `Gagal menambahkan! Anda memiliki ${existingQty} di keranjang, dan stok maksimal adalah ${maxStock}.`
          : `Cannot add more! You already have ${existingQty} in cart, and max stock is ${maxStock}.`
      )
      return
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
    
    setActiveActionId(null)
    setToastMessage(t('menu.addedToCart', qty, item.name))
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Animasi Banner (Tetap Sama)
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
      if (currentIndex >= bannerSlides.length) setActiveBannerIndex(0)
      else setActiveBannerIndex(currentIndex)
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
          setTimeout(() => { if (bannerRef.current) scrollBanner(0, false) }, 600) 
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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 sm:gap-8 bg-aldesCream px-4 py-4 sm:py-6 sm:px-6 lg:px-8 relative overflow-x-hidden">
      
      {/* --- RESPONSIVE TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 right-4 sm:right-5 z-[999] flex items-center gap-2 rounded-full bg-green-500 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-2xl transition-all max-w-[90vw] sm:max-w-md">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Sembunyikan banner jika sedang melakukan pencarian */}
      {!searchQuery && (
        <section className="space-y-3 w-full">
          <div 
            ref={bannerRef} 
            className={`flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
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
                className="relative min-w-full shrink-0 snap-center rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden bg-aldesRed aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] transform-gpu"
              >
                <img src={slide.image} alt={slide.alt} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
              </article>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-1">
            {bannerSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => { scrollBanner(index, true); setActiveBannerIndex(index) }}
                className={`h-2 sm:h-2.5 cursor-pointer rounded-full transition-all duration-500 ease-out ${
                  index === activeBannerIndex ? 'w-6 sm:w-8 bg-aldesRed' : 'w-2 sm:w-2.5 bg-aldesRed/30 hover:bg-aldesRed/60'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* --- INDIKATOR PENCARIAN AKTIF RESPONSIVE --- */}
      {searchQuery && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-aldesYellow border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
          <div className="break-words w-full sm:w-auto">
            <h2 className="text-lg sm:text-xl font-black uppercase text-black leading-tight">
              {t('menu.showingResultsFor')} <span className="text-aldesRed">"{searchQuery}"</span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70 mt-0.5">{t('menu.foundItems', filteredMenu.length)}</p>
          </div>
          <button 
            onClick={() => setSearchParams({})} 
            className="flex items-center justify-center gap-2 bg-white border-2 border-black px-4 py-2 rounded-xl font-black uppercase text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all w-full sm:w-auto"
          >
            <X size={16} strokeWidth={3} /> {t('menu.clearSearch')}
          </button>
        </div>
      )}

      {/* --- MENU GRID SECTION --- */}
      {isFetching ? (
        sectionDefinitions.map((section) => (
          <section key={section.key} className="w-full">
            <h2 className="mb-4 text-xl sm:text-2xl font-black text-aldesRed tracking-tight uppercase">{t(section.labelKey)}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {Array.from({ length: 3 }).map((_, index) => <MenuCardSkeleton key={`${section.key}-skeleton-${index}`} />)}
            </div>
          </section>
        ))
      ) : visibleSections.length > 0 ? (
        visibleSections.map((section) => (
          <section key={section.key} className="w-full">
            <h2 className="mb-4 text-xl sm:text-2xl font-black text-aldesRed tracking-tight uppercase">{t(section.labelKey)}</h2>
            
            {/* Optimized Responsive Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {menuBySection[section.key].map((item) => {
                const isItemOutOfStock = getMenuStock(item) <= 0
                return (
                  <article
                    key={item.id}
                    ref={activeActionId === item.id ? activeCardRef : null}
                    className={`group flex flex-col overflow-hidden rounded-2xl border-2 border-black bg-white transition-all duration-200 ${
                      isItemOutOfStock ? 'opacity-60 grayscale' : 'sm:hover:-translate-x-1 sm:hover:-translate-y-1 sm:hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]'
                    } ${item.is_custom ? 'shadow-[4px_4px_0_0_#EAB308]' : 'shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}
                  >
                    {/* Image Aspect Box */}
                    <div className="relative overflow-hidden border-b-2 border-black bg-white aspect-[16/10]">
                      {isItemOutOfStock && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-10 pointer-events-none">
                          <span className="bg-aldesRed text-white border-2 border-black px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider rotate-[-5deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {t('menu.outOfStock')}
                          </span>
                        </div>
                      )}
                      {menuImages[item.id] ? (
                        <img src={menuImages[item.id]} alt={item.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-in-out sm:group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 h-full w-full bg-white flex items-center justify-center">
                          <span className="text-black text-xs font-black uppercase">{t('menu.imageNotFound')}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Info Box */}
                    <div className="p-4 flex flex-col flex-1 min-w-0">
                      <div className={`mb-3 self-start inline-flex items-center gap-1 rounded-lg border-2 border-black px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.is_custom ? 'bg-aldesYellow text-black' : 'bg-white text-black'}`}>
                        {item.is_custom ? <><Flame className="h-3.5 w-3.5" />{t('menu.kitchen')}</> : section.key === 'sides' ? t('menu.tastySide') : section.key === 'drinks' ? t('menu.refreshment') : t('menu.signatureBurger')}
                      </div>
                      
                      <h3 className="text-base sm:text-lg font-black text-aldesRed uppercase tracking-tight truncate">{item.name}</h3>
                      <p className="mt-1.5 text-xs sm:text-sm text-black font-medium flex-1 line-clamp-3 sm:line-clamp-2 leading-relaxed">{item.description}</p>
                      <p className="mt-3 text-base sm:text-lg font-black text-black">{currencyFormatter.format(item.price ?? 0)}</p>
                      
                      {/* Action States */}
                      {isItemOutOfStock ? (
                        <button type="button" disabled className="cursor-not-allowed mt-4 flex h-10 w-full items-center justify-center gap-1 rounded-xl border-2 border-gray-300 bg-gray-200 px-4 font-black uppercase text-xs sm:text-sm text-gray-400 shadow-none">
                          {t('menu.outOfStock')}
                        </button>
                      ) : activeActionId === item.id ? (
                        <div className="mt-4 flex items-center justify-between gap-2.5 h-10 w-full">
                          <div className="flex h-full items-center overflow-hidden rounded-xl border-2 border-black bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                            <button type="button" onClick={() => setTempQty((p) => Math.max(1, p - 1))} className="flex h-8 w-8 items-center justify-center font-bold text-black transition hover:bg-gray-200 active:bg-gray-300"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="w-7 border-x-2 border-black text-center text-sm font-black text-black">{tempQty}</span>
                            <button type="button" onClick={() => setTempQty((p) => Math.min(getMenuStock(item), p + 1))} className="flex h-8 w-8 items-center justify-center font-bold text-black transition hover:bg-gray-200 active:bg-gray-300"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <button type="button" onClick={() => handleDirectAddToCart(item, tempQty)} className="flex h-full flex-1 items-center justify-center gap-1 rounded-xl border-2 border-black bg-aldesYellow font-black uppercase text-xs sm:text-sm text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-yellow-400">
                            {t('menu.confirm')} <ChevronRight className="h-4 w-4 shrink-0" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleInitialClick(item)} className={`cursor-pointer mt-4 flex h-10 w-full items-center justify-center gap-1 rounded-xl border-2 border-black px-4 font-black uppercase text-xs sm:text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${item.is_custom ? 'bg-aldesYellow text-black hover:bg-yellow-400' : 'bg-aldesRed text-white hover:brightness-110'}`}>
                          {section.key === 'burgers' ? (item.is_custom ? t('menu.customize') : t('menu.add')) : t('menu.add')} <ChevronRight className="h-4 w-4 shrink-0" />
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))
      ) : (
        /* Empty Search State Responsive */
        <section className="flex flex-col items-center justify-center text-center py-16 px-4 w-full">
          <div className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm sm:max-w-md w-full">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-aldesRed mb-2">{t('menu.noItemsFound')}</h2>
            <p className="text-sm sm:text-base font-bold text-black uppercase leading-snug">
              {t('menu.noItemsDesc', searchQuery)}
            </p>
            <button 
              onClick={() => setSearchParams({})} 
              className="mt-5 w-full bg-aldesRed text-white border-2 border-black px-5 py-3 rounded-xl font-black uppercase text-xs sm:text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
            >
              {t('menu.seeAllMenu')}
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default Menu