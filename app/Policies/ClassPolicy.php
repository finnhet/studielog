<?php

namespace App\Policies;

use App\Models\ClassModel;
use App\Models\User;

class ClassPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ClassModel $class): bool
    {
        return $user->classes->contains($class->id) || $user->id === $class->created_by;
    }

    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    public function update(User $user, ClassModel $class): bool
    {
        return $user->isTeacher();
    }

    public function delete(User $user, ClassModel $class): bool
    {
        return $user->isTeacher() && $user->id === $class->created_by;
    }

    public function manageStudents(User $user, ClassModel $class): bool
    {
        return $user->isTeacher() && $user->id === $class->created_by;
    }
}
