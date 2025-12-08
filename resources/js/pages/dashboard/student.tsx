import { Head, Link, router } from '@inertiajs/react';
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
  teacher: {
    name: string;
  };
  class: {
    name: string;
  };
}

interface Reservation {
  id: number;
  timeblock: {
    id: number;
    start_time: string;
    end_time: string;
    location: string;
    teacher: {
      name: string;
    };
    class: {
      name: string;
    };
  };
}

interface Summary {
  id: number;
  status: string;
  content: string;
  feedback?: string;
  timeblock: {
    start_time: string;
    teacher: {
      name: string;
    };
    class: {
      name: string;
    };
  };
}

interface Props {
  auth: { user: User };
  availableTimeblocks: Timeblock[];
  upcomingReservations: Reservation[];
  recentSummaries: Summary[];
}

export default function StudentDashboard({ auth, availableTimeblocks, upcomingReservations, recentSummaries }: Props) {
  const getSummaryBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleReserve = (timeblockId: number) => {
    router.post('/reservations', { timeblock_id: timeblockId });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">Welkom, {auth.user.name}</h2>
            <p className="text-gray-700 mt-2 text-lg">Plan je studiegesprekken</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Beschikbare Tijdblokken">
              {availableTimeblocks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Geen beschikbare tijdblokken</p>
              ) : (
                <div className="space-y-3">
                  {availableTimeblocks.slice(0, 5).map((timeblock) => (
                    <div key={timeblock.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{timeblock.class.name}</p>
                          <p className="text-sm text-gray-600">Docent: {timeblock.teacher.name}</p>
                          <p className="text-sm text-gray-600">{timeblock.location}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(timeblock.start_time).toLocaleString('nl-NL')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleReserve(timeblock.id)}
                        >
                          Reserveren
                        </Button>
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

            <Card title="Mijn Reserveringen">
              {upcomingReservations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Geen reserveringen</p>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{reservation.timeblock.class.name}</p>
                          <p className="text-sm text-gray-600">Docent: {reservation.timeblock.teacher.name}</p>
                          <p className="text-sm text-gray-600">{reservation.timeblock.location}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(reservation.timeblock.start_time).toLocaleString('nl-NL')}
                          </p>
                        </div>
                        <Badge variant="success">Gereserveerd</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/reservations"
                className="block text-center text-gray-600 hover:text-gray-700 font-medium mt-4"
              >
                Alle reserveringen →
              </Link>
            </Card>
          </div>

          <Card title="Recente Verslagen">
            {recentSummaries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nog geen verslagen geschreven</p>
            ) : (
              <div className="space-y-3">
                {recentSummaries.map((summary) => (
                  <div key={summary.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{summary.timeblock.class.name}</p>
                        <p className="text-sm text-gray-600">Docent: {summary.timeblock.teacher.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(summary.timeblock.start_time).toLocaleDateString('nl-NL')}
                        </p>
                        {summary.feedback && (
                          <p className="text-sm text-gray-700 mt-2 italic">Feedback: {summary.feedback}</p>
                        )}
                      </div>
                      {getSummaryBadge(summary.status)}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/timeblocks" className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900">Tijdblokken</h3>
              <p className="text-sm text-gray-700 mt-1">Bekijk beschikbare tijdblokken</p>
            </Link>
            <Link href="/reservations" className="block p-6 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <h3 className="font-semibold">Reservaties</h3>
              <p className="text-sm text-gray-600 mt-1">Bekijk je reservaties</p>
            </Link>
            <Link href="/summaries" className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900">Verslagen</h3>
              <p className="text-sm text-gray-700 mt-1">Schrijf en bekijk verslagen</p>
            </Link>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
