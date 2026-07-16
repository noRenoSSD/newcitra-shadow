import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";

const BG_IMAGES = [
    '/images/bg/1.webp',
    '/images/bg/2.webp',
    '/images/bg/3.webp',
    '/images/bg/4.webp',
];

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        // Preload images to prevent flickering
        BG_IMAGES.forEach((src) => {
            const img = new Image();
            img.src = src;
        });

        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % BG_IMAGES.length);
        }, 5000); // Ganti foto tiap 5 detik
        return () => clearInterval(interval);
    }, []);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 sm:p-12">
            <Head title="Log in" />

            {/* Background Image Slider */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 bg-gray-900">
                {BG_IMAGES.map((img, index) => (
                    <div
                        key={img}
                        className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                            index === currentBg ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{ 
                            backgroundImage: `url(${img})`, 
                            filter: 'blur(8px)', 
                            transform: 'scale(1.05)' // Menutupi tepian putih dari efek blur
                        }}
                    ></div>
                ))}
                {/* Overlay gelap agar form tetap terbaca */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
            </div>

            {/* Floating Card Container */}
            <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-white/50">
                
                {/* Left Side - Branding (Red) */}
                <div className="w-full lg:w-5/12 bg-linear-to-br from-red-800 to-red-600 p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden text-white">
                    {/* Inner Card Decorative Elements */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-900 rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-400 rounded-full mix-blend-overlay filter blur-2xl opacity-50"></div>
                    
                    <div className="relative z-10">
                        {/* Logo / Text Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                                CV. <span className="text-yellow-400">New Citra</span>
                            </h1>
                            <div className="w-16 h-1.5 bg-yellow-400 rounded-full mt-6 mb-8"></div>
                        </div>
                        
                        {/* Typography Improved */}
                        <p className="text-red-50 text-base lg:text-lg leading-relaxed font-medium opacity-90">
                            Sistem Informasi Manajemen Terpadu untuk mengelola Produksi, Pembelian, Penjualan, dan Akuntansi dengan lebih efisien dan modern.
                        </p>
                    </div>

                    <div className="relative z-10 mt-16 text-sm text-red-200/80 font-medium">
                        &copy; {new Date().getFullYear()} CV. New Citra.
                    </div>
                </div>

                {/* Right Side - Form (White) */}
                <div className="w-full lg:w-7/12 p-10 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="w-full max-w-md mx-auto space-y-8">
                        <div className="text-left mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Selamat Datang 👋</h2>
                            <p className="text-gray-500 text-sm font-medium">Silakan masukkan kredensial Anda untuk mengakses sistem.</p>
                        </div>

                        {status && (
                            <div className="mb-4 p-3 rounded-lg bg-green-50 text-sm font-medium text-green-600 border border-green-200">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-bold mb-1.5 block text-sm" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData("email", e.target.value)}
                                    placeholder="akuntansi@newcitra.com"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-bold block text-sm" />
                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            Lupa Password?
                                        </Link>
                                    )}
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-sm"
                                    autoComplete="current-password"
                                    onChange={(e) => setData("password", e.target.value)}
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center pt-2">
                                <Checkbox
                                    name="remember"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                    className="rounded text-red-600 focus:ring-red-500 border-gray-300 shadow-sm"
                                />
                                <label htmlFor="remember" className="ms-2 text-sm text-gray-600 font-semibold cursor-pointer">
                                    Ingat Saya
                                </label>
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {processing ? 'Memverifikasi...' : 'Masuk Sekarang'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

Login.layout = (page: React.ReactNode) => <>{page}</>;
