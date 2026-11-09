<?php

namespace Database\Seeders;

use App\Enums\EncounterStatus;
use App\Enums\EncounterType;
use App\Enums\GuarantorType;
use App\Enums\PatientGender;
use App\Enums\QueueStatus;
use App\Enums\RoleName;
use App\Enums\TariffCategory;
use App\Enums\UnitType;
use App\Models\Admission;
use App\Models\Assessment;
use App\Models\Bed;
use App\Models\BedAssignment;
use App\Models\Diagnosis;
use App\Models\DiagnosticOrder;
use App\Models\DiagnosticOrderItem;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\DrugCategory;
use App\Models\Encounter;
use App\Models\Guarantor;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\Procedure;
use App\Models\Queue;
use App\Models\Tariff;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DemoHospitalSeeder extends Seeder
{
    /**
     * Run the comprehensive demo hospital seeder.
     */
    public function run(): void
    {
        $today = Carbon::today();

        // 1. UNIT PELAYANAN
        $unitPoliUmum = Unit::firstOrCreate(
            ['code' => 'POLI-UMUM'],
            ['name' => 'Poli Umum', 'type' => UnitType::Outpatient, 'description' => 'Pelayanan kesehatan tingkat pertama dokter umum', 'is_active' => true]
        );

        $unitPoliAnak = Unit::firstOrCreate(
            ['code' => 'POLI-ANAK'],
            ['name' => 'Poli Anak & Tumbuh Kembang', 'type' => UnitType::Outpatient, 'description' => 'Pelayanan spesialis anak', 'is_active' => true]
        );

        $unitPoliDalam = Unit::firstOrCreate(
            ['code' => 'POLI-DALAM'],
            ['name' => 'Poli Penyakit Dalam', 'type' => UnitType::Outpatient, 'description' => 'Pelayanan spesialis penyakit dalam (internist)', 'is_active' => true]
        );

        $unitIgd = Unit::firstOrCreate(
            ['code' => 'IGD-01'],
            ['name' => 'Instalasi Gawat Darurat (IGD)', 'type' => UnitType::Emergency, 'description' => 'Pelayanan kegawatdaruratan medis 24 jam', 'is_active' => true]
        );

        $unitFarmasi = Unit::firstOrCreate(
            ['code' => 'FAR-01'],
            ['name' => 'Farmasi & Apotek Rawat Jalan', 'type' => UnitType::Pharmacy, 'description' => 'Pelayanan resep obat dan peracikan farmasi', 'is_active' => true]
        );

        $unitLab = Unit::firstOrCreate(
            ['code' => 'LAB-01'],
            ['name' => 'Laboratorium Patologi Klinik', 'type' => UnitType::Laboratory, 'description' => 'Pemeriksaan hematologi, kimia klinik, dan urin', 'is_active' => true]
        );

        $unitRad = Unit::firstOrCreate(
            ['code' => 'RAD-01'],
            ['name' => 'Radiologi & Diagnostic Imaging', 'type' => UnitType::Radiology, 'description' => 'Foto Rontgen X-Ray, USG, dan CT-Scan', 'is_active' => true]
        );

        $unitRanapMelati = Unit::firstOrCreate(
            ['code' => 'RANAP-MELATI'],
            ['name' => 'Bangsal Rawat Inap Melati', 'type' => UnitType::Inpatient, 'description' => 'Ruang perawatan rawat inap umum dan anak', 'is_active' => true]
        );

        // 2. PENJAMIN PASIEN (GUARANTOR)
        $guarantorBpjs = Guarantor::firstOrCreate(
            ['code' => 'BPJS-KES'],
            ['name' => 'BPJS Kesehatan', 'type' => GuarantorType::Bpjs, 'description' => 'Jaminan Kesehatan Nasional', 'is_active' => true]
        );

        $guarantorUmum = Guarantor::firstOrCreate(
            ['code' => 'UMUM'],
            ['name' => 'Umum / Pembayaran Pribadi', 'type' => GuarantorType::General, 'description' => 'Pasien bayar mandiri tunai/kartu', 'is_active' => true]
        );

        $guarantorInhealth = Guarantor::firstOrCreate(
            ['code' => 'ASR-INHEALTH'],
            ['name' => 'Mandiri Inhealth', 'type' => GuarantorType::Insurance, 'description' => 'Asuransi kesehatan swasta Mandiri Inhealth', 'is_active' => true]
        );

        // 3. TARIF LAYANAN
        $tariffs = [
            ['code' => 'TAR-KONSUL-UMUM', 'name' => 'Konsultasi Dokter Umum', 'category' => TariffCategory::Consultation, 'unit_id' => $unitPoliUmum->id, 'price' => 50000],
            ['code' => 'TAR-KONSUL-ANAK', 'name' => 'Konsultasi Spesialis Anak', 'category' => TariffCategory::Consultation, 'unit_id' => $unitPoliAnak->id, 'price' => 125000],
            ['code' => 'TAR-KONSUL-DALAM', 'name' => 'Konsultasi Spesialis Penyakit Dalam', 'category' => TariffCategory::Consultation, 'unit_id' => $unitPoliDalam->id, 'price' => 135000],
            ['code' => 'TAR-IGD-TRIAGE', 'name' => 'Pemeriksaan Emergency & Triage IGD', 'category' => TariffCategory::Consultation, 'unit_id' => $unitIgd->id, 'price' => 100000],
            ['code' => 'TAR-LAB-DARAH', 'name' => 'Pemeriksaan Darah Lengkap (CBC)', 'category' => TariffCategory::Laboratory, 'unit_id' => $unitLab->id, 'price' => 95000],
            ['code' => 'TAR-RAD-THORAX', 'name' => 'Foto Rontgen Thorax PA', 'category' => TariffCategory::Radiology, 'unit_id' => $unitRad->id, 'price' => 150000],
            ['code' => 'TAR-TINDAKAN-EKG', 'name' => 'Rekam Elektrokardiogram (EKG 12-Lead)', 'category' => TariffCategory::Procedure, 'unit_id' => $unitPoliDalam->id, 'price' => 85000],
            ['code' => 'TAR-NEBULIZER', 'name' => 'Tindakan Nebulisasi / Terapi Uap', 'category' => TariffCategory::Procedure, 'unit_id' => $unitPoliAnak->id, 'price' => 75000],
        ];

        foreach ($tariffs as $t) {
            Tariff::firstOrCreate(['code' => $t['code']], [...$t, 'is_active' => true]);
        }

        // 4. KATEGORI OBAT & OBAT (FARMASI)
        $catAntibiotik = DrugCategory::firstOrCreate(['name' => 'Antibiotik'], ['description' => 'Obat infeksi bakteri']);
        $catAnalgesik = DrugCategory::firstOrCreate(['name' => 'Analgesik & Antipiretik'], ['description' => 'Pereda nyeri dan demam']);
        $catSaluranNapas = DrugCategory::firstOrCreate(['name' => 'Obat Saluran Napas'], ['description' => 'Batuk, pilek, dan bronkodilator']);
        $catGastro = DrugCategory::firstOrCreate(['name' => 'Saluran Cerna'], ['description' => 'Antasida dan penurun asam lambung']);

        $drugParacetamol = Drug::firstOrCreate(
            ['code' => 'OBT-PCT-500'],
            [
                'name' => 'Paracetamol 500mg',
                'drug_category_id' => $catAnalgesik->id,
                'form' => 'Tablet',
                'strength' => '500 mg',
                'unit_of_measure' => 'Tablet',
                'price' => 1500,
                'manufacturer' => 'Kimia Farma',
                'is_active' => true,
            ]
        );

        $drugAmoxicillin = Drug::firstOrCreate(
            ['code' => 'OBT-AMX-500'],
            [
                'name' => 'Amoxicillin 500mg',
                'drug_category_id' => $catAntibiotik->id,
                'form' => 'Kapsul',
                'strength' => '500 mg',
                'unit_of_measure' => 'Kapsul',
                'price' => 3500,
                'manufacturer' => 'Kalbe Farma',
                'is_active' => true,
            ]
        );

        $drugOmeprazole = Drug::firstOrCreate(
            ['code' => 'OBT-OMZ-20'],
            [
                'name' => 'Omeprazole 20mg',
                'drug_category_id' => $catGastro->id,
                'form' => 'Kapsul',
                'strength' => '20 mg',
                'unit_of_measure' => 'Kapsul',
                'price' => 4500,
                'manufacturer' => 'Dexa Medica',
                'is_active' => true,
            ]
        );

        $drugCetirizine = Drug::firstOrCreate(
            ['code' => 'OBT-CTZ-10'],
            [
                'name' => 'Cetirizine 10mg',
                'drug_category_id' => $catSaluranNapas->id,
                'form' => 'Tablet',
                'strength' => '10 mg',
                'unit_of_measure' => 'Tablet',
                'price' => 2000,
                'manufacturer' => 'Sanbe Farma',
                'is_active' => true,
            ]
        );

        // Batches Obat (FEFO)
        DrugBatch::firstOrCreate(
            ['batch_number' => 'BATCH-PCT-2026A'],
            [
                'drug_id' => $drugParacetamol->id,
                'initial_quantity' => 1000,
                'current_quantity' => 850,
                'buy_price' => 900,
                'expiry_date' => $today->copy()->addMonths(18),
                'is_active' => true,
            ]
        );

        DrugBatch::firstOrCreate(
            ['batch_number' => 'BATCH-AMX-2026A'],
            [
                'drug_id' => $drugAmoxicillin->id,
                'initial_quantity' => 500,
                'current_quantity' => 420,
                'buy_price' => 2200,
                'expiry_date' => $today->copy()->addMonths(12),
                'is_active' => true,
            ]
        );

        DrugBatch::firstOrCreate(
            ['batch_number' => 'BATCH-OMZ-2026A'],
            [
                'drug_id' => $drugOmeprazole->id,
                'initial_quantity' => 400,
                'current_quantity' => 310,
                'buy_price' => 2800,
                'expiry_date' => $today->copy()->addMonths(14),
                'is_active' => true,
            ]
        );

        // 5. KAMAR & BED RAWAT INAP (BANGSAL MELATI)
        $bedsData = [
            ['bed_number' => 'MELATI-VIP-01', 'room_name' => 'Paviliun Melati', 'class' => 'vip', 'daily_rate' => 750000, 'status' => 'available'],
            ['bed_number' => 'MELATI-101', 'room_name' => 'Kamar Melati 1', 'class' => 'class_1', 'daily_rate' => 450000, 'status' => 'occupied'],
            ['bed_number' => 'MELATI-102', 'room_name' => 'Kamar Melati 1', 'class' => 'class_1', 'daily_rate' => 450000, 'status' => 'available'],
            ['bed_number' => 'MELATI-201', 'room_name' => 'Kamar Melati 2', 'class' => 'class_2', 'daily_rate' => 300000, 'status' => 'occupied'],
            ['bed_number' => 'MELATI-202', 'room_name' => 'Kamar Melati 2', 'class' => 'class_2', 'daily_rate' => 300000, 'status' => 'available'],
            ['bed_number' => 'MELATI-301', 'room_name' => 'Kamar Melati 3', 'class' => 'class_3', 'daily_rate' => 175000, 'status' => 'available'],
            ['bed_number' => 'MELATI-302', 'room_name' => 'Kamar Melati 3', 'class' => 'class_3', 'daily_rate' => 175000, 'status' => 'available'],
            ['bed_number' => 'MELATI-303', 'room_name' => 'Kamar Melati 3', 'class' => 'class_3', 'daily_rate' => 175000, 'status' => 'available'],
        ];

        $seededBeds = [];
        foreach ($bedsData as $b) {
            $seededBeds[$b['bed_number']] = Bed::firstOrCreate(['bed_number' => $b['bed_number']], $b);
        }

        // 6. DOKTER & JADWAL PRAKTIK
        $dokAnak = Doctor::firstOrCreate(
            ['code' => 'DOK-001'],
            [
                'name' => 'dr. Budi Santoso, Sp.A',
                'specialization' => 'Spesialis Anak',
                'license_number' => 'SIP-503/001/IDI/2023',
                'phone' => '081234567890',
                'email' => 'dokter@simrs.test',
                'is_active' => true,
            ]
        );

        $dokDalam = Doctor::firstOrCreate(
            ['code' => 'DOK-002'],
            [
                'name' => 'dr. Siti Rahma, Sp.PD',
                'specialization' => 'Spesialis Penyakit Dalam',
                'license_number' => 'SIP-503/002/IDI/2023',
                'phone' => '081234567891',
                'email' => 'siti.rahma@simrs.test',
                'is_active' => true,
            ]
        );

        // Jadwal praktik dokter
        DoctorSchedule::firstOrCreate(
            ['doctor_id' => $dokAnak->id, 'unit_id' => $unitPoliAnak->id, 'day_of_week' => $today->dayOfWeek],
            ['start_time' => '08:00:00', 'end_time' => '13:00:00', 'quota' => 25, 'is_active' => true]
        );

        DoctorSchedule::firstOrCreate(
            ['doctor_id' => $dokDalam->id, 'unit_id' => $unitPoliDalam->id, 'day_of_week' => $today->dayOfWeek],
            ['start_time' => '09:00:00', 'end_time' => '14:00:00', 'quota' => 30, 'is_active' => true]
        );

        // 7. AKUN USER STAF DEMO (PASSWORD: password)
        $staffAccounts = [
            [
                'email' => 'dokter@simrs.test',
                'name' => 'dr. Budi Santoso, Sp.A',
                'roles' => [RoleName::Doctor->value],
                'units' => [$unitPoliAnak->id, $unitPoliUmum->id, $unitRanapMelati->id],
            ],
            [
                'email' => 'pendaftaran@simrs.test',
                'name' => 'Rian Hidayat (Loket Pendaftaran)',
                'roles' => [RoleName::Registration->value],
                'units' => [$unitPoliUmum->id, $unitPoliAnak->id, $unitPoliDalam->id, $unitIgd->id],
            ],
            [
                'email' => 'perawat@simrs.test',
                'name' => 'Ns. Dewi Sartika, S.Kep',
                'roles' => [RoleName::Nurse->value],
                'units' => [$unitRanapMelati->id, $unitIgd->id],
            ],
            [
                'email' => 'farmasi@simrs.test',
                'name' => 'apt. Nurul Izzah, S.Farm',
                'roles' => [RoleName::Pharmacist->value],
                'units' => [$unitFarmasi->id],
            ],
            [
                'email' => 'kasir@simrs.test',
                'name' => 'Maya Indah (Kasir Billing)',
                'roles' => [RoleName::Cashier->value],
                'units' => [],
            ],
            [
                'email' => 'laboran@simrs.test',
                'name' => 'Ahmad Fauzi, A.Md.AK',
                'roles' => [RoleName::LabAnalyst->value, RoleName::Radiographer->value],
                'units' => [$unitLab->id, $unitRad->id],
            ],
            [
                'email' => 'manajemen@simrs.test',
                'name' => 'dr. Hendra Wijaya, MARS (Direktur RS)',
                'roles' => [RoleName::Management->value],
                'units' => [],
            ],
            [
                'email' => 'auditor@simrs.test',
                'name' => 'Ratna Sari, SE (Auditor Klinis)',
                'roles' => [RoleName::Auditor->value],
                'units' => [],
            ],
        ];

        foreach ($staffAccounts as $acc) {
            $user = User::firstOrCreate(
                ['email' => $acc['email']],
                [
                    'name' => $acc['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            $user->syncRoles($acc['roles']);
            if (! empty($acc['units'])) {
                $user->units()->sync($acc['units']);
            }
        }

        // 8. DATA PASIEN DEMO
        $patientsData = [
            ['name' => 'Muhammad Rizky Pratama', 'mrn' => 'RM-2026-0001', 'nik' => '7471012304950001', 'gender' => PatientGender::Male, 'birth_date' => '1995-04-23', 'address' => 'Jl. Ahmad Yani No. 45, Kendari', 'phone' => '081122334455'],
            ['name' => 'Anisa Rahmawati', 'mrn' => 'RM-2026-0002', 'nik' => '7471016508980002', 'gender' => PatientGender::Female, 'birth_date' => '1998-08-25', 'address' => 'Jl. MT Haryono No. 12, Kendari', 'phone' => '081234567801'],
            ['name' => 'Bambang Soedjarwo', 'mrn' => 'RM-2026-0003', 'nik' => '7471011211600003', 'gender' => PatientGender::Male, 'birth_date' => '1960-11-12', 'address' => 'Jl. Piere Tendean No. 8, Kendari', 'phone' => '081345678902'],
            ['name' => 'Karin Novilda', 'mrn' => 'RM-2026-0004', 'nik' => '7471014502010004', 'gender' => PatientGender::Female, 'birth_date' => '2001-02-15', 'address' => 'Jl. Sao-Sao No. 90, Kendari', 'phone' => '081456789013'],
            ['name' => 'Arkanendra Putra (Anak)', 'mrn' => 'RM-2026-0005', 'nik' => '7471011010210005', 'gender' => PatientGender::Male, 'birth_date' => '2021-10-10', 'address' => 'Jl. Saranani No. 34, Kendari', 'phone' => '081567890124'],
        ];

        $seededPatients = [];
        foreach ($patientsData as $p) {
            $seededPatients[$p['mrn']] = Patient::firstOrCreate(
                ['medical_record_number' => $p['mrn']],
                [
                    'name' => $p['name'],
                    'nik' => $p['nik'],
                    'gender' => $p['gender'],
                    'birth_date' => $p['birth_date'],
                    'address' => $p['address'],
                    'phone' => $p['phone'],
                    'is_active' => true,
                ]
            );
        }

        // 9. KUNJUNGAN & ANTREAN HARI INI (ENCOUNTERS & QUEUES)
        // Pasien 1: Poli Anak (dr. Budi) - Menunggu Konsultasi
        $enc1 = Encounter::firstOrCreate(
            ['encounter_number' => 'ENC-'.now()->format('Ymd').'-00001'],
            [
                'patient_id' => $seededPatients['RM-2026-0005']->id,
                'unit_id' => $unitPoliAnak->id,
                'doctor_id' => $dokAnak->id,
                'type' => EncounterType::Outpatient,
                'status' => EncounterStatus::Arrived,
                'guarantor_id' => $guarantorBpjs->id,
                'arrived_at' => now()->setTime(8, 30),
                'notes' => 'Demam tinggi sejak 2 hari, batuk pilek',
            ]
        );

        Queue::firstOrCreate(
            ['encounter_id' => $enc1->id],
            [
                'unit_id' => $unitPoliAnak->id,
                'queue_date' => $today,
                'queue_code' => 'A-001',
                'queue_number' => 1,
                'status' => QueueStatus::Waiting,
                'called_at' => null,
            ]
        );

        // Pasien 2: Poli Penyakit Dalam (dr. Siti) - Sedang Konsultasi
        $enc2 = Encounter::firstOrCreate(
            ['encounter_number' => 'ENC-'.now()->format('Ymd').'-00002'],
            [
                'patient_id' => $seededPatients['RM-2026-0003']->id,
                'unit_id' => $unitPoliDalam->id,
                'doctor_id' => $dokDalam->id,
                'type' => EncounterType::Outpatient,
                'status' => EncounterStatus::InConsultation,
                'guarantor_id' => $guarantorInhealth->id,
                'arrived_at' => now()->setTime(9, 0),
                'consultation_started_at' => now()->setTime(9, 15),
                'notes' => 'Kontrol rutin hipertensi dan nyeri dada',
            ]
        );

        Queue::firstOrCreate(
            ['encounter_id' => $enc2->id],
            [
                'unit_id' => $unitPoliDalam->id,
                'queue_date' => $today,
                'queue_code' => 'B-001',
                'queue_number' => 1,
                'status' => QueueStatus::Serving,
                'called_at' => now()->setTime(9, 15),
            ]
        );

        // Pasien 3: Selesai Konsultasi Poli Anak + EMR + Resep Obat + Invoice
        $enc3 = Encounter::firstOrCreate(
            ['encounter_number' => 'ENC-'.now()->format('Ymd').'-00003'],
            [
                'patient_id' => $seededPatients['RM-2026-0001']->id,
                'unit_id' => $unitPoliUmum->id,
                'doctor_id' => $dokAnak->id,
                'type' => EncounterType::Outpatient,
                'status' => EncounterStatus::Finished,
                'guarantor_id' => $guarantorUmum->id,
                'arrived_at' => now()->setTime(8, 0),
                'consultation_started_at' => now()->setTime(8, 15),
                'consultation_ended_at' => now()->setTime(8, 45),
            ]
        );

        Queue::firstOrCreate(
            ['encounter_id' => $enc3->id],
            [
                'unit_id' => $unitPoliUmum->id,
                'queue_date' => $today,
                'queue_code' => 'U-001',
                'queue_number' => 1,
                'status' => QueueStatus::Completed,
                'called_at' => now()->setTime(8, 15),
                'served_at' => now()->setTime(8, 45),
            ]
        );

        // SOAP Assessment EMR untuk Pasien 3
        $adminUser = User::first();

        Assessment::firstOrCreate(
            ['encounter_id' => $enc3->id],
            [
                'patient_id' => $seededPatients['RM-2026-0001']->id,
                'created_by' => $adminUser->id,
                'type' => 'soap',
                'subjective' => 'Pasien mengeluh pusing berputar, mual dan muntah 2 kali sejak kemarin malam.',
                'objective' => 'Keadaan umum: sedang, TD: 120/80 mmHg, Nadi: 84x/m, Suhu: 36.8C, RR: 20x/m.',
                'assessment' => 'Vertigo perifer e.c BPPV',
                'plan' => 'Istirahat tirah baring, hidrasi cukup, terapi medikamentosa anti-vertigo dan analgetik.',
                'is_final' => true,
                'finalized_at' => now()->setTime(8, 45),
                'finalized_by' => $adminUser->id,
            ]
        );

        Diagnosis::firstOrCreate(
            ['encounter_id' => $enc3->id, 'icd10_code' => 'H81.1'],
            [
                'patient_id' => $seededPatients['RM-2026-0001']->id,
                'icd10_name' => 'Benign paroxysmal vertigo (BPPV)',
                'type' => 'primary',
                'created_by' => $adminUser->id,
            ]
        );

        Procedure::firstOrCreate(
            ['encounter_id' => $enc3->id, 'icd9_code' => '89.07'],
            [
                'patient_id' => $seededPatients['RM-2026-0001']->id,
                'name' => 'General medical consultation and evaluation',
                'performed_by' => $dokAnak->id,
                'created_by' => $adminUser->id,
            ]
        );

        // 10. RESEP OBAT DI FARMASI (PRESCRIPTION)
        $rx = Prescription::firstOrCreate(
            ['encounter_id' => $enc3->id],
            [
                'prescription_number' => 'RX-'.now()->format('Ymd').'-0001',
                'patient_id' => $seededPatients['RM-2026-0001']->id,
                'doctor_id' => $dokAnak->id,
                'unit_id' => $unitFarmasi->id,
                'status' => 'submitted', // menunggu telaah apoteker
                'notes' => 'Sesudah makan',
            ]
        );

        PrescriptionItem::firstOrCreate(
            ['prescription_id' => $rx->id, 'drug_id' => $drugParacetamol->id],
            [
                'quantity' => 10,
                'dosage' => '500 mg',
                'frequency' => '3x1 tablet',
                'route' => 'Oral',
                'instructions' => 'Bila pusing/demam, sesudah makan',
                'status' => 'pending',
            ]
        );

        // 11. INVOICE KASIR (BILLING)
        $inv = Invoice::firstOrCreate(
            ['encounter_id' => $enc3->id],
            [
                'invoice_number' => 'INV-'.now()->format('Ymd').'-0001',
                'patient_id' => $seededPatients['RM-2026-0001']->id,
                'guarantor_id' => $guarantorUmum->id,
                'subtotal' => 65000,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => 65000,
                'paid_amount' => 65000,
                'status' => 'paid',
                'finalized_at' => now()->setTime(8, 50),
                'finalized_by' => $adminUser->id,
            ]
        );

        InvoiceItem::firstOrCreate(
            ['invoice_id' => $inv->id, 'name' => 'Konsultasi Dokter Umum'],
            [
                'item_type' => 'consultation',
                'quantity' => 1,
                'unit_price' => 50000,
                'subtotal' => 50000,
                'total' => 50000,
            ]
        );

        InvoiceItem::firstOrCreate(
            ['invoice_id' => $inv->id, 'name' => 'Paracetamol 500mg (10 tab)'],
            [
                'item_type' => 'drug',
                'quantity' => 10,
                'unit_price' => 1500,
                'subtotal' => 15000,
                'total' => 15000,
            ]
        );

        Payment::firstOrCreate(
            ['invoice_id' => $inv->id],
            [
                'payment_number' => 'KWT-'.now()->format('Ymd').'-0001',
                'amount' => 65000,
                'method' => 'cash',
                'paid_at' => now()->setTime(9, 10),
                'received_by' => $adminUser->id,
            ]
        );

        // 12. PENUNJANG LABORATORIUM & RADIOLOGI (DIAGNOSTICS)
        $diagOrder = DiagnosticOrder::firstOrCreate(
            ['order_number' => 'LAB-'.now()->format('Ymd').'-0001'],
            [
                'encounter_id' => $enc2->id,
                'patient_id' => $seededPatients['RM-2026-0003']->id,
                'doctor_id' => $dokDalam->id,
                'unit_id' => $unitLab->id,
                'type' => 'laboratory',
                'status' => 'ordered', // menunggu input hasil oleh laboran
                'clinical_notes' => 'Evaluasi leukosit dan hemoglobin',
            ]
        );

        DiagnosticOrderItem::firstOrCreate(
            ['diagnostic_order_id' => $diagOrder->id, 'test_name' => 'Darah Lengkap (Hematologi)'],
            [
                'tariff_id' => Tariff::where('code', 'TAR-LAB-DARAH')->first()?->id,
                'status' => 'ordered',
            ]
        );

        // 13. RAWAT INAP & ALOKASI BED (INPATIENT ADMISSION)
        $adm = Admission::firstOrCreate(
            ['admission_number' => 'ADM-'.now()->format('Ymd').'-0001'],
            [
                'encounter_id' => $enc2->id,
                'patient_id' => $seededPatients['RM-2026-0002']->id,
                'doctor_id' => $dokDalam->id,
                'status' => 'admitted',
                'initial_diagnosis' => 'Dengue Hemorrhagic Fever (DHF) Grade II',
                'admitted_at' => now()->subDay()->setTime(14, 0),
            ]
        );

        BedAssignment::firstOrCreate(
            ['admission_id' => $adm->id, 'bed_id' => $seededBeds['MELATI-101']->id],
            [
                'assigned_at' => now()->subDay()->setTime(14, 30),
                'assigned_by' => $adminUser->id,
            ]
        );
    }
}
