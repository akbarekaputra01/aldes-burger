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
  XCircle // <-- Tambahan Ikon XCircle untuk Cancelled
} from 'lucide-react';
import { ListItemSkeleton } from '../components/Skeletons';
import api from '../lib/api';

function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('on_progress');
  const [isFetching, setIsFetching] = useState(true);

  // 1. MENGAMBIL DATA DARI API LARAVEL
  useEffect(() => {
    const fetchOrders = async () => {
      setIsFetching(true);
      try {
        const { data } = await api.get('/transactions');
        setTransactions(data);
      } catch (error) {
        console.error("Gagal memuat transaksi:", error);
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
    <main className="min-h-screen w-full bg-[#F3E8CC] pb-24 pt-10 font-sans text-[#2D2D2D]">
      <div className="mx-auto max-w-xl px-6">
        
        <section className="py-10 text-center">
          <div className="mb-4 inline-block rotate-[-2deg] rounded-full border-2 border-black bg-[#D52518] px-4 py-1 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Status Update
            </p>
          </div>
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter text-black italic">
            Order <br/> 
            <span className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] [-webkit-text-stroke:2px_black]">
              Journal
            </span>
          </h2>
        </section>

        {/* TABS (KOTAK BIRU STYLE) */}
        <div className="mb-10 flex rounded-full border-4 border-black bg-white p-1.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <button 
            onClick={() => setActiveTab('on_progress')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-xs uppercase transition-all rounded-full
              ${activeTab === 'on_progress' ? 'bg-[#FFC926] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}
          >
            <UtensilsCrossed size={16} strokeWidth={3} /> On Going
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 font-black text-xs uppercase transition-all rounded-full
              ${activeTab === 'history' ? 'bg-[#FFC926] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400'}`}
          >
            <History size={16} strokeWidth={3} /> History
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
                          ? 'bg-[#D52518] text-white' 
                          : order.status?.toLowerCase() === 'cancelled'
                            ? 'bg-red-100 text-red-600 border-red-600' // Styling khusus untuk cancelled
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
                      <p className="text-[10px] font-black uppercase text-[#D52518]">#ADL-{order.id.split('-')[0]}</p>
                      <h3 className={`mt-1 text-xl font-black uppercase italic leading-none ${order.status?.toLowerCase() === 'cancelled' ? 'text-red-600 line-through decoration-2' : ''}`}>
                        {order.status}
                      </h3>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black transition-colors group-hover:bg-[#FFC926]">
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
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Bill</p>
                      <p className={`text-2xl font-black text-black ${order.status?.toLowerCase() === 'cancelled' ? 'opacity-50' : ''}`}>
                        Rp {order.amount?.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold italic">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                      <div className="mt-1 flex items-center gap-1 rounded-lg border border-black bg-[#FDF8EE] px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Ticket size={10} />
                        <span className="text-[8px] font-black uppercase">Promo Applied</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-[40px] border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <Clock3 size={48} className="text-[#D52518]" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                {activeTab === 'on_progress' ? 'Kitchen is Quiet!' : 'No History Yet'}
              </h3>
              <p className="mb-8 mt-2 text-xs font-bold text-gray-500 px-10">
                {activeTab === 'on_progress' 
                  ? "You haven't ordered anything yet. Let's get some burgers!" 
                  : "Your past orders will appear here."}
              </p>
              <button 
                onClick={() => navigate('/menu')}
                className="rounded-2xl border-4 border-black bg-[#FFC926] px-10 py-4 text-sm font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
              >
                Let's Cook Something!
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Transactions;