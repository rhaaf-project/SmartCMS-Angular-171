<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemLog extends Model
{
    protected $table = 'system_logs';

    protected $fillable = [
        'date',
        'time',
        'system',
        'application',
        'level',
        'alarm',
        'message',
    ];

    // Sample data for display
    public static function getSampleData(): array
    {
        return [
            [
                'id' => 1,
                'date' => '24/01/2025',
                'time' => '20:12:32',
                'system' => 'SmartUCX-1-HO',
                'application' => 'call server',
                'level' => 'minor',
                'alarm' => 'extension disconnect',
                'message' => 'unreacheable',
            ],
        ];
    }
}
