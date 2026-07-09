import { ChefHat, Utensils, ChevronDown, ChevronUp, Clock, RefreshCw, AlertCircle, XCircle } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import { useTranslation } from '../context/LanguageContext'

const nextStatus = { pending: 'cooking', cooking: 'done', done: 'done' }
const badgeClass = { 
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200', 
  cooking: 'bg-orange-100 text-orange-700 border border-orange-200', 
  done: 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
}

const formatTime = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function OrderCard({ order, moveStatus, cancelOrder, isLoading }) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(order.status !== 'done')

  const renderItemDetails = (detail) => {
    let modifiers = detail.snapshot_modifiers;
    let notes = detail.notes;

    if (typeof modifiers === 'string') {
      try { modifiers = JSON.parse(modifiers); } catch (e) { modifiers = null; }
    }

    const hasModifiers = modifiers && (Array.isArray(modifiers) ? modifiers.length > 0 : Object.keys(modifiers).length > 0);
    const hasNotes = notes && notes.trim() !== '';

    if (!hasModifiers && !hasNotes) return null;

    return (
      <div className="mt-2 ml-6 space-y-2">
        {hasModifiers && Array.isArray(modifiers) && (
          <div className="border-l-2 border-red-200 pl-3">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">{t('adminOrders.buildOrder')}</p>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5 font-medium">
              {modifiers.map((ing, idx) => <li key={idx} className="capitalize">{ing.replace(/_/g, ' ')}</li>)}
            </ul>
          </div>
        )}
        {hasModifiers && !Array.isArray(modifiers) && typeof modifiers === 'object' && (
          <div className="border-l-2 border-blue-200 pl-3 text-xs font-medium space-y-1">
            {modifiers.added && modifiers.added.length > 0 && <p className="text-emerald-600"><span className="font-bold">+ Add:</span> {modifiers.added.join(', ')}</p>}
            {modifiers.removed && modifiers.removed.length > 0 && <p className="text-red-500"><span className="font-bold">- No:</span> {modifiers.removed.join(', ')}</p>}
          </div>
        )}
        {hasNotes && (
          <div className="border-l-2 border-yellow-400 pl-3 bg-yellow-50/50 py-1.5 rounded-r-lg flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-black text-yellow-700 uppercase tracking-wider mb-0.5">{t('adminOrders.customerNote')}</p>
              <p className="text-xs text-gray-700 italic font-medium leading-tight">"{notes}"</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <article className="rounded-2xl border-2 border-red-100 p-4 shadow-sm bg-white hover:border-red-300 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-black text-gray-900 text-lg leading-tight">{order.user?.name || t('common.guest')}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">#ORD-{order.id.split('-')[0]}</p>
            <span className="flex items-center text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 mr-1" /> {formatTime(order.created_at)}
            </span>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badgeClass[order.status]}`}>{order.status}</span>
      </div>

      <div className="mb-4">
        <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="flex w-full items-center justify-between rounded-xl bg-red-50 p-2.5 transition-colors hover:bg-red-100 border border-red-100">
          <div className="flex items-center gap-2 text-red-600">
            <Utensils className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{t('transactionDetail.orderItems')} ({order.details?.length || 0})</span>
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-red-600" /> : <ChevronDown className="w-4 h-4 text-red-600" />}
        </button>
        {isExpanded && (
          <ul className="mt-3 space-y-2 animate-in slide-in-from-top-1 fade-in duration-200">
            {order.details?.map((detail) => (
              <li key={detail.id} className="text-sm bg-gray-50 rounded-xl p-3 border border-gray-200 leading-snug">
                <div className="flex items-start"><span className="font-black text-red-600 mr-2 text-base leading-none">{detail.quantity}x</span><span className="font-bold text-gray-800 leading-none mt-0.5">{detail.snapshot_name}</span></div>
                {renderItemDetails(detail)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {order.status !== 'done' && (
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={isLoading} onClick={() => moveStatus(order.id)} className="flex-1 flex justify-center items-center rounded-xl bg-red-600 px-3 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700 active:scale-[0.98] shadow-md shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> {t('common.loading')}</span> : (order.status === 'pending' ? t('adminOrders.markAs')('Cooking') : t('adminOrders.markAs')('Done'))}
          </button>
          
          {/* Hanya muncul saat status 'pending' */}
          {order.status === 'pending' && (
            <button type="button" disabled={isLoading} onClick={() => cancelOrder(order.id)} className="flex justify-center items-center rounded-xl bg-gray-50 border-2 border-gray-200 px-3 py-3 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" title={t('adminOrders.cancelOrder')}>
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
            </button>
          )}
        </div>
      )}
    </article>
  )
}

function AdminOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [isFetching, setIsFetching] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  
  // State untuk membatasi jumlah pesanan "Done" yang tampil (default 5)
  const [doneLimit, setDoneLimit] = useState(5)

  const loadOrders = useCallback(async (showLoading = false) => {
    if (showLoading) setIsFetching(true)
    try {
      const { data } = await api.get('/admin/orders')
      setOrders(data)
    } catch (error) { console.error("Failed to fetch orders:", error) } finally { setIsFetching(false) }
  }, [])
  
  useEffect(() => {
    loadOrders(true)
    const interval = setInterval(() => loadOrders(false), 15000)
    return () => clearInterval(interval)
  }, [loadOrders])

  const moveStatus = async (id) => {
    const order = orders.find((item) => item.id === id)
    if (!order || order.status === 'done') return
    setUpdatingOrderId(id)
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: nextStatus[order.status] })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus[o.status] } : o))
    } catch (error) { console.error("Failed to update status:", error); alert("Failed to update status.") } finally { setUpdatingOrderId(null) }
  }

  const cancelOrder = async (id) => {
    if (!window.confirm(t('adminOrders.cancelConfirm'))) return;
    setUpdatingOrderId(id)
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: 'cancelled' })
      setOrders(prev => prev.filter(o => o.id !== id))
    } catch (error) { console.error("Failed to cancel:", error); alert("Failed to cancel order.") } finally { setUpdatingOrderId(null) }
  }

  const columns = ['pending', 'cooking', 'done']

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="flex items-center gap-2 text-2xl font-black text-gray-900"><ChefHat className="h-8 w-8 text-red-600" /> {t('adminOrders.title')}</h1>
          <button onClick={() => loadOrders(true)} disabled={isFetching} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-sm disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-red-600' : ''}`} /> {isFetching ? t('common.loading') : t('adminOrders.refresh')}
          </button>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {columns.map((column) => {
            // 1. Filter pesanan berdasarkan status kolom saat ini
            const columnOrders = orders.filter((order) => order.status === column);
            
            // 2. Jika kolom adalah 'done', batasi jumlah yang tampil berdasarkan doneLimit
            const displayedOrders = column === 'done' 
              ? columnOrders.slice(0, doneLimit) 
              : columnOrders;

            return (
              <div key={column} className="rounded-[2rem] bg-white p-5 shadow-sm border-2 border-gray-100 min-h-[500px]">
                <div className="flex items-center justify-between mb-5 border-b-2 border-gray-100 pb-3">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{column}</h2>
                  <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-xs">
                    {/* Tetap tampilkan total aslinya di header kolom */}
                    {columnOrders.length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {isFetching && orders.length === 0 ? (
                    <div className="animate-pulse flex flex-col gap-4">
                      {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl w-full"></div>)}
                    </div>
                  ) : columnOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3"><ChefHat className="w-8 h-8 text-gray-300" /></div>
                      <p className="text-gray-400 font-bold text-sm">{t('adminOrders.allClearDesc')}</p>
                    </div>
                  ) : (
                    <>
                      {/* Render kartu pesanan yang sudah dibatasi */}
                      {displayedOrders.map((order) => (
                        <OrderCard 
                          key={order.id} 
                          order={order} 
                          moveStatus={moveStatus} 
                          cancelOrder={cancelOrder} 
                          isLoading={updatingOrderId === order.id} 
                        />
                      ))}

                      {/* Tombol Load More khusus untuk kolom Done */}
                      {column === 'done' && columnOrders.length > doneLimit && (
                        <button 
                          onClick={() => setDoneLimit(prev => prev + 5)}
                          className="w-full mt-2 py-3 bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 text-gray-600 font-bold rounded-xl text-sm transition-colors"
                        >
                          Show More ({columnOrders.length - doneLimit} remaining)
                        </button>
                      )}

                      {/* Tombol Reset (Sembunyikan) jika sudah terlanjur membuka banyak */}
                      {column === 'done' && doneLimit > 5 && (
                        <button 
                          onClick={() => setDoneLimit(5)}
                          className="w-full py-2 text-gray-400 hover:text-gray-600 font-semibold text-xs transition-colors"
                        >
                          Show Less
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default AdminOrders