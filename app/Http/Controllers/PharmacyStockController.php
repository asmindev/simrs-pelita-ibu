<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustStockRequest;
use App\Http\Requests\StoreDrugBatchRequest;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\StockMovement;
use App\Services\PharmacyStockService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PharmacyStockController extends Controller
{
    public function __construct(
        protected PharmacyStockService $stockService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', DrugBatch::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString(); // all, available, expired, empty

        $batches = DrugBatch::query()
            ->with(['drug.category'])
            ->when($search !== '', function (Builder $q) use ($search) {
                $q->where('batch_number', 'like', "%{$search}%")
                    ->orWhereHas('drug', fn (Builder $dq) => $dq->search($search));
            })
            ->when($status === 'available', fn (Builder $q) => $q->fefoAvailable())
            ->when($status === 'expired', fn (Builder $q) => $q->whereDate('expiry_date', '<', Carbon::today()))
            ->when($status === 'empty', fn (Builder $q) => $q->where('current_quantity', '<=', 0))
            ->orderBy('expiry_date', 'asc')
            ->paginate(15)
            ->withQueryString();

        $drugs = Drug::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'form', 'unit_of_measure', 'price']);

        $recentMovements = StockMovement::query()
            ->with(['drug:id,name,code', 'drugBatch:id,batch_number', 'user:id,name'])
            ->latest('id')
            ->limit(10)
            ->get();

        return Inertia::render('pharmacy/stock/index', [
            'batches' => $batches,
            'drugs' => $drugs,
            'recentMovements' => $recentMovements,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statistics' => [
                'total_batches' => DrugBatch::query()->where('is_active', true)->count(),
                'active_stock' => DrugBatch::query()->where('is_active', true)->sum('current_quantity'),
                'expiring_soon' => DrugBatch::query()
                    ->where('is_active', true)
                    ->where('current_quantity', '>', 0)
                    ->whereBetween('expiry_date', [Carbon::today(), Carbon::today()->addDays(30)])
                    ->count(),
                'expired' => DrugBatch::query()
                    ->where('is_active', true)
                    ->whereDate('expiry_date', '<', Carbon::today())
                    ->count(),
            ],
        ]);
    }

    public function storeBatch(StoreDrugBatchRequest $request): RedirectResponse
    {
        Gate::authorize('create', DrugBatch::class);

        $validated = $request->validated();

        $batch = DrugBatch::create([
            'drug_id' => $validated['drug_id'],
            'batch_number' => $validated['batch_number'],
            'expiry_date' => $validated['expiry_date'],
            'initial_quantity' => $validated['initial_quantity'],
            'current_quantity' => $validated['initial_quantity'],
            'buy_price' => $validated['buy_price'] ?? 0,
            'is_active' => true,
        ]);

        StockMovement::create([
            'drug_id' => $batch->drug_id,
            'drug_batch_id' => $batch->id,
            'type' => 'in',
            'quantity' => $batch->initial_quantity,
            'balance_before' => 0,
            'balance_after' => $batch->initial_quantity,
            'reason' => 'Penerimaan stok awal batch baru.',
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', "Batch {$batch->batch_number} berhasil ditambahkan dengan stok {$batch->initial_quantity}.");
    }

    public function adjust(AdjustStockRequest $request, DrugBatch $batch): RedirectResponse
    {
        Gate::authorize('adjust', $batch);

        $this->stockService->adjustStock(
            $batch,
            (int) $request->validated('new_quantity'),
            $request->validated('reason'),
            $request->user()
        );

        return back()->with('success', "Stok batch {$batch->batch_number} berhasil disesuaikan.");
    }
}
