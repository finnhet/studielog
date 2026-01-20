import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen
} from 'lucide-react';

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
  const [selectedTimeblock, setSelectedTimeblock] = useState<Timeblock | null>(null);

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const statusConfig: Record<string, { 
    bg: string; 
    border: string; 
    text: string; 
    hover: string;
    dot: string;
    label: string;
    icon: typeof CheckCircle;
  }> = {
    available: { 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700', 
      hover: 'hover:bg-emerald-100 hover:border-emerald-300',
      dot: 'bg-emerald-500',
      label: 'Beschikbaar',
      icon: CheckCircle
    },
    reserved: { 
      bg: 'bg-amber-50', 
      border: 'border-amber-200', 
      text: 'text-amber-700', 
      hover: 'hover:bg-amber-100 hover:border-amber-300',
      dot: 'bg-amber-500',
      label: 'Gereserveerd',
      icon: AlertCircle
    },
    completed: { 
      bg: 'bg-slate-50', 
      border: 'border-slate-200', 
      text: 'text-slate-600', 
      hover: 'hover:bg-slate-100 hover:border-slate-300',
      dot: 'bg-slate-400',
      label: 'Voltooid',
      icon: BookOpen
    },
    cancelled: { 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      text: 'text-red-700', 
      hover: 'hover:bg-red-100 hover:border-red-300',
      dot: 'bg-red-500',
      label: 'Geannuleerd',
      icon: XCircle
    },
  };

  const getStatusClasses = (status: string) => {
    const config = statusConfig[status] || statusConfig.available;
    return `${config.bg} ${config.border} ${config.text} ${config.hover}`;
  };

  const getStatusDot = (status: string) => {
    return statusConfig[status]?.dot || 'bg-blue-500';
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
    setSelectedTimeblock(null);
  };

  const isStudent = auth.user.role === 'student';

  
  const sortedTimeblocks = useMemo(() => {
    return [...timeblocks].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [timeblocks]);

  
  const groupedTimeblocks = useMemo(() => {
    const groups: Record<string, Timeblock[]> = {};
    sortedTimeblocks.forEach(tb => {
      const dateKey = new Date(tb.start_time).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tb);
    });
    return groups;
  }, [sortedTimeblocks]);

  const TimeblockCard = ({ timeblock, compact = false }: { timeblock: Timeblock; compact?: boolean }) => {
    const StatusIcon = statusConfig[timeblock.status]?.icon || CheckCircle;
    
    return (
      <div
        className={`rounded-xl border-l-4 p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] ${getStatusClasses(timeblock.status)}`}
        style={{ borderLeftColor: getStatusDot(timeblock.status).replace('bg-', '') }}
        onClick={() => setSelectedTimeblock(timeblock)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm sm:text-base truncate">{timeblock.class.name}</div>
            {!compact && (
              <>
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm opacity-80">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatTime(timeblock.start_time)} - {formatTime(timeblock.end_time)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm opacity-80">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{timeblock.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm opacity-80">
                  <User className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{timeblock.teacher.name}</span>
                </div>
              </>
            )}
            {compact && (
              <div className="text-xs sm:text-sm opacity-80 mt-1">
                {formatTime(timeblock.start_time)} - {formatTime(timeblock.end_time)}
              </div>
            )}
          </div>
          <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ring-2 ring-white shadow-sm ${getStatusDot(timeblock.status)}`} />
        </div>
        {timeblock.reservation && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{timeblock.reservation.student.name}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderListView = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>
      <div className="flex-1 p-4 sm:p-6 scrollbar-thin" style={{ overflow: 'auto' }}>
        {Object.keys(groupedTimeblocks).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-gray-400">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 opacity-50" />
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-500">Geen tijdblokken deze week</p>
            <p className="text-sm sm:text-base text-gray-400 mt-1">Probeer een andere week te selecteren</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {Object.entries(groupedTimeblocks).map(([dateStr, dayBlocks]) => {
              const date = new Date(dateStr);
              return (
                <div key={dateStr}>
                  <div className={`flex items-center gap-3 mb-3 sm:mb-4 pb-3 border-b-2 ${isToday(date) ? 'border-indigo-200' : 'border-gray-100'}`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm ${
                      isToday(date) ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-base sm:text-lg ${isToday(date) ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {date.toLocaleDateString('nl-NL', { weekday: 'long' })}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    {isToday(date) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-indigo-100 text-indigo-700 shadow-sm">
                        Vandaag
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {dayBlocks.map((timeblock) => (
                      <TimeblockCard key={timeblock.id} timeblock={timeblock} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Agenda" />

      <div className="flex flex-col">
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Agenda
                </h2>
                <p className="text-sm sm:text-base text-gray-500 mt-1 ml-11 sm:ml-[52px]">
                  {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Navigation */}
                <div className="flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                  <button 
                    onClick={() => navigateWeek(-1)} 
                    className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                    title="Vorige week"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={goToToday} 
                    className="px-4 sm:px-5 py-1.5 sm:py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors active:scale-95"
                  >
                    Vandaag
                  </button>
                  <button 
                    onClick={() => navigateWeek(1)} 
                    className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                    title="Volgende week"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Legend - scrollable on mobile */}
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 scrollbar-hide">
              {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2 whitespace-nowrap">
                  <div className={`w-3 h-3 rounded-full shadow-sm ring-2 ring-white ${config.dot}`} />
                  <span className="text-gray-600 font-medium">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* List View */}
          {renderListView()}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={selectedTimeblock !== null}
        onClose={() => setSelectedTimeblock(null)}
        title="Tijdblok Details"
        size="md"
      >
        {selectedTimeblock && (
          <div className="space-y-4 sm:space-y-6">
            {/* Status badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${statusConfig[selectedTimeblock.status]?.bg} ${statusConfig[selectedTimeblock.status]?.text} border ${statusConfig[selectedTimeblock.status]?.border}`}
              >
                {statusConfig[selectedTimeblock.status]?.label || selectedTimeblock.status}
              </span>
              {isStudent && selectedTimeblock.status === 'available' && (
                <span className="text-xs sm:text-sm text-emerald-600 font-medium">Beschikbaar voor reservering</span>
              )}
            </div>

            {/* Class name */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{selectedTimeblock.class.name}</h3>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Tijd</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">
                    {formatTime(selectedTimeblock.start_time)} - {formatTime(selectedTimeblock.end_time)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Datum</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">
                    {new Date(selectedTimeblock.start_time).toLocaleDateString('nl-NL', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Locatie</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">{selectedTimeblock.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 sm:p-2 bg-white rounded-lg shadow-sm">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Docent</div>
                  <div className="font-semibold text-sm sm:text-base text-gray-900">{selectedTimeblock.teacher.name}</div>
                </div>
              </div>
            </div>

            {/* Reservation info */}
            {selectedTimeblock.reservation && (
              <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-1 text-sm">
                  <User className="w-4 h-4" />
                  Gereserveerd door
                </div>
                <div className="text-base sm:text-lg font-bold text-amber-800">
                  {selectedTimeblock.reservation.student.name}
                </div>
              </div>
            )}

            {/* Action button */}
            {isStudent && selectedTimeblock.status === 'available' && (
              <Button
                onClick={() => handleReserve(selectedTimeblock.id)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Reserveer dit tijdblok
              </Button>
            )}
          </div>
        )}
      </Modal>
    </AuthenticatedLayout>
  );
}
