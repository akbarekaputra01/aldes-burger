// export default Menu
import { CheckCircle, ChevronRight, Flame, Minus, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom' // <-- Tambahan useSearchParams
import { MenuCardSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
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
  { key: 'burgers', label: 'BURGERS' },
  { key: 'sides', label: 'SIDE DISHES' },
  { key: 'drinks', label: 'DRINKS' },
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

const bannerSlides = [
  { id: 1, image: promo1, alt: 'Spesial Promo Weekend' },
  { id: 2, image: promo2, alt: 'Aldes Burger Opening Offerings' },
]

const extendedSlides = [...bannerSlides, { ...bannerSlides[0], id: 'clone' }]

const fetcher = (url) => api.get(url).then((res) => res.data)

function Menu() {
  const navigate = useNavigate()
  const { addToCart } = useCart()

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
    setToastMessage(`Successfully added ${qty}x ${item.name}`)
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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 bg-aldesCream px-4 py-6 sm:px-6 lg:px-8 relative">
      
      {toastMessage && (
        <div className="fixed top-20 right-5 z-[999] flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-all">
          <CheckCircle className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* Sembunyikan banner jika sedang melakukan pencarian supaya user fokus ke hasil */}
      {!searchQuery && (
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
                <img src={slide.image} alt={slide.alt} className="absolute inset-0 w-full h-full object-cover rounded-3xl pointer-events-none" />
              </article>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {bannerSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => { scrollBanner(index, true); setActiveBannerIndex(index) }}
                className={`h-2.5 cursor-pointer rounded-full transition-all duration-500 ease-out ${
                  index === activeBannerIndex ? 'w-8 bg-aldesRed' : 'w-2.5 bg-aldesRed/30 hover:bg-aldesRed/60'
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {/* --- INDIKATOR PENCARIAN AKTIF --- */}
      {searchQuery && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-aldesYellow border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <h2 className="text-xl font-black uppercase text-black">
              Showing Results For: <span className="text-aldesRed">"{searchQuery}"</span>
            </h2>
            <p className="text-sm font-bold text-black/70">Found {filteredMenu.length} items</p>
          </div>
          <button 
            onClick={() => setSearchParams({})} 
            className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 rounded-xl font-black uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <X size={16} strokeWidth={3} /> Clear Search
          </button>
        </div>
      )}

      {isFetching ? (
        sectionDefinitions.map((section) => (
          <section key={section.key}>
            <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">{section.label}</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => <MenuCardSkeleton key={`${section.key}-skeleton-${index}`} />)}
            </div>
          </section>
        ))
      ) : visibleSections.length > 0 ? (
        visibleSections.map((section) => (
          <section key={section.key}>
            <h2 className="mb-4 text-2xl font-extrabold text-aldesRed">{section.label}</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {menuBySection[section.key].map((item) => (
                <article
                  key={item.id}
                  ref={activeActionId === item.id ? activeCardRef : null}
                  className={`group flex flex-col overflow-hidden rounded-xl border-2 border-black bg-white transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
                    item.is_custom ? 'shadow-[4px_4px_0px_0px_#EAB308]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="relative overflow-hidden border-b-2 border-black bg-white">
                    {menuImages[item.id] ? (
                      <img src={menuImages[item.id]} alt={item.name} className="h-48 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" />
                    ) : (
                      <div className="h-48 w-full bg-white flex items-center justify-center">
                        <span className="text-black font-bold">Image Not Found</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <div className={`mb-3 self-start inline-flex items-center gap-1 rounded-lg border-2 border-black px-2 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${item.is_custom ? 'bg-aldesYellow text-black' : 'bg-white text-black'}`}>
                      {item.is_custom ? <><Flame className="h-3.5 w-3.5" /> Kitchen</> : section.key === 'sides' ? 'Tasty Side' : section.key === 'drinks' ? 'Refreshment' : 'Signature Burger'}
                    </div>
                    
                    <h3 className="text-lg font-black text-aldesRed uppercase tracking-tight">{item.name}</h3>
                    <p className="mt-2 text-sm text-black font-medium flex-1">{item.description}</p>
                    <p className="mt-3 text-lg font-black text-black">{currencyFormatter.format(item.price ?? 0)}</p>
                    
                    {activeActionId === item.id ? (
                      <div className="mt-4 flex items-center justify-between gap-2 h-10">
                        <div className="flex h-full items-center overflow-hidden rounded-lg border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <button type="button" onClick={() => setTempQty((p) => Math.max(1, p - 1))} className="flex h-8 w-8 items-center justify-center font-bold text-black transition hover:bg-gray-200 active:bg-gray-300"><Minus className="h-4 w-4" /></button>
                          <span className="w-8 border-x-2 border-black text-center font-bold text-black">{tempQty}</span>
                          <button type="button" onClick={() => setTempQty((p) => p + 1)} className="flex h-8 w-8 items-center justify-center font-bold text-black transition hover:bg-gray-200 active:bg-gray-300"><Plus className="h-4 w-4" /></button>
                        </div>
                        <button type="button" onClick={() => handleDirectAddToCart(item, tempQty)} className="flex h-full flex-1 items-center justify-center gap-1 rounded-lg border-2 border-black bg-aldesYellow font-bold uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-yellow-400">
                          Confirm <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleInitialClick(item)} className={`cursor-pointer mt-4 flex h-10 w-full items-center justify-center gap-1 rounded-lg border-2 border-black px-4 font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${item.is_custom ? 'bg-aldesYellow text-black hover:bg-yellow-400' : 'bg-aldesRed text-white hover:brightness-110'}`}>
                        {section.key === 'burgers' ? (item.is_custom ? 'Customize' : 'Add') : 'Add'} <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      ) : (
        // State Jika Hasil Pencarian Kosong
        <section className="flex flex-col items-center justify-center text-center py-20">
          <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase text-aldesRed mb-2">Oops!</h2>
            <p className="text-lg font-bold text-black uppercase">
              No items found for <span className="bg-aldesYellow px-2">"{searchQuery}"</span>
            </p>
            <button 
              onClick={() => setSearchParams({})} 
              className="mt-6 bg-aldesRed text-white border-2 border-black px-6 py-3 rounded-xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
            >
              See All Menu
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default Menu