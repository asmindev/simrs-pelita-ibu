<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\VoidInvoiceRequest;
use App\Models\Encounter;
use App\Models\Invoice;
use App\Services\BillingCalculationService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(
        protected BillingCalculationService $billingService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Invoice::class);

        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->toString();
        $date = $request->string('date')->toString();

        $invoices = Invoice::query()
            ->with(['patient', 'encounter.unit', 'guarantor'])
            ->when($search !== '', fn (Builder $q) => $q->search($search))
            ->when($status !== '' && $status !== 'all', fn (Builder $q) => $q->where('status', $status))
            ->when($date !== '', fn (Builder $q) => $q->whereDate('created_at', $date))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $today = Carbon::today();

        return Inertia::render('cashier/invoice/list/index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'date' => $date,
            ],
            'statistics' => [
                'total_today' => Invoice::whereDate('created_at', $today)->count(),
                'draft' => Invoice::where('status', 'draft')->whereDate('created_at', $today)->count(),
                'paid' => Invoice::where('status', 'paid')->whereDate('created_at', $today)->count(),
                'revenue_today' => (float) Invoice::where('status', 'paid')->whereDate('created_at', $today)->sum('paid_amount'),
            ],
        ]);
    }

    public function store(StoreInvoiceRequest $request): RedirectResponse
    {
        Gate::authorize('create', Invoice::class);

        $encounter = Encounter::findOrFail($request->validated('encounter_id'));
        $invoice = $this->billingService->createFromEncounter($encounter, $request->user());

        return redirect()
            ->route('cashier.invoices.show', $invoice->id)
            ->with('success', "Invoice {$invoice->invoice_number} berhasil dibuat.");
    }

    public function show(Invoice $invoice): Response
    {
        Gate::authorize('view', $invoice);

        $invoice->load([
            'patient',
            'encounter.unit',
            'encounter.doctor',
            'guarantor',
            'items',
            'payments.receivedBy',
            'refunds.approvedBy',
            'finalizedBy',
            'voidedBy',
        ]);

        return Inertia::render('cashier/invoice/show/index', [
            'invoice' => $invoice,
        ]);
    }

    public function finalize(Request $request, Invoice $invoice): RedirectResponse
    {
        Gate::authorize('finalize', $invoice);

        $this->billingService->finalize($invoice, $request->user());

        return back()->with('success', "Invoice {$invoice->invoice_number} berhasil difinalisasi.");
    }

    public function void(VoidInvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        Gate::authorize('void', $invoice);

        $this->billingService->voidInvoice(
            $invoice,
            $request->validated('void_reason'),
            $request->user()
        );

        return back()->with('success', "Invoice {$invoice->invoice_number} berhasil dibatalkan (void).");
    }
}
