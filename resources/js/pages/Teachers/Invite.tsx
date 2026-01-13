import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FormEventHandler } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Props {
  auth: { user: User };
}

export default function InviteTeacher({ auth }: Props) {
  const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
    email: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/teachers/invite', {
      onSuccess: () => reset(),
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Nodig Docent Uit" />

      <div className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <Card title="Nodig een docent uit" className="!p-4 sm:!p-6">
            <div className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600">
              Stuur een uitnodiging naar een collega om een docent account aan te maken.
              De ontvanger krijgt een email met een link om zich te registreren via Microsoft.
            </div>

            {wasSuccessful && (
              <div className="mb-4 p-3 sm:p-4 bg-green-100 text-green-700 rounded-md text-sm sm:text-base">
                Uitnodiging succesvol verstuurd!
              </div>
            )}

            <form onSubmit={submit} className="space-y-4 sm:space-y-6 max-w-md">
              <Input
                label="Email adres van de docent"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                error={errors.email}
                placeholder="docent@school.nl"
                required
              />

              <div className="flex items-center justify-end">
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                  {processing ? 'Versturen...' : 'Verstuur Uitnodiging'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
