<?php

namespace App\Http\Requests;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreDoctorScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $doctor = $this->route('doctor');

        return $doctor instanceof Doctor
            && ($this->user()?->can('update', $doctor) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'unit_id' => [
                'required',
                'integer',
                Rule::exists('units', 'id')->where('is_active', true),
            ],
            'day_of_week' => ['required', 'integer', 'between:1,7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'quota' => ['nullable', 'integer', 'min:1', 'max:999'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $doctor = $this->route('doctor');

            if (! $doctor instanceof Doctor) {
                return;
            }

            $overlaps = DoctorSchedule::query()
                ->where('doctor_id', $doctor->id)
                ->where('day_of_week', $this->integer('day_of_week'))
                ->where('is_active', true)
                ->where('start_time', '<', (string) $this->input('end_time'))
                ->where('end_time', '>', (string) $this->input('start_time'))
                ->exists();

            if ($overlaps) {
                $validator->errors()->add(
                    'start_time',
                    'Jadwal bertabrakan dengan jadwal dokter pada hari yang sama.',
                );
            }
        });
    }
}
