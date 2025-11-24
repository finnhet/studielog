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

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Mijn Reserveringen</h2>

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
            <div className="grid grid-cols-1 gap-4">
              {reservations.map((reservation) => {
                const isPast = isPastReservation(reservation.timeblock.start_time);
                
                return (
                  <Card key={reservation.id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {reservation.timeblock.class.name}
                          </h3>
                          {getStatusBadge(reservation.status)}
                          {isPast && (
                            <Badge variant="default">Voltooid</Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Docent: {reservation.timeblock.teacher.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Locatie: {reservation.timeblock.location}
                          </p>
                          <p className="text-sm text-gray-500">
                            Start: {new Date(reservation.timeblock.start_time).toLocaleString('nl-NL')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Einde: {new Date(reservation.timeblock.end_time).toLocaleString('nl-NL')}
                          </p>
                        </div>
                      </div>
                      {!isPast && reservation.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancel(reservation.id)}
                        >
                          Annuleren
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
