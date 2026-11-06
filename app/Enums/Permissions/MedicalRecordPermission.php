<?php

namespace App\Enums\Permissions;

enum MedicalRecordPermission: string
{
    case AssessmentUpdate = 'medical-record.assessment.update';
    case SensitiveNoteView = 'medical-record.sensitive-note.view';
    case SensitiveNoteUpdate = 'medical-record.sensitive-note.update';
    case DiagnosisManage = 'medical-record.diagnosis.manage';
    case EncounterView = 'medical-record.encounter.view';
    case EncounterCreate = 'medical-record.encounter.create';
    case EncounterUpdate = 'medical-record.encounter.update';
    case ResumeExport = 'medical-record.resume.export';
    case ProcedureManage = 'medical-record.procedure.manage';
}
