<?php

use App\Models\ClassModel;
use App\Models\Reservation;
use App\Models\Timeblock;
use App\Models\User;

test('student can reserve available timeblock', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    $class = ClassModel::factory()->create();
    
    $class->users()->attach($student->id);
    
    $timeblock = Timeblock::factory()->available()->create([
        'teacher_id' => $teacher->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($student)->post(route('reservations.store'), [
        'timeblock_id' => $timeblock->id,
    ]);

    $response->assertRedirect(route('reservations.index'));
    
    $this->assertDatabaseHas('reservations', [
        'timeblock_id' => $timeblock->id,
        'student_id' => $student->id,
        'status' => 'confirmed',
    ]);
    
    $this->assertDatabaseHas('timeblocks', [
        'id' => $timeblock->id,
        'status' => 'reserved',
    ]);
});

test('student cannot reserve timeblock from class they are not in', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    $class = ClassModel::factory()->create();
    
    $timeblock = Timeblock::factory()->available()->create([
        'teacher_id' => $teacher->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($student)->post(route('reservations.store'), [
        'timeblock_id' => $timeblock->id,
    ]);

    $response->assertForbidden();
});

test('student cannot reserve already reserved timeblock', function () {
    $teacher = User::factory()->teacher()->create();
    $student1 = User::factory()->student()->create();
    $student2 = User::factory()->student()->create();
    $class = ClassModel::factory()->create();
    
    $class->users()->attach([$student1->id, $student2->id]);
    
    $timeblock = Timeblock::factory()->available()->create([
        'teacher_id' => $teacher->id,
        'class_id' => $class->id,
    ]);

    $this->actingAs($student1)->post(route('reservations.store'), [
        'timeblock_id' => $timeblock->id,
    ]);

    $timeblock->refresh();

    $response = $this->actingAs($student2)->post(route('reservations.store'), [
        'timeblock_id' => $timeblock->id,
    ]);

    $response->assertForbidden();
});

test('teacher cannot create reservation', function () {
    $teacher = User::factory()->teacher()->create();
    $timeblock = Timeblock::factory()->available()->create();

    $response = $this->actingAs($teacher)->post(route('reservations.store'), [
        'timeblock_id' => $timeblock->id,
    ]);

    $response->assertForbidden();
});

test('student can cancel their own reservation', function () {
    $student = User::factory()->student()->create();
    $timeblock = Timeblock::factory()->reserved()->create();
    
    $reservation = Reservation::create([
        'timeblock_id' => $timeblock->id,
        'student_id' => $student->id,
        'status' => 'confirmed',
    ]);

    $response = $this->actingAs($student)->delete(route('reservations.destroy', $reservation));

    $response->assertRedirect(route('reservations.index'));
    
    $this->assertDatabaseMissing('reservations', ['id' => $reservation->id]);
    
    $this->assertDatabaseHas('timeblocks', [
        'id' => $timeblock->id,
        'status' => 'available',
    ]);
});
