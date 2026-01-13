import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Reservation {
  id: number;
  status: string;
  timeblock: {
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
  };
}

interface Props {
  auth: { user: User };
  reservations: Reservation[];
}

export default function ReservationsIndex({ auth, reservations }: Props) {
  const handleCancel = (id: number) => {
    if (confirm('Weet je zeker dat je deze reservering wilt annuleren?')) {
      router.delete(`/reservations/${id}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const isPastReservation = (startTime: string) => {
    return new Date(startTime) < new Date();
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Mijn Reserveringen" />

      <div className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Mijn Reserveringen</h2>

          {reservations.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">Je hebt nog geen reserveringen</p>
              <div className="text-center mt-4">
                <Button onClick={() => router.visit('/timeblocks')}>
                  Bekijk Beschikbare Tijdblokken
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="sm:hidden space-y-4">
                {reservations.map((reservation) => {
                  const isPast = isPastReservation(reservation.timeblock.start_time);
                  return (
                    <Card key={reservation.id} className="!p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-semibold text-gray-900">{reservation.timeblock.class.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {getStatusBadge(reservation.status)}
                          {isPast && <Badge variant="default">Voltooid</Badge>}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {new Date(reservation.timeblock.start_time).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span>
                            {new Date(reservation.timeblock.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(reservation.timeblock.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {reservation.timeblock.teacher.name} • {reservation.timeblock.location}
                        </div>
                      </div>
                      {!isPast && reservation.status === 'confirmed' && (
                        <button 
                          onClick={() => handleCancel(reservation.id)}
                          className="mt-3 w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Annuleren
                        </button>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden sm:block bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum & Tijd</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klas & Docent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locatie</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((reservation) => {
                        const isPast = isPastReservation(reservation.timeblock.start_time);
                        return (
                          <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(reservation.timeblock.start_time).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(reservation.timeblock.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(reservation.timeblock.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{reservation.timeblock.class.name}</div>
                              <div className="text-xs text-gray-500">{reservation.timeblock.teacher.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {reservation.timeblock.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(reservation.status)}
                                {isPast && <Badge variant="default">Voltooid</Badge>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {!isPast && reservation.status === 'confirmed' && (
                                <button 
                                  onClick={() => handleCancel(reservation.id)}
                                  className="text-red-600 hover:text-red-900 font-medium"
                                >
                                  Annuleren
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
