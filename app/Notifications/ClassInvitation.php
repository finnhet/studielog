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

    /**
     * Create a new notification instance.
     */
    public function __construct(ClassModel $classModel)
    {
        $this->classModel = $classModel;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Uitnodiging voor klas: ' . $this->classModel->name)
            ->line('Je bent uitgenodigd om deel te nemen aan de klas ' . $this->classModel->name . '.')
            ->action('Bekijk uitnodiging', url('/dashboard'))
            ->line('Log in op StudieLog om de uitnodiging te accepteren.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'class_id' => $this->classModel->id,
            'class_name' => $this->classModel->name,
            'message' => 'Je bent uitgenodigd voor klas ' . $this->classModel->name,
        ];
    }
}
