import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    return (
        <AuthLayout
            title="Welkom bij StudieLog"
            description="Log in met je school account om verder te gaan"
        >
            <Head title="Log in" />

            <div className="flex flex-col gap-6">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full py-6 text-lg"
                    onClick={() => window.location.href = '/auth/microsoft/redirect'}
                >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 23 23">
                        <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                        <path fill="#f35325" d="M1 1h10v10H1z"/>
                        <path fill="#81bc06" d="M12 1h10v10H12z"/>
                        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                        <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                    Inloggen met Microsoft
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    <p>Geen account?</p>
                    <p>Vraag je docent om een uitnodiging.</p>
                </div>
            </div>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
