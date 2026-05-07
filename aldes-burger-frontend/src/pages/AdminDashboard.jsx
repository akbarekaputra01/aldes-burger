import { ChartColumnBig, Clock3, Flame, Wallet, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

const statusClass = {
  pending: 'bg-yellow-100 text-yellow-700',
  cooking: 'bg-orange-100 text-orange-700',
  done: 'bg-emerald-100 text-emerald-700',
}

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mengambil data pesanan asli dari database
    api.get('/admin/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false))
  }, [])

  // Kalkulasi data otomatis berdasarkan isi database
  const totalOrders = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const cookingCount = orders.filter(o => o.status === 'cooking').length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const summaryCards = [
    { label: 'Total Orders', value: totalOrders, icon: ChartColumnBig },
    { label: 'Pending', value: pendingCount, icon: Clock3 },
    { label: 'Cooking', value: cookingCount, icon: Flame },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: Wallet },
  ]

  // Ambil 5 pesanan terbaru untuk ditampilkan di tabel
  const latestOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aldesCream">
        <Loader2 className="h-10 w-10 animate-spin text-aldesRed" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-aldesCream p-4 sm:p-6 lg:p-8">
      <section className="mx-auto max-w-7xl space-y-6">
        
        {/* KARTU RINGKASAN */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <article key={card.label} className="rounded-3xl bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <div className="rounded-xl bg-red-50 p-2 text-red-600"><Icon className="h-4 w-4" /></div>
                </div>
                <p className="mt-3 text-3xl font-black text-gray-900">{card.value}</p>
              </article>
            )
          })}
        </div>

        {/* TABEL PESANAN TERBARU */}
        <article className="rounded-3xl bg-white shadow-sm">
          <div className="border-b border-red-100 px-5 py-4">
            <h3 className="text-lg font-bold text-gray-900">Latest Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-500">Belum ada pesanan masuk.</td>
                  </tr>
                ) : (
                  latestOrders.map((order) => {
                    // Gabungkan nama-nama menu yang dipesan menjadi satu teks
                    const itemNames = order.details?.map(d => `${d.quantity}x ${d.snapshot_name}`).join(', ') || '-';
                    
                    return (
                      <tr key={order.id} className="border-t border-red-50 hover:bg-red-50/30">
                        <td className="px-5 py-3 font-semibold text-gray-900">
                           {/* Potong ID UUID yang panjang agar tabel rapi */}
                           <span className="truncate w-24 block" title={order.id}>{order.id.split('-')[0]}...</span>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{order.user?.name || 'Guest'}</td>
                        <td className="px-5 py-3 text-gray-700 max-w-xs truncate" title={itemNames}>{itemNames}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClass[order.status] || statusClass.pending}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>
        
      </section>
    </main>
  )
}

export default AdminDashboard