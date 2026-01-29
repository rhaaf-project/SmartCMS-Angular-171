<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

// Test endpoint
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'timestamp' => now()->toISOString()
    ]);
});

// Login endpoint
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token
    ]);
});

// Logout endpoint (requires auth)
Route::post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out successfully']);
})->middleware('auth:sanctum');

// Get current user (requires auth)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// V1 API Routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Dashboard Stats
    Route::get('stats', [\App\Http\Controllers\Api\V1\StatsController::class, 'index']);

    // Connectivity
    Route::apiResource('extensions', \App\Http\Controllers\Api\V1\Connectivity\ExtensionController::class);
    Route::apiResource('trunks', \App\Http\Controllers\Api\V1\Connectivity\TrunkController::class);
    Route::apiResource('inbound-routes', \App\Http\Controllers\Api\V1\Connectivity\InboundRouteController::class);

    // Organization
    Route::apiResource('branches', \App\Http\Controllers\Api\V1\Organization\BranchController::class);
    Route::apiResource('sub-branches', \App\Http\Controllers\Api\V1\Organization\SubBranchController::class);

    // Recording
    Route::get('cdrs', [\App\Http\Controllers\Api\V1\Recording\CdrController::class, 'index']);
    Route::get('cdrs/{cdr}', [\App\Http\Controllers\Api\V1\Recording\CdrController::class, 'show']);

    // SBC
    Route::apiResource('sbcs', \App\Http\Controllers\Api\V1\Sbc\SbcController::class);
    Route::apiResource('sbc-routes', \App\Http\Controllers\Api\V1\Sbc\SbcRouteController::class);
});

