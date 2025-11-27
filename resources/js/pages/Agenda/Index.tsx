import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const weekDays = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  const START_HOUR = 8;
  const END_HOUR = 18;
  const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  
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
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
      reserved: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200',
      completed: 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200',
      cancelled: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200',
    };
    return colors[status] || 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
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

  const getPositionStyles = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;
    
    const top = (startHour - START_HOUR) * 60; // 60px per hour
    const height = (endHour - startHour) * 60;
    
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Agenda" />

      <div className="py-8 h-[calc(100vh-65px)] flex flex-col">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Agenda
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-medium text-gray-600">
                {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
              </span>
              <div className="flex space-x-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button onClick={() => navigateWeek(-1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={goToToday} className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded">
                  Vandaag
                </button>
                <button onClick={() => navigateWeek(1)} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 border-r border-gray-200 bg-gray-50"></div>
              {weekDates.map((date, index) => (
                <div 
                  key={index} 
                  className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday(date) ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className={`text-xs font-medium uppercase mb-1 ${
                    isToday(date) ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {weekDays[index]}
                  </div>
                  <div className={`text-xl font-bold ${
                    isToday(date) ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto relative">
              <div className="grid grid-cols-8 min-h-[600px]">
                {/* Time Column */}
                <div className="border-r border-gray-200 bg-gray-50">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-[60px] border-b border-gray-100 relative">
                      <span className="absolute -top-3 right-2 text-xs text-gray-400">
                        {hour}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
                {weekDates.map((date, index) => {
                  const dayTimeblocks = getTimeblocksForDay(date);
                  
                  return (
                    <div key={index} className="border-r border-gray-200 last:border-r-0 relative bg-white">
                      {/* Grid lines */}
                      {HOURS.map((hour) => (
                        <div key={hour} className="h-[60px] border-b border-gray-100"></div>
                      ))}

                      {/* Events */}
                      {dayTimeblocks.map((timeblock) => (
                        <div
                          key={timeblock.id}
                          className={`absolute left-1 right-1 rounded p-2 text-xs border cursor-pointer transition-all hover:z-10 hover:shadow-md overflow-hidden ${getStatusColor(timeblock.status)}`}
                          style={getPositionStyles(timeblock.start_time, timeblock.end_time)}
                          onClick={() => {
                            if (isStudent && timeblock.status === 'available') {
                              if (confirm('Wil je dit tijdblok reserveren?')) {
                                handleReserve(timeblock.id);
                              }
                            }
                          }}
                        >
                          <div className="font-bold truncate">
                            {timeblock.class.name}
                          </div>
                          <div className="truncate text-opacity-75">
                            {formatTime(timeblock.start_time)} - {formatTime(timeblock.end_time)}
                          </div>
                          <div className="truncate text-opacity-75">
                            {timeblock.teacher.name}
                          </div>
                          {timeblock.reservation && (
                            <div className="mt-1 pt-1 border-t border-black/10 truncate font-medium">
                              {timeblock.reservation.student.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
