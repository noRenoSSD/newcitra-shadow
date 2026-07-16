import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <div className="p-6 space-y-5">
            <Head title="Ganti Password" />

            <div>
                <h2 className="text-2xl font-bold text-red-800">
                    Ganti Password
                </h2>
                <p className="text-sm text-red-800 mt-1">Perbarui password akun Anda untuk keamanan.</p>
            </div>

            <div className="py-6">
                <div className="mx-auto max-w-7xl">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
