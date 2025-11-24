<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->student_id || 
               $user->id === $reservation->timeblock->teacher_id;
    }

    public function create(User $user): bool
    {
        return $user->isStudent();
    }

    public function update(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->student_id;
    }

    public function delete(User $user, Reservation $reservation): bool
    {
        return $user->id === $reservation->student_id;
    }
}
