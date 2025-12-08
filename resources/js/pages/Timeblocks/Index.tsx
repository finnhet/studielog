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
    createForm.post('/timeblocks', {
      onSuccess: () => {
        createForm.reset();
        setIsCreateOpen(false);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeblock) return;

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
    editForm.setData({
      class_id: timeblock.class.id.toString(),
      start_time: timeblock.start_time.slice(0, 16),
      end_time: timeblock.end_time.slice(0, 16),
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

          <div className="grid grid-cols-1 gap-4">
            {timeblocks.length === 0 ? (
              <Card>
                <p className="text-gray-500 text-center py-8">Geen tijdblokken gevonden</p>
              </Card>
            ) : (
              timeblocks.map((timeblock) => (
                <Card key={timeblock.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold text-gray-900">{timeblock.class.name}</h3>
                        {getStatusBadge(timeblock.status)}
                      </div>
                      <div className="mt-2 space-y-1">
                        {timeblock.teacher && (
                          <p className="text-sm text-gray-600">Docent: {timeblock.teacher.name}</p>
                        )}
                        <p className="text-sm text-gray-600">Locatie: {timeblock.location}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(timeblock.start_time).toLocaleString('nl-NL', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tijdslot: {new Date(timeblock.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} - {new Date(timeblock.end_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          {' '}({Math.round((new Date(timeblock.end_time).getTime() - new Date(timeblock.start_time).getTime()) / (1000 * 60))} min)
                        </p>
                        {timeblock.reservation && (
                          <p className="text-sm text-gray-600 font-medium">
                            Gereserveerd door: {timeblock.reservation.student.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {isTeacher ? (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => openEdit(timeblock)}>
                            Bewerken
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(timeblock.id)}>
                            Verwijderen
                          </Button>
                        </>
                      ) : (
                        timeblock.status === 'available' && (
                          <Button size="sm" onClick={() => handleReserve(timeblock.id)}>
                            Reserveren
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </Card>
              ))
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
          <Input
            label="Starttijd"
            type="datetime-local"
            value={createForm.data.start_time}
            onChange={(e) => createForm.setData('start_time', e.target.value)}
            error={createForm.errors.start_time}
            required
          />
          <Input
            label="Eindtijd"
            type="datetime-local"
            value={createForm.data.end_time}
            onChange={(e) => createForm.setData('end_time', e.target.value)}
            error={createForm.errors.end_time}
            required
          />
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
            {createForm.data.start_time && createForm.data.end_time && createForm.data.duration && (() => {
              const start = new Date(createForm.data.start_time);
              const end = new Date(createForm.data.end_time);
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
          <Input
            label="Starttijd"
            type="datetime-local"
            value={editForm.data.start_time}
            onChange={(e) => editForm.setData('start_time', e.target.value)}
            error={editForm.errors.start_time}
            required
          />
          <Input
            label="Eindtijd"
            type="datetime-local"
            value={editForm.data.end_time}
            onChange={(e) => editForm.setData('end_time', e.target.value)}
            error={editForm.errors.end_time}
            required
          />
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
