import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Calendar, ChevronDown } from 'lucide-react';
import { PremiumLoader } from '../ui/PremiumLoader';
import { Link } from 'react-router-dom';

interface AuthFormProps {
    mode: 'login' | 'signup';
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, isLoading = false }) => {
    const [form, setForm] = useState({
        name: '',
        gender: '',
        birthDate: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (mode === 'signup') {
            if (!form.name) newErrors.name = 'Nama lengkap wajib diisi';
            if (!form.gender) newErrors.gender = 'Jenis kelamin wajib dipilih';
            if (!form.birthDate) newErrors.birthDate = 'Tanggal lahir wajib diisi';
        }
        if (!form.email) newErrors.email = 'Email wajib diisi';
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Format email tidak valid';

        if (!form.password) newErrors.password = 'Password wajib diisi';
        else if (form.password.length < 6) newErrors.password = 'Password minimal 6 karakter';

        if (mode === 'signup' && form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(form);
        }
    };

    const inputClasses = (field: string) => `
        w-full bg-white/5 border ${errors[field] ? 'border-rose-500/50' : 'border-white/10'} 
        rounded-2xl px-12 py-4 text-white font-medium 
        focus:outline-none focus:ring-2 ${errors[field] ? 'focus:ring-rose-500/20' : 'focus:ring-premium-accent/20'} 
        focus:border-premium-accent/50 transition-all duration-300 placeholder:text-white/20 appearance-none
    `;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
                {mode === 'signup' && (
                    <div className="space-y-4">
                        <m.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative"
                        >
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="text"
                                placeholder="Nama Lengkap"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className={inputClasses('name')}
                            />
                            {errors.name && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.name}</p>}
                        </m.div>

                        <m.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <select
                                value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                className={`${inputClasses('gender')} cursor-pointer`}
                            >
                                <option value="" disabled className="bg-slate-900 text-white/20">Jenis Kelamin</option>
                                <option value="male" className="bg-slate-900 text-white">Laki-laki</option>
                                <option value="female" className="bg-slate-900 text-white">Perempuan</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                            {errors.gender && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.gender}</p>}
                        </m.div>

                        <m.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                        >
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="date"
                                value={form.birthDate}
                                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                                className={`${inputClasses('birthDate')} cursor-pointer`}
                                style={{ colorScheme: 'dark' }}
                            />
                            {errors.birthDate && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.birthDate}</p>}
                        </m.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                    type="email"
                    placeholder="Alamat Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClasses('email')}
                />
                {errors.email && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.email}</p>}
            </div>

            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inputClasses('password')}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.password}</p>}
            </div>

            {mode === 'signup' && (
                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="relative"
                >
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Konfirmasi Password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className={inputClasses('confirmPassword')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {errors.confirmPassword && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-4">{errors.confirmPassword}</p>}
                </m.div>
            )}

            {mode === 'login' && (
                <div className="flex justify-end px-2">
                    <Link to="/forgot-password" className="text-xs font-bold text-premium-accent hover:text-premium-accent-light transition-colors uppercase tracking-widest cursor-pointer">
                        Lupa Password?
                    </Link>
                </div>
            )}

            <m.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-slate-50 transition-all disabled:opacity-50 group mt-6"
            >
                {isLoading ? (
                    <PremiumLoader variant="inline" size="sm" color="#0f172a" />
                ) : (
                    <>
                        {mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </m.button>
        </form>
    );
};
