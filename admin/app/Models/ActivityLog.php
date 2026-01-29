<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    protected $fillable = [
        'date',
        'time',
        'user',
        'system',
        'application_name',
        'action',
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
                'user' => 'admin@smartx.local',
                'system' => 'CMS',
                'application_name' => '',
                'action' => 'login',
                'message' => 'login success',
            ],
            [
                'id' => 2,
                'date' => '24/01/2025',
                'time' => '20:12:32',
                'user' => 'admin@smartx.local',
                'system' => 'SmartUCX-1-HO',
                'application_name' => 'call server',
                'action' => 'add extension',
                'message' => '6001',
            ],
        ];
    }
}
