<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', ClassModel::class);

        $classes = ClassModel::with('location', 'creator', 'users')->get()->map(function ($class) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'location_id' => $class->location_id,
                'created_by' => $class->created_by,
                'location' => [
                    'id' => $class->location->id,
                    'name' => $class->location->name,
                ],
                'creator' => [
                    'name' => $class->creator->name,
                ],
                'students' => $class->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                }),
            ];
        });

        $locations = Location::all()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
            ];
        });

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', ClassModel::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
        ]);

        $class = ClassModel::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('classes.index');
    }

    public function update(Request $request, ClassModel $class)
    {
        $this->authorize('update', $class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
        ]);

        $class->update($validated);

        return redirect()->route('classes.index');
    }

    public function destroy(ClassModel $class)
    {
        $this->authorize('delete', $class);

        $class->delete();

        return redirect()->route('classes.index');
    }

    public function addStudent(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);

        if (!$user->isStudent()) {
            abort(422, 'User must be a student');
        }

        $class->users()->syncWithoutDetaching([$validated['user_id']]);

        return redirect()->back();
    }

    public function removeStudent(Request $request, ClassModel $class)
    {
        $this->authorize('manageStudents', $class);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $class->users()->detach($validated['user_id']);

        return redirect()->back();
    }
}
