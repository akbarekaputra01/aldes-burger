import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock3, 
  History,
  CheckCircle2,
  Package,
  ArrowUpRight,
  MapPin,
  UtensilsCrossed,
  Ticket,
  Sparkles,
  XCircle
} from 'lucide-react';
import { ListItemSkeleton } from '../components/Skeletons';
import api from '../lib/api';
import { useTranslation } from '../context/LanguageContext';

function Transactions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('on_progress');
  const [isFetching, setIsFetching] = useState(true);

  // 1. MENGAMBIL DATA DARI API LARAVEL DENGAN SWR
  useEffect(() => {
    const fetchOrders = async () => {
      // SWR: Tampilkan riwayat cache secara instan
      const cachedTx = sessionStorage.getItem('aldes_transactions_cache');
      if (cachedTx) {
        try {
          setTransactions(JSON.parse(cachedTx));
          setIsFetching(false);
        } catch(e) {}
      } else {
        setIsFetching(true);
      }

      // SWR: Fetch API secara diam-diam (silent update)
      try {
        const { data } = await api.get('/transactions');
        setTransactions(data);
        sessionStorage.setItem('aldes_transactions_cache', JSON.stringify(data));
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrders();
  }, []);

  // 2. LOGIKA PEMISAH OTOMATIS (ON GOING VS HISTORY)
  const currentOrders = useMemo(() => 
    transactions.filter((order) => {
      const status = order.status?.toLowerCase();
      
      if (activeTab === 'on_progress') {
        // Jangan tampilkan done, completed, DAN cancelled di On Going
        return status !== 'done' && status !== 'completed' && status !== 'cancelled';
      } else {
        // Masukkan done, completed, dan cancelled ke tab History
        return status === 'done' || status === 'completed' || status === 'cancelled';
      }
    }), [activeTab, transactions]
  );

  return (
    <main className="min-h-screen w-full bg-aldesCream pb-24 pt-10 text-[#2D2D2D]">
      <div className="mx-auto max-w-xl px-6">
        
        <section className="py-10 text-center">
          <div className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-black bg-aldesRed px-4 py-1 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> {t('transactions.statusUpdate')}
            </p>
          </div>
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter text-black italic">
            {t('transactions.orderJournal')} <br/> 
            <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] [-webkit-text-stroke:2px_black]">
              {t('transactions.orderJournal2')}
            </span>
          </h2>
        </section>

        {/* TABS (KOTAK BIRU STYLE) */}
        <div className="mb-10 flex rounded-full border-4 border-black bg-white p-1.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <button 
            onClick={() => setActiveTab('on_progress')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-xs uppercase transition-all rounded-full
              ${activeTab === 'on_progress' ? 'bg-aldesYellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}
          >
            <UtensilsCrossed size={16} strokeWidth={3} /> {t('transactions.onGoing')}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-xs uppercase transition-all rounded-full
              ${activeTab === 'history' ? 'bg-aldesYellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}
          >
            <History size={16} strokeWidth={3} /> {t('transactions.history')}
          </button>
        </div>

        {/* LIST TRANSAKSI */}
        <div className="space-y-6">
          {isFetching ? (
            Array.from({ length: 3 }).map((_, i) => <ListItemSkeleton key={i} />)
          ) : currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <article 
                key={order.id} 
                onClick={() => navigate(`/transactions/${order.id}`)}
                className="group cursor-pointer rounded-[2.5rem] border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex gap-4">
                    {/* BAGIAN IKON STATUS */}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black
                      ${activeTab === 'on_progress' 
                          ? 'bg-aldesRed text-white' 
                          : order.status?.toLowerCase() === 'cancelled'
                            ? 'bg-red-100 text-red-600 border-red-600' // Styling khusus untuk cancelled
                            : (order.status?.toLowerCase() === 'done' || order.status?.toLowerCase() === 'completed')
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-600' // Styling khusus untuk done / completed
                              : 'bg-gray-100 text-gray-400'}`}>
                      {activeTab === 'on_progress' ? (
                        <Package size={28} className="animate-pulse" />
                      ) : order.status?.toLowerCase() === 'cancelled' ? (
                        <XCircle size={28} /> // Ikon X jika status dibatalkan
                      ) : (
                        <CheckCircle2 size={28} /> // Ikon Centang jika status selesai
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-aldesRed">#ADL-{order.id ? String(order.id).split('-')[0] : ''}</p>
                      <h3 className={`mt-1 text-xl font-black uppercase italic leading-none 
                        ${order.status?.toLowerCase() === 'cancelled' ? 'text-red-600 line-through decoration-2' : ''}
                        ${(order.status?.toLowerCase() === 'done' || order.status?.toLowerCase() === 'completed') ? 'text-emerald-700' : ''}`}>
                        {order.status === 'waiting_for_payment' ? 'Waiting for Payment' : order.status}
                      </h3>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black transition-colors group-hover:bg-aldesYellow">
                    <ArrowUpRight size={20} strokeWidth={3} />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t-2 border-dashed border-black pt-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={14} />
                    <p className="text-[10px] font-bold">Aldes Burger Central</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t('transactions.totalBill')}</p>
                      <p className={`text-2xl font-black text-black ${order.status?.toLowerCase() === 'cancelled' ? 'opacity-50' : ''}`}>
                        Rp {order.amount?.toLocaleString('en-US')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold italic">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <div className="mt-1 flex items-center gap-1 rounded-lg border border-black bg-[#FDF8EE] px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Ticket size={10} />
                        <span className="text-[8px] font-black uppercase">{t('transactions.promoApplied')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-[40px] border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <Clock3 size={48} className="text-aldesRed" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                {activeTab === 'on_progress' ? t('transactions.kitchenQuiet') : t('transactions.noHistory')}
              </h3>
              <p className="mb-8 mt-2 text-xs font-bold text-gray-500 px-10">
                {activeTab === 'on_progress' 
                  ? t('transactions.kitchenQuietDesc') 
                  : t('transactions.noHistoryDesc')}
              </p>
              <button 
                onClick={() => navigate('/menu')}
                className="rounded-2xl border-4 border-black bg-aldesYellow px-10 py-4 text-sm font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
              >
                {t('transactions.letsOrder')}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Transactions;