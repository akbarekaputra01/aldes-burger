import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Zap,
  AlertCircle,
  CheckCircle,
  KeyRound // Icon baru untuk OTP
} from 'lucide-react';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import MascotBurger from '../assets/mascot-burger.png';

function SignUp() {
  const navigate = useNavigate();

  // State UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFlippingOut, setIsFlippingOut] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State Logika Alur
  const [step, setStep] = useState('register'); // 'register' atau 'otp'
  const [otp, setOtp] = useState('');

  // State Data Form
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });

  // 1. Fungsi Handle Register (Tahap 1)
  const handleRegister = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!email.endsWith('@gmail.com')) {
      setError('Please use a valid Gmail address ending with @gmail.com.');
      setSuccess('');
      return;
    }

    if (!/^08\d{8,11}$/.test(phone)) {
      setError('Phone number must start with 08 and contain 10 to 13 digits.');
      setSuccess('');
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError('Password confirmation does not match your password.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await api.post('/register', form);
      
      // Ubah UI ke tampilan OTP
      setSuccess('Account created! Please check your email for the verification code.');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fungsi Handle Verifikasi OTP (Tahap 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Panggil API Verifikasi
      await api.post('/verify-otp', {
        email: form.email,
        otp: otp
      });

      // Berikan feedback sukses
      setSuccess('Email verified successfully! Redirecting to login...');

      // Animasi flip card sebelum pindah halaman
      setTimeout(() => {
        setIsFlippingOut(true);
      }, 900);

      // Arahkan user ke halaman LOGIN, bukan halaman utama ('/')
      setTimeout(() => {
        navigate('/login'); 
      }, 1650);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or expired. Please try again.');
      setSuccess('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-hidden bg-aldesCream font-sans selection:bg-aldesYellow selection:text-black relative">
      
      {/* Background Burger Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="1">
                  <path d="M32 54C32 43.5066 40.5066 35 51 35H69C79.4934 35 88 43.5066 88 54V56H32V54Z" stroke="#D52518" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M28 60H92" stroke="#D52518" stroke-width="3" stroke-linecap="round"/>
                  <path d="M31 64H89" stroke="#D52518" stroke-width="3" stroke-linecap="round"/>
                  <path d="M36 71H84" stroke="#D52518" stroke-width="3" stroke-linecap="round"/>
                  <path d="M34 76V77C34 83.0751 38.9249 88 45 88H75C81.0751 88 86 83.0751 86 77V76" stroke="#D52518" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="46" cy="47" r="1.7" fill="#FFC926"/>
                  <circle cx="56" cy="43" r="1.7" fill="#FFC926"/>
                  <circle cx="66" cy="46" r="1.7" fill="#FFC926"/>
                  <circle cx="76" cy="44" r="1.7" fill="#FFC926"/>
                </g>
              </svg>
            `)}")`,
            backgroundSize: '120px 120px',
            backgroundPosition: '0 0'
          }}
        />
      </div>

      {/* Background Dots */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(#D52518 1.1px, transparent 1.1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-aldesRed rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-aldesYellow rounded-full blur-3xl opacity-35" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-4 md:px-8 md:py-5 perspective-wrapper">
        <div
          className={`signup-flip-card ${
            isFlippingOut ? 'signup-flip-out' : ''
          } w-full max-w-5xl min-h-[520px] grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] bg-white/80 backdrop-blur-xl border-[4px] border-black rounded-[2rem] md:rounded-[2.6rem] overflow-hidden shadow-[10px_10px_0_0_#000]`}
        >
          
          {/* LEFT BRAND SECTION */}
          <section className="relative bg-aldesRed px-7 py-7 md:px-9 md:py-8 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-8 -left-16 w-64 h-64 border-[24px] border-aldesYellow rounded-full" />
              <div className="absolute bottom-[-90px] right-[-80px] w-72 h-72 border-[24px] border-white rounded-full" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-black text-aldesYellow px-4 py-2 rounded-full border-2 border-aldesYellow font-black text-xs uppercase tracking-wider shadow-[4px_4px_0_0_#FFC926]">
                <Zap size={15} fill="#FFC926" />
                Aldes Burger
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center my-4">
              <div className="relative mb-7">
                <div className="absolute inset-0 bg-black rounded-[1.8rem] translate-x-3 translate-y-3" />
                <div className="relative w-44 h-44 md:w-52 md:h-52 bg-aldesCream border-[4px] border-black rounded-[1.8rem] flex items-center justify-center shadow-inner overflow-hidden">
                  <div className="absolute top-4 left-4 bg-aldesYellow border-[3px] border-black rounded-full w-11 h-11" />
                  <div className="absolute bottom-5 right-5 bg-white border-[3px] border-black rounded-full w-9 h-9" />
                  <Sparkles className="absolute top-7 right-7 text-aldesRed fill-aldesRed" size={24} />
                  <img
                    src={MascotBurger}
                    alt="Aldes Burger Mascot"
                    className="relative z-10 w-[82%] h-[82%] object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.22)]"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-full border-[3px] border-aldesYellow font-black text-[10px] uppercase whitespace-nowrap rotate-[-2deg]">
                  Fresh. Juicy. Crispy.
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.85] text-aldesYellow drop-shadow-[4px_4px_0_#000]">
                Join The
                <br />
                <span className="text-white">Burger Club</span>
              </h1>

              <p className="mt-4 max-w-sm text-white font-bold text-sm md:text-[15px] leading-relaxed">
                Create your account and get closer to tasty deals, faster orders, and Aldes Burger specials.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/15 border-2 border-white/30 rounded-2xl px-2 py-3">
                <p className="text-aldesYellow font-black text-base md:text-lg leading-none">Fast</p>
                <p className="text-white text-[9px] font-bold uppercase mt-1">Order</p>
              </div>
              <div className="bg-white/15 border-2 border-white/30 rounded-2xl px-2 py-3">
                <p className="text-aldesYellow font-black text-base md:text-lg leading-none">Hot</p>
                <p className="text-white text-[9px] font-bold uppercase mt-1">Deals</p>
              </div>
              <div className="bg-white/15 border-2 border-white/30 rounded-2xl px-2 py-3">
                <p className="text-aldesYellow font-black text-base md:text-lg leading-none">Fresh</p>
                <p className="text-white text-[9px] font-bold uppercase mt-1">Taste</p>
              </div>
            </div>
          </section>

          {/* RIGHT FORM SECTION */}
          <section className="relative px-5 py-7 md:px-10 md:py-8 lg:px-12 flex items-center">
            <div className="w-full max-w-[520px] mx-auto">
              
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-aldesYellow border-[3px] border-black rounded-full px-4 py-2 mb-4 shadow-[4px_4px_0_0_#000]">
                  <Sparkles size={15} className="fill-black" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {step === 'register' ? 'Create New Account' : 'Security Check'}
                  </span>
                </div>

                <h2 className="text-4xl md:text-[46px] font-black text-black uppercase tracking-tighter leading-none">
                  {step === 'register' ? 'Sign Up' : 'Verify'}
                  <span className="text-aldesRed">.</span>
                </h2>

                <p className="mt-3 text-sm md:text-[15px] text-gray-500 font-semibold">
                  {step === 'register' 
                    ? 'Fill in your details to start ordering your favorite Aldes Burger menu.' 
                    : `We've sent a 6-digit code to ${form.email}. Please enter it below.`}
                </p>
              </div>

              {error && (
                <div className="mb-5 bg-aldesRed/10 border-[3px] border-aldesRed p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="bg-aldesRed text-white rounded-full p-1 shrink-0">
                    <AlertCircle size={17} />
                  </div>
                  <p className="text-sm font-black text-aldesRed">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-5 bg-green-100 border-[3px] border-green-600 p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="bg-green-600 text-white rounded-full p-1 shrink-0">
                    <CheckCircle size={17} />
                  </div>
                  <p className="text-sm font-black text-green-700">{success}</p>
                </div>
              )}

              {/* RENDER FORM BERDASARKAN STEP */}
              {step === 'register' ? (
                // FORM PENDAFTARAN
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-aldesRed transition-colors">
                      Full Name
                    </label>
                    <div className="flex items-center bg-aldesCream/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                      <User size={19} className="mr-3 text-aldesRed shrink-0" />
                      <input
                        className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400"
                        placeholder="Enter your full name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-aldesRed transition-colors">
                        Email
                      </label>
                      <div className="flex items-center bg-aldesCream/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                        <Mail size={18} className="mr-3 text-aldesRed shrink-0" />
                        <input
                          type="email"
                          className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400"
                          placeholder="mail@gmail.com"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-aldesRed transition-colors">
                        Phone
                      </label>
                      <div className="flex items-center bg-aldesCream/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                        <Phone size={18} className="mr-3 text-aldesRed shrink-0" />
                        <input
                          className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400"
                          placeholder="0812..."
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-aldesRed transition-colors">
                        Password
                      </label>
                      <div className="flex items-center bg-aldesCream/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                        <Lock size={18} className="mr-3 text-aldesRed shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400 tracking-normal"
                          placeholder="••••••••"
                          required
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="ml-2 text-black hover:text-aldesRed transition-colors shrink-0"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-aldesRed transition-colors">
                        Confirm Password
                      </label>
                      <div className="flex items-center bg-aldesCream/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                        <Lock size={18} className="mr-3 text-aldesRed shrink-0" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400 tracking-normal"
                          placeholder="••••••••"
                          required
                          value={form.password_confirmation}
                          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="ml-2 text-black hover:text-aldesRed transition-colors shrink-0"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-aldesRed text-white py-4 rounded-2xl border-[4px] border-black font-black text-lg uppercase shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[8px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 mt-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-aldesYellow -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-black flex items-center gap-2 tracking-tight">
                      {isLoading ? (
                        <><Loader2 className="animate-spin" size={23} /> Processing...</>
                      ) : (
                        <><ArrowRight strokeWidth={4} size={23} /> Register Account</>
                      )}
                    </span>
                  </button>
                </form>
              ) : (
                // FORM OTP
                <form onSubmit={handleVerifyOtp} className="space-y-6 mt-4">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase mb-3 text-gray-500 tracking-wider text-center group-focus-within:text-aldesRed transition-colors">
                      Enter 6-Digit Code
                    </label>
                    <div className="flex items-center bg-aldesCream/60 border-[3px] border-black rounded-2xl px-6 py-4 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all max-w-[300px] mx-auto">
                      <KeyRound size={24} className="mr-4 text-aldesRed shrink-0" />
                      <input
                        type="text"
                        maxLength="6"
                        className="bg-transparent w-full outline-none font-black text-3xl tracking-[0.5em] text-center placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-bold"
                        placeholder="••••••"
                        required
                        value={otp}
                        // Regex agar user hanya bisa mengetik angka
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="w-full bg-black text-aldesYellow py-4 rounded-2xl border-[4px] border-black font-black text-lg uppercase shadow-[0_8px_0_0_#FFC926] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#FFC926] active:translate-y-[8px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-aldesYellow -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-black flex items-center gap-2 tracking-tight">
                      {isLoading ? (
                        <><Loader2 className="animate-spin" size={23} /> Verifying...</>
                      ) : success ? (
                        <><CheckCircle size={23} /> Success</>
                      ) : (
                        <><Sparkles size={23} /> Verify OTP</>
                      )}
                    </span>
                  </button>
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setStep('register')}
                      className="text-xs font-bold text-gray-500 hover:text-aldesRed underline underline-offset-4"
                    >
                      Wrong email? Go back
                    </button>
                  </div>
                </form>
              )}

              {/* Tampilkan link ke login hanya pada tahap register */}
              {step === 'register' && (
                <div className="mt-6 pt-5 border-t-[3px] border-dashed border-black text-center">
                  <p className="font-black text-xs md:text-[13px] text-gray-500 uppercase tracking-wider">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-aldesRed hover:bg-aldesYellow px-2 py-1 rounded-lg transition-colors underline decoration-[2px] underline-offset-4"
                    >
                      Login here
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .perspective-wrapper {
          perspective: 1800px;
        }

        .signup-flip-card {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          transform-origin: center center;
          animation: signupFlipIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
          will-change: transform, opacity, filter;
        }

        .signup-flip-card.signup-flip-out {
          pointer-events: none;
          animation: signupFlipOut 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes signupFlipIn {
          0% {
            opacity: 0;
            filter: blur(4px);
            transform: rotateY(8deg) translateY(18px) scale(0.985);
          }

          55% {
            opacity: 1;
            filter: blur(0);
            transform: rotateY(-2deg) translateY(0) scale(1.005);
          }

          100% {
            opacity: 1;
            filter: blur(0);
            transform: rotateY(0deg) translateY(0) scale(1);
          }
        }

        @keyframes signupFlipOut {
          0% {
            opacity: 1;
            filter: blur(0);
            transform: rotateY(0deg) translateY(0) scale(1);
          }

          45% {
            opacity: 0.92;
            filter: blur(0.5px);
            transform: rotateY(-4deg) translateY(2px) scale(0.995);
          }

          100% {
            opacity: 0;
            filter: blur(4px);
            transform: rotateY(-10deg) translateY(18px) scale(0.975);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .signup-flip-card,
          .signup-flip-card.signup-flip-out {
            animation: none;
            filter: none;
          }
        }
      `}</style>
    </main>
  );
}

export default SignUp;