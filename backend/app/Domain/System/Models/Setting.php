<?php

namespace App\Domain\System\Models;

use App\Domain\System\Enums\SettingType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $table = 'system_settings';

    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    public function getTypedValueAttribute(): mixed
    {
        $type = SettingType::tryFrom((string) $this->type) ?? SettingType::String;

        return $type->cast($this->value);
    }
}
