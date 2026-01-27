import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  creator: {
    name: string;
  };
  classes_count?: number;
  teachers: Teacher[];
}

interface Props {
  auth: { user: User };
  locations: Location[];
}

export default function LocationsIndex({ auth, locations }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [managingTeachers, setManagingTeachers] = useState<Location | null>(null);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const createForm = useForm({
    name: '',
    address: '',
  });

  const editForm = useForm({
    name: '',
    address: '',
  });

  const handleSearch = async (query: string) => {
    setTeacherEmail(query);
    setSelectedTeacher(null);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`/locations/teachers/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed', error);
    }
  };

  const selectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherEmail(teacher.name + ` (${teacher.email})`);
    setSearchResults([]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/locations', {
      onSuccess: () => {
        createForm.reset();
        setIsCreateOpen(false);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;

    editForm.put(`/locations/${editingLocation.id}`, {
      onSuccess: () => {
        editForm.reset();
        setEditingLocation(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je deze vestiging wilt verwijderen?')) {
      router.delete(`/locations/${id}`);
    }
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingTeachers) return;

    const invitedEmail = selectedTeacher ? selectedTeacher.email : teacherEmail;
    const data = selectedTeacher 
      ? { user_id: selectedTeacher.id } 
      : { email: teacherEmail };

    router.post(`/locations/${managingTeachers.id}/teachers`, data, {
      onSuccess: () => {
        setTeacherEmail('');
        setSelectedTeacher(null);
        setSearchResults([]);
        setInviteSuccess(`Uitnodiging verstuurd naar ${invitedEmail}`);
        setTimeout(() => setInviteSuccess(null), 5000);
      },
    });
  };

  const handleRemoveTeacher = (locationId: number, userId: number) => {
    if (confirm('Weet je zeker dat je deze docent wilt verwijderen?')) {
      router.delete(`/locations/${locationId}/teachers`, {
        data: { user_id: userId },
      });
    }
  };

  const openEdit = (location: Location) => {
    setEditingLocation(location);
    editForm.setData({
      name: location.name,
      address: location.address,
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Vestigingen" />

      <div className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Vestigingen</h2>
            <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
              + Nieuwe Vestiging
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {locations.length === 0 ? (
              <Card>
                <p className="text-gray-500 text-center py-8">Geen vestigingen gevonden</p>
              </Card>
            ) : (
              locations.map((location) => (
                <Card key={location.id}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{location.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Adres: {location.address}</p>
                      <p className="text-sm text-gray-500">Aangemaakt door: {location.creator.name}</p>
                      <p className="text-sm text-gray-500">Docenten: {location.teachers.length}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button size="sm" variant="secondary" onClick={() => setManagingTeachers(location)} className="flex-1 sm:flex-none">
                        Docenten
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(location)} className="flex-1 sm:flex-none">
                        Bewerken
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(location.id)} className="flex-1 sm:flex-none">
                        Verwijderen
                      </Button>
                    </div>
                  </div>

                  {location.teachers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Docenten:</h4>
                      <div className="flex flex-wrap gap-2">
                        {location.teachers.map((teacher) => (
                          <span
                            key={teacher.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {teacher.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nieuwe Vestiging">
        <form onSubmit={handleCreate}>
          <Input
            label="Naam"
            value={createForm.data.name}
            onChange={(e) => createForm.setData('name', e.target.value)}
            error={createForm.errors.name}
            required
          />
          <Input
            label="Adres"
            value={createForm.data.address}
            onChange={(e) => createForm.setData('address', e.target.value)}
            error={createForm.errors.address}
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
        isOpen={!!editingLocation}
        onClose={() => setEditingLocation(null)}
        title="Vestiging Bewerken"
      >
        <form onSubmit={handleEdit}>
          <Input
            label="Naam"
            value={editForm.data.name}
            onChange={(e) => editForm.setData('name', e.target.value)}
            error={editForm.errors.name}
            required
          />
          <Input
            label="Adres"
            value={editForm.data.address}
            onChange={(e) => editForm.setData('address', e.target.value)}
            error={editForm.errors.address}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setEditingLocation(null)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={editForm.processing}>
              Bijwerken
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!managingTeachers}
        onClose={() => {
          setManagingTeachers(null);
          setTeacherEmail('');
          setSelectedTeacher(null);
          setSearchResults([]);
          setInviteSuccess(null);
        }}
        title={`Docenten Beheren - ${managingTeachers?.name}`}
      >
        {inviteSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm flex items-center justify-between">
            <span>✓ {inviteSuccess}</span>
            <button onClick={() => setInviteSuccess(null)} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleAddTeacher} className="mb-6 relative">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Docent Zoeken of Email
            </label>
            <input
              type="text"
              value={teacherEmail}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Zoek op naam of email..."
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm text-gray-900"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((teacher) => (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => selectTeacher(teacher)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                  >
                    <span className="font-medium text-gray-900">{teacher.name}</span>
                    <span className="text-sm text-gray-500">{teacher.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" size="sm" className="w-full">
            Docent Toevoegen
          </Button>
        </form>

        {managingTeachers && managingTeachers.teachers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Huidige Docenten:</h4>
            <div className="space-y-2">
              {managingTeachers.teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{teacher.name}</div>
                    <div className="text-sm text-gray-500">{teacher.email}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveTeacher(managingTeachers.id, teacher.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Verwijderen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {managingTeachers && managingTeachers.teachers.length === 0 && (
          <p className="text-gray-500 text-center py-4">Nog geen docenten gekoppeld</p>
        )}
      </Modal>
    </AuthenticatedLayout>
  );
}
