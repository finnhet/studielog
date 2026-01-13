<?php

namespace App\Policies;

use App\Models\Summary;
use App\Models\User;

class SummaryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Summary $summary): bool
    {
        return $user->id === $summary->student_id || 
               $user->id === $summary->timeblock->teacher_id;
    }

    public function create(User $user): bool
    {
        return $user->isStudent();
    }

    public function update(User $user, Summary $summary): bool
    {
        return $user->id === $summary->student_id && 
               ($summary->status === 'pending' || $summary->status === 'rejected');
    }

    public function delete(User $user, Summary $summary): bool
    {
        return $user->id === $summary->student_id && $summary->status === 'pending';
    }

    public function approve(User $user, Summary $summary): bool
    {
        return $user->isTeacher() && $user->id === $summary->timeblock->teacher_id;
    }

    public function reject(User $user, Summary $summary): bool
    {
        return $user->isTeacher() && $user->id === $summary->timeblock->teacher_id;
    }
}
