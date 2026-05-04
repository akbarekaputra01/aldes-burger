import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { setAuthSession } from '../utils/auth';
import MascotBurger from '../assets/mascot-burger.png'; 

function Auth() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ login_identity: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const { data } = await api.post('/login', form);
      setAuthSession(data);
      navigate(data.user?.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      const message = err.response?.data?.message || 'Login Gagal! 🍔';
      setError(message.toUpperCase());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#F3E8CC] overflow-x-hidden font-sans">
      <section className="w-full md:w-[40%] bg-[#D52518] relative flex flex-col justify-center items-center p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="relative z-10 text-center">
          <div className="bg-white border-[6px] border-black p-4 rounded-[3rem] inline-block mb-6 shadow-[15px_15px_0_0_#000] rotate-3 animate-bounce-slow">
            <img src={MascotBurger} alt="Mascot" className="w-32 h-32 md:w-56 md:h-56 object-contain" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[#FFC926] uppercase italic tracking-tighter leading-none mb-4 drop-shadow-[6px_6px_0_#000]">ALDES<br/>BURGER</h1>
          <p className="text-[#F3E8CC] font-black text-sm uppercase tracking-[0.3em] bg-black px-6 py-2 rounded-full inline-block">EST. 2026</p>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="animate-flip-in w-full max-w-[500px] bg-white border-[6px] border-black rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-[12px_12px_0_0_#000] md:shadow-[18px_18px_0_0_#000] relative">
          <div className="absolute -top-6 -right-4 md:-top-10 md:-right-8 bg-[#D52518] border-[4px] border-black px-5 py-2.5 md:px-7 md:py-3.5 rounded-2xl shadow-[6px_6px_0_0_#FFC926] rotate-6 z-30">
            <span className="font-black text-[#FFC926] text-lg md:text-2xl uppercase italic tracking-tighter">LOG IN</span>
          </div>

          <div className="mb-8 flex justify-between items-start">
            <div className="text-left">
              <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none">WELCOME BACK!</h2>
              <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase mt-2">Ready for another bite? 🍔</p>
            </div>
            <Sparkles className="text-[#FFC926] fill-[#FFC926] animate-pulse mt-4" size={32} />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-[3px] border-red-600 text-red-700 font-black rounded-2xl animate-shake text-xs flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-black text-[#D52518] uppercase ml-2 tracking-wider">Email or Phone</label>
              <div className="flex items-center bg-[#F3E8CC]/20 border-4 border-black rounded-2xl px-4 py-4 focus-within:bg-white transition-all">
                <User size={20} className="mr-3 text-black" />
                <input 
                  type="text"
                  value={form.login_identity}
                  onChange={(e) => setForm({...form, login_identity: e.target.value})} 
                  className="bg-transparent w-full outline-none font-bold text-base text-black" 
                  placeholder="name@mail.com / 0812..." 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs font-black text-[#D52518] uppercase ml-2 tracking-wider">Password</label>
              <div className="flex items-center bg-white border-4 border-black rounded-2xl px-4 py-4 shadow-[4px_4px_0_0_#000]">
                <Lock size={20} className="mr-3 text-black" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})} 
                  className="bg-transparent w-full outline-none font-bold text-base text-black" 
                  placeholder="••••••••" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-black">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#D52518] text-[#FFC926] py-5 rounded-2xl border-[5px] border-black font-black text-2xl uppercase shadow-[0_8px_0_0_#000] active:translate-y-1 active:shadow-[0_4px_0_0_#000] transition-all flex justify-center items-center gap-3">
              {isLoading ? <Loader2 className="animate-spin" /> : <>START COOKING! <ArrowRight strokeWidth={4} size={28}/></>}
            </button>
          </form>

          <p className="mt-10 text-center font-black text-xs text-gray-400 uppercase tracking-widest leading-none">
            New to the kitchen? <Link to="/signup" className="text-[#D52518] underline decoration-[#FFC926] decoration-[5px] underline-offset-4 hover:text-black transition-colors">SIGN UP</Link>
          </p>
        </div>
      </section>

      <style>{`
        @keyframes flip-in { 0% { transform: rotateY(-90deg); opacity: 0; } 100% { transform: rotateY(0deg); opacity: 1; } }
        .animate-flip-in { animation: flip-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(3deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </main>
  );
}

export default Auth;