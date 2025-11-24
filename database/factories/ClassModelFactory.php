<?php

namespace Database\Factories;

use App\Models\ClassModel;
use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassModelFactory extends Factory
{
    protected $model = ClassModel::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'location_id' => Location::factory(),
            'created_by' => User::factory(),
        ];
    }
}
