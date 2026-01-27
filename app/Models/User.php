<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'microsoft_id',
        'avatar',
        'microsoft_access_token',
        'microsoft_refresh_token',
        'microsoft_token_expires',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'microsoft_token_expires' => 'datetime',
        ];
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(ClassModel::class, 'class_user', 'user_id', 'class_id');
    }

    public function locations(): BelongsToMany
    {
        return $this->belongsToMany(Location::class, 'location_user')
            ->withTimestamps();
    }

    public function createdLocations(): HasMany
    {
        return $this->hasMany(Location::class, 'created_by');
    }

    public function createdClasses(): HasMany
    {
        return $this->hasMany(ClassModel::class, 'created_by');
    }

    public function timeblocks(): HasMany
    {
        return $this->hasMany(Timeblock::class, 'teacher_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'student_id');
    }

    public function summaries(): HasMany
    {
        return $this->hasMany(Summary::class, 'student_id');
    }
}
