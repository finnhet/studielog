<?php

use App\Models\Location;
use App\Models\User;

test('teacher can create location', function () {
    $teacher = User::factory()->teacher()->create();

    $response = $this->actingAs($teacher)->post(route('locations.store'), [
        'name' => 'Test Location',
        'address' => '123 Test St',
    ]);

    $response->assertRedirect(route('locations.index'));
    
    $this->assertDatabaseHas('locations', [
        'name' => 'Test Location',
        'address' => '123 Test St',
        'created_by' => $teacher->id,
    ]);
});

test('student cannot create location', function () {
    $student = User::factory()->student()->create();

    $response = $this->actingAs($student)->post(route('locations.store'), [
        'name' => 'Test Location',
        'address' => '123 Test St',
    ]);

    $response->assertForbidden();
});

test('teacher can update their own location', function () {
    $teacher = User::factory()->teacher()->create();
    $location = Location::factory()->create(['created_by' => $teacher->id]);

    $response = $this->actingAs($teacher)->put(route('locations.update', $location), [
        'name' => 'Updated Location',
        'address' => '456 New St',
    ]);

    $response->assertRedirect(route('locations.index'));
    
    $this->assertDatabaseHas('locations', [
        'id' => $location->id,
        'name' => 'Updated Location',
        'address' => '456 New St',
    ]);
});

test('teacher cannot update another teachers location', function () {
    $teacher1 = User::factory()->teacher()->create();
    $teacher2 = User::factory()->teacher()->create();
    $location = Location::factory()->create(['created_by' => $teacher1->id]);

    $response = $this->actingAs($teacher2)->put(route('locations.update', $location), [
        'name' => 'Updated Location',
        'address' => '456 New St',
    ]);

    $response->assertForbidden();
});

test('teacher can delete their own location', function () {
    $teacher = User::factory()->teacher()->create();
    $location = Location::factory()->create(['created_by' => $teacher->id]);

    $response = $this->actingAs($teacher)->delete(route('locations.destroy', $location));

    $response->assertRedirect(route('locations.index'));
    $this->assertDatabaseMissing('locations', ['id' => $location->id]);
});
