<?php

namespace App\Policies;

use App\Models\Timeblock;
use App\Models\User;

class TimeblockPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Timeblock $timeblock): bool
    {
        if ($user->isTeacher()) {
            return $user->id === $timeblock->teacher_id;
        }
        
        return $user->classes->contains($timeblock->class_id);
    }

    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    public function update(User $user, Timeblock $timeblock): bool
    {
        return $user->isTeacher() && $user->id === $timeblock->teacher_id;
    }

    public function delete(User $user, Timeblock $timeblock): bool
    {
        return $user->isTeacher() && $user->id === $timeblock->teacher_id;
    }

    public function reserve(User $user, Timeblock $timeblock): bool
    {
        $existingReservation = \App\Models\Reservation::where('timeblock_id', $timeblock->id)->exists();
        
        return $user->isStudent() && 
               $timeblock->status === 'available' &&
               !$existingReservation &&
               $user->classes->contains($timeblock->class_id);
    }
}
