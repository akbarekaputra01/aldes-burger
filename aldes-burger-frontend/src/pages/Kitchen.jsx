import { GripVertical, Loader2, Minus, Plus, Trash2, X, Flame } from 'lucide-react'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ListItemSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
import { useTranslation } from '../context/LanguageContext'
import GifLoader from '../components/GifLoader'
import api from '../lib/api'

// --- IMPORT ASSETS ---
import imgBeefPatty from '../assets/beef_patty.png'
import imgBottomBurger from '../assets/bottom_burger.png'
import imgCheese from '../assets/cheese.png'
import imgChickenPatty from '../assets/chicken_patty.png'
import imgLettuce from '../assets/lettuce.png'
import imgPickles from '../assets/pickles.png'
import imgTomato from '../assets/tomato.png'
import imgTopBurger from '../assets/top_burger.png'
import imgKitchenBg from '../assets/kitchen.png'
import imgMayonnaise from '../assets/mayonnaise.png'
import imgKetchup from '../assets/ketchup.png'
import imgSecretSauce from '../assets/secret_sauce.png'

const makeUid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

// Ingredient image helper
const getIngredientImage = (name) => {
  if (!name) return null
  const n = name.toLowerCase()
  if (n.includes('bottom') || n.includes('bawah')) return imgBottomBurger
  if (n.includes('top') || n.includes('atas') || n.includes('bun') || n.includes('roti')) {
    if (n.includes('bottom')) return imgBottomBurger
    return imgTopBurger
  }
  if (n.includes('beef') || n.includes('daging')) return imgBeefPatty
  if (n.includes('chicken') || n.includes('ayam')) return imgChickenPatty
  if (n.includes('cheese') || n.includes('keju')) return imgCheese
  if (n.includes('lettuce') || n.includes('selada')) return imgLettuce
  if (n.includes('pickle') || n.includes('acar') || n.includes('onion') || n.includes('caramelized')) return imgPickles
  if (n.includes('tomato') || n.includes('tomat')) return imgTomato
  if (n.includes('mayo')) return imgMayonnaise
  if (n.includes('ketchup') || n.includes('saus tomat')) return imgKetchup
  if (n.includes('secret') || n.includes('rahasia')) return imgSecretSauce
  return null
}

const isBottomBunItem = (name) => {
  if (!name) return false
  const n = name.toLowerCase()
  return n.includes('bottom') || n.includes('bawah')
}

const isTopBunItem = (name) => {
  if (!name) return false
  const n = name.toLowerCase()
  return n.includes('top') || n.includes('atas') || (n.includes('bun') && !n.includes('bottom') && !n.includes('bawah'))
}

// Burger layer order helper (bottom to top)
const getStackOrder = (name) => {
  const n = name.toLowerCase()
  if (n.includes('bottom') || n.includes('bawah')) return 1
  if (n.includes('lettuce') || n.includes('selada')) return 2
  if (n.includes('tomato') || n.includes('tomat')) return 3
  if (n.includes('pickle') || n.includes('acar') || n.includes('onion')) return 4
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) return 5
  if (n.includes('cheese') || n.includes('keju')) return 6
  if (n.includes('sauce') || n.includes('saus') || n.includes('mayo') || n.includes('ketchup')) return 6.5
  if (n.includes('top') || n.includes('atas')) return 7
  return 99
}

const getIngredientPriority = (name) => {
  if (!name) return 99;
  return getStackOrder(name);
}

const getIngredientThickness = (name, isMobile = false) => {
  if (!name) return 10
  const n = name.toLowerCase()
  const factor = isMobile ? 0.75 : 1
  
  if (n.includes('bottom') || n.includes('bawah')) return Math.round(16 * factor)
  if (n.includes('top') || n.includes('atas') || n.includes('bun')) return Math.round(22 * factor)
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) return Math.round(16 * factor)
  if (n.includes('tomato') || n.includes('tomat')) return Math.round(4 * factor)
  if (n.includes('lettuce') || n.includes('selada')) return Math.round(4 * factor)
  if (n.includes('cheese') || n.includes('keju')) return Math.round(2 * factor)
  if (n.includes('pickle') || n.includes('acar') || n.includes('onion') || n.includes('caramelized')) return Math.round(2 * factor)
  if (n.includes('sauce') || n.includes('saus') || n.includes('mayo') || n.includes('ketchup')) return Math.round(3 * factor)
  return Math.round(10 * factor)
}

const getVisualOffset = (name, isMobile = false) => {
  if (!name) return 0
  const n = name.toLowerCase()
  const factor = isMobile ? 0.7 : 1
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) {
    return Math.round(16 * factor)
  }
  if (n.includes('sauce') || n.includes('saus') || n.includes('mayo') || n.includes('ketchup')) {
    return Math.round(12 * factor) 
  }
  return 0
}

const toIngredientInstances = (menuIngredients = []) =>
  menuIngredients.flatMap((ingredient) => {
    const quantity = ingredient.pivot?.quantity ?? 1
    return Array.from({ length: quantity }).map((_, index) => ({
      instance_id: makeUid(),
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      ingredient_price: Number(ingredient.price ?? 0),
      source: 'default',
      baseline_ref: `${ingredient.id}-${index + 1}`,
      animate_drop: false,
    }))
  })

function Kitchen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()
  const { t } = useTranslation()

  const [menu, setMenu] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [burgerStack, setBurgerStack] = useState([])
  const [baselineStack, setBaselineStack] = useState([])
  const [qty, setQty] = useState(1)
  const [isFetching, setIsFetching] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isSavingVariation, setIsSavingVariation] = useState(false)

  const getMaxQtyForStack = () => {
    if (burgerStack.length === 0) return 1
    
    // Count occurrences of each ingredient ID in the current stack
    const counts = {}
    burgerStack.forEach(layer => {
      counts[layer.ingredient_id] = (counts[layer.ingredient_id] ?? 0) + 1
    })
    
    let maxQty = 999
    for (const ingredientId in counts) {
      const pantryIng = ingredients.find(i => i.id === Number(ingredientId))
      const stock = pantryIng ? pantryIng.stock : 0
      const reqQty = counts[ingredientId]
      const possibleQty = Math.floor(stock / reqQty)
      if (possibleQty < maxQty) {
        maxQty = possibleQty
      }
    }
    return Math.max(1, maxQty)
  }
  
  const [draggingData, setDraggingData] = useState(null)
  const [isDragOverBox, setIsDragOverBox] = useState(false)
  const [dragOverItemId, setDragOverItemId] = useState(null)
  const [hoveredLayerId, setHoveredLayerId] = useState(null)

  // VIEWPORT DETECTION
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const checkSize = () => setIsMobileViewport(window.innerWidth < 640)
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  const menuId = location.state?.menuId
  const incomingMenu = location.state?.menu

  const selectedMenu = useMemo(() => {
    if (!menu.length) return null
    if (incomingMenu?.id) return menu.find((m) => m.id === incomingMenu.id) ?? incomingMenu
    return menu.find((m) => m.id === menuId) ?? menu.find((m) => m.is_custom) ?? menu[0]
  }, [incomingMenu, menuId, menu])

  useEffect(() => {
    const loadData = async () => {
      const cachedMenu = sessionStorage.getItem('aldes_menu_cache');
      const cachedIngredients = sessionStorage.getItem('aldes_ingredients_cache');
      
      if (cachedMenu && cachedIngredients) {
        setMenu(JSON.parse(cachedMenu));
        setIngredients(JSON.parse(cachedIngredients));
        setIsFetching(false); 
      } else {
        setIsFetching(true);
      }

      try {
        const [menuRes, ingredientsRes] = await Promise.all([api.get('/menus'), api.get('/ingredients')]);
        const fetchedMenus = menuRes.data;
        
        const uniqueIngredients = [];
        const seenNames = new Set();
        const nonBurgerItems = ['water','drink', 'mineral', 'fries', 'nugget', 'soda', 'tea', 'ring', 'cola'];
        
        ingredientsRes.data.forEach((item) => {
          const itemName = item.name.toLowerCase();
          const isExcluded = nonBurgerItems.some(keyword => itemName.includes(keyword));
          if (!seenNames.has(item.name) && !isExcluded) {
            seenNames.add(item.name);
            uniqueIngredients.push(item);
          }
        });
        
        setMenu(fetchedMenus);
        setIngredients(uniqueIngredients);
        sessionStorage.setItem('aldes_menu_cache', JSON.stringify(fetchedMenus));
        sessionStorage.setItem('aldes_ingredients_cache', JSON.stringify(uniqueIngredients));
      } catch (error) {
        if (!cachedMenu || !cachedIngredients) {
          setMenu([]);
          setIngredients([]);
        }
      } finally {
        setIsFetching(false);
      }
    }
    loadData()
  }, [])

  const initializedMenuIdRef = useRef(null);
  useEffect(() => {
    if (!selectedMenu || ingredients.length === 0) return;

    if (initializedMenuIdRef.current === selectedMenu.id) return;
    initializedMenuIdRef.current = selectedMenu.id;

    if (selectedMenu.is_custom) {
      setBaselineStack([])
      setBurgerStack([])
    } else {
      let menuIngredients = selectedMenu.ingredients ?? []
      if (menuIngredients.length === 0) {
        const isChicken = selectedMenu.name.toLowerCase().includes('chicken')
        const recipeKeywords = ['bottom bun', 'lettuce', 'tomato', 'pickle', isChicken ? 'chicken' : 'beef', 'cheese', 'top bun']
        menuIngredients = recipeKeywords.map(keyword => {
          const found = ingredients.find(i => i.name.toLowerCase().includes(keyword))
          return found ? { ...found, pivot: { quantity: 1 } } : null
        }).filter(Boolean)
      }
      const initialStack = toIngredientInstances(menuIngredients)
        .sort((a, b) => getStackOrder(a.ingredient_name) - getStackOrder(b.ingredient_name))
      setBaselineStack(initialStack)
      setBurgerStack(initialStack)
    }
    setQty(1)
  }, [selectedMenu, ingredients])

  const signatureIngredients = useMemo(() => {
    if (!selectedMenu || selectedMenu.is_custom) return [];
    const uniqueIds = new Set();
    return baselineStack.filter(item => {
      if (uniqueIds.has(item.ingredient_id)) return false;
      uniqueIds.add(item.ingredient_id);
      return true;
    });
  }, [baselineStack, selectedMenu]);

  const toggleSignatureIngredient = (ingredientId, isCurrentlyIncluded) => {
    if (isCurrentlyIncluded) {
      setBurgerStack(prev => prev.filter(item => item.ingredient_id !== ingredientId));
    } else {
      const itemsToAdd = baselineStack.filter(item => item.ingredient_id === ingredientId);
      setBurgerStack(prev => {
        const next = [...prev, ...itemsToAdd];
        return next.sort((a, b) => getStackOrder(a.ingredient_name) - getStackOrder(b.ingredient_name));
      });
    }
  }

  const pantryIngredients = useMemo(() => {
    if (!selectedMenu) return []
    let result = []
    if (selectedMenu.is_custom) {
      result = [...ingredients]
    } else {
      const allowedIds = (selectedMenu.ingredients ?? []).map((i) => i.id)
      result = ingredients.filter((i) => allowedIds.includes(i.id))
    }
    return result.sort((a, b) => getIngredientPriority(a.name) - getIngredientPriority(b.name));
  }, [ingredients, selectedMenu])

  const layerCounts = useMemo(() => {
    const counts = {}
    burgerStack.forEach((l) => { counts[l.ingredient_id] = (counts[l.ingredient_id] ?? 0) + 1 })
    return counts
  }, [burgerStack])

  const modifiers = useMemo(() => {
    const baseCounts = {}
    baselineStack.forEach((l) => { baseCounts[l.ingredient_id] = (baseCounts[l.ingredient_id] ?? 0) + 1 })
    const keys = new Set([...Object.keys(baseCounts), ...Object.keys(layerCounts)].map(Number))

    return [...keys].flatMap((id) => {
      const b = baseCounts[id] ?? 0
      const c = layerCounts[id] ?? 0
      if (b === c) return []
      return c > b ? [{ ingredient_id: id, action: 'add', quantity: c - b }] : [{ ingredient_id: id, action: 'remove', quantity: b - c }]
    })
  }, [baselineStack, layerCounts])

  const unitPrice = useMemo(() => {
    const base = selectedMenu?.is_custom ? 0 : Number(selectedMenu?.price ?? 0)
    const extra = burgerStack
      .filter((l) => l.source === 'added' || selectedMenu?.is_custom)
      .reduce((s, l) => s + Number(l.ingredient_price ?? 0), 0)
    return base + extra
  }, [burgerStack, selectedMenu])

  const canAddIngredient = (ingredient) => {
    const nameLower = (ingredient.name || '').toLowerCase()
    const isBottom = nameLower.includes('bottom') || nameLower.includes('bawah')
    const isTop = nameLower.includes('top') || nameLower.includes('atas') || (nameLower.includes('bun') && !nameLower.includes('bottom') && !nameLower.includes('bawah'))

    if (isBottom) {
      const bottomCount = burgerStack.filter(l => {
        const ln = (l.ingredient_name || '').toLowerCase()
        return ln.includes('bottom') || ln.includes('bawah')
      }).length
      if (bottomCount >= 3) return false
    }

    if (isTop) {
      const topCount = burgerStack.filter(l => {
        const ln = (l.ingredient_name || '').toLowerCase()
        return ln.includes('top') || ln.includes('atas') || (ln.includes('bun') && !ln.includes('bottom') && !ln.includes('bawah'))
      }).length
      if (topCount >= 1) return false
    }

    const currentCount = burgerStack.filter(l => l.ingredient_id === ingredient.id).length
    if (currentCount >= 5) return false

    return true
  }

  const addIngredientToStack = (ingredient, atIndex = burgerStack.length, animateDrop = false) => {
    if (!canAddIngredient(ingredient)) {
      alert(localStorage.getItem('aldes_lang') === 'id' ? `Maksimal tercapai untuk ${ingredient.name}!` : `Maximum limit reached for ${ingredient.name}!`)
      return
    }
    const newLayer = {
      instance_id: makeUid(),
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      ingredient_price: Number(ingredient.price ?? 0),
      source: 'added',
      baseline_ref: null,
      animate_drop: animateDrop,
    }
    setBurgerStack((prev) => {
      const next = [...prev]
      if (isTopBunItem(ingredient.name)) {
        next.push(newLayer);
      } else {
        const topBunIdx = next.findIndex(l => isTopBunItem(l.ingredient_name));
        if (topBunIdx !== -1) {
          next.splice(topBunIdx, 0, newLayer);
        } else {
          next.splice(atIndex, 0, newLayer);
        }
      }
      return next
    })
  }

  const handleReorder = (dragId, dropId) => {
    if (dragId === dropId) return;
    setBurgerStack(prev => {
      const dragIdx = prev.findIndex(item => item.instance_id === dragId);
      const dropIdx = prev.findIndex(item => item.instance_id === dropId);
      if (dragIdx < 0 || dropIdx < 0) return prev;

      const dragItem = prev[dragIdx];
      if (isBottomBunItem(dragItem.ingredient_name) || isTopBunItem(dragItem.ingredient_name)) return prev;

      const dropItem = prev[dropIdx];
      if (isBottomBunItem(dropItem.ingredient_name) || isTopBunItem(dropItem.ingredient_name)) return prev;

      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(dropIdx, 0, moved);

      if (next.length > 0 && !isBottomBunItem(next[0].ingredient_name)) return prev;
      const topBunIdx = next.findIndex(l => isTopBunItem(l.ingredient_name));
      if (topBunIdx !== -1 && topBunIdx !== next.length - 1) return prev;

      return next;
    });
  }

  const handleDropOnItem = (e, targetInstanceId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItemId(null);
    if (!draggingData) return;

    if (draggingData.type === 'pantry') {
      if (!selectedMenu?.is_custom) {
        setDraggingData(null);
        return;
      }
      if (burgerStack.length === 0 && !isBottomBunItem(draggingData.ingredient.name)) return;
      if (!canAddIngredient(draggingData.ingredient)) {
        alert(localStorage.getItem('aldes_lang') === 'id' ? `Maksimal tercapai untuk ${draggingData.ingredient.name}!` : `Maximum limit reached for ${draggingData.ingredient.name}!`);
        setDraggingData(null);
        return;
      }
      setBurgerStack(prev => {
        const targetIdx = prev.findIndex(l => l.instance_id === targetInstanceId);
        const newLayer = {
          instance_id: makeUid(),
          ingredient_id: draggingData.ingredient.id,
          ingredient_name: draggingData.ingredient.name,
          ingredient_price: Number(draggingData.ingredient.price ?? 0),
          source: 'added',
          baseline_ref: null,
          animate_drop: false,
        };
        const next = [...prev];
        next.splice(targetIdx, 0, newLayer);

        if (next.length > 0 && !isBottomBunItem(next[0].ingredient_name)) return prev;
        const topBunIdx = next.findIndex(l => isTopBunItem(l.ingredient_name));
        if (topBunIdx !== -1 && topBunIdx !== next.length - 1) return prev;

        return next;
      });
    } else if (draggingData.type === 'stack') {
      handleReorder(draggingData.instance_id, targetInstanceId);
    }
    setDraggingData(null);
  }

  const handleDropOnKitchen = (e) => {
    e.preventDefault()
    setIsDragOverBox(false)
    if (!draggingData) return

    if (draggingData.type === 'pantry') {
      if (!selectedMenu?.is_custom) {
        setDraggingData(null);
        return;
      }
      if (burgerStack.length === 0 && !isBottomBunItem(draggingData.ingredient.name)) {
        setDraggingData(null);
        return;
      }
      if (!canAddIngredient(draggingData.ingredient)) {
        alert(localStorage.getItem('aldes_lang') === 'id' ? `Maksimal tercapai untuk ${draggingData.ingredient.name}!` : `Maximum limit reached for ${draggingData.ingredient.name}!`);
        setDraggingData(null);
        return;
      }
      addIngredientToStack(draggingData.ingredient, burgerStack.length, false)
    } else if (draggingData.type === 'stack') {
        setBurgerStack((prev) => {
          const srcIdx = prev.findIndex((l) => l.instance_id === draggingData.instance_id)
          if (srcIdx < 0) return prev
          const next = [...prev]
          const [moved] = next.splice(srcIdx, 1)

          const topBunIdx = next.findIndex(l => isTopBunItem(l.ingredient_name));
          if (topBunIdx !== -1) {
            next.splice(topBunIdx, 0, moved);
          } else {
            next.push(moved); 
          }

          if (next.length > 0 && !isBottomBunItem(next[0].ingredient_name)) return prev;
          const finalTopBunIdx = next.findIndex(l => isTopBunItem(l.ingredient_name));
          if (finalTopBunIdx !== -1 && finalTopBunIdx !== next.length - 1) return prev;

          return next
        })
      }
    setDraggingData(null)
  }

  const handleAddAnotherVariation = () => {
    if (!canCheckout) return
    const maxPossible = getMaxQtyForStack()
    if (qty > maxPossible) {
      alert(
        localStorage.getItem('aldes_lang') === 'id'
          ? `Gagal! Jumlah melebihi bahan yang tersedia (Maks: ${maxPossible}).`
          : `Error! Quantity exceeds available ingredients (Max: ${maxPossible}).`
      )
      return
    }
    setIsSavingVariation(true)
    const payload = {
      menu_id: selectedMenu.id,
      name: selectedMenu.name,
      qty,
      unit_price: unitPrice,
      total_price: unitPrice * qty,
      modifiers,
      ingredients: burgerStack.map((l) => l.ingredient_name),
      is_customized: true,
    }
    addToCart(payload)
    setTimeout(() => {
      setBurgerStack([...baselineStack]);
      setIsSavingVariation(false)
    }, 300)
  }

  const handleAddToCart = () => {
    if (!canCheckout) return
    const maxPossible = getMaxQtyForStack()
    if (qty > maxPossible) {
      alert(
        localStorage.getItem('aldes_lang') === 'id'
          ? `Gagal! Jumlah melebihi bahan yang tersedia (Maks: ${maxPossible}).`
          : `Error! Quantity exceeds available ingredients (Max: ${maxPossible}).`
      )
      return
    }
    const payload = {
      menu_id: selectedMenu.id,
      name: selectedMenu.name,
      qty,
      unit_price: unitPrice,
      total_price: unitPrice * qty,
      modifiers,
      ingredients: burgerStack.map((l) => l.ingredient_name),
      is_customized: true,
    }
    setIsAddingToCart(true)
    addToCart(payload)
    navigate('/cart')
  }

  let currentBottomOffset = isMobileViewport ? 42 : 45;
  const stackWithPositions = burgerStack.map((layer) => {
    const pos = currentBottomOffset;
    currentBottomOffset += getIngredientThickness(layer.ingredient_name, isMobileViewport);
    return { ...layer, bottomPos: pos };
  });

  const isBottomBunValid = burgerStack.length > 0 && isBottomBunItem(burgerStack[0]?.ingredient_name);
  const isTopBunValid = burgerStack.length > 1 && isTopBunItem(burgerStack[burgerStack.length - 1]?.ingredient_name);
  const canCheckout = isBottomBunValid && isTopBunValid && getMaxQtyForStack() >= 1;

  return (
    <main className="relative z-0 min-h-screen bg-[#F3E8CC] px-3 py-6 pb-44 sm:p-8 select-none overflow-x-hidden">
      <style>
        {`
          @keyframes dropBounce {
            0% { transform: translateY(-300px); opacity: 0; }
            50% { transform: translateY(15px); opacity: 1; }
            75% { transform: translateY(-5px); opacity: 1; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-drop-bounce {
            animation: dropBounce 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        
        {/* TOP: WORKSPACE */}
        <article className="rounded-3xl sm:rounded-[2.5rem] bg-white p-4 sm:p-6 shadow-[8px_8px_0_0_#000] md:shadow-[10px_10px_0_0_#000] border-4 sm:border-[5px] border-black lg:p-8">
          <p className="inline-flex rounded-xl bg-[#FFC926] border-[2px] sm:border-[3px] border-black px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000]">
            Digital Kitchen
          </p>
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-4xl md:text-5xl font-black text-black uppercase tracking-tighter leading-tight">
            {selectedMenu?.name ?? t('kitchen.title')}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide leading-relaxed">
            {t('kitchen.subtitle')}
          </p>

          <div className="mt-6 sm:mt-8 grid gap-6 lg:grid-cols-2">
            
            {/* --- VISUAL STACK CONTAINER --- */}
            <div className="flex flex-col h-[400px] sm:h-[480px] lg:h-[550px] overflow-hidden min-w-0">
              <h2 className="mb-2 sm:mb-3 text-lg sm:text-xl font-black text-black uppercase tracking-tight text-center">
                {t('kitchen.yourStack')}
              </h2>
              <div
                className={`flex-1 rounded-2xl sm:rounded-3xl border-[3px] sm:border-[4px] border-black relative overflow-hidden transition-all duration-300 flex justify-center items-end pb-4 bg-cover bg-center 
                  ${isDragOverBox ? 'shadow-[inset_0_0_50px_rgba(255,201,38,0.5)]' : 'shadow-[inset_0_4px_20px_rgba(0,0,0,0.1)]'}`}
                style={{ backgroundImage: `url(${imgKitchenBg})` }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOverBox(true) }}
                onDragLeave={() => setIsDragOverBox(false)}
                onDrop={handleDropOnKitchen}
                onClick={() => setHoveredLayerId(null)}
              >
                {/* GLASS OVERLAY */}
                <div className={`absolute inset-0 transition-all duration-500 pointer-events-none 
                  ${burgerStack.length === 0 
                    ? (isDragOverBox ? 'bg-white/40 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-[3px]') 
                    : 'bg-transparent backdrop-blur-none'}
                `} />

                {/* --- MINI THUMBNAIL LIST --- */}
                <div className="absolute left-1.5 sm:left-2 top-3 bottom-3 w-16 sm:w-20 z-10 flex flex-col items-center gap-2 sm:gap-3 overflow-y-auto scrollbar-hide py-2 pointer-events-none">
                  {[...burgerStack].reverse().map(layer => {
                    const isHovered = hoveredLayerId === layer.instance_id;
                    const isDragTarget = dragOverItemId === layer.instance_id;
                    return (
                      <div
                        key={layer.instance_id}
                        draggable={!isBottomBunItem(layer.ingredient_name) && !isTopBunItem(layer.ingredient_name)}
                        onDragStart={(e) => {
                          if (isBottomBunItem(layer.ingredient_name) || isTopBunItem(layer.ingredient_name)) { e.preventDefault(); return; }
                          e.stopPropagation();
                          setDraggingData({ type: 'stack', instance_id: layer.instance_id });
                          const imgEl = e.currentTarget.querySelector('img');
                          if (imgEl) e.dataTransfer.setDragImage(imgEl, 24, 24);
                        }}
                        onDragEnd={() => { setDraggingData(null); setDragOverItemId(null); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverItemId(layer.instance_id); }}
                        onDrop={(e) => handleDropOnItem(e, layer.instance_id)}
                        onFocus={() => setHoveredLayerId(layer.instance_id)}
                        onBlur={() => setHoveredLayerId(null)}
                        onMouseEnter={() => setHoveredLayerId(layer.instance_id)}
                        onMouseLeave={() => setHoveredLayerId(null)}
                        title={layer.ingredient_name}
                        className={`group pointer-events-auto w-11 h-11 sm:w-14 sm:h-14 bg-white rounded-xl border-2 sm:border-[3px] flex items-center justify-center flex-shrink-0 transition-all relative 
                          ${(!isBottomBunItem(layer.ingredient_name) && !isTopBunItem(layer.ingredient_name)) ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                          ${isHovered ? 'border-[#D52518] scale-105 shadow-[3px_3px_0_0_#D52518] sm:shadow-[4px_4px_0_0_#D52518] z-10' : 'border-black shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000]'}
                          ${isDragTarget ? 'border-[#FFC926] bg-[#FFC926]/30 scale-105' : ''}`}
                      >
                        {!!selectedMenu?.is_custom && !isBottomBunItem(layer.ingredient_name) && !isTopBunItem(layer.ingredient_name) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBurgerStack(prev => prev.filter(l => l.instance_id !== layer.instance_id));
                              setHoveredLayerId(null);
                            }}
                            className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-[#D52518] border-2 border-black text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center shadow-[1px_1px_0_0_#000] sm:shadow-[2px_2px_0_0_#000] hover:bg-black transition-all z-20 cursor-pointer"
                          >
                            <X size={10} strokeWidth={4} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                        {getIngredientImage(layer.ingredient_name) ? (
                          <img src={getIngredientImage(layer.ingredient_name)} className="w-7 h-7 sm:w-9 sm:h-9 object-contain pointer-events-none drop-shadow-sm" alt="" />
                        ) : (
                          <span className="text-[8px] sm:text-[10px] font-black text-black uppercase">Img</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Clear All button */}
                {burgerStack.length > 0 && !!selectedMenu?.is_custom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBurgerStack([]);
                      setHoveredLayerId(null);
                      setQty(1);
                    }}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-white text-[#D52518] rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 border-2 sm:border-[3px] border-black shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase hover:bg-[#D52518] hover:text-[#FFC926] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                    title={t('kitchen.clearStack')}
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" /> {t('kitchen.clearStack')}
                  </button>
                )}

                <div className="absolute bottom-[5px] sm:bottom-[65px] w-[50%] h-6 sm:h-8 bg-black/15 rounded-[100%] blur-[4px] sm:blur-[6px] z-0" />

                {/* BIG VISUAL BURGER STACK */}
                {isFetching ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-16 z-20 transition-all">
                    <GifLoader isLoading={true} size="w-48 sm:w-64 drop-shadow-2xl" text={t('common.loading')} />
                  </div>
                ) : burgerStack.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-16 z-20 transition-all">
                    <img src={imgBottomBurger} alt="placeholder" className="w-28 sm:w-40 grayscale opacity-40 drop-shadow-xl animate-pulse" />
                    <div className="mt-4 sm:mt-6 bg-[#D52518] border-2 sm:border-[4px] border-black text-[#FFC926] px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000] flex flex-col items-center animate-bounce">
                      <span className="font-black text-base sm:text-xl uppercase tracking-tighter">{t('kitchen.emptyStack')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 pointer-events-none" style={{ 
                     transform: `scale(${ (() => {
                        const totalVisualHeight = stackWithPositions.length > 0 ? stackWithPositions[stackWithPositions.length - 1].bottomPos + 100 : 0;
                        const maxContainerHeight = isMobileViewport ? 250 : 380; 
                        return totalVisualHeight > maxContainerHeight ? maxContainerHeight / totalVisualHeight : 1;
                     })() })`, 
                     transformOrigin: isMobileViewport ? '50% calc(100% - 90px)' : '50% calc(100% - 110px)'
                  }}>
                  {stackWithPositions.map((layer, index) => {
                    const n = layer.ingredient_name.toLowerCase();
                    let imgWidthClass = 'w-[125px] sm:w-[180px]';
                    if (n.includes('bun') || n.includes('bottom') || n.includes('top')) {
                      imgWidthClass = 'w-[140px] sm:w-[200px]';
                    } else if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) {
                      imgWidthClass = 'w-[135px] sm:w-[190px]';
                    } else if (n.includes('cheese') || n.includes('keju')) {
                      imgWidthClass = 'w-[125px] sm:w-[180px]';
                    } else if (n.includes('sauce') || n.includes('saus') || n.includes('mayo') || n.includes('ketchup')) {
                      imgWidthClass = 'w-[110px] sm:w-[160px]'; 
                    }

                    const isHovered = hoveredLayerId === layer.instance_id;
                    const isDragTarget = dragOverItemId === layer.instance_id;

                    return (
                      <div
                        key={layer.instance_id}
                        className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center w-full pointer-events-none"
                        style={{
                          bottom: `${layer.bottomPos + getVisualOffset(layer.ingredient_name, isMobileViewport)}px`,
                          zIndex: index + 10
                        }}
                      >
                        <div className={`${layer.animate_drop ? 'animate-drop-bounce' : ''} flex justify-center items-center w-full relative`}>
                          <div
                            className="absolute z-20 w-[90px] sm:w-[120px] h-[18px] sm:h-[25px] pointer-events-auto cursor-pointer"
                            onMouseEnter={() => setHoveredLayerId(layer.instance_id)}
                            onMouseLeave={() => setHoveredLayerId(null)}
                          />
                          {getIngredientImage(layer.ingredient_name) ? (
                            <img
                              src={getIngredientImage(layer.ingredient_name)}
                              alt={layer.ingredient_name}
                              className={`object-contain relative z-10 transition-all duration-300 ${imgWidthClass} 
                                  ${!isHovered && !isDragTarget ? 'drop-shadow-[0_8px_6px_rgba(0,0,0,0.25)] sm:drop-shadow-[0_12px_10px_rgba(0,0,0,0.3)]' : ''}
                                  ${isHovered && !isDragTarget ? 'scale-[1.03] drop-shadow-[0_12px_12px_rgba(213,37,24,0.5)] brightness-105' : ''}
                                  ${isDragTarget ? 'scale-[1.03] drop-shadow-[0_15px_15px_rgba(255,201,38,0.8)] brightness-110 opacity-90' : ''}`}
                            />
                          ) : (
                            <div
                              className={`${imgWidthClass} h-9 sm:h-12 bg-[#FFC926] rounded-full border-2 sm:border-[4px] border-black flex items-center justify-center text-xs sm:text-base font-black text-black shadow-[2px_2px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] relative z-10 transition-all duration-300
                                  ${isHovered ? 'scale-[1.03]' : ''}
                                  ${isDragTarget ? 'scale-[1.03] opacity-90 border-dashed' : ''}`}
                            >
                              {layer.ingredient_name}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                  }
                  </div>
                )}
              </div>
            </div>

            {/* PANTRY */}
            <aside className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 border-[3px] sm:border-[4px] border-black shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000] h-[400px] sm:h-[480px] lg:h-[550px] flex flex-col min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mb-3 flex items-center gap-2">
                <Flame size={22} className="text-[#D52518] fill-current" /> {t('kitchen.ingredients')}
              </h2>

              {!selectedMenu?.is_custom ? (
                // Signature Menu UI
                <>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 mb-3 sm:mb-4 tracking-wide border-b-2 sm:border-b-4 border-dashed border-black/10 pb-2.5">Customize Recipe (uncheck to remove)</p>
                  <div className="flex-1 overflow-y-auto pr-1 sm:pr-3 flex flex-col gap-3 sm:gap-4 scrollbar-hide">
                    {signatureIngredients.map((sigIng) => {
                      const isIncluded = burgerStack.some(l => l.ingredient_id === sigIng.ingredient_id);
                      const isBaseBun = isBottomBunItem(sigIng.ingredient_name) || isTopBunItem(sigIng.ingredient_name);
                      
                      return (
                        <label
                          key={sigIng.ingredient_id}
                          className={`group flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border-2 sm:border-[3px] p-2.5 sm:p-3 transition-all cursor-pointer 
                            ${!isIncluded ? 'border-gray-300 bg-gray-100 opacity-60' : 'border-black bg-white shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] sm:hover:-translate-y-0.5'}`}
                        >
                          <div className="flex-shrink-0 pl-0.5">
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              disabled={isBaseBun}
                              onChange={() => toggleSignatureIngredient(sigIng.ingredient_id, isIncluded)}
                              className="w-5 h-5 sm:w-6 sm:h-6 accent-[#D52518] rounded border-2 border-black cursor-pointer disabled:cursor-not-allowed"
                            />
                          </div>
                          <div className={`h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 flex items-center justify-center rounded-xl border transition-transform ${!isIncluded ? 'bg-gray-200 border-transparent' : 'bg-[#F3E8CC] border-black sm:group-hover:scale-105'}`}>
                            {getIngredientImage(sigIng.ingredient_name) ? (
                              <img src={getIngredientImage(sigIng.ingredient_name)} alt="" className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-sm pointer-events-none" />
                            ) : (
                              <span className="text-[8px] text-black font-black uppercase">Img</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`truncate font-black text-xs sm:text-sm uppercase tracking-tight ${!isIncluded ? 'text-gray-500' : 'text-black'}`}>{sigIng.ingredient_name}</p>
                            {isBaseBun && <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 mt-0.5 uppercase">Required Foundation</p>}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </>
              ) : (
                // Custom Menu UI
                <>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase text-gray-500 mb-3 sm:mb-4 tracking-wide border-b-2 sm:border-b-4 border-dashed border-black/10 pb-2.5">Drag/Tap ingredients to stack</p>
                  <div className="flex-1 overflow-y-auto pr-1 sm:pr-3 flex flex-col gap-3 sm:gap-4 scrollbar-hide">
                    {isFetching ? (
                      Array.from({ length: 5 }).map((_, idx) => <ListItemSkeleton key={idx} />)
                    ) : (
                      pantryIngredients.map((ingredient) => {
                        const isFoundationMissing = burgerStack.length === 0;
                        const isBottomBun = isBottomBunItem(ingredient.name);
                        const isOutOfStock = ingredient.stock <= 0;
                        const isLimitReached = !canAddIngredient(ingredient);
                        const isDisabled = (isFoundationMissing && !isBottomBun) || isOutOfStock || isLimitReached;
                        const itemPrice = Number(ingredient.price ?? 0);
                        
                        return (
                          <div
                            key={ingredient.id}
                            draggable={!isDisabled}
                            onDragStart={(e) => {
                              if (isDisabled) return;
                              setDraggingData({ type: 'pantry', ingredient })
                              const imgElement = e.currentTarget.querySelector('img')
                              if (imgElement) {
                                e.dataTransfer.setDragImage(imgElement, imgElement.clientWidth / 2, imgElement.clientHeight / 2)
                              }
                            }}
                            onDragEnd={() => setDraggingData(null)}
                            className={`group flex items-center gap-3 rounded-xl sm:rounded-2xl border-2 sm:border-[3px] p-2 sm:p-2.5 transition-all 
                                ${isDisabled 
                                ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed' 
                                : 'border-black bg-white shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] sm:hover:-translate-y-0.5 cursor-grab active:cursor-grabbing'}`}
                          >
                            <div className={`h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 flex items-center justify-center rounded-xl border transition-transform 
                                ${isDisabled ? 'bg-gray-200 border-transparent' : 'bg-[#F3E8CC] border-black sm:group-hover:scale-105'}`}>
                              {getIngredientImage(ingredient.name) ? (
                                <img src={getIngredientImage(ingredient.name)} alt="" className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-sm pointer-events-none" />
                              ) : (
                                <span className="text-[8px] text-black font-black uppercase">Img</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <p className={`truncate font-black text-xs sm:text-sm uppercase tracking-tight ${isDisabled ? 'text-gray-500' : 'text-black'}`}>{ingredient.name}</p>
                              {isOutOfStock ? (
                                <p className="text-[9px] sm:text-[10px] font-black text-aldesRed mt-0.5 uppercase">Out of Stock</p>
                              ) : isLimitReached ? (
                                <p className="text-[9px] sm:text-[10px] font-black text-[#D52518] mt-0.5 uppercase">Limit Reached</p>
                              ) : itemPrice > 0 && (
                                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 mt-0.5">IDR {itemPrice.toLocaleString('id-ID')}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              disabled={isDisabled}
                              onClick={() => addIngredientToStack(ingredient, burgerStack.length, true)}
                              className={`rounded-xl border border-black p-1.5 sm:p-2 shadow-[1.5px_1.5px_0_0_#000] sm:shadow-[2px_2px_0_0_#000] transition-all flex-shrink-0 
                                ${isDisabled 
                                  ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-none' 
                                  : 'bg-[#D52518] text-[#FFC926] hover:bg-black active:translate-y-[1px] active:shadow-none'}`}
                            >
                              <Plus className="h-4 w-4 sm:h-5 sm:w-5 stroke-[4]" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </>
              )}
            </aside>
          </div>
        </article>

        {/* BOTTOM: ORDER SUMMARY */}
        <article className="rounded-3xl sm:rounded-[2.5rem] bg-white p-4 sm:p-6 shadow-[8px_8px_0_0_#000] md:shadow-[10px_10px_0_0_#000] border-4 sm:border-[5px] border-black lg:p-8">
          <h2 className="text-xl sm:text-3xl font-black text-black uppercase tracking-tighter mb-4 sm:mb-6 border-b-4 sm:border-b-[5px] border-dashed border-black pb-3 sm:pb-4">
            {t('checkout.orderSummary')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* 1. CURRENT STACK LIST */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#F3E8CC]/50 p-3 sm:p-4 border-2 sm:border-[4px] border-black shadow-[inset_0_3px_0_0_rgba(0,0,0,0.05)] flex flex-col md:col-span-2 lg:col-span-6 min-h-[220px] sm:min-h-[250px]">
              <p className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                Stack List <span className="bg-black text-[#FFC926] px-2 py-0.5 rounded-full text-[10px]">{burgerStack.length}</span>
              </p>
              
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px] sm:max-h-[350px] pr-1 scrollbar-hide">
                {burgerStack.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-8 opacity-50">
                    <p className="text-xs sm:text-sm font-black uppercase text-gray-500">Burger is empty</p>
                  </div>
                ) : (
                  [...burgerStack].reverse().map((layer) => {
                    const isHovered = hoveredLayerId === layer.instance_id;
                    const isDragTarget = dragOverItemId === layer.instance_id;
                    const layerPrice = Number(layer.ingredient_price ?? 0);
                    
                    return (
                      <div
                        key={layer.instance_id}
                        draggable={!isBottomBunItem(layer.ingredient_name) && !isTopBunItem(layer.ingredient_name)}
                        onDragStart={(e) => {
                          if (isBottomBunItem(layer.ingredient_name) || isTopBunItem(layer.ingredient_name)) { e.preventDefault(); return; }
                          e.stopPropagation();
                          setDraggingData({ type: 'stack', instance_id: layer.instance_id })
                        }}
                        onDragEnd={() => { setDraggingData(null); setDragOverItemId(null); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverItemId(layer.instance_id); }}
                        onDrop={(e) => handleDropOnItem(e, layer.instance_id)}
                        onMouseEnter={() => setHoveredLayerId(layer.instance_id)}
                        onMouseLeave={() => setHoveredLayerId(null)}
                        className={`flex items-center justify-between text-xs sm:text-sm p-2 sm:p-2.5 rounded-xl border-2 sm:border-[3px] transition-all 
                             ${(!isBottomBunItem(layer.ingredient_name) && !isTopBunItem(layer.ingredient_name)) ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                            ${isDragTarget ? 'border-black shadow-[3px_3px_0_0_#000] bg-[#FFC926] scale-[1.01]' : 
                            isHovered ? 'border-black bg-white shadow-[3px_3px_0_0_#000] -translate-y-0.5 z-10 relative' : 'bg-white border-black shadow-[1.5px_1.5px_0_0_#000] sm:shadow-[2px_2px_0_0_#000]'}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-1.5">
                          {(!isBottomBunItem(layer.ingredient_name) && !isTopBunItem(layer.ingredient_name)) && (
                            <GripVertical className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${isHovered ? 'text-black' : 'text-gray-400'}`} />
                          )}
                          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-[#F3E8CC] rounded-lg border border-black flex items-center justify-center flex-shrink-0 pointer-events-none">
                            {getIngredientImage(layer.ingredient_name) ? (
                              <img src={getIngredientImage(layer.ingredient_name)} alt="" className="h-5 w-5 sm:h-6 sm:w-6 object-contain drop-shadow-sm" />
                            ) : (
                              <span className="text-[7px] font-black uppercase">Img</span>
                            )}
                          </div>
                          <span className={`font-black uppercase tracking-tight truncate pointer-events-none flex-1 transition-colors ${isHovered ? 'text-[#D52518]' : 'text-black'}`}>
                            {layer.ingredient_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!!selectedMenu?.is_custom && layerPrice > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-black text-gray-500 pointer-events-none">+Rp {layerPrice.toLocaleString('id-ID')}</span>
                          )}
                          {!!selectedMenu?.is_custom && !isBottomBunItem(layer.ingredient_name) && !isTopBunItem(layer.ingredient_name) && (
                            <button type="button" onClick={() => setBurgerStack(prev => prev.filter(l => l.instance_id !== layer.instance_id))} className="text-black hover:text-[#FFC926] hover:bg-black border-2 border-transparent hover:border-black transition-colors p-1 rounded-lg">
                              <Trash2 className="h-3.5 w-3.5 stroke-[3]" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* 2. Price & Qty */}
            <div className="flex flex-col gap-4 sm:gap-5 md:col-span-1 lg:col-span-3 justify-center">
              <div className="flex flex-col items-start border-b-[4px] border-dashed border-black pb-4 mb-4 gap-1">
                <span className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-widest">{t('kitchen.totalPrice')}</span>
                <span className="text-4xl sm:text-5xl lg:text-5xl font-black text-[#D52518] tracking-tighter italic flex items-center whitespace-nowrap">
                  <span className="text-2xl sm:text-3xl lg:text-3xl mr-2 italic">IDR</span>
                  {(unitPrice * qty).toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{t('kitchen.quantity')}</p>
                <div className="flex items-center justify-between bg-white border-2 sm:border-[4px] border-black rounded-xl sm:rounded-2xl p-1 sm:p-1.5 shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000]">
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 sm:p-3 rounded-xl bg-white border border-black text-black hover:bg-[#FFC926] active:scale-95 transition-all"><Minus className="h-4 w-4 sm:h-5 sm:w-5 stroke-[4]" /></button>
                  <span className="text-xl sm:text-2xl font-black text-black w-10 text-center">{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(getMaxQtyForStack(), q + 1))} className="p-2 sm:p-3 rounded-xl bg-[#FFC926] border border-black text-black hover:bg-black hover:text-[#FFC926] active:scale-95 transition-all"><Plus className="h-4 w-4 sm:h-5 sm:w-5 stroke-[4]" /></button>
                </div>
              </div>
            </div>

            {/* 3. Multi-Variation Checkout Buttons (Desktop) */}
            <div className="hidden md:flex flex-col gap-3 sm:gap-4 md:col-span-1 lg:col-span-3 justify-center w-full">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canCheckout || isAddingToCart}
                className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 sm:border-[4px] border-black font-black text-lg sm:text-xl uppercase flex flex-col items-center justify-center gap-0.5 transition-all min-h-[75px] sm:min-h-[90px] 
                       ${canCheckout 
                    ? 'bg-[#D52518] text-[#FFC926] shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000] active:translate-y-0.5 hover:bg-black' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border-gray-400'
                  }`}
              >
                {!canCheckout ? (
                  <span className="text-xs sm:text-sm font-black uppercase text-center px-4">
                    {getMaxQtyForStack() < 1 ? (localStorage.getItem('aldes_lang') === 'id' ? "Bahan tidak cukup!" : "Not enough stock!") : !isBottomBunValid ? "Needs Bottom Bun!" : "Needs Top Bun!"}
                  </span>
                ) : (
                  <>
                    <span className="text-[11px] sm:text-sm font-black text-white uppercase tracking-widest">{t('kitchen.addToCart')}</span>
                    <span className="italic tracking-tighter text-sm sm:text-base">IDR {(unitPrice * qty).toLocaleString('id-ID')}</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleAddAnotherVariation}
                disabled={!canCheckout || isSavingVariation}
                className={`w-full py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 border-2 sm:border-[4px] transition-all 
                       ${canCheckout 
                    ? 'border-black bg-white text-black shadow-[3px_3px_0_0_#000] sm:shadow-[4px_4px_0_0_#000] active:translate-y-0.5 hover:bg-[#FFC926]' 
                    : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed shadow-none'
                  }`}
              >
                {isSavingVariation ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5 stroke-[4]" />}
                CONFIRM & BUILD ANOTHER
              </button>
              <p className="text-[9px] sm:text-[10px] text-center text-gray-500 font-bold px-1 uppercase tracking-wide leading-tight">
                Save this variation and build another without leaving the page.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t-4 border-black z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.1)] flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddAnotherVariation}
            disabled={!canCheckout || isSavingVariation}
            className={`flex-1 py-2 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-1 border-2 transition-all 
                   ${canCheckout 
                ? 'border-black bg-white text-black shadow-[2px_2px_0_0_#000] active:translate-y-0.5' 
                : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed shadow-none'
              }`}
          >
            {isSavingVariation ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 stroke-[4]" />}
            BUILD ANOTHER
          </button>
          
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canCheckout || isAddingToCart}
            className={`flex-[2] py-2 rounded-xl border-2 border-black font-black text-xs uppercase flex flex-col items-center justify-center gap-0 transition-all min-h-[50px] 
                   ${canCheckout 
                ? 'bg-[#D52518] text-[#FFC926] shadow-[2px_2px_0_0_#000] active:translate-y-0.5' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border-gray-400'
              }`}
          >
            {!canCheckout ? (
              <span className="text-[10px] font-black uppercase text-center px-1">
                {getMaxQtyForStack() < 1 ? (localStorage.getItem('aldes_lang') === 'id' ? "Bahan habis!" : "No stock!") : !isBottomBunValid ? "Needs Bottom Bun!" : "Needs Top Bun!"}
              </span>
            ) : (
              <>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('kitchen.addToCart')}</span>
                <span className="italic tracking-tighter text-sm">IDR {(unitPrice * qty).toLocaleString('id-ID')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}

export default Kitchen