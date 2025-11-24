<?php

namespace Database\Factories;

use App\Models\Timeblock;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SummaryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'timeblock_id' => Timeblock::factory(),
            'student_id' => User::factory()->student(),
            'content' => fake()->paragraphs(3, true),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'feedback' => fake()->optional()->paragraph(),
        ];
    }
}
