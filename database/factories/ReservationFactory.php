<?php

namespace Database\Factories;

use App\Models\Timeblock;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'timeblock_id' => Timeblock::factory(),
            'student_id' => User::factory()->student(),
            'status' => fake()->randomElement(['pending', 'confirmed', 'cancelled']),
        ];
    }
}
