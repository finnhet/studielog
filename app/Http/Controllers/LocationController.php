<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Location::class);

        $locations = Location::with('creator', 'classes')->get()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'created_by' => $location->created_by,
                'creator' => [
                    'name' => $location->creator->name,
                ],
                'classes_count' => $location->classes->count(),
            ];
        });

        return Inertia::render('Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Location::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        $location = Location::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('locations.index');
    }

    public function update(Request $request, Location $location)
    {
        $this->authorize('update', $location);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
        ]);

        $location->update($validated);

        return redirect()->route('locations.index');
    }

    public function destroy(Location $location)
    {
        $this->authorize('delete', $location);

        $location->delete();

        return redirect()->route('locations.index');
    }
}
