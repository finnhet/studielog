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

interface Location {
  id: number;
  name: string;
  address: string;
  creator: {
    name: string;
  };
  classes_count?: number;
}

interface Props {
  auth: { user: User };
  locations: Location[];
}

export default function LocationsIndex({ auth, locations }: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const createForm = useForm({
    name: '',
    address: '',
  });

  const editForm = useForm({
    name: '',
    address: '',
  });

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

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Vestigingen</h2>
            <Button onClick={() => setIsCreateOpen(true)}>
              + Nieuwe Vestiging
            </Button>
          </div>

          <Card>
            {locations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Geen vestigingen gevonden</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Naam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Adres
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aangemaakt door
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locations.map((location) => (
                      <tr key={location.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{location.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{location.creator.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEdit(location)}
                            className="text-gray-600 hover:text-gray-900 mr-4"
                          >
                            Bewerken
                          </button>
                          <button
                            onClick={() => handleDelete(location.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Verwijderen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
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
    </AuthenticatedLayout>
  );
}
