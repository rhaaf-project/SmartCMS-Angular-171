<?php

namespace App\Http\Controllers\Api\V1\Connectivity;

use App\Http\Controllers\Controller;
use App\Models\Extension;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExtensionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Extension::query()->with(['user', 'callServer']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('extension', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $extensions = $query->paginate($request->get('per_page', 15));

        return response()->json($extensions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'extension' => 'required|string|unique:extensions,extension|max:20',
            'name' => 'nullable|string|max:100',
            'secret' => 'nullable|string|max:100',
            'context' => 'nullable|string|max:50',
            'type' => 'required|in:sip,pjsip,webrtc',
            'user_id' => 'nullable|exists:users,id',
            'call_server_id' => 'nullable|exists:call_servers,id',
            'is_active' => 'boolean',
        ]);

        $extension = Extension::create($validated);

        return response()->json(['message' => 'Extension created successfully', 'data' => $extension], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Extension $extension): JsonResponse
    {
        $extension->load(['user', 'callServer']);
        return response()->json($extension);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Extension $extension): JsonResponse
    {
        $validated = $request->validate([
            'extension' => 'sometimes|string|max:20|unique:extensions,extension,' . $extension->id,
            'name' => 'nullable|string|max:100',
            'secret' => 'nullable|string|max:100',
            'context' => 'nullable|string|max:50',
            'type' => 'sometimes|in:sip,pjsip,webrtc',
            'user_id' => 'nullable|exists:users,id',
            'call_server_id' => 'nullable|exists:call_servers,id',
            'is_active' => 'boolean',
        ]);

        $extension->update($validated);

        return response()->json(['message' => 'Extension updated successfully', 'data' => $extension]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Extension $extension): JsonResponse
    {
        $extension->delete();
        return response()->json(['message' => 'Extension deleted successfully']);
    }
}
