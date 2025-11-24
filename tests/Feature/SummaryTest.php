<?php

use App\Models\ClassModel;
use App\Models\Summary;
use App\Models\Timeblock;
use App\Models\User;

test('student can create summary for completed timeblock', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    $class = ClassModel::factory()->create();
    
    $class->users()->attach($student->id);
    
    $timeblock = Timeblock::factory()->completed()->create([
        'teacher_id' => $teacher->id,
        'class_id' => $class->id,
    ]);

    $response = $this->actingAs($student)->post(route('summaries.store'), [
        'timeblock_id' => $timeblock->id,
        'content' => 'This is my summary of the meeting.',
    ]);

    $response->assertRedirect(route('summaries.index'));
    
    $this->assertDatabaseHas('summaries', [
        'timeblock_id' => $timeblock->id,
        'student_id' => $student->id,
        'content' => 'This is my summary of the meeting.',
        'status' => 'pending',
    ]);
});

test('teacher cannot create summary', function () {
    $teacher = User::factory()->teacher()->create();
    $timeblock = Timeblock::factory()->completed()->create();

    $response = $this->actingAs($teacher)->post(route('summaries.store'), [
        'timeblock_id' => $timeblock->id,
        'content' => 'This is a summary.',
    ]);

    $response->assertForbidden();
});

test('student can update their own pending summary', function () {
    $student = User::factory()->student()->create();
    $timeblock = Timeblock::factory()->completed()->create();
    
    $summary = Summary::factory()->create([
        'student_id' => $student->id,
        'timeblock_id' => $timeblock->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($student)->put(route('summaries.update', $summary), [
        'content' => 'Updated summary content.',
    ]);

    $response->assertRedirect(route('summaries.index'));
    
    $this->assertDatabaseHas('summaries', [
        'id' => $summary->id,
        'content' => 'Updated summary content.',
    ]);
});

test('teacher can approve summary', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    
    $timeblock = Timeblock::factory()->create(['teacher_id' => $teacher->id]);
    
    $summary = Summary::factory()->create([
        'student_id' => $student->id,
        'timeblock_id' => $timeblock->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($teacher)->patch(route('summaries.approve', $summary), [
        'feedback' => 'Great work!',
    ]);

    $response->assertRedirect(route('summaries.index'));
    
    $this->assertDatabaseHas('summaries', [
        'id' => $summary->id,
        'status' => 'approved',
        'feedback' => 'Great work!',
    ]);
});

test('teacher can reject summary', function () {
    $teacher = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    
    $timeblock = Timeblock::factory()->create(['teacher_id' => $teacher->id]);
    
    $summary = Summary::factory()->create([
        'student_id' => $student->id,
        'timeblock_id' => $timeblock->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($teacher)->patch(route('summaries.reject', $summary), [
        'feedback' => 'Please add more details.',
    ]);

    $response->assertRedirect(route('summaries.index'));
    
    $this->assertDatabaseHas('summaries', [
        'id' => $summary->id,
        'status' => 'rejected',
        'feedback' => 'Please add more details.',
    ]);
});

test('student cannot approve their own summary', function () {
    $student = User::factory()->student()->create();
    $timeblock = Timeblock::factory()->create();
    
    $summary = Summary::factory()->create([
        'student_id' => $student->id,
        'timeblock_id' => $timeblock->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($student)->patch(route('summaries.approve', $summary), [
        'feedback' => 'Self approval',
    ]);

    $response->assertForbidden();
});

test('teacher cannot approve summary from another teachers timeblock', function () {
    $teacher1 = User::factory()->teacher()->create();
    $teacher2 = User::factory()->teacher()->create();
    $student = User::factory()->student()->create();
    
    $timeblock = Timeblock::factory()->create(['teacher_id' => $teacher1->id]);
    
    $summary = Summary::factory()->create([
        'student_id' => $student->id,
        'timeblock_id' => $timeblock->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($teacher2)->patch(route('summaries.approve', $summary), [
        'feedback' => 'Approved',
    ]);

    $response->assertForbidden();
});
