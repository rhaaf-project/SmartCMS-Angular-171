<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CallLog extends Model
{
    protected $table = 'call_logs';

    protected $fillable = [
        'line',
        'number',
        'destination',
        'start_time',
        'stop_time',
        'duration',
        'status',
    ];

    // Sample data for display
    public static function getSampleData(): array
    {
        return [
            [
                'id' => 1,
                'line' => 'vpw',
                'number' => '9001',
                'destination' => 'local',
                'start_time' => 'Sat, 24 Jan 2026 21:41:20',
                'stop_time' => 'Sat, 24 Jan 2026 21:41:40',
                'duration' => '00:20',
                'status' => 'answer',
            ],
        ];
    }
}
