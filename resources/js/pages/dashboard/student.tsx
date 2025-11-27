import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Calendar, Clock, CheckCircle, AlertCircle, BookOpen, User as UserIcon, MapPin, ArrowRight, X, Check, FileText } from 'lucide-react';

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

interface Invitation {
  id: number;
  name: string;
  creator: {
    name: string;
  };
}

interface MissingSummary {
    id: number; // Reservation ID
    timeblock: {
        id: number;
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
  pendingInvitations: Invitation[];
  missingSummaries: MissingSummary[];
}

export default function StudentDashboard({ auth, availableTimeblocks, upcomingReservations, recentSummaries, pendingInvitations, missingSummaries }: Props) {
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    timeblock_id: 0,
    content: '',
  });

  const openSummaryModal = (timeblockId: number) => {
    setData('timeblock_id', timeblockId);
    setIsSummaryModalOpen(true);
  };

  const closeSummaryModal = () => {
    setIsSummaryModalOpen(false);
    reset();
  };

  const submitSummary = (e: React.FormEvent) => {
    e.preventDefault();
    post('/summaries', {
        onSuccess: () => closeSummaryModal(),
    });
  };

  const getSummaryBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const handleReserve = (timeblockId: number) => {
    if (!confirm('Weet je zeker dat je dit tijdblok wilt reserveren?')) return;
    router.post('/reservations', { timeblock_id: timeblockId });
  };

  const handleAcceptInvitation = (classId: number) => {
    router.post(`/classes/${classId}/invitations/accept`);
  };

  const handleRejectInvitation = (classId: number) => {
    if (confirm('Weet je zeker dat je deze uitnodiging wilt weigeren?')) {
      router.post(`/classes/${classId}/invitations/reject`);
    }
  };

  const stats = {
    available: availableTimeblocks.length,
    upcoming: upcomingReservations.length,
    summaries: recentSummaries.filter(s => s.status === 'pending').length,
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welkom, {auth.user.name}</h2>
            <p className="text-gray-600 mt-2 text-lg">Plan je studiegesprekken en bekijk je laatste updates.</p>
          </div>

          {/* Pending Invitations */}
          {pendingInvitations && pendingInvitations.length > 0 && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <Card className="border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Uitnodigingen voor klassen</h3>
                </div>
                <div className="space-y-3">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between bg-blue-50/50 rounded-xl p-4 border border-blue-100 transition-all hover:bg-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{invitation.name}</div>
                            <div className="text-sm text-gray-500">Uitgenodigd door {invitation.creator.name}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleRejectInvitation(invitation.id)} className="flex items-center gap-1">
                            <X className="w-4 h-4" /> Weigeren
                        </Button>
                        <Button size="sm" onClick={() => handleAcceptInvitation(invitation.id)} className="flex items-center gap-1">
                            <Check className="w-4 h-4" /> Accepteren
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-24 h-24 text-blue-600" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Beschikbare tijdblokken</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                <Badge variant="success">Nu beschikbaar</Badge>
              </div>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-24 h-24 text-orange-600" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Aankomende reserveringen</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-orange-600 font-medium">
                <Badge variant="warning">Eerstvolgende</Badge>
              </div>
            </Card>

            <Card className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle className="w-24 h-24 text-green-600" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Openstaande verslagen</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.summaries}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                <Badge variant="warning">Actie vereist</Badge>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available timeblocks (table) */}
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Beschikbare Tijdblokken</h3>
                </div>
                <Link href="/timeblocks" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                    Alle tijdblokken <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {availableTimeblocks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Geen beschikbare tijdblokken</p>
                    <p className="text-sm text-gray-400 mt-1">Check later nog eens terug</p>
                </div>
              ) : (
                <div className="space-y-3">
                    {availableTimeblocks.slice(0, 5).map(tb => (
                        <div key={tb.id} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white rounded-lg border border-gray-200 shadow-sm group-hover:border-indigo-200 group-hover:shadow-md transition-all">
                                    <span className="text-xs font-bold text-gray-500 uppercase">{new Date(tb.start_time).toLocaleDateString('nl-NL', { weekday: 'short' })}</span>
                                    <span className="text-xl font-bold text-gray-900">{new Date(tb.start_time).getDate()}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(tb.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} - {new Date(tb.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="font-semibold text-gray-900 mb-1">{tb.class.name}</div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {tb.teacher.name}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {tb.location}</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleReserve(tb.id)} className="opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                Reserveren
                            </Button>
                        </div>
                    ))}
                </div>
              )}
            </Card>

            {/* Upcoming reservations */}
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Mijn Reserveringen</h3>
                </div>
                <Link href="/reservations" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                    Bekijk alle <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {upcomingReservations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Geen reserveringen</p>
                    <p className="text-sm text-gray-400 mt-1">Reserveer een tijdblok om te beginnen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{reservation.timeblock.class.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>{new Date(reservation.timeblock.start_time).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {reservation.timeblock.location}</span>
                                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {reservation.timeblock.teacher.name}</span>
                            </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="success">Gereserveerd</Badge>
                        <Link href={`/reservations`} className="text-xs font-medium text-gray-500 hover:text-gray-800">Beheren</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent summaries */}
          <div className="mt-8">
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Recente Verslagen</h3>
                    </div>
                    <Link href="/summaries" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                        Alle verslagen <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recentSummaries.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nog geen verslagen geschreven</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentSummaries.slice(0, 6).map((summary) => (
                    <div key={summary.id} className="flex flex-col justify-between p-5 rounded-xl border border-gray-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="font-bold text-gray-900">{summary.timeblock.class.name}</div>
                                {getSummaryBadge(summary.status)}
                            </div>
                            <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(summary.timeblock.start_time).toLocaleDateString('nl-NL', { dateStyle: 'long' })}
                            </div>
                            {summary.feedback && (
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic mb-4 border border-gray-100">
                                    "{summary.feedback}"
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <UserIcon className="w-3 h-3" />
                                {summary.timeblock.teacher.name}
                            </div>
                            <Link href={`/summaries/${summary.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
                                Bekijk details
                            </Link>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </Card>
          </div>

          {/* Missing Summaries Alert */}
          {missingSummaries && missingSummaries.length > 0 && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <Card className="border-l-4 border-l-orange-500 bg-orange-50/30">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-900">Nog te schrijven verslagen</h3>
                </div>
                <div className="space-y-3">
                  {missingSummaries.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-orange-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">Studiegesprek met {reservation.timeblock.teacher.name}</div>
                            <div className="text-sm text-gray-500">
                                {new Date(reservation.timeblock.start_time).toLocaleDateString('nl-NL')} • {reservation.timeblock.class.name}
                            </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => openSummaryModal(reservation.timeblock.id)} className="bg-orange-600 hover:bg-orange-700 text-white">
                        Schrijf verslag
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Summary Modal */}
      <Modal isOpen={isSummaryModalOpen} onClose={closeSummaryModal} title="Schrijf verslag">
        <form onSubmit={submitSummary} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wat hebben jullie besproken?
                </label>
                <textarea
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[150px]"
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Beschrijf hier kort wat er besproken is tijdens het studiegesprek..."
                    required
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={closeSummaryModal}>
                    Annuleren
                </Button>
                <Button type="submit" disabled={processing}>
                    Opslaan
                </Button>
            </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
