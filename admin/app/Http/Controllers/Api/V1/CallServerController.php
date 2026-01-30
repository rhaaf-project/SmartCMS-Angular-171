<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CallServer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CallServerController extends Controller
{
    public function index(): JsonResponse
    {
        $callServers = CallServer::with('headOffice')->get();

        return response()->json([
            'success' => true,
            'data' => $callServers
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'head_office_id' => 'nullable|exists:head_offices,id',
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $callServer = CallServer::create($validated);
        $callServer->load('headOffice');

        return response()->json([
            'success' => true,
            'message' => 'Call server created successfully',
            'data' => $callServer
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $callServer = CallServer::with('headOffice')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $callServer
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $callServer = CallServer::findOrFail($id);

        $validated = $request->validate([
            'head_office_id' => 'nullable|exists:head_offices,id',
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $callServer->update($validated);
        $callServer->load('headOffice');

        return response()->json([
            'success' => true,
            'message' => 'Call server updated successfully',
            'data' => $callServer
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $callServer = CallServer::findOrFail($id);
        $callServer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Call server deleted successfully'
        ]);
    }
}
