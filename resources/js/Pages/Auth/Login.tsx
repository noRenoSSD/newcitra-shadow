import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
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
        <div className="min-h-screen flex bg-gray-50">
            <Head title="Log in" />

            {/* Left Side - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-red-900 to-red-700 p-12 text-white flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="z-10">
                    <img 
                        src="/images/logo-citra.jpg" 
                        alt="Logo CV New Citra" 
                        className="w-24 h-24 rounded-2xl shadow-lg mb-8 object-cover border-4 border-white/20 bg-white" 
                        onError={(e) => {
                            // Fallback jika logo tidak ada
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        CV. <span className="text-yellow-400">New Citra</span>
                    </h1>
                    <p className="text-xl text-red-100 font-light leading-relaxed max-w-lg">
                        Sistem Informasi Manajemen Terpadu untuk mengelola Produksi, Pembelian, Penjualan, dan Akuntansi dengan lebih efisien dan modern.
                    </p>
                </div>
                
                <div className="z-10 text-sm text-red-200/80 font-medium">
                    &copy; {new Date().getFullYear()} CV. New Citra. All rights reserved.
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute top-0 -left-4 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang 👋</h2>
                        <p className="text-gray-500 text-sm">Silakan masukkan kredensial Anda untuk mengakses sistem.</p>
                    </div>

                    {status && (
                        <div className="mb-4 p-4 rounded-lg bg-green-50 text-sm font-medium text-green-600 border border-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-semibold mb-2 block" />
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
                            <div className="flex justify-between items-center mb-2">
                                <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-semibold block" />
                                {canResetPassword && (
                                    <Link
                                        href={route("password.request")}
                                        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
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

                        <div className="flex items-center">
                            <Checkbox
                                name="remember"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData("remember", e.target.checked)}
                                className="rounded text-red-600 focus:ring-red-500 border-gray-300 shadow-sm"
                            />
                            <label htmlFor="remember" className="ms-2 text-sm text-gray-600 font-medium cursor-pointer">
                                Ingat Saya
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {processing ? 'Memverifikasi...' : 'Masuk Sekarang'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// loggin tanpa sidebar
Login.layout = (page: React.ReactNode) => <>{page}</>;
