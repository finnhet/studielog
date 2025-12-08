import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
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
  reservation?: {
    student: {
      name: string;
    };
  };
}

interface Props {
  auth: { user: User };
  timeblocks: Timeblock[];
  weekStart: string;
}

export default function AgendaIndex({ auth, timeblocks, weekStart }: Props) {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(weekStart));

  const weekDays = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
  
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    
    router.get('/agenda', {
      week: newDate.toISOString().split('T')[0],
    });
  };

  const goToToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    router.get('/agenda', {
      week: monday.toISOString().split('T')[0],
    });
  };

  const getTimeblocksForDay = (date: Date) => {
    return timeblocks.filter(tb => {
      const tbDate = new Date(tb.start_time);
      return (
        tbDate.getFullYear() === date.getFullYear() &&
        tbDate.getMonth() === date.getMonth() &&
        tbDate.getDate() === date.getDate()
      );
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default' | 'danger'> = {
      available: 'success',
      reserved: 'warning',
      completed: 'default',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleReserve = (timeblockId: number) => {
    router.post('/reservations', { timeblock_id: timeblockId });
  };

  const isStudent = auth.user.role === 'student';

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Agenda" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-gray-900">
              Agenda
            </h2>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" onClick={() => navigateWeek(-1)}>
                ← Vorige Week
              </Button>
              <Button size="sm" onClick={goToToday}>
                Vandaag
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigateWeek(1)}>
                Volgende Week →
              </Button>
            </div>
          </div>

          <Card className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Week van {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
            </h3>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDates.map((date, index) => {
              const dayTimeblocks = getTimeblocksForDay(date);
              const today = isToday(date);

              return (
                <div key={index} className="flex flex-col">
                  <Card className={`mb-2 ${today ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="text-center">
                      <h3 className={`font-bold ${today ? 'text-gray-700' : 'text-gray-900'}`}>
                        {weekDays[index]}
                      </h3>
                      <p className={`text-sm ${today ? 'text-gray-700 font-semibold' : 'text-gray-600'}`}>
                        {date.getDate()} {date.toLocaleDateString('nl-NL', { month: 'short' })}
                      </p>
                    </div>
                  </Card>

                  <div className="space-y-2 flex-1">
                    {dayTimeblocks.length === 0 ? (
                      <Card className="h-full">
                        <p className="text-gray-400 text-sm text-center py-4">Geen tijdblokken</p>
                      </Card>
                    ) : (
                      dayTimeblocks.map((timeblock) => (
                        <Card key={timeblock.id} className="hover:shadow-lg transition-shadow">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-bold text-gray-700">
                                    {formatTime(timeblock.start_time)}
                                  </span>
                                  <span className="text-xs text-gray-500">-</span>
                                  <span className="text-sm font-bold text-gray-700">
                                    {formatTime(timeblock.end_time)}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {timeblock.class.name}
                                </h4>
                                <p className="text-xs text-gray-600">{timeblock.teacher.name}</p>
                                <p className="text-xs text-gray-500">📍 {timeblock.location}</p>
                              </div>
                              <div>
                                {getStatusBadge(timeblock.status)}
                              </div>
                            </div>

                            {timeblock.reservation && (
                              <div className="bg-gray-50 p-2 rounded text-xs">
                                <p className="text-gray-800">
                                  👤 {timeblock.reservation.student.name}
                                </p>
                              </div>
                            )}

                            {isStudent && timeblock.status === 'available' && (
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleReserve(timeblock.id)}
                              >
                                Reserveren
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
