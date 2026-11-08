<?php

namespace App\Http\Requests;

use App\Enums\Permissions\InpatientPermission;
use Illuminate\Foundation\Http\FormRequest;

class StoreBedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(InpatientPermission::BedView->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'room_name' => ['required', 'string', 'max:100'],
            'bed_number' => ['required', 'string', 'max:50', 'unique:beds,bed_number'],
            'class' => ['required', 'string', 'in:vip,class_1,class_2,class_3,icu'],
            'daily_rate' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
