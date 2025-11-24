import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Timeblock {
  id: number;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  class: {
    name: string;
  };
  reservation?: {
    student: {
      name: string;
    };
  };
}

interface Summary {
  id: number;
  status: string;
  student: {
    name: string;
  };
  timeblock: {
    start_time: string;
    class: {
      name: string;
    };
  };
}

interface Props {
  auth: { user: User };
  upcomingTimeblocks: Timeblock[];
  pendingSummaries: Summary[];
  stats: {
    totalTimeblocks: number;
    totalReservations: number;
    pendingSummaries: number;
  };
}

export default function TeacherDashboard({ auth, upcomingTimeblocks, pendingSummaries, stats }: Props) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default'> = {
      available: 'success',
      reserved: 'warning',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welkom, {auth.user.name}!</h2>
              <p className="text-gray-700 mt-2 text-lg">Overzicht van je studiegesprekken</p>
            </div>
            <Button onClick={() => window.location.href = '/microsoft/redirect'}>
              📅 Koppel Outlook
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium">Totaal Tijdblokken</p>
                <p className="text-5xl font-bold text-gray-900 mt-2">{stats.totalTimeblocks}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium">Reserveringen</p>
                <p className="text-5xl font-bold text-gray-900 mt-2">{stats.totalReservations}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 text-sm font-medium">Te beoordelen</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mt-2">{stats.pendingSummaries}</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Aankomende Tijdblokken">
              {upcomingTimeblocks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Geen aankomende tijdblokken</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTimeblocks.map((timeblock) => (
                    <div key={timeblock.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{timeblock.class.name}</p>
                          <p className="text-sm text-gray-600">{timeblock.location}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(timeblock.start_time).toLocaleString('nl-NL')}
                          </p>
                          {timeblock.reservation && (
                            <p className="text-sm text-gray-600 mt-1">
                              Student: {timeblock.reservation.student.name}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(timeblock.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/timeblocks"
                className="block text-center text-gray-600 hover:text-gray-700 font-medium mt-4"
              >
                Alle tijdblokken →
              </Link>
            </Card>

            <Card title="Verslagen te beoordelen">
              {pendingSummaries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Geen verslagen te beoordelen</p>
              ) : (
                <div className="space-y-3">
                  {pendingSummaries.map((summary) => (
                    <div key={summary.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{summary.student.name}</p>
                          <p className="text-sm text-gray-600">{summary.timeblock.class.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(summary.timeblock.start_time).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <Badge variant="warning">pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/summaries"
                className="block text-center text-gray-600 hover:text-gray-700 font-medium mt-4"
              >
                Alle verslagen →
              </Link>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/timeblocks" className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900">Tijdblokken</h3>
              <p className="text-sm text-gray-700 mt-1">Beheer je tijdblokken</p>
            </Link>
            <Link href="/classes" className="block p-6 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <h3 className="font-semibold">Klassen</h3>
              <p className="text-sm text-gray-600 mt-1">Beheer je klassen</p>
            </Link>
            <Link href="/locations" className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900">Vestigingen</h3>
              <p className="text-sm text-gray-700 mt-1">Beheer vestigingen</p>
            </Link>
            <Link href="/summaries" className="block p-6 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <h3 className="font-semibold text-orange-900">Verslagen</h3>
              <p className="text-sm text-orange-700 mt-1">Beoordeel verslagen</p>
            </Link>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
