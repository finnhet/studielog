import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Summary {
  id: number;
  content: string;
  status: string;
  feedback?: string;
  timeblock: {
    id: number;
    start_time: string;
    end_time: string;
    teacher: {
      name: string;
    };
    class: {
      name: string;
    };
  };
  student: {
    name: string;
  };
}

interface Props {
  auth: { user: User };
  summaries: Summary[];
}

export default function SummariesIndex({ auth, summaries }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState<Summary | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [actionSummary, setActionSummary] = useState<Summary | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const { data, setData, post, put, processing, errors, reset } = useForm({
    timeblock_id: 0,
    content: '',
  });

  const { data: feedbackData, setData: setFeedbackData, post: postFeedback } = useForm({
    feedback: '',
  });

  const openCreateModal = () => {
    reset();
    setEditingSummary(null);
    setIsModalOpen(true);
  };

  const openEditModal = (summary: Summary) => {
    setEditingSummary(summary);
    setData({
      timeblock_id: summary.timeblock.id,
      content: summary.content,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSummary(null);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSummary) {
      put(`/summaries/${editingSummary.id}`, {
        onSuccess: () => closeModal(),
      });
    } else {
      post('/summaries', {
        onSuccess: () => closeModal(),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Weet je zeker dat je deze samenvatting wilt verwijderen?')) {
      router.delete(`/summaries/${id}`);
    }
  };

  const openApproveModal = (summary: Summary) => {
    setActionSummary(summary);
    setActionType('approve');
    setFeedbackData({ feedback: '' });
    setFeedbackModalOpen(true);
  };

  const openRejectModal = (summary: Summary) => {
    setActionSummary(summary);
    setActionType('reject');
    setFeedbackData({ feedback: '' });
    setFeedbackModalOpen(true);
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionSummary) return;

    const endpoint = actionType === 'approve' 
      ? `/summaries/${actionSummary.id}/approve`
      : `/summaries/${actionSummary.id}/reject`;

    postFeedback(endpoint, {
      onSuccess: () => {
        setFeedbackModalOpen(false);
        setActionSummary(null);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const isStudent = auth.user.role === 'student';
  const isTeacher = auth.user.role === 'teacher';

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Samenvattingen" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {isStudent ? 'Mijn Samenvattingen' : 'Samenvattingen'}
            </h2>
            {isStudent && (
              <Button onClick={openCreateModal}>
                Nieuwe Samenvatting
              </Button>
            )}
          </div>

          {summaries.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">
                {isStudent ? 'Je hebt nog geen samenvattingen geschreven' : 'Geen samenvattingen om te beoordelen'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {summaries.map((summary) => (
                <Card key={summary.id}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {summary.timeblock.class.name}
                        </h3>
                        {getStatusBadge(summary.status)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {isTeacher && (
                          <p>Student: {summary.student.name}</p>
                        )}
                        <p>Docent: {summary.timeblock.teacher.name}</p>
                        <p>Datum: {new Date(summary.timeblock.start_time).toLocaleDateString('nl-NL')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {isStudent && summary.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEditModal(summary)}
                          >
                            Bewerken
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(summary.id)}
                          >
                            Verwijderen
                          </Button>
                        </>
                      )}
                      {isTeacher && summary.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => openApproveModal(summary)}
                          >
                            Goedkeuren
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openRejectModal(summary)}
                          >
                            Afwijzen
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Samenvatting:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{summary.content}</p>
                  </div>

                  {summary.feedback && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Feedback:</h4>
                      <p className="text-gray-800">{summary.feedback}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSummary ? 'Samenvatting Bewerken' : 'Nieuwe Samenvatting'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            label="Tijdblok ID"
            value={data.timeblock_id}
            onChange={(e) => setData('timeblock_id', parseInt(e.target.value))}
            error={errors.timeblock_id}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inhoud
            </label>
            <textarea
              value={data.content}
              onChange={(e) => setData('content', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={processing}>
              {editingSummary ? 'Bijwerken' : 'Aanmaken'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Annuleren
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title={actionType === 'approve' ? 'Samenvatting Goedkeuren' : 'Samenvatting Afwijzen'}
      >
        <form onSubmit={handleAction} className="space-y-4">
          <p className="text-gray-700">
            {actionType === 'approve'
              ? 'Je staat op het punt deze samenvatting goed te keuren. Feedback is optioneel.'
              : 'Je staat op het punt deze samenvatting af te wijzen. Geef duidelijke feedback aan de student.'}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback {actionType === 'reject' && '(verplicht)'}
            </label>
            <textarea
              value={feedbackData.feedback}
              onChange={(e) => setFeedbackData('feedback', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={actionType === 'reject'}
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" variant={actionType === 'approve' ? 'success' : 'danger'}>
              {actionType === 'approve' ? 'Goedkeuren' : 'Afwijzen'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setFeedbackModalOpen(false)}>
              Annuleren
            </Button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
