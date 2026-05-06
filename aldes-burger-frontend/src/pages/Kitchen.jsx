import { GripVertical, Loader2, Minus, Plus, Trash2, X, Flame } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ListItemSkeleton } from '../components/Skeletons'
import { useCart } from '../context/CartContext'
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

const makeUid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

// Helper Gambar
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

// Helper Urutan Susunan Burger (Bawah ke Atas)
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

const getIngredientPriority = (name) => {
  if (!name) return 99;
  return getStackOrder(name);
}

const getIngredientThickness = (name) => {
  if (!name) return 10
  const n = name.toLowerCase()
  if (n.includes('bottom') || n.includes('bawah')) return 16 
  if (n.includes('top') || n.includes('atas') || n.includes('bun')) return 22 
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) return 16 
  if (n.includes('tomato') || n.includes('tomat')) return 4 
  if (n.includes('lettuce') || n.includes('selada')) return 4 
  if (n.includes('cheese') || n.includes('keju')) return 2 
  if (n.includes('pickle') || n.includes('acar') || n.includes('onion') || n.includes('caramelized')) return 2
  return 10
}

const getVisualOffset = (name) => {
  if (!name) return 0
  const n = name.toLowerCase()
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) {
    return 16 
  }
  return 0
}

const toIngredientInstances = (menuIngredients = []) => menuIngredients.flatMap((ingredient) => {
  const quantity = ingredient.pivot?.quantity ?? 1
  return Array.from({ length: quantity }).map((_, index) => ({
    instance_id: makeUid(),
    ingredient_id: ingredient.id,
    ingredient_name: ingredient.name,
    ingredient_price: Number(ingredient.price ?? 0), // DIUBAH KE NUMBER
    source: 'default',
    baseline_ref: `${ingredient.id}-${index + 1}`,
    animate_drop: false,
  }))
})

function Kitchen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart } = useCart()

  const [menu, setMenu] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [burgerStack, setBurgerStack] = useState([])
  const [baselineStack, setBaselineStack] = useState([])
  const [qty, setQty] = useState(1)
  const [isFetching, setIsFetching] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isSavingVariation, setIsSavingVariation] = useState(false)
  const [draggingData, setDraggingData] = useState(null)
  const [isDragOverBox, setIsDragOverBox] = useState(false)
  const [dragOverItemId, setDragOverItemId] = useState(null)
  const [hoveredLayerId, setHoveredLayerId] = useState(null)

  const menuId = location.state?.menuId
  const incomingMenu = location.state?.menu

  const selectedMenu = useMemo(() => {
    if (!menu.length) return null
    if (incomingMenu?.id) return menu.find((m) => m.id === incomingMenu.id) ?? incomingMenu
    return menu.find((m) => m.id === menuId) ?? menu.find((m) => m.is_custom) ?? menu[0]
  }, [incomingMenu, menuId, menu])

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true)
      try {
        const [menuRes, ingredientsRes] = await Promise.all([api.get('/menus'), api.get('/ingredients')])
        setMenu(menuRes.data)
        
        const uniqueIngredients = [];
        const seenNames = new Set();
        ingredientsRes.data.forEach((item) => {
          if (!seenNames.has(item.name)) {
            seenNames.add(item.name);
            uniqueIngredients.push(item);
          }
        });
        
        setIngredients(uniqueIngredients);
      } catch (error) {
        setMenu([])
        setIngredients([])
      } finally {
        setIsFetching(false)
      }
    }
    loadData()
  }, [])

  // Inisialisasi Stack ketika Menu & Ingredients siap
  useEffect(() => {
    if (!selectedMenu || ingredients.length === 0) return;

    if (selectedMenu.is_custom) {
      setBaselineStack([])
      setBurgerStack([])
    } else {
      let menuIngredients = selectedMenu.ingredients ?? []
      
      // FALLBACK RECIPE
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

  // Mendapatkan bahan-bahan unik dari resep Signature untuk Checklist Pantry
  const signatureIngredients = useMemo(() => {
    if (!selectedMenu || selectedMenu.is_custom) return [];
    const uniqueIds = new Set();
    return baselineStack.filter(item => {
      if (uniqueIds.has(item.ingredient_id)) return false;
      uniqueIds.add(item.ingredient_id);
      return true;
    });
  }, [baselineStack, selectedMenu]);

  // Fungsi toggle Checklist untuk menu Signature
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
    const base = selectedMenu?.is_custom ? 0 : Number(selectedMenu?.price ?? 0) // DIUBAH KE NUMBER
    const extra = burgerStack
      .filter((l) => l.source === 'added' || selectedMenu?.is_custom)
      .reduce((s, l) => s + Number(l.ingredient_price ?? 0), 0) // DIUBAH KE NUMBER
    return base + extra
  }, [burgerStack, selectedMenu])

  const addIngredientToStack = (ingredient, atIndex = burgerStack.length, animateDrop = false) => {
    const newLayer = {
      instance_id: makeUid(),
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      ingredient_price: Number(ingredient.price ?? 0), // DIUBAH KE NUMBER
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

      setBurgerStack(prev => {
        const targetIdx = prev.findIndex(l => l.instance_id === targetInstanceId);
        const newLayer = {
          instance_id: makeUid(),
          ingredient_id: draggingData.ingredient.id,
          ingredient_name: draggingData.ingredient.name,
          ingredient_price: Number(draggingData.ingredient.price ?? 0), // DIUBAH KE NUMBER
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
      addIngredientToStack(draggingData.ingredient, burgerStack.length, false)
    } else if (draggingData.type === 'stack') {
      setBurgerStack((prev) => {
        const srcIdx = prev.findIndex((l) => l.instance_id === draggingData.instance_id)
        if (srcIdx < 0) return prev

        const next = [...prev]
        const [moved] = next.splice(srcIdx, 1)
        next.push(moved)
        
        if (next.length > 0 && !isBottomBunItem(next[0].ingredient_name)) return prev;
        const topBunIdx = next.findIndex(l => isTopBunItem(l.ingredient_name));
        if (topBunIdx !== -1 && topBunIdx !== next.length - 1) return prev;

        return next
      })
    }
    setDraggingData(null)
  }

  const handleAddAnotherVariation = () => {
    if (!canCheckout) return
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
      setBurgerStack([...baselineStack]); // Kembalikan ke recipe dasar jika klik add another
      setIsSavingVariation(false)
    }, 300)
  }

  const handleAddToCart = () => {
    if (!canCheckout) return
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

  let currentBottomOffset = 40; 
  const stackWithPositions = burgerStack.map((layer) => {
    const pos = currentBottomOffset;
    currentBottomOffset += getIngredientThickness(layer.ingredient_name);
    return { ...layer, bottomPos: pos };
  });

  const isBottomBunValid = burgerStack.length > 0 && isBottomBunItem(burgerStack[0]?.ingredient_name);
  const isTopBunValid = burgerStack.length > 1 && isTopBunItem(burgerStack[burgerStack.length - 1]?.ingredient_name);
  const canCheckout = isBottomBunValid && isTopBunValid;

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6">
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
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        
        {/* TOP: WORKSPACE */}
        <article className="rounded-3xl bg-white p-6 shadow-md lg:p-8">
          <p className="inline-flex rounded-full bg-aldesYellow px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">Digital Kitchen</p>
          <h1 className="mt-3 text-2xl font-black text-aldesRed">{selectedMenu?.name ?? 'Build your burger'}</h1>
          <p className="mt-2 text-sm text-aldesRed/80">Tarik bahan dari Pantry, dan seret dari daftar Order Summary untuk mengatur posisi!</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            
            {/* --- VISUAL STACK CONTAINER --- */}
            <div className="flex flex-col h-[550px]">
              <h2 className="mb-3 text-lg font-black text-aldesRed text-center">Visual Stack</h2>
              
              <div 
                className={`flex-1 rounded-3xl border-4 relative overflow-hidden transition-all duration-300 flex justify-center items-end pb-4 bg-cover bg-center 
                  ${isDragOverBox ? 'border-aldesYellow shadow-[inset_0_0_50px_rgba(234,179,8,0.3)]' : 'border-aldesCream/80 shadow-inner'}`}
                style={{ backgroundImage: `url(${imgKitchenBg})` }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOverBox(true) }}
                onDragLeave={() => setIsDragOverBox(false)}
                onDrop={handleDropOnKitchen}
                onClick={() => setHoveredLayerId(null)}
              >
                
                {/* OVERLAY KACA KETIKA KOSONG */}
                <div className={`absolute inset-0 transition-all duration-500 pointer-events-none 
                  ${burgerStack.length === 0 
                     ? (isDragOverBox ? 'bg-white/40 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-[3px]') 
                     : 'bg-transparent backdrop-blur-none'}
                `} />

                {/* --- MINI THUMBNAIL LIST --- */}
                <div className="absolute left-1 top-4 bottom-4 w-20 z-[150] flex flex-col items-center gap-3 overflow-y-auto scrollbar-hide py-3 pointer-events-none">
                   {[...burgerStack].reverse().map(layer => {
                      const isHovered = hoveredLayerId === layer.instance_id;
                      const isDragTarget = dragOverItemId === layer.instance_id;
                      return (
                        <div 
                           key={layer.instance_id} 
                           draggable={selectedMenu?.is_custom} // KUNCI REORDER
                           onDragStart={(e) => {
                             if (!selectedMenu?.is_custom) { e.preventDefault(); return; }
                             e.stopPropagation();
                             setDraggingData({ type: 'stack', instance_id: layer.instance_id });
                             const imgEl = e.currentTarget.querySelector('img');
                             if (imgEl) e.dataTransfer.setDragImage(imgEl, 24, 24);
                           }}
                           onDragEnd={() => { setDraggingData(null); setDragOverItemId(null); }}
                           onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverItemId(layer.instance_id); }}
                           onDrop={(e) => handleDropOnItem(e, layer.instance_id)}
                           onMouseEnter={() => setHoveredLayerId(layer.instance_id)}
                           onMouseLeave={() => setHoveredLayerId(null)}
                           title={layer.ingredient_name}
                           className={`group pointer-events-auto w-14 h-14 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border-2 flex items-center justify-center flex-shrink-0 transition-all relative
                             ${selectedMenu?.is_custom ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                             ${isHovered ? 'border-aldesRed scale-105 shadow-aldesRed/20 z-10' : 'border-aldesCream/80 hover:border-aldesYellow'}
                             ${isDragTarget ? 'border-aldesYellow bg-aldesYellow/30 scale-105' : ''}`}
                        >
                           {/* Hapus silang kecil (delete) untuk menu Signature */}
                           {selectedMenu?.is_custom && (
                             <button 
                                onClick={(e) => {
                                 e.stopPropagation();
                                 setBurgerStack(prev => prev.filter(l => l.instance_id !== layer.instance_id));
                                 setHoveredLayerId(null);
                               }} 
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-sm hover:bg-red-600 transition-all z-20 cursor-pointer"
                             >
                               <X size={12} strokeWidth={3} />
                             </button>
                           )}
                           
                           {getIngredientImage(layer.ingredient_name) ? (
                              <img src={getIngredientImage(layer.ingredient_name)} className="w-9 h-9 object-contain pointer-events-none drop-shadow-sm" alt="" />
                           ) : (
                              <span className="text-[10px] font-bold text-aldesRed uppercase">Img</span>
                           )}
                        </div>
                      )
                   })}
                </div>

                {/* TOMBOL CLEAR ALL */}
                {burgerStack.length > 0 && selectedMenu?.is_custom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBurgerStack([]); 
                      setHoveredLayerId(null);
                      setQty(1); 
                     }}
                    className="absolute top-4 right-4 z-[200] bg-white/90 backdrop-blur-md text-red-500 rounded-xl px-4 py-2 shadow-md border border-red-100 flex items-center gap-2 text-xs font-bold hover:bg-red-50 hover:scale-105 active:scale-95 transition-all"
                    title="Kosongkan Dapur"
                  >
                    <Trash2 className="h-4 w-4" /> CLEAR ALL
                  </button>
                )}

                <div className="absolute bottom-[65px] w-[50%] h-8 bg-black/15 rounded-[100%] blur-[6px] pl-12 z-0" />
                
  
                {/* BIG VISUAL BURGER STACK */}
                {isFetching ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 z-20 transition-all">
                    <Loader2 className="h-16 w-16 text-aldesRed animate-spin mb-4 drop-shadow-md" />
                    <div className="bg-white/80 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-lg border border-red-100 flex flex-col items-center animate-pulse">
                      <span className="font-black text-lg text-aldesRed uppercase tracking-wide">Preparing Your Burger...</span>
                      <span className="text-xs font-bold text-gray-500">Merapikan resep dari dapur</span>
                    </div>
                  </div>
                ) : burgerStack.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 z-20 transition-all">
                    <img src={imgBottomBurger} alt="placeholder" className="w-40 grayscale opacity-40 drop-shadow-xl animate-pulse" />
                    <div className="mt-6 bg-aldesRed text-white px-6 py-2.5 rounded-full shadow-lg flex flex-col items-center animate-bounce">
                      <span className="font-black text-lg">Pondasi Kosong!</span>
                      <span className="text-xs font-medium opacity-90">Tarik Bottom Bun ke sini terlebih dahulu</span>
                    </div>
                  </div>
                ) : (
                  stackWithPositions.map((layer, index) => {
                    const n = layer.ingredient_name.toLowerCase();
                    let imgWidthClass = 'w-[180px]'; 
                    if (n.includes('bun') || n.includes('bottom') || n.includes('top')) {
                      imgWidthClass = 'w-[200px]'; 
                    } else if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) {
                      imgWidthClass = 'w-[190px]'; 
                    } else if (n.includes('cheese') || n.includes('keju')) {
                      imgWidthClass = 'w-[180px]'; 
                    } else {
                      imgWidthClass = 'w-[180px]'; 
                    }

                    const isHovered = hoveredLayerId === layer.instance_id;
                    const isDragTarget = dragOverItemId === layer.instance_id;

                    return (
                      <div 
                        key={layer.instance_id}
                        className="absolute left-1/2 -translate-x-1/2 pl-12 flex justify-center items-center w-full pointer-events-none"
                        style={{ 
                           bottom: `${layer.bottomPos + getVisualOffset(layer.ingredient_name)}px`, 
                           zIndex: index + 10 
                         }}
                      >
                        <div className={`${layer.animate_drop ? 'animate-drop-bounce' : ''} flex justify-center items-center w-full relative`}>
                            <div 
                               className="absolute z-20 w-[120px] h-[25px] pointer-events-auto cursor-pointer"
                               onMouseEnter={() => setHoveredLayerId(layer.instance_id)}
                              onMouseLeave={() => setHoveredLayerId(null)}
                            />
                            {getIngredientImage(layer.ingredient_name) ? (
                              <img 
                                 src={getIngredientImage(layer.ingredient_name)} 
                                 alt={layer.ingredient_name} 
                                 className={`object-contain relative z-10 transition-all duration-300 ${imgWidthClass}
                                   ${!isHovered && !isDragTarget ? 'drop-shadow-[0_12px_10px_rgba(0,0,0,0.25)]' : ''}
                                  ${isHovered && !isDragTarget ? 'scale-[1.03] drop-shadow-[0_15px_15px_rgba(239,68,68,0.4)] brightness-105' : ''}
                                  ${isDragTarget ? 'scale-[1.03] drop-shadow-[0_20px_20px_rgba(234,179,8,0.8)] brightness-110 opacity-90' : ''}`}
                              />
                            ) : (
                              <div 
                                 className={`${imgWidthClass} h-12 bg-aldesYellow rounded-full border-4 border-aldesRed flex items-center justify-center text-base font-black text-aldesRed shadow-md relative z-10 transition-all duration-300
                                   ${isHovered ? 'scale-[1.03] drop-shadow-lg brightness-105' : ''}
                                  ${isDragTarget ? 'scale-[1.03] drop-shadow-lg brightness-110 opacity-90 border-dashed' : ''}`}
                              >
                                {layer.ingredient_name}
                              </div>
                            )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <aside className="rounded-3xl bg-white p-5 shadow-sm border border-aldesCream h-[550px] flex flex-col">
              <h2 className="text-xl font-black text-aldesRed mb-4">Pantry</h2>
              
              {!selectedMenu?.is_custom ? (
                // UI UNTUK MENU SIGNATURE: Tampilkan Checklist
                <>
                  <p className="text-xs text-gray-500 mb-3">Sesuaikan resep Signature (Hapus centang untuk mengurangi bahan)</p>
                  <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                    {signatureIngredients.map((sigIng) => {
                      const isIncluded = burgerStack.some(l => l.ingredient_id === sigIng.ingredient_id);
                      // Kunci roti agar tidak bisa diuncheck
                      const isBaseBun = isBottomBunItem(sigIng.ingredient_name) || isTopBunItem(sigIng.ingredient_name);
                      
                      return (
                        <label 
                          key={sigIng.ingredient_id} 
                          className={`group flex items-center gap-4 rounded-2xl border-2 p-3 transition-all cursor-pointer
                            ${!isIncluded ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-aldesCream/50 bg-white hover:border-aldesYellow hover:shadow-md'}`}
                        >
                          <div className="flex-shrink-0 pl-1">
                             <input 
                               type="checkbox" 
                               checked={isIncluded} 
                               disabled={isBaseBun}
                               onChange={() => toggleSignatureIngredient(sigIng.ingredient_id, isIncluded)}
                               className="w-5 h-5 accent-aldesRed rounded border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                             />
                          </div>
                          <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-transform ${!isIncluded ? 'bg-gray-200' : 'bg-aldesCream/30 group-hover:scale-110 group-hover:-rotate-3'}`}>
                             {getIngredientImage(sigIng.ingredient_name) ? (
                               <img src={getIngredientImage(sigIng.ingredient_name)} alt="" className="h-10 w-10 object-contain drop-shadow-sm pointer-events-none" />
                             ) : (
                               <span className="text-[10px] text-aldesRed/40 font-bold uppercase">Img</span>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className={`truncate font-bold text-sm ${!isIncluded ? 'text-gray-500' : 'text-aldesRed'}`}>{sigIng.ingredient_name}</p>
                             {isBaseBun && <p className="text-[10px] text-gray-400 mt-0.5">Pondasi Wajib</p>}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </>
              ) : (
                // UI UNTUK MENU CUSTOM: Tampilkan bahan Draggable
                <>
                  <p className="text-xs text-gray-500 mb-3">Tarik (Drag) gambar di bawah ke dalam area tumpukan burger!</p>
                  <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                    {isFetching ? (
                      Array.from({ length: 6 }).map((_, idx) => <ListItemSkeleton key={idx} />)
                    ) : (
                      pantryIngredients.map((ingredient) => {
                        const isFoundationMissing = burgerStack.length === 0;
                        const isBottomBun = isBottomBunItem(ingredient.name);
                        const isDisabled = isFoundationMissing && !isBottomBun;
                        const itemPrice = Number(ingredient.price ?? 0); // DIUBAH KE NUMBER

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
                            className={`group flex items-center gap-4 rounded-2xl border-2 p-3 transition-all 
                               ${isDisabled 
                                 ? 'border-gray-100 bg-gray-50 opacity-40 grayscale cursor-not-allowed' 
                                 : 'border-aldesCream/50 bg-white hover:border-aldesYellow hover:bg-aldesYellow/5 hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing'}`}
                          >
                            <div className={`h-16 w-16 flex-shrink-0 flex items-center justify-center rounded-xl transition-transform 
                               ${isDisabled ? 'bg-gray-200' : 'bg-aldesCream/30 group-hover:scale-110 group-hover:-rotate-3'}`}>
                              {getIngredientImage(ingredient.name) ? (
                                <img src={getIngredientImage(ingredient.name)} alt="" className="h-12 w-12 object-contain drop-shadow-sm pointer-events-none" />
                              ) : (
                                <span className="text-[10px] text-aldesRed/40 font-bold uppercase">Img</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pointer-events-none">
                              <p className={`truncate font-bold text-sm ${isDisabled ? 'text-gray-500' : 'text-aldesRed'}`}>{ingredient.name}</p>
                              
                              {/* HANYA TAMPILKAN HARGA JIKA > 0 */}
                              {itemPrice > 0 && (
                                <p className="text-xs font-bold text-gray-500 mt-0.5">Rp {itemPrice.toLocaleString('id-ID')}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              disabled={isDisabled}
                              onClick={() => addIngredientToStack(ingredient, burgerStack.length, true)}
                              className={`rounded-xl p-2.5 shadow-sm transition-all flex-shrink-0 
                                ${isDisabled 
                                   ? 'bg-gray-300 text-gray-100' 
                                   : 'bg-aldesRed text-white hover:brightness-110 active:scale-95'}`}
                            >
                              <Plus className="h-5 w-5" />
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
        <aside className="rounded-3xl bg-white p-6 shadow-md lg:p-8">
          <h2 className="text-xl font-black text-aldesRed mb-4 border-b border-aldesCream pb-4">Order Summary</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
                           
             {/* 1. CURRENT STACK LIST */}
             <div className="rounded-2xl bg-aldesCream p-4 border border-aldesRed/10 flex flex-col lg:col-span-6">
                <p className="text-xs font-bold text-aldesRed uppercase tracking-wider mb-3">Stack List ({burgerStack.length})</p>
                <div className="flex-1 space-y-2">
                  {burgerStack.length === 0 ? (
                    <p className="text-sm text-gray-500 italic text-center mt-4 pb-4">Burger masih kosong</p>
                  ) : (
                    [...burgerStack].reverse().map((layer) => {
                      const isHovered = hoveredLayerId === layer.instance_id;
                      const isDragTarget = dragOverItemId === layer.instance_id;
                      const layerPrice = Number(layer.ingredient_price ?? 0); // DIUBAH KE NUMBER
                      
                      return (
                        <div 
                          key={layer.instance_id}
                          draggable={selectedMenu?.is_custom} // KUNCI REORDER: Hanya bisa didrag jika menu custom
                          onDragStart={(e) => {
                             if (!selectedMenu?.is_custom) { e.preventDefault(); return; }
                             e.stopPropagation();
                             setDraggingData({ type: 'stack', instance_id: layer.instance_id })
                          }}
                          onDragEnd={() => { setDraggingData(null); setDragOverItemId(null); }}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverItemId(layer.instance_id); }}
                          onDrop={(e) => handleDropOnItem(e, layer.instance_id)}
                          onMouseEnter={() => setHoveredLayerId(layer.instance_id)}
                          onMouseLeave={() => setHoveredLayerId(null)}
                          className={`flex items-center justify-between text-sm p-2 rounded-xl border transition-all 
                            ${selectedMenu?.is_custom ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
                            ${isDragTarget ? 'border-aldesYellow border-2 shadow-md bg-aldesYellow/10 scale-[1.02]' : 
                               isHovered ? 'border-aldesRed bg-red-50/50 shadow-md scale-[1.01] z-10 relative' : 'bg-white border-aldesCream/50 shadow-sm'}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                            {/* Hanya tampilkan ikon Grip (titik-titik drag) jika Custom Menu */}
                            {selectedMenu?.is_custom && (
                               <GripVertical className={`h-4 w-4 flex-shrink-0 transition-colors ${isHovered ? 'text-aldesRed' : 'text-gray-400'}`} />
                            )}
                            
                            {getIngredientImage(layer.ingredient_name) ? (
                              <img src={getIngredientImage(layer.ingredient_name)} alt="" className="h-7 w-7 object-contain drop-shadow-sm pointer-events-none flex-shrink-0" />
                            ) : (
                              <div className="h-7 w-7 bg-aldesCream rounded-full flex-shrink-0 pointer-events-none" />
                            )}
                            <span className={`font-bold truncate pointer-events-none flex-1 transition-colors ${isHovered ? 'text-aldesRed' : 'text-gray-700'}`}>
                              {layer.ingredient_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Jika Custom Menu, HANYA tampilkan tambahan harga JIKA nilainya lebih besar dari 0 */}
                            {selectedMenu?.is_custom && layerPrice > 0 && (
                              <span className="text-xs font-semibold text-gray-400 pointer-events-none">+{layerPrice.toLocaleString('id-ID')}</span>
                            )}
                            
                            {/* Hapus ikon trash untuk menu Signature karena sudah dikelola via checkbox di Pantry */}
                            {selectedMenu?.is_custom && (
                              <button onClick={() => setBurgerStack(prev => prev.filter(l => l.instance_id !== layer.instance_id))} className="text-red-400 hover:text-white hover:bg-red-500 transition-colors p-1.5 rounded-lg ml-1">
                                <Trash2 className="h-4 w-4" />
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
             <div className="flex flex-col gap-4 lg:col-span-3 justify-center sticky top-24">
                <div className="flex flex-col border-b border-aldesCream/80 pb-3">
                   <p className="text-xs font-bold text-gray-400 uppercase">Unit Price</p>
                   <p className="text-xl font-black text-aldesRed">Rp {unitPrice.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center justify-between bg-white border-2 border-aldesCream rounded-2xl p-1.5 shadow-sm">
                   <button onClick={() => setQty(q => Math.max(1, q-1))} className="p-2 rounded-xl bg-aldesCream text-aldesRed hover:bg-aldesYellow transition-colors"><Minus className="h-5 w-5"/></button>
                   <span className="text-lg font-black text-aldesRed w-8 text-center">{qty}</span>
                   <button onClick={() => setQty(q => q+1)} className="p-2 rounded-xl bg-aldesCream text-aldesRed hover:bg-aldesYellow transition-colors"><Plus className="h-5 w-5"/></button>
                </div>
             </div>

             {/* 3. Multi-Variation Checkout Buttons */}
             <div className="flex flex-col gap-3 lg:col-span-3 sticky top-24">
                 <button 
                     onClick={handleAddToCart}
                    disabled={!canCheckout || isAddingToCart}
                    className={`w-full py-5 rounded-2xl font-black text-lg flex flex-col items-center justify-center gap-1 shadow-lg transition-all min-h-[100px] 
                      ${canCheckout 
                         ? 'bg-aldesRed text-white shadow-red-200 hover:brightness-110 active:scale-[0.98]' 
                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                 >
                    {!canCheckout ? (
                      <span className="text-sm font-bold uppercase text-center px-4">
                         {!isBottomBunValid ? "Butuh Bottom Bun!" : "Butuh Top Bun!"}
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-white/90 uppercase tracking-wide">Finalize & Cart</span>
                        <span>Rp {(unitPrice * qty).toLocaleString('id-ID')}</span>
                      </>
                    )}
                 </button>

                 <button 
                    onClick={handleAddAnotherVariation}
                    disabled={!canCheckout || isSavingVariation}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all 
                      ${canCheckout 
                         ? 'border-aldesRed text-aldesRed hover:bg-red-50 active:scale-[0.98]' 
                         : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                 >
                    {isSavingVariation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    CONFIRM & BUILD ANOTHER
                 </button>
                 <p className="text-[10px] text-center text-gray-400 font-medium px-2 italic">
                    Gunakan tombol di atas jika ingin memesan variasi burger kustom lainnya tanpa pindah halaman.
                 </p>
             </div>
                        
          </div>
        </aside>

      </section>
    </main>
  )
}

export default Kitchen