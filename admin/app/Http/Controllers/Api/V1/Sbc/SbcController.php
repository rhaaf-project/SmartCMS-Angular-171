<?php

namespace App\Http\Controllers\Api\V1\Sbc;

use App\Http\Controllers\Controller;
use App\Models\Sbc;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SbcController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Sbc::query()->with('callServer');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('sip_server', 'like', "%{$search}%");
        }

        $sbcs = $query->paginate($request->get('per_page', 15));

        return response()->json($sbcs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'call_server_id' => 'nullable|exists:call_servers,id',
            'sip_server' => 'nullable|string',
            'sip_server_port' => 'integer',
            'transport' => 'in:udp,tcp,tls',
            'context' => 'nullable|string',
            'registration' => 'in:none,outbound,inbound',
            'auth_username' => 'nullable|string',
            'secret' => 'nullable|string',
            'outcid' => 'nullable|string',
            'maxchans' => 'integer',
            'disabled' => 'boolean',
        ]);

        $sbc = Sbc::create($validated);

        return response()->json(['message' => 'SBC created successfully', 'data' => $sbc], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sbc $sbc): JsonResponse
    {
        return response()->json($sbc);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sbc $sbc): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'call_server_id' => 'nullable|exists:call_servers,id',
            'sip_server' => 'nullable|string',
            'sip_server_port' => 'integer',
            'transport' => 'in:udp,tcp,tls',
            'context' => 'nullable|string',
            'registration' => 'in:none,outbound,inbound',
            'auth_username' => 'nullable|string',
            'secret' => 'nullable|string',
            'outcid' => 'nullable|string',
            'maxchans' => 'integer',
            'disabled' => 'boolean',
        ]);

        $sbc->update($validated);

        return response()->json(['message' => 'SBC updated successfully', 'data' => $sbc]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sbc $sbc): JsonResponse
    {
        $sbc->delete();
        return response()->json(['message' => 'SBC deleted successfully']);
    }
}
