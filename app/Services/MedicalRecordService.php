<?php

namespace App\Services;

use App\Enums\DiagnosisType;
use App\Enums\EncounterStatus;
use App\Enums\Permissions\MedicalRecordPermission;
use App\Models\Assessment;
use App\Models\BreakGlassGrant;
use App\Models\ClinicalReport;
use App\Models\Diagnosis;
use App\Models\Encounter;
use App\Models\PatientAccessLog;
use App\Models\Procedure;
use App\Models\RecordAddendum;
use App\Models\RecordDraft;
use App\Models\SensitiveNote;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MedicalRecordService
{
    /**
     * @return array<string, mixed>
     */
    public function getEncounterWithEmr(Encounter $encounter, User $user, ?string $clientIp = null, ?string $userAgent = null): array
    {
        $canViewSensitive = $user->can(MedicalRecordPermission::SensitiveNoteView->value)
            || BreakGlassGrant::where('user_id', $user->id)
                ->where('patient_id', $encounter->patient_id)
                ->active()
                ->exists();

        $relations = [
            'patient',
            'unit',
            'doctor',
            'guarantor',
            'queue',
            'assessments.createdBy',
            'assessments.finalizedBy',
            'assessments.addenda.createdBy',
            'diagnoses.createdBy',
            'procedures.performedBy',
            'procedures.createdBy',
            'clinicalReports.doctor',
            'clinicalReports.createdBy',
        ];

        if ($canViewSensitive) {
            $relations[] = 'sensitiveNotes.createdBy';
        }

        $encounter->load($relations);

        // Pencatatan log akses rekam medis pasien
        PatientAccessLog::create([
            'user_id' => $user->id,
            'patient_id' => $encounter->patient_id,
            'unit_id' => $encounter->unit_id,
            'action' => 'view_emr',
            'ip_address' => $clientIp,
            'user_agent' => $userAgent,
            'context' => [
                'encounter_id' => $encounter->id,
                'encounter_number' => $encounter->encounter_number,
                'viewed_sensitive' => $canViewSensitive,
            ],
        ]);

        $data = $encounter->toArray();

        // Keamanan: field catatan sensitif secara mutlak tidak dikirim ke klien jika pengguna tidak berwenang
        if (! $canViewSensitive) {
            unset($data['sensitive_notes']);
        }

        $data['can_view_sensitive'] = $canViewSensitive;

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createAssessment(Encounter $encounter, array $data, User $actor): Assessment
    {
        return DB::transaction(function () use ($encounter, $data, $actor): Assessment {
            $assessment = Assessment::create([
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'created_by' => $actor->id,
                'type' => $data['type'],
                'subjective' => $data['subjective'] ?? null,
                'objective' => $data['objective'] ?? null,
                'assessment' => $data['assessment'] ?? null,
                'plan' => $data['plan'] ?? null,
                'vital_signs' => $data['vital_signs'] ?? null,
                'triage_level' => $data['triage_level'] ?? null,
                'allergies' => $data['allergies'] ?? null,
                'is_final' => false,
            ]);

            // Ubah status encounter menjadi sedang konsultasi jika masih arrived
            if ($encounter->status === EncounterStatus::Arrived) {
                $encounter->update(['status' => EncounterStatus::InConsultation]);
            }

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($assessment)
                ->event('assessment_created')
                ->withProperties([
                    'encounter_id' => $encounter->id,
                    'patient_id' => $encounter->patient_id,
                    'type' => $assessment->type->value,
                ])
                ->log("Pencatatan asesmen klinis ({$assessment->type->value}) untuk encounter {$encounter->encounter_number}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $encounter->patient_id,
                'unit_id' => $encounter->unit_id,
                'action' => 'create_assessment',
                'context' => [
                    'encounter_id' => $encounter->id,
                    'assessment_id' => $assessment->id,
                ],
            ]);

            return $assessment;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateAssessment(Assessment $assessment, array $data, User $actor): Assessment
    {
        return DB::transaction(function () use ($assessment, $data, $actor): Assessment {
            $assessment->update([
                'type' => $data['type'] ?? $assessment->type,
                'subjective' => $data['subjective'] ?? $assessment->subjective,
                'objective' => $data['objective'] ?? $assessment->objective,
                'assessment' => $data['assessment'] ?? $assessment->assessment,
                'plan' => $data['plan'] ?? $assessment->plan,
                'vital_signs' => array_key_exists('vital_signs', $data) ? $data['vital_signs'] : $assessment->vital_signs,
                'triage_level' => array_key_exists('triage_level', $data) ? $data['triage_level'] : $assessment->triage_level,
                'allergies' => array_key_exists('allergies', $data) ? $data['allergies'] : $assessment->allergies,
            ]);

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($assessment)
                ->event('assessment_updated')
                ->withProperties([
                    'encounter_id' => $assessment->encounter_id,
                    'patient_id' => $assessment->patient_id,
                ])
                ->log("Pembaruan asesmen klinis {$assessment->id}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $assessment->patient_id,
                'unit_id' => $assessment->encounter->unit_id,
                'action' => 'update_assessment',
                'context' => [
                    'encounter_id' => $assessment->encounter_id,
                    'assessment_id' => $assessment->id,
                ],
            ]);

            return $assessment;
        });
    }

    public function finalizeAssessment(Assessment $assessment, User $actor): Assessment
    {
        return DB::transaction(function () use ($assessment, $actor): Assessment {
            $assessment->update([
                'is_final' => true,
                'finalized_at' => now(),
                'finalized_by' => $actor->id,
            ]);

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($assessment)
                ->event('assessment_finalized')
                ->withProperties([
                    'encounter_id' => $assessment->encounter_id,
                    'patient_id' => $assessment->patient_id,
                ])
                ->log("Finalisasi asesmen klinis {$assessment->id}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $assessment->patient_id,
                'unit_id' => $assessment->encounter->unit_id,
                'action' => 'finalize_assessment',
                'context' => [
                    'encounter_id' => $assessment->encounter_id,
                    'assessment_id' => $assessment->id,
                ],
            ]);

            return $assessment;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createAddendum(Assessment $assessment, array $data, User $actor): RecordAddendum
    {
        return DB::transaction(function () use ($assessment, $data, $actor): RecordAddendum {
            $addendum = RecordAddendum::create([
                'assessment_id' => $assessment->id,
                'reason' => $data['reason'],
                'content' => $data['content'],
                'created_by' => $actor->id,
            ]);

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($addendum)
                ->event('assessment_addendum_created')
                ->withProperties([
                    'assessment_id' => $assessment->id,
                    'encounter_id' => $assessment->encounter_id,
                    'patient_id' => $assessment->patient_id,
                    'reason' => $data['reason'],
                ])
                ->log("Pembuatan addendum pada asesmen {$assessment->id}: {$data['reason']}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $assessment->patient_id,
                'unit_id' => $assessment->encounter->unit_id,
                'action' => 'addendum_created',
                'context' => [
                    'assessment_id' => $assessment->id,
                    'addendum_id' => $addendum->id,
                ],
            ]);

            return $addendum;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addDiagnosis(Encounter $encounter, array $data, User $actor): Diagnosis
    {
        return DB::transaction(function () use ($encounter, $data, $actor): Diagnosis {
            // Jika diagnosis baru adalah primary, ubah primary sebelumnya menjadi secondary
            if ($data['type'] === DiagnosisType::Primary || $data['type'] === 'primary') {
                Diagnosis::where('encounter_id', $encounter->id)
                    ->where('type', DiagnosisType::Primary)
                    ->update(['type' => DiagnosisType::Secondary]);
            }

            $diagnosis = Diagnosis::create([
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'icd10_code' => $data['icd10_code'],
                'icd10_name' => $data['icd10_name'],
                'type' => $data['type'],
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor->id,
            ]);

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($diagnosis)
                ->event('diagnosis_added')
                ->withProperties([
                    'encounter_id' => $encounter->id,
                    'icd10_code' => $diagnosis->icd10_code,
                    'type' => $diagnosis->type->value,
                ])
                ->log("Penambahan diagnosis {$diagnosis->icd10_code} ({$diagnosis->type->value})");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $encounter->patient_id,
                'unit_id' => $encounter->unit_id,
                'action' => 'add_diagnosis',
                'context' => [
                    'diagnosis_id' => $diagnosis->id,
                    'icd10_code' => $diagnosis->icd10_code,
                ],
            ]);

            return $diagnosis;
        });
    }

    public function deleteDiagnosis(Diagnosis $diagnosis, User $actor): void
    {
        DB::transaction(function () use ($diagnosis, $actor): void {
            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($diagnosis)
                ->event('diagnosis_deleted')
                ->withProperties([
                    'encounter_id' => $diagnosis->encounter_id,
                    'icd10_code' => $diagnosis->icd10_code,
                ])
                ->log("Penghapusan diagnosis {$diagnosis->icd10_code}");

            $diagnosis->delete();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addProcedure(Encounter $encounter, array $data, User $actor): Procedure
    {
        return DB::transaction(function () use ($encounter, $data, $actor): Procedure {
            $procedure = Procedure::create([
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'icd9_code' => $data['icd9_code'] ?? null,
                'name' => $data['name'],
                'notes' => $data['notes'] ?? null,
                'performed_by' => $data['performed_by'] ?? null,
                'created_by' => $actor->id,
            ]);

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($procedure)
                ->event('procedure_added')
                ->withProperties([
                    'encounter_id' => $encounter->id,
                    'procedure_name' => $procedure->name,
                ])
                ->log("Penambahan tindakan medis {$procedure->name}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $encounter->patient_id,
                'unit_id' => $encounter->unit_id,
                'action' => 'add_procedure',
                'context' => [
                    'procedure_id' => $procedure->id,
                    'name' => $procedure->name,
                ],
            ]);

            // Sinkronkan draft invoice kunjungan agar otomatis memuat biaya tindakan baru
            $draftInvoice = $encounter->invoices()->where('status', 'draft')->first();
            if ($draftInvoice) {
                app(BillingCalculationService::class)->syncInvoiceItems($draftInvoice, $encounter);
            }

            return $procedure;
        });
    }

    public function deleteProcedure(Procedure $procedure, User $actor): void
    {
        DB::transaction(function () use ($procedure, $actor): void {
            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($procedure)
                ->event('procedure_deleted')
                ->withProperties([
                    'encounter_id' => $procedure->encounter_id,
                    'procedure_name' => $procedure->name,
                ])
                ->log("Penghapusan tindakan {$procedure->name}");

            $encounter = $procedure->encounter;
            $procedure->delete();

            // Sinkronkan ulang tagihan draft jika ada tindakan yang dihapus
            if ($encounter) {
                $draftInvoice = $encounter->invoices()->where('status', 'draft')->first();
                if ($draftInvoice) {
                    app(BillingCalculationService::class)->syncInvoiceItems($draftInvoice, $encounter);
                }
            }
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addSensitiveNote(Encounter $encounter, array $data, User $actor): SensitiveNote
    {
        return DB::transaction(function () use ($encounter, $data, $actor): SensitiveNote {
            $note = SensitiveNote::create([
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'category' => $data['category'],
                'content' => $data['content'],
                'created_by' => $actor->id,
            ]);

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($note)
                ->event('sensitive_note_added')
                ->withProperties([
                    'encounter_id' => $encounter->id,
                    'patient_id' => $encounter->patient_id,
                    'category' => $note->category->value,
                ])
                ->log("Penambahan catatan sensitif kategori {$note->category->value}");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $encounter->patient_id,
                'unit_id' => $encounter->unit_id,
                'action' => 'add_sensitive_note',
                'context' => [
                    'note_id' => $note->id,
                    'category' => $note->category->value,
                ],
            ]);

            return $note;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createClinicalReport(Encounter $encounter, array $data, User $actor): ClinicalReport
    {
        return DB::transaction(function () use ($encounter, $data, $actor): ClinicalReport {
            $report = ClinicalReport::create([
                'encounter_id' => $encounter->id,
                'patient_id' => $encounter->patient_id,
                'report_type' => $data['report_type'],
                'title' => $data['title'],
                'content' => $data['content'],
                'reported_at' => $data['reported_at'] ?? now(),
                'doctor_id' => $data['doctor_id'] ?? null,
                'created_by' => $actor->id,
            ]);

            activity('medical-record')
                ->causedBy($actor)
                ->performedOn($report)
                ->event('clinical_report_created')
                ->withProperties([
                    'encounter_id' => $encounter->id,
                    'report_type' => $report->report_type->value,
                    'title' => $report->title,
                ])
                ->log("Pembuatan laporan klinis {$report->title} ({$report->report_type->value})");

            PatientAccessLog::create([
                'user_id' => $actor->id,
                'patient_id' => $encounter->patient_id,
                'unit_id' => $encounter->unit_id,
                'action' => 'create_clinical_report',
                'context' => [
                    'report_id' => $report->id,
                    'report_type' => $report->report_type->value,
                ],
            ]);

            return $report;
        });
    }

    /**
     * @param  array<string, mixed>  $content
     */
    public function saveDraft(Encounter $encounter, string $formType, array $content, User $actor): RecordDraft
    {
        return RecordDraft::updateOrCreate(
            [
                'encounter_id' => $encounter->id,
                'user_id' => $actor->id,
                'form_type' => $formType,
            ],
            [
                'content' => $content,
            ]
        );
    }

    public function getDraft(Encounter $encounter, string $formType, User $actor): ?RecordDraft
    {
        return RecordDraft::where('encounter_id', $encounter->id)
            ->where('user_id', $actor->id)
            ->where('form_type', $formType)
            ->first();
    }
}
