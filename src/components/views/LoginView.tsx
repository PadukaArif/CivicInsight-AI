import React from 'react';
import { LogIn, User, Shield, Lock, Mail, CreditCard, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import logoImg from '../../logo.png';

interface LoginViewProps {
  onLoginWarga: (email: string, pass: string) => Promise<{ success: boolean; error?: string }> | any;
  onLoginAdmin: (username: string, pass: string) => { success: boolean; error?: string };
  onRegisterWarga: (name: string, email: string, nik: string, pass: string) => Promise<{ success: boolean; error?: string }> | any;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginWarga,
  onLoginAdmin,
  onRegisterWarga,
}) => {
  // Tabs: 'warga' | 'admin'
  const [activeRole, setActiveRole] = React.useState<'warga' | 'admin'>('warga');
  // Citizen modes: 'login' | 'register'
  const [wargaMode, setWargaMode] = React.useState<'login' | 'register'>('login');

  // Input states
  const [email, setEmail] = React.useState('warga@civicinsight.id');
  const [password, setPassword] = React.useState('warga123');
  const [adminUser, setAdminUser] = React.useState('admin');
  const [adminPass, setAdminPass] = React.useState('admin123');

  // Register states
  const [regName, setRegName] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regNik, setRegNik] = React.useState('');
  const [regPass, setRegPass] = React.useState('');

  // Password visibility
  const [showPassword, setShowPassword] = React.useState(false);

  // Status and notifications
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleWargaLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Harap isi seluruh formulir login!');
      return;
    }

    const res = await onLoginWarga(email.trim().toLowerCase(), password);
    if (!res.success) {
      setErrorMsg(res.error || 'Email atau kata sandi salah!');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!adminUser.trim() || !adminPass.trim()) {
      setErrorMsg('Harap isi username dan password pengurus!');
      return;
    }

    const res = onLoginAdmin(adminUser.trim(), adminPass);
    if (!res.success) {
      setErrorMsg(res.error || 'Username atau password salah!');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!regName.trim() || !regEmail.trim() || !regNik.trim() || !regPass.trim()) {
      setErrorMsg('Harap lengkapi semua bidang registrasi!');
      return;
    }

    if (isNaN(Number(regNik.trim()))) {
      setErrorMsg('NIK harus berupa angka saja!');
      return;
    }

    const res = await onRegisterWarga(regName.trim(), regEmail.trim().toLowerCase(), regNik.trim(), regPass);
    if (res.success) {
      setSuccessMsg(
        'Registrasi Berhasil! Akun Anda saat ini PENDING. Silakan melapor langsung ke Pak RT/RW setempat untuk disetujui (approve) sebelum masuk ke dashboard.'
      );
      // Reset registration form
      setRegName('');
      setRegEmail('');
      setRegNik('');
      setRegPass('');
      // Switch back to login
      setWargaMode('login');
    } else {
      setErrorMsg(res.error || 'Registrasi gagal. Email atau NIK mungkin sudah digunakan!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-100 p-4 font-sans select-none antialiased">
      {/* Container Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 sm:p-8 space-y-6 animate-fade-in relative overflow-hidden">
        {/* Glow element */}
        <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${
          activeRole === 'admin' ? 'bg-blue-500' : 'bg-teal-500'
        }`} />

        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-2 select-none z-10 relative">
          <img src={logoImg} alt="CivicInsight AI Logo" className="h-16 w-auto object-contain animate-pulse-slow" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
            CivicInsight <span className="text-teal-650">AI</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold max-w-[280px]">
            Portal Kependudukan Mandiri RT 04 / RW 02
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/50 text-xs font-bold relative z-10 select-none">
          <button
            type="button"
            onClick={() => {
              setActiveRole('warga');
              clearMessages();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeRole === 'warga'
                ? 'bg-white text-teal-800 shadow-sm border border-teal-100/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={14} className={activeRole === 'warga' ? 'text-teal-650' : ''} />
            Layanan Warga
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              clearMessages();
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-white text-blue-800 shadow-sm border border-blue-100/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield size={14} className={activeRole === 'admin' ? 'text-blue-650' : ''} />
            Panel Pengurus
          </button>
        </div>

        {/* Error and Success Notices */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs font-medium animate-fade-in">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-950 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs font-bold animate-fade-in">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-normal">{successMsg}</span>
          </div>
        )}

        {/* Auth Forms */}
        <div className="relative z-10">
          {activeRole === 'warga' ? (
            /* ======================== CITIZEN AUTH FORM ======================== */
            wargaMode === 'login' ? (
              /* CITIZEN LOGIN */
              <form onSubmit={handleWargaLoginSubmit} autoComplete="off" className="space-y-4 animate-fade-in">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email Warga:</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-100"
                        autoComplete="off"
                      />
                      <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kata Sandi:</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-100"
                        autoComplete="off"
                      />
                      <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-650"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-xs flex items-center justify-center gap-1.5"
                >
                  <LogIn size={15} />
                  Masuk Portal Warga
                </button>

                <div className="text-center pt-2 text-xs font-medium text-slate-500 select-none">
                  Belum punya akun warga?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setWargaMode('register');
                      clearMessages();
                    }}
                    className="text-teal-600 hover:text-teal-855 font-bold hover:underline cursor-pointer"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </form>
            ) : (
              /* CITIZEN REGISTER */
              <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-4 animate-fade-in">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap Anda:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-100"
                        autoComplete="off"
                      />
                      <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Alamat Email:</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="contoh@warga.com"
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-100"
                        autoComplete="off"
                      />
                      <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nomor NIK KTP Anda:</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={regNik}
                        onChange={(e) => setRegNik(e.target.value)}
                        placeholder="16 digit angka NIK"
                        maxLength={16}
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-100"
                        autoComplete="off"
                      />
                      <CreditCard size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Buat Kata Sandi:</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="Kata sandi minimal 6 karakter"
                        className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-slate-100"
                        autoComplete="off"
                      />
                      <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UserPlus size={15} />
                  Kirim Registrasi Warga
                </button>

                <div className="text-center pt-2 text-xs font-medium text-slate-500 select-none">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setWargaMode('login');
                      clearMessages();
                    }}
                    className="text-teal-600 hover:text-teal-850 font-bold hover:underline cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </div>
              </form>
            )
          ) : (
            /* ======================== ADMIN AUTH FORM ======================== */
            <form onSubmit={handleAdminLoginSubmit} autoComplete="off" className="space-y-4 animate-fade-in">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Username Pengurus:</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      placeholder="Masukkan username..."
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-100"
                      autoComplete="off"
                    />
                    <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kata Sandi Pengurus:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-100"
                      autoComplete="off"
                    />
                    <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-650"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 font-bold select-none leading-normal">
                <span>Akses Pengurus RT/RW dibatasi secara mutlak untuk ketua RT/RW dan sekretaris penanggung jawab.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-xs flex items-center justify-center gap-1.5"
              >
                <LogIn size={15} />
                Masuk Sistem Pengurus
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
