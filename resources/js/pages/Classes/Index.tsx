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
  status?: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
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
  teachers: Teacher[];
}

interface Props {
  auth: { user: User };
  classes: ClassItem[];
  locations: Location[];
  allTeachers: Teacher[];
}

export default function ClassesIndex({ auth, classes, locations, allTeachers }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [managingStudents, setManagingStudents] = useState<ClassItem | null>(null);
  const [managingTeachers, setManagingTeachers] = useState<ClassItem | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [teacherFilter, setTeacherFilter] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState<string | null>(null);

  const createForm = useForm({
    name: '',
    location_id: '',
  });

  const editForm = useForm({
    name: '',
    location_id: '',
  });

  const handleSearch = async (query: string) => {
      setStudentEmail(query);
      setSelectedUser(null); // Reset selection when typing
      
      if (query.length < 2) {
          setSearchResults([]);
          return;
      }
      
      try {
          const response = await fetch(`/classes/students/search?query=${encodeURIComponent(query)}`, {
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

  const selectUser = (user: User) => {
      setSelectedUser(user);
      setStudentEmail(user.name + ` (${user.email})`);
      setSearchResults([]);
  };

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

    const invitedEmail = selectedUser ? selectedUser.email : studentEmail;
    const data = selectedUser 
        ? { user_id: selectedUser.id } 
        : { email: studentEmail };

    router.post(`/classes/${managingStudents.id}/students`, data, {
      onSuccess: () => {
        setStudentEmail('');
        setSelectedUser(null);
        setSearchResults([]);
        setInviteSuccess(`Uitnodiging verstuurd naar ${invitedEmail}`);
        setTimeout(() => setInviteSuccess(null), 5000);
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

  const handleAddTeacher = (teacherId: number) => {
    if (!managingTeachers) return;

    const teacher = allTeachers.find(t => t.id === teacherId);
    router.post(`/classes/${managingTeachers.id}/teachers`, { user_id: teacherId }, {
      onSuccess: () => {
        setTeacherFilter('');
        setTeacherSuccess(`Docent ${teacher?.name} toegevoegd`);
        setTimeout(() => setTeacherSuccess(null), 5000);
      },
    });
  };

  const handleRemoveTeacher = (classId: number, userId: number) => {
    if (confirm('Weet je zeker dat je deze docent wilt verwijderen?')) {
      router.delete(`/classes/${classId}/teachers`, {
        data: { user_id: userId },
      });
    }
  };

  const availableTeachers = managingTeachers 
    ? allTeachers.filter(teacher => 
        !managingTeachers.teachers.some(t => t.id === teacher.id) &&
        (teacherFilter === '' || 
         teacher.name.toLowerCase().includes(teacherFilter.toLowerCase()) ||
         teacher.email.toLowerCase().includes(teacherFilter.toLowerCase()))
      )
    : [];

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

      <div className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Klassen</h2>
            <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
              + Nieuwe Klas
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {classes.length === 0 ? (
              <Card>
                <p className="text-gray-500 text-center py-8">Geen klassen gevonden</p>
              </Card>
            ) : (
              classes.map((classItem) => (
                <Card key={classItem.id}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{classItem.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Vestiging: {classItem.location.name}</p>
                      <p className="text-sm text-gray-500">Aangemaakt door: {classItem.creator.name}</p>
                      <p className="text-sm text-gray-500">Studenten: {classItem.students.length}</p>
                      <p className="text-sm text-gray-500">Docenten: {classItem.teachers.length}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <Button size="sm" variant="secondary" onClick={() => setManagingStudents(classItem)} className="flex-1 sm:flex-none">
                        Studenten
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setManagingTeachers(classItem)} className="flex-1 sm:flex-none">
                        Docenten
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(classItem)} className="flex-1 sm:flex-none">
                        Bewerken
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(classItem.id)} className="flex-1 sm:flex-none">
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

                  {classItem.teachers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Docenten:</h4>
                      <div className="flex flex-wrap gap-2">
                        {classItem.teachers.map((teacher) => (
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
        onClose={() => {
          setManagingStudents(null);
          setInviteSuccess(null);
        }}
        title={`Studenten Beheren - ${managingStudents?.name}`}
      >
        {inviteSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm flex items-center justify-between">
            <span>✓ {inviteSuccess}</span>
            <button onClick={() => setInviteSuccess(null)} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleAddStudent} className="mb-6 relative">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Zoeken of Email
            </label>
            <input
                type="text"
                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={studentEmail}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Zoek op naam of vul email in..."
                autoComplete="off"
            />
            {searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {searchResults.map(user => (
                        <div 
                            key={user.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => selectUser(user)}
                        >
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                    ))}
                </div>
            )}
          </div>
          <Button type="submit" size="sm">
            {selectedUser ? 'Geselecteerde Student Uitnodigen' : 'Uitnodigen via Email'}
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
                    <p className="font-medium text-gray-900">
                        {student.name}
                        {student.status === 'pending' && (
                            <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                Uitgenodigd
                            </span>
                        )}
                    </p>
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

      <Modal
        isOpen={!!managingTeachers}
        onClose={() => {
          setManagingTeachers(null);
          setTeacherSuccess(null);
          setTeacherFilter('');
        }}
        title={`Docenten Beheren - ${managingTeachers?.name}`}
      >
        {teacherSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm flex items-center justify-between">
            <span>✓ {teacherSuccess}</span>
            <button onClick={() => setTeacherSuccess(null)} className="text-green-700 hover:text-green-900">
              ×
            </button>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Docent Toevoegen
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            placeholder="Filter op naam of email..."
          />
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {availableTeachers.length === 0 ? (
              <p className="p-3 text-gray-500 text-sm text-center">
                {allTeachers.length === managingTeachers?.teachers.length 
                  ? 'Alle docenten zijn al gekoppeld' 
                  : 'Geen docenten gevonden'}
              </p>
            ) : (
              availableTeachers.map(teacher => (
                <div 
                  key={teacher.id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">{teacher.name}</div>
                    <div className="text-xs text-gray-500">{teacher.email}</div>
                  </div>
                  <Button size="sm" onClick={() => handleAddTeacher(teacher.id)}>
                    Toevoegen
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {managingTeachers && managingTeachers.teachers.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Gekoppelde Docenten:</h4>
            <div className="space-y-2">
              {managingTeachers.teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveTeacher(managingTeachers.id, teacher.id)}
                  >
                    Verwijderen
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {managingTeachers && managingTeachers.teachers.length === 0 && (
          <p className="text-gray-500 text-center py-4">Nog geen docenten gekoppeld aan deze klas</p>
        )}
      </Modal>
    </AuthenticatedLayout>
  );
}
