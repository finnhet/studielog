<?php

use App\Http\Controllers\AgendaController;
use App\Http\Controllers\Auth\MicrosoftOAuthController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MicrosoftAuthController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\TimeblockController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware('web')->group(function () {
    Route::get('auth/microsoft/redirect', [MicrosoftOAuthController::class, 'redirect'])->name('auth.microsoft.redirect');
    Route::get('auth/microsoft/callback', [MicrosoftOAuthController::class, 'callback'])->name('auth.microsoft.callback');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('agenda', [AgendaController::class, 'index'])->name('agenda');
    
    Route::get('microsoft/redirect', [MicrosoftAuthController::class, 'redirect'])->name('microsoft.redirect');
    Route::get('microsoft/callback', [MicrosoftAuthController::class, 'callback'])->name('microsoft.callback');
    Route::post('microsoft/disconnect', [MicrosoftAuthController::class, 'disconnect'])->name('microsoft.disconnect');

    Route::resource('locations', LocationController::class)->except(['show', 'create', 'edit']);
    
    Route::get('classes/students/search', [ClassController::class, 'searchStudents'])->name('classes.students.search');
    Route::resource('classes', ClassController::class)->except(['show', 'create', 'edit']);
    Route::post('classes/{class}/students', [ClassController::class, 'addStudent'])->name('classes.students.add');
    Route::delete('classes/{class}/students', [ClassController::class, 'removeStudent'])->name('classes.students.remove');
    Route::post('classes/{class}/invitations/accept', [ClassController::class, 'acceptInvitation'])->name('classes.invitations.accept');
    Route::post('classes/{class}/invitations/reject', [ClassController::class, 'rejectInvitation'])->name('classes.invitations.reject');
    
    Route::resource('timeblocks', TimeblockController::class)->except(['show', 'create', 'edit']);
    
    Route::resource('reservations', ReservationController::class)->only(['index', 'store', 'destroy']);
    
    Route::resource('summaries', SummaryController::class)->except(['show', 'create', 'edit']);
    Route::patch('summaries/{summary}/approve', [SummaryController::class, 'approve'])->name('summaries.approve');
    Route::patch('summaries/{summary}/reject', [SummaryController::class, 'reject'])->name('summaries.reject');
});

require __DIR__.'/settings.php';
