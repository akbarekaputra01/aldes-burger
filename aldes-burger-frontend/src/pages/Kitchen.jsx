import { GripVertical, Loader2, Minus, Plus, Trash2 } from 'lucide-react'
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

// PENYESUAIAN KETEBALAN MIXED
const getIngredientThickness = (name) => {
  if (!name) return 15
  const n = name.toLowerCase()
  if (n.includes('bottom') || n.includes('bawah')) return 25 
  if (n.includes('top') || n.includes('atas') || n.includes('bun')) return 30 
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) return 25 
  if (n.includes('tomato') || n.includes('tomat')) return 6 
  if (n.includes('lettuce') || n.includes('selada')) return 6 
  if (n.includes('cheese') || n.includes('keju')) return 2 
  if (n.includes('pickle') || n.includes('acar') || n.includes('onion') || n.includes('caramelized')) return 3
  return 15 
}

// 🌟 HELPER: Mengembalikan angka murni untuk mengubah koordinat Bottom 
const getVisualOffset = (name) => {
  if (!name) return 0
  const n = name.toLowerCase()
  if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) {
    return 25 // Geser 25px ke atas
  }
  return 0
}

const toIngredientInstances = (menuIngredients = []) => menuIngredients.flatMap((ingredient) => {
  const quantity = ingredient.pivot?.quantity ?? 1
  return Array.from({ length: quantity }).map((_, index) => ({
    instance_id: makeUid(),
    ingredient_id: ingredient.id,
    ingredient_name: ingredient.name,
    ingredient_price: ingredient.price ?? 0,
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

  const [activeLayerId, setActiveLayerId] = useState(null)

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
        setIngredients(ingredientsRes.data)
      } catch (error) {
        setMenu([])
        setIngredients([])
      } finally {
        setIsFetching(false)
      }
    }
    loadData()
  }, [])

  const resetToInitial = () => {
    if (!selectedMenu) return
    if (selectedMenu.is_custom) {
      setBaselineStack([])
      setBurgerStack([])
    } else {
      const initialStack = toIngredientInstances(selectedMenu.ingredients ?? [])
      setBaselineStack(initialStack)
      setBurgerStack(initialStack)
    }
    setQty(1)
  }

  useEffect(() => {
    resetToInitial()
  }, [selectedMenu])

  const pantryIngredients = useMemo(() => {
    if (!selectedMenu) return []
    if (selectedMenu.is_custom) return ingredients
    const allowedIds = (selectedMenu.ingredients ?? []).map((i) => i.id)
    return ingredients.filter((i) => allowedIds.includes(i.id))
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
    const base = selectedMenu?.is_custom ? 0 : (selectedMenu?.price ?? 0)
    const extra = burgerStack
      .filter((l) => l.source === 'added' || selectedMenu?.is_custom)
      .reduce((s, l) => s + (l.ingredient_price ?? 0), 0)
    return base + extra
  }, [burgerStack, selectedMenu])

  const addIngredientToStack = (ingredient, atIndex = burgerStack.length, animateDrop = false) => {
    const newLayer = {
      instance_id: makeUid(),
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      ingredient_price: ingredient.price ?? 0,
      source: 'added',
      baseline_ref: null,
      animate_drop: animateDrop,
    }
    setBurgerStack((prev) => {
      const next = [...prev]
      next.splice(atIndex, 0, newLayer)
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
      return next;
    });
  }

  const handleDropOnItem = (e, targetInstanceId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItemId(null);

    if (!draggingData) return;

    if (draggingData.type === 'pantry') {
      setBurgerStack(prev => {
        const targetIdx = prev.findIndex(l => l.instance_id === targetInstanceId);
        const newLayer = {
          instance_id: makeUid(),
          ingredient_id: draggingData.ingredient.id,
          ingredient_name: draggingData.ingredient.name,
          ingredient_price: draggingData.ingredient.price ?? 0,
          source: 'added',
          baseline_ref: null,
          animate_drop: false,
        };
        const next = [...prev];
        next.splice(targetIdx, 0, newLayer); 
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
      addIngredientToStack(draggingData.ingredient, burgerStack.length, false)
    } else if (draggingData.type === 'stack') {
      setBurgerStack((prev) => {
        const srcIdx = prev.findIndex((l) => l.instance_id === draggingData.instance_id)
        if (srcIdx < 0) return prev
        const next = [...prev]
        const [moved] = next.splice(srcIdx, 1)
        next.push(moved) 
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
      resetToInitial()
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

  let currentBottomOffset = 25; 
  const stackWithPositions = burgerStack.map((layer) => {
    const pos = currentBottomOffset;
    currentBottomOffset += getIngredientThickness(layer.ingredient_name);
    return { ...layer, bottomPos: pos };
  });

  const isBottomBunValid = burgerStack.length > 0 && getIngredientImage(burgerStack[0]?.ingredient_name) === imgBottomBurger;
  const isTopBunValid = burgerStack.length > 1 && getIngredientImage(burgerStack[burgerStack.length - 1]?.ingredient_name) === imgTopBurger;
  const canCheckout = isBottomBunValid && isTopBunValid;

  return (
    <main 
      className="min-h-screen bg-aldesCream px-4 py-8 sm:px-6"
      onClick={() => setActiveLayerId(null)}
    >
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
        `}
      </style>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        
        {/* TOP: WORKSPACE */}
        <article className="rounded-3xl bg-white p-6 shadow-md lg:p-8">
          <p className="inline-flex rounded-full bg-aldesYellow px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">Digital Kitchen</p>
          <h1 className="mt-3 text-2xl font-black text-aldesRed">{selectedMenu?.name ?? 'Build your burger'}</h1>
          <p className="mt-2 text-sm text-aldesRed/80">Tarik bahan dari Pantry, dan seret dari daftar Order Summary untuk mengatur posisi!</p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col h-[550px]">
              <h2 className="mb-3 text-lg font-black text-aldesRed text-center">Visual Stack</h2>
              <div 
                className={`flex-1 rounded-3xl border-4 relative overflow-hidden transition-all duration-300 flex justify-center items-end pb-4 
                  ${isDragOverBox ? 'border-aldesYellow bg-aldesYellow/10' : 'border-dashed border-aldesCream bg-aldesCream/20'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOverBox(true) }}
                onDragLeave={() => setIsDragOverBox(false)}
                onDrop={handleDropOnKitchen}
              >
                {/* 🌟 TOMBOL CLEAR ALL (Hapus Semua Tumpukan) */}
                {burgerStack.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBurgerStack([]); // Kosongkan seluruh burger
                      setActiveLayerId(null);
                      setQty(1); // Reset quantity ke 1
                    }}
                    className="absolute top-4 right-4 z-[200] bg-white text-red-500 rounded-xl px-4 py-2 shadow-md border border-red-100 flex items-center gap-2 text-xs font-bold hover:bg-red-50 hover:scale-105 active:scale-95 transition-all"
                    title="Kosongkan Dapur"
                  >
                    <Trash2 className="h-4 w-4" /> CLEAR ALL
                  </button>
                )}

                <div className="absolute bottom-4 w-[70%] h-6 bg-amber-900/10 rounded-[100%] blur-[4px] mb-2" />
                
                {burgerStack.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none">
                    <img src={imgBottomBurger} alt="placeholder" className="w-56 grayscale blur-[2px]" />
                    <p className="mt-4 font-black text-aldesRed">Tarik Bottom Bun Kesini!</p>
                  </div>
                ) : (
                  stackWithPositions.map((layer, index) => {
                    const n = layer.ingredient_name.toLowerCase();
                    let imgWidthClass = 'w-[240px]'; 
                    if (n.includes('bun') || n.includes('bottom') || n.includes('top')) {
                      imgWidthClass = 'w-[280px]'; 
                    } else if (n.includes('beef') || n.includes('chicken') || n.includes('patty')) {
                      imgWidthClass = 'w-[250px]'; 
                    } else if (n.includes('cheese') || n.includes('keju')) {
                      imgWidthClass = 'w-[250px]'; 
                    } else {
                      imgWidthClass = 'w-[250px]'; 
                    }

                    const isActive = activeLayerId === layer.instance_id;

                    return (
                      <div 
                        key={layer.instance_id}
                        className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center w-full pointer-events-none"
                        style={{ 
                          bottom: `${layer.bottomPos + getVisualOffset(layer.ingredient_name)}px`, 
                          zIndex: isActive ? 100 : index + 10 
                        }}
                        onMouseLeave={() => setActiveLayerId(null)}
                      >
                        <div className={`${layer.animate_drop ? 'animate-drop-bounce' : ''} flex justify-center items-center w-full relative`}>
                            
                            <div 
                              className="absolute z-20 w-[150px] h-[60px] pointer-events-auto cursor-pointer" 
                              onMouseEnter={() => setActiveLayerId(layer.instance_id)}
                              onClick={(e) => {
                                e.stopPropagation(); 
                                setActiveLayerId(layer.instance_id);
                              }}
                            />

                            {getIngredientImage(layer.ingredient_name) ? (
                              <img 
                                src={getIngredientImage(layer.ingredient_name)} 
                                alt={layer.ingredient_name} 
                                className={`object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.25)] relative z-10 transition-transform duration-300 ${imgWidthClass} ${isActive ? 'scale-105' : ''}`}
                              />
                            ) : (
                              <div 
                                className={`${imgWidthClass} h-12 bg-aldesYellow rounded-full border-4 border-aldesRed flex items-center justify-center text-base font-black text-aldesRed shadow-md relative z-10 transition-transform duration-300 ${isActive ? 'scale-105' : ''}`}
                              >
                                {layer.ingredient_name}
                              </div>
                            )}

                            {/* 🌟 TOMBOL HAPUS INDIVIDU DI VISUAL STACK TELAH DIHAPUS */}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <aside className="rounded-3xl bg-white p-5 shadow-sm border border-aldesCream h-[550px] flex flex-col">
              <h2 className="text-xl font-black text-aldesRed mb-4">Pantry</h2>
              <p className="text-xs text-gray-500 mb-3">Tarik (Drag) gambar di bawah ke dalam area tumpukan burger!</p>
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                {isFetching ? (
                  Array.from({ length: 6 }).map((_, idx) => <ListItemSkeleton key={idx} />)
                ) : (
                  pantryIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingData({ type: 'pantry', ingredient })
                        const imgElement = e.currentTarget.querySelector('img')
                        if (imgElement) {
                          e.dataTransfer.setDragImage(imgElement, imgElement.clientWidth / 2, imgElement.clientHeight / 2)
                        }
                      }}
                      onDragEnd={() => setDraggingData(null)}
                      className="group flex cursor-grab items-center gap-4 rounded-2xl border-2 border-aldesCream/50 bg-white p-3 transition-all hover:border-aldesYellow hover:bg-aldesYellow/5 hover:shadow-md hover:-translate-y-0.5 active:cursor-grabbing"
                    >
                      <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center rounded-xl bg-aldesCream/30 transition-transform group-hover:scale-110 group-hover:-rotate-3">
                        {getIngredientImage(ingredient.name) ? (
                          <img src={getIngredientImage(ingredient.name)} alt="" className="h-12 w-12 object-contain drop-shadow-sm pointer-events-none" />
                        ) : (
                          <span className="text-[10px] text-aldesRed/40 font-bold uppercase">Img</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <p className="truncate font-bold text-aldesRed text-sm">{ingredient.name}</p>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">Rp {ingredient.price.toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addIngredientToStack(ingredient, burgerStack.length, true)}
                        className="rounded-xl bg-aldesRed p-2.5 text-white shadow-sm hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
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
                    [...burgerStack].reverse().map((layer) => (
                      <div 
                        key={layer.instance_id} 
                        draggable
                        onDragStart={(e) => { 
                          e.stopPropagation(); 
                          setDraggingData({ type: 'stack', instance_id: layer.instance_id })
                        }}
                        onDragEnd={() => { setDraggingData(null); setDragOverItemId(null); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverItemId(layer.instance_id); }}
                        onDrop={(e) => handleDropOnItem(e, layer.instance_id)}
                        className={`flex items-center justify-between text-sm bg-white p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing
                          ${dragOverItemId === layer.instance_id ? 'border-aldesYellow border-2 shadow-md bg-aldesYellow/10 scale-[1.02]' : 'border-aldesCream/50 shadow-sm'}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                          <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0 pointer-events-none" />
                          {getIngredientImage(layer.ingredient_name) ? (
                            <img src={getIngredientImage(layer.ingredient_name)} alt="" className="h-7 w-7 object-contain drop-shadow-sm pointer-events-none flex-shrink-0" />
                          ) : (
                            <div className="h-7 w-7 bg-aldesCream rounded-full flex-shrink-0 pointer-events-none" />
                          )}
                          <span className="font-bold text-gray-700 truncate pointer-events-none flex-1">{layer.ingredient_name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-gray-400 pointer-events-none">+{layer.ingredient_price.toLocaleString('id-ID')}</span>
                          <button onClick={() => setBurgerStack(prev => prev.filter(l => l.instance_id !== layer.instance_id))} className="text-red-400 hover:text-white hover:bg-red-500 transition-colors p-1.5 rounded-lg ml-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
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