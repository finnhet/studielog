<?php

namespace Database\Seeders;

use App\Models\ClassModel;
use App\Models\Location;
use App\Models\Reservation;
use App\Models\Summary;
use App\Models\Timeblock;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'John Teacher',
                'password' => 'password',
                'email_verified_at' => now(),
                'role' => 'teacher',
            ]
        );

        $student = User::firstOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Jane Student',
                'password' => 'password',
                'email_verified_at' => now(),
                'role' => 'student',
            ]
        );

        $teachers = User::factory()->teacher()->withoutTwoFactor()->count(3)->create();
        $students = User::factory()->student()->withoutTwoFactor()->count(10)->create();

        $location = Location::create([
            'name' => 'Main Campus',
            'address' => '123 University Ave',
            'created_by' => $teacher->id,
        ]);

        $location2 = Location::create([
            'name' => 'Downtown Campus',
            'address' => '456 City Street',
            'created_by' => $teachers[0]->id,
        ]);

        $class1 = ClassModel::create([
            'name' => 'Software Development 2024',
            'location_id' => $location->id,
            'created_by' => $teacher->id,
        ]);

        $class2 = ClassModel::create([
            'name' => 'Web Design 2024',
            'location_id' => $location2->id,
            'created_by' => $teachers[0]->id,
        ]);

        $class1->users()->attach([$student->id, ...$students->take(5)->pluck('id')->toArray()]);
        $class2->users()->attach($students->skip(5)->pluck('id')->toArray());

        $timeblock1 = Timeblock::create([
            'teacher_id' => $teacher->id,
            'class_id' => $class1->id,
            'start_time' => now()->addDays(1)->setTime(10, 0),
            'end_time' => now()->addDays(1)->setTime(11, 0),
            'location' => 'Room 101',
            'status' => 'available',
        ]);

        $timeblock2 = Timeblock::create([
            'teacher_id' => $teacher->id,
            'class_id' => $class1->id,
            'start_time' => now()->addDays(2)->setTime(14, 0),
            'end_time' => now()->addDays(2)->setTime(15, 0),
            'location' => 'Room 102',
            'status' => 'reserved',
        ]);

        $timeblock3 = Timeblock::create([
            'teacher_id' => $teachers[0]->id,
            'class_id' => $class2->id,
            'start_time' => now()->addDays(3)->setTime(9, 0),
            'end_time' => now()->addDays(3)->setTime(10, 0),
            'location' => 'Room 201',
            'status' => 'completed',
        ]);

        $reservation1 = Reservation::create([
            'timeblock_id' => $timeblock2->id,
            'student_id' => $student->id,
            'status' => 'confirmed',
        ]);

        $summary1 = Summary::create([
            'timeblock_id' => $timeblock3->id,
            'student_id' => $students[5]->id,
            'content' => 'We discussed my progress on the web design project. I showed my wireframes and received feedback on improving the user experience.',
            'status' => 'pending',
        ]);

        $summary2 = Summary::create([
            'timeblock_id' => $timeblock2->id,
            'student_id' => $student->id,
            'content' => 'Reviewed my software development skills and discussed career goals. The teacher provided guidance on next steps.',
            'status' => 'approved',
            'feedback' => 'Good summary. Keep up the excellent work!',
        ]);
    }
}
