<?php

use App\Models\ClassModel;
use App\Models\Timeblock;
use App\Models\User;

test('teacher can create timeblock', function () {
    $teacher = User::factory()->teacher()->create();
    $class = ClassModel::factory()->create();

    $startTime = now()->addDays(1)->setTime(10, 0);
    $endTime = now()->addDays(1)->setTime(11, 0);

    $response = $this->actingAs($teacher)->post(route('timeblocks.store'), [
        'class_id' => $class->id,
        'start_time' => $startTime->toDateTimeString(),
        'end_time' => $endTime->toDateTimeString(),
        'location' => 'Room 101',
    ]);

    $response->assertRedirect(route('timeblocks.index'));
    
    $this->assertDatabaseHas('timeblocks', [
        'teacher_id' => $teacher->id,
        'class_id' => $class->id,
        'location' => 'Room 101',
        'status' => 'available',
    ]);
});

test('student cannot create timeblock', function () {
    $student = User::factory()->student()->create();
    $class = ClassModel::factory()->create();

    $startTime = now()->addDays(1)->setTime(10, 0);
    $endTime = now()->addDays(1)->setTime(11, 0);

    $response = $this->actingAs($student)->post(route('timeblocks.store'), [
        'class_id' => $class->id,
        'start_time' => $startTime->toDateTimeString(),
        'end_time' => $endTime->toDateTimeString(),
        'location' => 'Room 101',
    ]);

    $response->assertForbidden();
});

test('cannot create overlapping timeblocks', function () {
    $teacher = User::factory()->teacher()->create();
    $class = ClassModel::factory()->create();

    $startTime = now()->addDays(1)->setTime(10, 0);
    $endTime = now()->addDays(1)->setTime(11, 0);

    Timeblock::factory()->create([
        'teacher_id' => $teacher->id,
        'start_time' => $startTime,
        'end_time' => $endTime,
    ]);

    $response = $this->actingAs($teacher)->post(route('timeblocks.store'), [
        'class_id' => $class->id,
        'start_time' => $startTime->toDateTimeString(),
        'end_time' => $endTime->toDateTimeString(),
        'location' => 'Room 102',
    ]);

    $response->assertSessionHasErrors('start_time');
});

test('teacher can update their own timeblock', function () {
    $teacher = User::factory()->teacher()->create();
    $timeblock = Timeblock::factory()->create(['teacher_id' => $teacher->id]);

    $newStartTime = now()->addDays(5)->setTime(14, 0);
    $newEndTime = now()->addDays(5)->setTime(15, 0);

    $response = $this->actingAs($teacher)->put(route('timeblocks.update', $timeblock), [
        'class_id' => $timeblock->class_id,
        'start_time' => $newStartTime->toDateTimeString(),
        'end_time' => $newEndTime->toDateTimeString(),
        'location' => 'Room 999',
    ]);

    $response->assertRedirect(route('timeblocks.index'));
    
    $this->assertDatabaseHas('timeblocks', [
        'id' => $timeblock->id,
        'location' => 'Room 999',
    ]);
});

test('teacher cannot update another teachers timeblock', function () {
    $teacher1 = User::factory()->teacher()->create();
    $teacher2 = User::factory()->teacher()->create();
    $timeblock = Timeblock::factory()->create(['teacher_id' => $teacher1->id]);

    $response = $this->actingAs($teacher2)->put(route('timeblocks.update', $timeblock), [
        'class_id' => $timeblock->class_id,
        'start_time' => $timeblock->start_time->toDateTimeString(),
        'end_time' => $timeblock->end_time->toDateTimeString(),
        'location' => 'Room 999',
    ]);

    $response->assertForbidden();
});
