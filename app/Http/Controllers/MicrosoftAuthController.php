<?php

namespace App\Http\Controllers;

use App\Services\MicrosoftGraphService;
use Illuminate\Http\Request;

class MicrosoftAuthController extends Controller
{
    protected $graphService;

    public function __construct(MicrosoftGraphService $graphService)
    {
        $this->graphService = $graphService;
    }

    public function redirect()
    {
        return redirect($this->graphService->getAuthUrl());
    }

    public function callback(Request $request)
    {
        if ($request->has('error')) {
            return redirect('/dashboard')->with('error', 'Microsoft authenticatie mislukt');
        }

        try {
            $tokenData = $this->graphService->getAccessToken($request->code);

            if (!isset($tokenData['access_token'])) {
                return redirect('/dashboard')->with('error', 'Geen toegangstoken ontvangen');
            }

            auth()->user()->update([
                'microsoft_access_token' => encrypt($tokenData['access_token']),
                'microsoft_refresh_token' => encrypt($tokenData['refresh_token'] ?? null),
                'microsoft_token_expires' => now()->addSeconds($tokenData['expires_in']),
            ]);

            return redirect('/dashboard')->with('success', 'Microsoft account succesvol gekoppeld');
        } catch (\Exception $e) {
            return redirect('/dashboard')->with('error', 'Fout bij koppelen Microsoft account: ' . $e->getMessage());
        }
    }

    public function disconnect()
    {
        auth()->user()->update([
            'microsoft_access_token' => null,
            'microsoft_refresh_token' => null,
            'microsoft_token_expires' => null,
        ]);

        return redirect('/dashboard')->with('success', 'Microsoft account ontkoppeld');
    }
}
