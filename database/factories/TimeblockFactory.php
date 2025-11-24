<?php

namespace Database\Factories;

use App\Models\ClassModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TimeblockFactory extends Factory
{
    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('now', '+1 month');
        $endTime = (clone $startTime)->modify('+1 hour');

        return [
            'teacher_id' => User::factory()->teacher(),
            'class_id' => ClassModel::factory(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'location' => fake()->address(),
            'status' => fake()->randomElement(['available', 'reserved', 'completed', 'cancelled']),
        ];
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
        ]);
    }

    public function reserved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reserved',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }
}
