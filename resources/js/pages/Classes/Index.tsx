import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Location {
  id: number;
  name: string;
}

interface ClassItem {
  id: number;
  name: string;
  location_id: number;
  created_by: number;
  location: Location;
  creator: {
    name: string;
  };
  students: User[];
}

interface Props {
  auth: { user: User };
  classes: ClassItem[];
  locations: Location[];
}

export default function ClassesIndex({ auth, classes, locations }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [managingStudents, setManagingStudents] = useState<ClassItem | null>(null);
  const [studentEmail, setStudentEmail] = useState('');

  const createForm = useForm({
    name: '',
    location_id: '',
  });

  const editForm = useForm({
    name: '',
    location_id: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/classes', {
      onSuccess: () => {
        createForm.reset();
        setIsCreateOpen(false);
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    editForm.put(`/classes/${editingClass.id}`, {
      onSuccess: () => {
        editForm.reset();
        setEditingClass(null);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je deze klas wilt verwijderen?')) {
      router.delete(`/classes/${id}`);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingStudents) return;

    router.post(`/classes/${managingStudents.id}/students`, { email: studentEmail }, {
      onSuccess: () => {
        setStudentEmail('');
      },
    });
  };

  const handleRemoveStudent = (classId: number, userId: number) => {
    if (confirm('Weet je zeker dat je deze student wilt verwijderen?')) {
      router.delete(`/classes/${classId}/students`, {
        data: { user_id: userId },
      });
    }
  };

  const openEdit = (classItem: ClassItem) => {
    setEditingClass(classItem);
    editForm.setData({
      name: classItem.name,
      location_id: classItem.location.id.toString(),
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Klassen" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Klassen</h2>
            <Button onClick={() => setIsCreateOpen(true)}>
              + Nieuwe Klas
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {classes.length === 0 ? (
              <Card>
                <p className="text-gray-500 text-center py-8">Geen klassen gevonden</p>
              </Card>
            ) : (
              classes.map((classItem) => (
                <Card key={classItem.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Vestiging: {classItem.location.name}</p>
                      <p className="text-sm text-gray-500">Aangemaakt door: {classItem.creator.name}</p>
                      <p className="text-sm text-gray-500">Studenten: {classItem.students.length}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => setManagingStudents(classItem)}>
                        Studenten
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(classItem)}>
                        Bewerken
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(classItem.id)}>
                        Verwijderen
                      </Button>
                    </div>
                  </div>

                  {classItem.students.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Studenten:</h4>
                      <div className="flex flex-wrap gap-2">
                        {classItem.students.map((student) => (
                          <span
                            key={student.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                          >
                            {student.name}
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

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nieuwe Klas">
        <form onSubmit={handleCreate}>
          <Input
            label="Naam"
            value={createForm.data.name}
            onChange={(e) => createForm.setData('name', e.target.value)}
            error={createForm.errors.name}
            required
          />
          <Select
            label="Vestiging"
            value={createForm.data.location_id}
            onChange={(e) => createForm.setData('location_id', e.target.value)}
            options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
            error={createForm.errors.location_id}
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
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        title="Klas Bewerken"
      >
        <form onSubmit={handleEdit}>
          <Input
            label="Naam"
            value={editForm.data.name}
            onChange={(e) => editForm.setData('name', e.target.value)}
            error={editForm.errors.name}
            required
          />
          <Select
            label="Vestiging"
            value={editForm.data.location_id}
            onChange={(e) => editForm.setData('location_id', e.target.value)}
            options={locations.map((loc) => ({ value: loc.id, label: loc.name }))}
            error={editForm.errors.location_id}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setEditingClass(null)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={editForm.processing}>
              Bijwerken
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!managingStudents}
        onClose={() => setManagingStudents(null)}
        title={`Studenten Beheren - ${managingStudents?.name}`}
      >
        <form onSubmit={handleAddStudent} className="mb-6">
          <Input
            label="Student Email"
            type="email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            placeholder="student@example.com"
            required
          />
          <Button type="submit" size="sm">
            Student Toevoegen
          </Button>
        </form>

        {managingStudents && managingStudents.students.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Huidige Studenten:</h4>
            <div className="space-y-2">
              {managingStudents.students.map((student) => (
                <div
                  key={student.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveStudent(managingStudents.id, student.id)}
                  >
                    Verwijderen
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </AuthenticatedLayout>
  );
}
