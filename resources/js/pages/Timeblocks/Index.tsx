import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ClassItem {
  id: number;
  name: string;
}

interface Timeblock {
  id: number;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  class: ClassItem;
  teacher?: {
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
  classes: ClassItem[];
}

export default function TimeblocksIndex({ auth, timeblocks, classes }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTimeblock, setEditingTimeblock] = useState<Timeblock | null>(null);

  // Local state for date/time pickers
  const [createDate, setCreateDate] = useState('');
  const [createStartTime, setCreateStartTime] = useState('');
  const [createEndTime, setCreateEndTime] = useState('');

  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  const isTeacher = auth.user.role === 'teacher';

  const createForm = useForm({
    class_id: '',
    start_time: '',
    end_time: '',
    location: '',
    duration: '15',
  });

  const editForm = useForm({
    class_id: '',
    start_time: '',
    end_time: '',
    location: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure the form data is synced before submit
    const start = `${createDate}T${createStartTime}`;
    const end = `${createDate}T${createEndTime}`;
    
    createForm.transform((data) => ({
      ...data,
      start_time: start,
      end_time: end,
    }));

    createForm.post('/timeblocks', {
      onSuccess: () => {
        createForm.reset();
        setCreateDate('');
        setCreateStartTime('');
        setCreateEndTime('');
        setIsCreateOpen(false);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeblock) return;

    const start = `${editDate}T${editStartTime}`;
    const end = `${editDate}T${editEndTime}`;

    editForm.transform((data) => ({
      ...data,
      start_time: start,
      end_time: end,
    }));

    editForm.put(`/timeblocks/${editingTimeblock.id}`, {
      onSuccess: () => {
        editForm.reset();
        setEditingTimeblock(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je dit tijdblok wilt verwijderen?')) {
      router.delete(`/timeblocks/${id}`);
    }
  };

  const handleReserve = (id: number) => {
    router.post('/reservations', { timeblock_id: id });
  };

  const openEdit = (timeblock: Timeblock) => {
    setEditingTimeblock(timeblock);
    
    // Parse date and times from the timeblock
    const start = new Date(timeblock.start_time);
    const end = new Date(timeblock.end_time);
    
    // Format: YYYY-MM-DD
    const d = start.toISOString().split('T')[0];
    // Format: HH:mm
    const st = start.toTimeString().slice(0, 5);
    const et = end.toTimeString().slice(0, 5);

    setEditDate(d);
    setEditStartTime(st);
    setEditEndTime(et);

    editForm.setData({
      class_id: timeblock.class.id.toString(),
      start_time: timeblock.start_time,
      end_time: timeblock.end_time,
      location: timeblock.location,
    });
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

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Tijdblokken" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Tijdblokken</h2>
            {isTeacher && (
              <Button onClick={() => setIsCreateOpen(true)}>
                + Nieuw Tijdblok
              </Button>
            )}
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
            {timeblocks.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">Geen tijdblokken gevonden</p>
                {isTeacher && <p className="text-sm mt-2">Maak een nieuw tijdblok aan om te beginnen.</p>}
              </div>
            ) : (
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
                    {timeblocks.map((timeblock) => (
                      <tr key={timeblock.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(timeblock.start_time).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(timeblock.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(timeblock.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{timeblock.class.name}</div>
                          {timeblock.teacher && (
                            <div className="text-xs text-gray-500">{timeblock.teacher.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {timeblock.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            {getStatusBadge(timeblock.status)}
                            {timeblock.reservation && (
                              <span className="text-xs text-gray-500">
                                {timeblock.reservation.student.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            {isTeacher ? (
                              <>
                                <button 
                                  onClick={() => openEdit(timeblock)}
                                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                  Bewerken
                                </button>
                                <button 
                                  onClick={() => handleDelete(timeblock.id)}
                                  className="text-red-600 hover:text-red-900 font-medium"
                                >
                                  Verwijderen
                                </button>
                              </>
                            ) : (
                              timeblock.status === 'available' && (
                                <Button size="sm" onClick={() => handleReserve(timeblock.id)}>
                                  Reserveren
                                </Button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nieuw Tijdblok">
        <form onSubmit={handleCreate}>
          <Select
            label="Klas"
            value={createForm.data.class_id}
            onChange={(e) => createForm.setData('class_id', e.target.value)}
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            error={createForm.errors.class_id}
            required
          />
          <div className="space-y-4 mb-4">
            <Input
              label="Datum"
              type="date"
              value={createDate}
              onChange={(e) => setCreateDate(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Starttijd"
                type="time"
                value={createStartTime}
                onChange={(e) => setCreateStartTime(e.target.value)}
                required
              />
              <Input
                label="Eindtijd"
                type="time"
                value={createEndTime}
                onChange={(e) => setCreateEndTime(e.target.value)}
                required
              />
            </div>
            {createForm.errors.start_time && (
              <p className="text-sm text-red-600">{createForm.errors.start_time}</p>
            )}
            {createForm.errors.end_time && (
              <p className="text-sm text-red-600">{createForm.errors.end_time}</p>
            )}
          </div>
          <Select
            label="Tijdblok duur (minuten)"
            value={createForm.data.duration}
            onChange={(e) => createForm.setData('duration', e.target.value)}
            options={[
              { value: '15', label: '15 minuten' },
              { value: '20', label: '20 minuten' },
              { value: '30', label: '30 minuten' },
              { value: '45', label: '45 minuten' },
              { value: '60', label: '60 minuten' },
            ]}
            error={createForm.errors.duration}
            required
          />
          <div className="text-sm text-gray-600 mb-4">
            {createDate && createStartTime && createEndTime && createForm.data.duration && (() => {
              const start = new Date(`${createDate}T${createStartTime}`);
              const end = new Date(`${createDate}T${createEndTime}`);
              const duration = parseInt(createForm.data.duration);
              const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
              const numberOfBlocks = Math.floor(totalMinutes / duration);
              return numberOfBlocks > 0 
                ? `Dit maakt ${numberOfBlocks} tijdblokken van ${duration} minuten elk.`
                : 'Selecteer een langere tijdspanne of kortere duur.';
            })()}
          </div>
          <Input
            label="Locatie"
            value={createForm.data.location}
            onChange={(e) => createForm.setData('location', e.target.value)}
            error={createForm.errors.location}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={createForm.processing}>
              Opslaan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!editingTimeblock}
        onClose={() => setEditingTimeblock(null)}
        title="Tijdblok Bewerken"
      >
        <form onSubmit={handleEdit}>
          <Select
            label="Klas"
            value={editForm.data.class_id}
            onChange={(e) => editForm.setData('class_id', e.target.value)}
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            error={editForm.errors.class_id}
            required
          />
          <div className="space-y-4 mb-4">
            <Input
              label="Datum"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Starttijd"
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                required
              />
              <Input
                label="Eindtijd"
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                required
              />
            </div>
            {editForm.errors.start_time && (
              <p className="text-sm text-red-600">{editForm.errors.start_time}</p>
            )}
            {editForm.errors.end_time && (
              <p className="text-sm text-red-600">{editForm.errors.end_time}</p>
            )}
          </div>
          <Input
            label="Locatie"
            value={editForm.data.location}
            onChange={(e) => editForm.setData('location', e.target.value)}
            error={editForm.errors.location}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setEditingTimeblock(null)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={editForm.processing}>
              Bijwerken
            </Button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
