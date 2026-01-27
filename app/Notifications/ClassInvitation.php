<?php

namespace App\Notifications;

use App\Models\ClassModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClassInvitation extends Notification implements ShouldQueue
{
    use Queueable;

    public $classModel;

    public function __construct(ClassModel $classModel)
    {
        $this->classModel = $classModel;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Uitnodiging voor klas: ' . $this->classModel->name)
            ->line('Je bent uitgenodigd om deel te nemen aan de klas ' . $this->classModel->name . '.')
            ->action('Bekijk uitnodiging', url('/dashboard'))
            ->line('Log in op StudieLog om de uitnodiging te accepteren.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'class_id' => $this->classModel->id,
            'class_name' => $this->classModel->name,
            'message' => 'Je bent uitgenodigd voor klas ' . $this->classModel->name,
        ];
    }
}
