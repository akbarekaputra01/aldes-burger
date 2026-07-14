import { ChartColumnBig, Clock3, Flame, Wallet, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useTranslation } from '../context/LanguageContext'

const statusClass = {
  pending: 'bg-yellow-100 text-yellow-700',
  cooking: 'bg-orange-100 text-orange-700',
  done: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700'
}

let cachedDashboardOrders = null

function AdminDashboard() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState(cachedDashboardOrders || [])
  const [isLoading, setIsLoading] = useState(!cachedDashboardOrders)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (cachedDashboardOrders) return

    api.get('/admin/orders')
      .then(({ data }) => {
        setOrders(data)
        cachedDashboardOrders = data
      })
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false))
  }, [])

  const totalOrders = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const cookingCount = orders.filter(o => o.status === 'cooking').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
  
  const totalRevenue = orders
    .filter(o => o.status === 'done')
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(val);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'revenue') return order.status === 'done';
    
    const currentStatus = order.status?.toLowerCase() || '';
    const targetFilter = statusFilter.toLowerCase();
    
    if (targetFilter === 'cancelled') {
      return currentStatus === 'cancelled';
    }
    
    return currentStatus === targetFilter;
  });

  const allFilteredOrders = filteredOrders;

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
        
        {/* GRID KARTU - Diubah jadi xl:grid-cols-5 agar muat 5 kartu sejajar */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          
          {/* TOTAL ORDERS */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`text-left rounded-3xl p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
              statusFilter === 'all' ? 'bg-red-600 text-white ring-4 ring-red-200' : 'bg-white hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${statusFilter === 'all' ? 'text-red-100' : 'text-gray-500'}`}>{t('adminDashboard.totalOrders')}</p>
              <div className={`rounded-xl p-2 ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                <ChartColumnBig className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-3 text-3xl font-black ${statusFilter === 'all' ? 'text-white' : 'text-gray-900'}`}>{totalOrders}</p>
          </button>

          {/* PENDING */}
          <button
            onClick={() => setStatusFilter('pending')}
            className={`text-left rounded-3xl p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
              statusFilter === 'pending' ? 'bg-red-600 text-white ring-4 ring-red-200' : 'bg-white hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${statusFilter === 'pending' ? 'text-red-100' : 'text-gray-500'}`}>{t('adminDashboard.pending')}</p>
              <div className={`rounded-xl p-2 ${statusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-3 text-3xl font-black ${statusFilter === 'pending' ? 'text-white' : 'text-gray-900'}`}>{pendingCount}</p>
          </button>

          {/* COOKING */}
          <button
            onClick={() => setStatusFilter('cooking')}
            className={`text-left rounded-3xl p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
              statusFilter === 'cooking' ? 'bg-red-600 text-white ring-4 ring-red-200' : 'bg-white hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${statusFilter === 'cooking' ? 'text-red-100' : 'text-gray-500'}`}>{t('adminDashboard.cooking')}</p>
              <div className={`rounded-xl p-2 ${statusFilter === 'cooking' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-3 text-3xl font-black ${statusFilter === 'cooking' ? 'text-white' : 'text-gray-900'}`}>{cookingCount}</p>
          </button>

          {/* CANCELLED */}
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`text-left rounded-3xl p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
              statusFilter === 'cancelled' ? 'bg-red-600 text-white ring-4 ring-red-200' : 'bg-white hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${statusFilter === 'cancelled' ? 'text-red-100' : 'text-gray-500'}`}>{t('adminDashboard.cancelled')}</p>
              <div className={`rounded-xl p-2 ${statusFilter === 'cancelled' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                <Trash2 className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-3 text-3xl font-black ${statusFilter === 'cancelled' ? 'text-white' : 'text-gray-900'}`}>{cancelledCount}</p>
          </button>

          {/* TOTAL REVENUE */}
          <button
            onClick={() => setStatusFilter('revenue')}
            className={`text-left rounded-3xl p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
              statusFilter === 'revenue' ? 'bg-red-600 text-white ring-4 ring-red-200' : 'bg-white hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${statusFilter === 'revenue' ? 'text-red-100' : 'text-gray-500'}`}>{t('adminDashboard.revenue')}</p>
              <div className={`rounded-xl p-2 ${statusFilter === 'revenue' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className={`mt-3 text-2xl font-black ${statusFilter === 'revenue' ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrency(totalRevenue)}
            </p>
          </button>

        </div>
        
        {/* TABEL PESANAN */}
        <article className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <div className="border-b border-red-100 px-5 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">
              {t('adminDashboard.showing')} <span className="text-red-600 capitalize">
                {statusFilter === 'revenue' ? t('adminDashboard.completed') : statusFilter === 'all' ? t('adminDashboard.totalOrders') : t(`adminDashboard.${statusFilter}`) || statusFilter}
              </span> {t('adminDashboard.orders')}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th className="px-5 py-3">{t('adminDashboard.orderId')}</th>
                  <th className="px-5 py-3">{t('adminDashboard.customer')}</th>
                  <th className="px-5 py-3">{t('adminDashboard.items')}</th>
                  <th className="px-5 py-3">{t('adminDashboard.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allFilteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-12 text-center text-gray-400 italic">
                      {t('adminDashboard.noOrders')}
                    </td>
                  </tr>
                ) : (
                  allFilteredOrders.map((order) => {
                    const itemNames = order.details?.map(d => `${d.quantity}x ${d.snapshot_name}`).join(', ') || '-';
                    const currentStatus = order.status?.toLowerCase() || '';

                    return (
                      <tr key={order.id} className="hover:bg-red-50/20 transition-colors">
                        <td className="px-5 py-4 font-mono text-gray-500 text-xs">
                          #{order.id ? (String(order.id).includes('-') ? String(order.id).split('-')[0] : order.id) : ''}
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-800">
                          {order.user?.name || t('common.guest')}
                        </td>
                        <td className="px-5 py-4 text-gray-600 max-w-xs truncate" title={itemNames}>
                          {itemNames}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${statusClass[currentStatus] || statusClass.pending}`}>
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