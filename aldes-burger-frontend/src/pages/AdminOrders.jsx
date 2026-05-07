import { ChefHat, Utensils, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const nextStatus = { pending: 'cooking', cooking: 'done', done: 'done' }
const badgeClass = { 
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200', 
  cooking: 'bg-orange-100 text-orange-700 border border-orange-200', 
  done: 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
}

// Komponen Kartu Pesanan
function OrderCard({ order, moveStatus }) {
  const [isExpanded, setIsExpanded] = useState(order.status !== 'done')

  // Fungsi pintar untuk menampilkan urutan bahan
  const renderIngredients = (modifiers) => {
    if (!modifiers) return null;
    let parsed = modifiers;
    
    // Kadang data dari API berupa string JSON, kadang sudah berbentuk Array
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { return null; }
    }
    
    // Jika formatnya Array (Urutan Bahan dari Kitchen)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return (
        <div className="mt-2 ml-6 border-l-2 border-red-200 pl-3">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">
            Susunan (Bawah ke Atas):
          </p>
          <ol className="list-decimal list-inside text-xs text-gray-600 space-y-0.5 font-medium">
            {parsed.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ol>
        </div>
      );
    }
    return null;
  }

  return (
    <article className="rounded-2xl border-2 border-red-100 p-4 shadow-sm bg-white hover:border-red-300 transition-colors">
      {/* HEADER TIKET */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-black text-gray-900 text-lg leading-tight">{order.user?.name || 'Guest'}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
            #ORD-{order.id.split('-')[0]}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badgeClass[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* DAFTAR MENU (ACCORDION BISA DI KLIK) */}
      <div className="mb-4">
        <button 
          type="button" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between rounded-xl bg-red-50 p-2.5 transition-colors hover:bg-red-100 border border-red-100"
        >
          <div className="flex items-center gap-2 text-red-600">
            <Utensils className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Order Items ({order.details?.length || 0})
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-red-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-red-600" />
          )}
        </button>

        {isExpanded && (
          <ul className="mt-3 space-y-2 animate-in slide-in-from-top-1 fade-in duration-200">
            {order.details?.map((detail) => (
              <li key={detail.id} className="text-sm bg-gray-50 rounded-xl p-3 border border-gray-200 leading-snug">
                <div className="flex items-start">
                  <span className="font-black text-red-600 mr-2 text-base leading-none">{detail.quantity}x</span>
                  <span className="font-bold text-gray-800 leading-none mt-0.5">
                    {detail.snapshot_name}
                  </span>
                </div>
                
                {/* Memanggil fungsi render urutan bahan */}
                {renderIngredients(detail.snapshot_modifiers)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TOMBOL ACTION */}
      {order.status !== 'done' && (
        <button 
          type="button" 
          onClick={() => moveStatus(order.id)} 
          className="mt-2 w-full rounded-xl bg-red-600 px-3 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-700 active:scale-[0.98] shadow-md shadow-red-200"
        >
          {order.status === 'pending' ? 'Mulai Masak' : 'Selesaikan Pesanan'}
        </button>
      )}
    </article>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])

  const loadOrders = () => api.get('/admin/orders').then(({ data }) => setOrders(data)).catch(() => setOrders([]))
  
  useEffect(() => {
    loadOrders()
  }, [])

  const moveStatus = async (id) => {
    const order = orders.find((item) => item.id === id)
    if (!order || order.status === 'done') return
    await api.patch(`/admin/orders/${id}/status`, { status: nextStatus[order.status] })
    loadOrders()
  }

  const columns = ['pending', 'cooking', 'done']

  return (
    <main className="min-h-screen bg-aldesCream px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-black text-gray-900">
          <ChefHat className="h-8 w-8 text-red-600" />
          Kitchen Display System
        </h1>
        
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {columns.map((column) => (
            <div key={column} className="rounded-[2rem] bg-white p-5 shadow-sm border-2 border-gray-100">
              <div className="flex items-center justify-between mb-5 border-b-2 border-gray-100 pb-3">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{column}</h2>
                <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-xs">
                  {orders.filter((order) => order.status === column).length}
                </span>
              </div>

              <div className="space-y-4">
                {orders.filter((order) => order.status === column).length === 0 ? (
                  <div className="text-center py-10 text-gray-400 font-bold text-sm italic">
                    Kosong
                  </div>
                ) : (
                  orders.filter((order) => order.status === column).map((order) => (
                    <OrderCard key={order.id} order={order} moveStatus={moveStatus} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default AdminOrders