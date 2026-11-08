<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDiagnosticOrderRequest;
use App\Http\Requests\StoreDiagnosticResultRequest;
use App\Models\DiagnosticOrder;
use App\Models\Encounter;
use App\Services\DiagnosticService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DiagnosticOrderController extends Controller
{
    public function __construct(
        protected DiagnosticService $diagnosticService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', DiagnosticOrder::class);

        $search = $request->string('search')->trim()->toString();
        $type = $request->string('type')->toString(); // laboratory, radiology, all
        $status = $request->string('status')->toString();
        $date = $request->string('date')->toString();

        $orders = DiagnosticOrder::query()
            ->with(['patient', 'doctor', 'unit', 'items'])
            ->when($search !== '', fn (Builder $q) => $q->search($search))
            ->when($type !== '' && $type !== 'all', fn (Builder $q) => $q->where('type', $type))
            ->when($status !== '' && $status !== 'all', fn (Builder $q) => $q->where('status', $status))
            ->when($date !== '', fn (Builder $q) => $q->whereDate('created_at', $date))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $today = Carbon::today();

        return Inertia::render('diagnostics/order/list/index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'status' => $status,
                'date' => $date,
            ],
            'statistics' => [
                'total_today' => DiagnosticOrder::whereDate('created_at', $today)->count(),
                'lab_orders' => DiagnosticOrder::where('type', 'laboratory')->whereDate('created_at', $today)->count(),
                'radiology_orders' => DiagnosticOrder::where('type', 'radiology')->whereDate('created_at', $today)->count(),
                'completed_today' => DiagnosticOrder::where('status', 'completed')->whereDate('created_at', $today)->count(),
            ],
        ]);
    }

    public function store(StoreDiagnosticOrderRequest $request): RedirectResponse
    {
        Gate::authorize('create', DiagnosticOrder::class);

        $encounter = Encounter::findOrFail($request->validated('encounter_id'));
        $order = $this->diagnosticService->createOrder($encounter, $request->validated(), $request->user());

        return redirect()
            ->route('diagnostics.orders.show', $order->id)
            ->with('success', "Order penunjang {$order->order_number} berhasil dibuat.");
    }

    public function show(DiagnosticOrder $order): Response
    {
        Gate::authorize('view', $order);

        $order->load([
            'patient',
            'doctor',
            'unit',
            'encounter',
            'items.results',
            'results.performedBy',
            'completedBy',
        ]);

        return Inertia::render('diagnostics/order/show/index', [
            'order' => $order,
        ]);
    }

    public function inputResult(StoreDiagnosticResultRequest $request, DiagnosticOrder $order): RedirectResponse
    {
        Gate::authorize('inputResult', $order);

        $attachment = $request->file('attachment');
        $this->diagnosticService->recordResult($order, $request->validated(), $attachment, $request->user());

        return back()->with('success', 'Hasil pemeriksaan diagnostik berhasil disimpan.');
    }

    public function complete(Request $request, DiagnosticOrder $order): RedirectResponse
    {
        Gate::authorize('complete', $order);

        $this->diagnosticService->completeOrder($order, $request->user());

        return back()->with('success', "Order pemeriksaan {$order->order_number} selesai dan hasil diverifikasi.");
    }
}
