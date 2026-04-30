import { AtSign, Eye, EyeOff, Loader2, Sparkles, ArrowRight, User, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MascotBurger from '../assets/mascot-burger.png'; 

function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-[#F3E8CC] overflow-x-hidden font-sans">
      {/* SISI KIRI: BRANDING (EST. 2026 FIXED - IDENTIK DENGAN LOGIN) */}
      <section className="w-full md:w-[40%] bg-[#D52518] relative flex flex-col justify-center items-center p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className="relative z-10 text-center">
          <div className="bg-white border-[6px] border-black p-4 rounded-[3rem] inline-block mb-6 shadow-[15px_15px_0_0_#000] rotate-3 animate-bounce-slow">
            <img src={MascotBurger} alt="Mascot" className="w-32 h-32 md:w-56 md:h-56 object-contain" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[#FFC926] uppercase italic tracking-tighter leading-none mb-4 drop-shadow-[6px_6px_0_#000]">ALDES<br/>BURGER</h1>
          {/* DISAMAKAN: text-sm, tracking-[0.3em], px-6 py-2 */}
          <p className="text-[#F3E8CC] font-black text-sm uppercase tracking-[0.3em] bg-black px-6 py-2 rounded-full inline-block">EST. 2026</p>
        </div>
        <div className="hidden md:block absolute top-0 -right-1 h-full w-24">
          <svg viewBox="0 0 100 800" className="h-full w-full fill-[#F3E8CC]" preserveAspectRatio="none">
            <path d="M100 0 C20 200 150 500 0 800 L100 800 Z" />
          </svg>
        </div>
      </section>

      {/* SISI KANAN: FORM */}
      <section className="flex-1 flex items-center justify-center p-4 md:p-10 perspective-1000">
        <div className="animate-flip-in w-full max-w-[600px] bg-white border-[6px] border-black rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-[12px_12px_0_0_#000] md:shadow-[18px_18px_0_0_#000] relative">
          <div className="absolute -top-6 -right-4 md:-top-10 md:-right-8 bg-[#D52518] border-[4px] border-black px-5 py-2.5 md:px-7 md:py-3.5 rounded-2xl shadow-[6px_6px_0_0_#FFC926] rotate-6 hover:-rotate-2 transition-transform cursor-default z-30">
            <span className="font-black text-[#FFC926] text-lg md:text-2xl uppercase italic tracking-tighter">SIGN UP</span>
          </div>
          <div className="mb-8 flex justify-between items-start">
            <div className="text-left">
              <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none">JOIN THE CREW!</h2>
              <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase mt-2">PLAY IT, BUILD IT, BITE IT! ✨</p>
            </div>
            <div className="mt-8 md:mt-10 mr-2">
               <Sparkles className="text-[#FFC926] fill-[#FFC926] animate-pulse shrink-0" size={32} />
            </div>
          </div>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-[#D52518] uppercase ml-2">Name</label>
                <div className="flex items-center bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#000]">
                  <User size={18} className="mr-2 text-black" />
                  <input className="bg-transparent w-full outline-none font-bold text-sm" placeholder="Your Name" />
                </div>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-[#D52518] uppercase ml-2">Username</label>
                <div className="flex items-center bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#000]">
                  <AtSign size={18} className="mr-2 text-black" />
                  <input className="bg-transparent w-full outline-none font-bold text-sm" placeholder="@your_username" />
                </div>
              </div>
            </div>
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black text-[#D52518] uppercase ml-2">Email</label>
              <div className="flex items-center bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#000]">
                <Mail size={18} className="mr-2 text-black" />
                <input className="bg-transparent w-full outline-none font-bold text-sm" placeholder="name@gmail.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-[#D52518] uppercase ml-2">Password</label>
                <div className="flex items-center bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#000]">
                  <input type="password" size={18} className="bg-transparent w-full outline-none font-bold text-sm" placeholder="••••" />
                </div>
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-[#D52518] uppercase ml-2">Confirm</label>
                <div className="flex items-center bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_#000]">
                  <input type="password" size={18} className="bg-transparent w-full outline-none font-bold text-sm" placeholder="••••" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[#D52518] text-[#FFC926] py-4 rounded-2xl border-[5px] border-black font-black text-xl uppercase shadow-[0_6px_0_0_#000] hover:translate-y-1 hover:shadow-[0_3px_0_0_#000] transition-all mt-4 flex justify-center items-center gap-3">
              LET'S COOK! <ArrowRight strokeWidth={4} size={24}/>
            </button>
          </form>
          <p className="mt-8 text-center font-black text-[10px] text-gray-400 uppercase tracking-widest leading-none">
            Already have an account? <Link to="/login" className="text-[#D52518] underline decoration-[#FFC926] decoration-[3px] underline-offset-4 hover:text-black transition-colors">LOG IN</Link>
          </p>
        </div>
      </section>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        @keyframes flip-in { 0% { transform: rotateY(-90deg); opacity: 0; } 100% { transform: rotateY(0deg); opacity: 1; } }
        .animate-flip-in { animation: flip-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0) rotate(3deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </main>
  );
}

export default SignUp;