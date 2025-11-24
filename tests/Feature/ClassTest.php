<?php

use App\Models\ClassModel;
use App\Models\Location;
use App\Models\User;

test('teacher can create class', function () {
    $teacher = User::factory()->teacher()->create();
    $location = Location::factory()->create();

    $response = $this->actingAs($teacher)->post(route('classes.store'), [
        'name' => 'Test Class',
        'location_id' => $location->id,
    ]);

    $response->assertRedirect(route('classes.index'));
    
    $this->assertDatabaseHas('classes', [
        'name' => 'Test Class',
        'location_id' => $location->id,
        'created_by' => $teacher->id,
    ]);
});

test('student cannot create class', function () {
    $student = User::factory()->student()->create();
    $location = Location::factory()->create();

    $response = $this->actingAs($student)->post(route('classes.store'), [
        'name' => 'Test Class',
        'location_id' => $location->id,
    ]);

    $response->assertForbidden();
});

test('teacher can add student to class', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    $class = ClassModel::factory()->create(['created_by' => $teacher->id]);

    $response = $this->actingAs($teacher)->post(route('classes.students.add', $class), [
        'user_id' => $student->id,
    ]);

    $response->assertRedirect();
    
    $this->assertTrue($class->users()->where('user_id', $student->id)->exists());
});

test('teacher cannot add student to another teachers class', function () {
    $teacher1 = User::factory()->teacher()->create();
    $teacher2 = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    $class = ClassModel::factory()->create(['created_by' => $teacher1->id]);

    $response = $this->actingAs($teacher2)->post(route('classes.students.add', $class), [
        'user_id' => $student->id,
    ]);

    $response->assertForbidden();
});

test('teacher can remove student from class', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    $class = ClassModel::factory()->create(['created_by' => $teacher->id]);
    $class->users()->attach($student->id);

    $response = $this->actingAs($teacher)->delete(route('classes.students.remove', $class), [
        'user_id' => $student->id,
    ]);

    $response->assertRedirect();
    
    $this->assertFalse($class->users()->where('user_id', $student->id)->exists());
});
