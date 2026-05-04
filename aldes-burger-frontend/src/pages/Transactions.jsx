import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock3, 
  ChevronRight, 
  History,
  Search,
  CheckCircle2,
  Package,
  ArrowUpRight,
  MapPin,
  UtensilsCrossed
} from 'lucide-react';
import { ListItemSkeleton } from '../components/Skeletons';
import api from '../lib/api';
import MascotBurger from '../assets/mascot-burger.png';

function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('on_progress');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setIsFetching(true);
    api.get('/transactions')
      .then(({ data }) => setTransactions(data))
      .catch(() => setTransactions([]))
      .finally(() => setIsFetching(false));
  }, []);

  const currentOrders = useMemo(() => 
    transactions.filter((order) => 
      activeTab === 'on_progress' ? order.status !== 'done' : order.status === 'done'
    ), [activeTab, transactions]
  );

  return (
    <main className="min-h-screen w-full bg-[#FDF8EE] font-sans text-[#2D2D2D] pb-24 overflow-x-hidden">
      
      {/* 1. TOP NAV */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-[#F3E8CC] px-8 py-5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#FFC926] rounded-[1.2rem] flex items-center justify-center rotate-[-8deg] shadow-lg shadow-[#FFC926]/30">
                <img src={MascotBurger} alt="Mascot" className="w-7 h-7 object-contain rotate-[8deg]" />
             </div>
             <h1 className="text-xl font-black italic tracking-tight uppercase">Aldes Tracker</h1>
          </div>
          <button className="p-2 bg-gray-50 rounded-full hover:bg-[#F3E8CC] transition-colors">
            <Search size={20} className="text-gray-400" />
          </button>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6">
        
        {/* 2. HERO GREETING (Tanpa Exclusive Member) */}
        <section className="py-12">
          <h2 className="text-4xl font-black text-black leading-tight">Where's my <br/> <span className="text-[#D52518]">Burger?</span></h2>
        </section>

        {/* 3. FLOATING GLASS TABS */}
        <div className="flex p-1.5 bg-gray-100/50 rounded-[2rem] border border-white mb-10 shadow-inner">
          <button 
            onClick={() => setActiveTab('on_progress')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all duration-500
              ${activeTab === 'on_progress' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-black'}`}
          >
            <UtensilsCrossed size={14} /> Active Order
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest transition-all duration-500
              ${activeTab === 'history' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:text-black'}`}
          >
            <History size={14} /> My History
          </button>
        </div>

        {/* 4. TRANSACTION CARDS */}
        <div className="space-y-8">
          {isFetching ? (
            Array.from({ length: 3 }).map((_, i) => <ListItemSkeleton key={i} />)
          ) : currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <article 
                key={order.id} 
                onClick={() => navigate(`/transactions/${order.id}`)}
                className="group relative bg-white rounded-[3rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] border border-gray-50 hover:shadow-2xl hover:shadow-[#FFC926]/10 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FFC926]/10 to-transparent rounded-bl-[5rem] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                  <header className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                          ${activeTab === 'on_progress' ? 'bg-[#D52518] text-white shadow-lg shadow-[#D52518]/20' : 'bg-[#F3E8CC] text-[#D52518]'}`}>
                          {activeTab === 'on_progress' ? <Package size={22} /> : <CheckCircle2 size={22} />}
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Order ID</p>
                          <p className="text-sm font-black text-black">#{order.id.slice(0,10)}</p>
                       </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                       <ArrowUpRight size={18} />
                    </div>
                  </header>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-[#D52518]" />
                       <p className="text-[11px] font-bold text-gray-500 truncate">Delivery to: South Residence, Block B...</p>
                    </div>
                    
                    <div className="h-[1px] w-full bg-gray-100"></div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Total Bill</p>
                        <p className="text-2xl font-black text-black tracking-tight">
                           <span className="text-xs mr-1 text-[#D52518]">IDR</span>
                           {order.amount.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{order.created_at}</p>
                         <span className={`inline-block mt-1 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                            ${order.status === 'pending' ? 'bg-[#FFC926] text-black' : 'bg-green-100 text-green-600'}`}>
                            {order.status}
                         </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-8">
                 <div className="absolute inset-0 bg-[#FFC926] blur-3xl opacity-20 rounded-full animate-pulse"></div>
                 <div className="relative w-32 h-32 bg-white rounded-[3rem] border border-[#F3E8CC] flex items-center justify-center shadow-xl">
                    <Clock3 size={40} className="text-[#D52518] animate-bounce" />
                 </div>
              </div>
              <h3 className="text-2xl font-black mb-2">No Active Cravings</h3>
              <p className="text-sm font-medium text-gray-400 px-10 mb-8 leading-relaxed">
                Your order list is currently empty. Time to treat yourself to something delicious!
              </p>
              <button 
                onClick={() => navigate('/menu')}
                className="group flex items-center gap-3 bg-black text-[#FFC926] px-10 py-4 rounded-3xl font-black uppercase text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
              >
                Start Ordering <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}

export default Transactions;