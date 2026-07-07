import {
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Zap,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { setAuthSession } from '../utils/auth';
import MascotBurger from '../assets/mascot-burger.png';

function Auth() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // step: 'login' | 'forgot' | 'verify_otp' | 'reset'
  const [step, setStep] = useState('login');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- 1. LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email) return setError('Please enter your registered email address.');
    if (!email.endsWith('@gmail.com')) return setError('Please use a valid Gmail address ending with @gmail.com.');
    if (!password) return setError('Please enter your password.');

    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/login', { email, password });
      setAuthSession(data);
      navigate(data.user?.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) setError('This email is not registered. Please check your email or create a new account.');
      else if (status === 401 || status === 422) setError('The password does not match the registered email.');
      else setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToForgot = () => {
    setError(''); setSuccess(''); setStep('forgot');
  };

  const backToLogin = () => {
    setError(''); setSuccess(''); setOtp(''); setNewPassword(''); setPasswordConfirmation(''); setStep('login');
  };

  // --- 2. FORGOT PASSWORD (SEND OTP) ---
  const handleForgot = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();

    if (!email) return setError('Please enter your registered email address.');
    if (!email.endsWith('@gmail.com')) return setError('Please use a valid Gmail address.');

    setError(''); setSuccess(''); setIsLoading(true);

    try {
      await api.post('/forgot-password', { email });
      setSuccess('An OTP code has been sent to your email.');
      setStep('verify_otp'); // Pindah ke tahap validasi OTP Dulu
    } catch (err) {
      if (err.response?.status === 404) setError('This email is not registered.');
      else setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. VERIFY OTP (SEBELUM GANTI PASSWORD) ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('OTP must be exactly 6 digits.');

    setError(''); setSuccess(''); setIsLoading(true);

    try {
      // Validasi OTP murni ke backend
      await api.post('/verify-otp', { email: form.email.trim().toLowerCase(), otp });
      localStorage.setItem('reset_otp', otp);
      setSuccess('OTP Verified! Please enter your new password.');
      
      // Jika sukses, baru munculkan form ganti password
      setTimeout(() => {
        setStep('reset');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. EXECUTE RESET PASSWORD ---
  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword) return setError('Please enter a new password.');
    if (newPassword !== passwordConfirmation) return setError('Password confirmation does not match.');
    // const savedOtp = localStorage.getItem('reset_otp');
    setError(''); setSuccess(''); setIsLoading(true);

    try {
      await api.post('/reset-password', {
      email: form.email.trim().toLowerCase(),
      password: newPassword,
      password_confirmation: passwordConfirmation
      });
      setSuccess('Your password has been reset successfully. Please log in.');
      localStorage.removeItem('reset_otp');
      setOtp(''); setNewPassword(''); setPasswordConfirmation('');
      setTimeout(() => {
        setStep('login');
        setSuccess('');
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#F3E8CC] font-sans selection:bg-[#FFC926] selection:text-black relative">
      {/* Background Burger Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="1"><path d="M32 54C32 43.5066 40.5066 35 51 35H69C79.4934 35 88 43.5066 88 54V56H32V54Z" stroke="#D52518" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 60H92" stroke="#D52518" stroke-width="3" stroke-linecap="round"/><path d="M31 64H89" stroke="#D52518" stroke-width="3" stroke-linecap="round"/><path d="M36 71H84" stroke="#D52518" stroke-width="3" stroke-linecap="round"/><path d="M34 76V77C34 83.0751 38.9249 88 45 88H75C81.0751 88 86 83.0751 86 77V76" stroke="#D52518" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="47" r="1.7" fill="#FFC926"/><circle cx="56" cy="43" r="1.7" fill="#FFC926"/><circle cx="66" cy="46" r="1.7" fill="#FFC926"/><circle cx="76" cy="44" r="1.7" fill="#FFC926"/></g></svg>`)}")`, backgroundSize: '120px 120px', backgroundPosition: '0 0' }} />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(#D52518 1.1px, transparent 1.1px)`, backgroundSize: '24px 24px' }} />
      </div>
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#D52518] rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-[#FFC926] rounded-full blur-3xl opacity-35" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-4 md:px-8 md:py-5 perspective-wrapper">
        <div className="auth-flip-card w-full max-w-5xl min-h-[520px] grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] bg-white/80 backdrop-blur-xl border-[4px] border-black rounded-[2rem] md:rounded-[2.6rem] overflow-hidden shadow-[10px_10px_0_0_#000]">
          
          {/* LEFT BRAND SECTION */}
          <section className="relative bg-[#D52518] px-7 py-7 md:px-9 md:py-8 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-8 -left-16 w-64 h-64 border-[24px] border-[#FFC926] rounded-full" />
              <div className="absolute bottom-[-90px] right-[-80px] w-72 h-72 border-[24px] border-white rounded-full" />
            </div>
            <div className="relative z-10">
              <Link to="/" title="Back to Home" className="inline-flex items-center gap-2 bg-black text-[#FFC926] px-4 py-2 rounded-full border-2 border-[#FFC926] font-black text-xs uppercase tracking-wider shadow-[4px_4px_0_0_#FFC926] hover:scale-105 hover:bg-gray-900 active:scale-95 transition-all cursor-pointer">
                <Zap size={15} fill="#FFC926" /> Aldes Burger
              </Link>
            </div>
            <div className="relative z-10 flex flex-col items-center text-center my-4">
              <div className="relative mb-7">
                <div className="absolute inset-0 bg-black rounded-[1.8rem] translate-x-3 translate-y-3" />
                <div className="relative w-44 h-44 md:w-52 md:h-52 bg-[#F3E8CC] border-[4px] border-black rounded-[1.8rem] flex items-center justify-center shadow-inner overflow-hidden">
                  <div className="absolute top-4 left-4 bg-[#FFC926] border-[3px] border-black rounded-full w-11 h-11" />
                  <div className="absolute bottom-5 right-5 bg-white border-[3px] border-black rounded-full w-9 h-9" />
                  <Sparkles className="absolute top-7 right-7 text-[#D52518] fill-[#D52518]" size={24} />
                  <img src={MascotBurger} alt="Aldes Burger Mascot" className="relative z-10 w-[82%] h-[82%] object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.22)]" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-full border-[3px] border-[#FFC926] font-black text-[10px] uppercase whitespace-nowrap rotate-[-2deg]">
                  Fresh. Juicy. Crispy.
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-[0.85] text-[#FFC926] drop-shadow-[4px_4px_0_#000]">
                {step === 'login' && (<>Welcome<br /><span className="text-white">Back!</span></>)}
                {step === 'forgot' && (<>Reset<br /><span className="text-white">Password</span></>)}
                {step === 'verify_otp' && (<>Verify<br /><span className="text-white">OTP Code</span></>)}
                {step === 'reset' && (<>Almost<br /><span className="text-white">There!</span></>)}
              </h1>
              <p className="mt-4 max-w-sm text-white font-bold text-sm md:text-[15px] leading-relaxed">
                {step === 'login' && 'Log in with your registered email to continue your order.'}
                {step === 'forgot' && "Enter your registered email and we'll send you an OTP code."}
                {step === 'verify_otp' && 'Enter the OTP code we sent you to proceed.'}
                {step === 'reset' && 'Create a new secure password for your account.'}
              </p>
            </div>
            <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/15 border-2 border-white/30 rounded-2xl px-2 py-3">
                <p className="text-[#FFC926] font-black text-base md:text-lg leading-none">Fast</p>
                <p className="text-white text-[9px] font-bold uppercase mt-1">Login</p>
              </div>
              <div className="bg-white/15 border-2 border-white/30 rounded-2xl px-2 py-3">
                <p className="text-[#FFC926] font-black text-base md:text-lg leading-none">Hot</p>
                <p className="text-white text-[9px] font-bold uppercase mt-1">Deals</p>
              </div>
              <div className="bg-white/15 border-2 border-white/30 rounded-2xl px-2 py-3">
                <p className="text-[#FFC926] font-black text-base md:text-lg leading-none">Fresh</p>
                <p className="text-white text-[9px] font-bold uppercase mt-1">Taste</p>
              </div>
            </div>
          </section>

          {/* RIGHT FORM SECTION */}
          <section className="relative px-5 py-7 md:px-10 md:py-8 lg:px-12 flex items-center">
            <div className="w-full max-w-[520px] mx-auto">
              
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-[#FFC926] border-[3px] border-black rounded-full px-4 py-2 mb-4 shadow-[4px_4px_0_0_#000]">
                  <Sparkles size={15} className="fill-black" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {step === 'login' && 'Member Login'}
                    {step === 'forgot' && 'Forgot Password'}
                    {step === 'verify_otp' && 'OTP Validation'}
                    {step === 'reset' && 'Create New Pass'}
                  </span>
                </div>
                <h2 className="text-4xl md:text-[46px] font-black text-black uppercase tracking-tighter leading-none">
                  {step === 'login' && 'Log In'}
                  {step === 'forgot' && 'Recover'}
                  {step === 'verify_otp' && 'Verify'}
                  {step === 'reset' && 'New Pass'}
                  <span className="text-[#D52518]">.</span>
                </h2>
              </div>

              {error && (
                <div className="mb-5 bg-[#D52518]/10 border-[3px] border-[#D52518] p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="bg-[#D52518] text-white rounded-full p-1 shrink-0"><AlertCircle size={17} /></div>
                  <p className="text-sm font-black text-[#D52518]">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-5 bg-green-600/10 border-[3px] border-green-600 p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="bg-green-600 text-white rounded-full p-1 shrink-0"><CheckCircle2 size={17} /></div>
                  <p className="text-sm font-black text-green-700">{success}</p>
                </div>
              )}

              {/* ===== 1. LOGIN FORM ===== */}
              {step === 'login' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-[#D52518] transition-colors">Registered Email</label>
                    <div className="flex items-center bg-[#F3E8CC]/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                      <Mail size={19} className="mr-3 text-[#D52518] shrink-0" />
                      <input type="email" value={form.email} className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400" placeholder="mail@gmail.com" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-black uppercase text-gray-500 tracking-wider group-focus-within:text-[#D52518] transition-colors">Password</label>
                    </div>
                    <div className="flex items-center bg-[#F3E8CC]/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                      <Lock size={18} className="mr-3 text-[#D52518] shrink-0" />
                      <input type={showPassword ? 'text' : 'password'} value={form.password} className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400 tracking-normal" placeholder="Enter your password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-black hover:text-[#D52518] transition-colors shrink-0">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                    <button type="button" onClick={goToForgot} className="text-[11px] font-black uppercase text-[#D52518] hover:underline underline-offset-4 tracking-wider mt-2 block">Forgot?</button>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-[#D52518] text-white py-4 rounded-2xl border-[4px] border-black font-black text-lg uppercase shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[8px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 mt-3 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FFC926] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-black flex items-center gap-2 tracking-tight">
                      {isLoading ? <><Loader2 className="animate-spin" size={23} /> Signing In...</> : <><ArrowRight strokeWidth={4} size={23} /> Log In</>}
                    </span>
                  </button>
                </form>
              )}

              {/* ===== 2. FORGOT (Send Email) ===== */}
              {step === 'forgot' && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-[#D52518] transition-colors">Registered Email</label>
                    <div className="flex items-center bg-[#F3E8CC]/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                      <Mail size={19} className="mr-3 text-[#D52518] shrink-0" />
                      <input type="email" value={form.email} className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400" placeholder="mail@gmail.com" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-black text-white py-4 rounded-2xl border-[4px] border-black font-black text-lg uppercase shadow-[0_8px_0_0_#D52518] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#D52518] active:translate-y-[8px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 mt-3 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FFC926] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-black flex items-center gap-2 tracking-tight">
                      {isLoading ? <><Loader2 className="animate-spin" size={23} /> Sending OTP...</> : <><ArrowRight strokeWidth={4} size={23} /> Send OTP</>}
                    </span>
                  </button>
                  <button type="button" onClick={backToLogin} className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase text-gray-500 hover:text-[#D52518] transition-colors py-2"><ArrowLeft size={14} strokeWidth={3} /> Back to Login</button>
                </form>
              )}

              {/* ===== 3. VERIFY OTP (VALIDASI SAJA) ===== */}
              {step === 'verify_otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 mt-4">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase mb-3 text-gray-500 tracking-wider text-center group-focus-within:text-[#D52518] transition-colors">Enter 6-Digit Code</label>
                    <div className="flex items-center bg-[#F3E8CC]/60 border-[3px] border-black rounded-2xl px-6 py-4 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all max-w-[300px] mx-auto">
                      <KeyRound size={24} className="mr-4 text-[#D52518] shrink-0" />
                      <input type="text" maxLength="6" className="bg-transparent w-full outline-none font-black text-3xl tracking-[0.5em] text-center placeholder:text-gray-300 placeholder:tracking-normal placeholder:font-bold" placeholder="------" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading || otp.length < 6} className="w-full bg-black text-[#FFC926] py-4 rounded-2xl border-[4px] border-black font-black text-lg uppercase shadow-[0_8px_0_0_#FFC926] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#FFC926] active:translate-y-[8px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FFC926] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-black flex items-center gap-2 tracking-tight">
                      {isLoading ? <><Loader2 className="animate-spin" size={23} /> Verifying...</> : <><Sparkles size={23} /> Verify OTP</>}
                    </span>
                  </button>
                  <button type="button" onClick={backToLogin} className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase text-gray-500 hover:text-[#D52518] transition-colors py-2"><ArrowLeft size={14} strokeWidth={3} /> Cancel</button>
                </form>
              )}

              {/* ===== 4. RESET PASSWORD (HANYA MUNCUL JIKA OTP VALID) ===== */}
              {step === 'reset' && (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-[#D52518] transition-colors">New Password</label>
                    <div className="flex items-center bg-[#F3E8CC]/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                      <Lock size={18} className="mr-3 text-[#D52518] shrink-0" />
                      <input type={showNewPassword ? 'text' : 'password'} value={newPassword} className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400" placeholder="Enter new password" required onChange={(e) => setNewPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="ml-2 text-black hover:text-[#D52518] transition-colors shrink-0">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black uppercase mb-2 text-gray-500 tracking-wider group-focus-within:text-[#D52518] transition-colors">Confirm Password</label>
                    <div className="flex items-center bg-[#F3E8CC]/60 border-[3px] border-black rounded-2xl px-4 py-3 focus-within:bg-white focus-within:shadow-[5px_5px_0_0_#FFC926] transition-all">
                      <Lock size={18} className="mr-3 text-[#D52518] shrink-0" />
                      <input type={showNewPassword ? 'text' : 'password'} value={passwordConfirmation} className="bg-transparent w-full outline-none font-bold text-sm placeholder:text-gray-400" placeholder="Re-enter new password" required onChange={(e) => setPasswordConfirmation(e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-4 rounded-2xl border-[4px] border-black font-black text-lg uppercase shadow-[0_8px_0_0_#000] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#000] active:translate-y-[8px] active:shadow-none disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-3 mt-3 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#FFC926] -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:text-black flex items-center gap-2 tracking-tight">
                      {isLoading ? <><Loader2 className="animate-spin" size={23} /> Resetting...</> : <><ArrowRight strokeWidth={4} size={23} /> Update Password</>}
                    </span>
                  </button>
                </form>
              )}

              {/* Tampilkan ke Sign Up hanya jika ada di halaman Login */}
              {step === 'login' && (
                <div className="mt-6 pt-5 border-t-[3px] border-dashed border-black text-center">
                  <p className="font-black text-xs md:text-[13px] text-gray-500 uppercase tracking-wider">
                    New to Aldes Burger?{' '}
                    <Link to="/signup" className="text-[#D52518] hover:bg-[#FFC926] px-2 py-1 rounded-lg transition-colors underline decoration-[2px] underline-offset-4">Create account</Link>
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <style>{`
        .perspective-wrapper { perspective: 1800px; }
        .auth-flip-card {
          transform-style: preserve-3d; backface-visibility: hidden; transform-origin: center center;
          animation: authFlipIn 0.95s cubic-bezier(0.16, 1, 0.3, 1) both; will-change: transform, opacity, filter;
        }
        @keyframes authFlipIn {
          0% { opacity: 0; filter: blur(4px); transform: rotateY(-8deg) translateY(18px) scale(0.985); }
          55% { opacity: 1; filter: blur(0); transform: rotateY(2deg) translateY(0) scale(1.005); }
          100% { opacity: 1; filter: blur(0); transform: rotateY(0deg) translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) { .auth-flip-card { animation: none; filter: none; } }
      `}</style>
    </main>
  );
}

export default Auth;