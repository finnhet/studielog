import { dashboard } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welkom bij StudieLog" />
            
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-gray-900">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                            StudieLog
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Jouw persoonlijke studievoortgang en planning in één overzicht.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 justify-center">
                        {auth.user ? (
                            <Link href={dashboard()}>
                                <Button className="w-full py-6 text-lg">
                                    Ga naar Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <a href="/auth/microsoft/redirect">
                                <Button className="w-full py-6 text-lg flex items-center justify-center gap-3">
                                    <svg className="h-6 w-6" viewBox="0 0 23 23">
                                        <path fill="#f35325" d="M1 1h10v10H1z"/>
                                        <path fill="#81bc06" d="M12 1h10v10H12z"/>
                                        <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                                        <path fill="#ffba08" d="M12 12h10v10H12z"/>
                                    </svg>
                                    Inloggen met Microsoft
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
