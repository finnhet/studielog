<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;

class LocationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isTeacher();
    }

    public function view(User $user, Location $location): bool
    {
        return $user->isTeacher();
    }

    public function create(User $user): bool
    {
        return $user->isTeacher();
    }

    public function update(User $user, Location $location): bool
    {
        return $user->isTeacher() && (
            $user->id === $location->created_by ||
            $location->teachers()->where('user_id', $user->id)->exists()
        );
    }

    public function delete(User $user, Location $location): bool
    {
        return $user->isTeacher() && $user->id === $location->created_by;
    }
}
