<?php

namespace App\Http\Controllers\Rbac;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rbac\StoreRoleRequest;
use App\Http\Requests\Rbac\UpdateRolePermissionsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Role::class);

        $roles = Role::with(['permissions' => function ($q): void {
            $q->select('id', 'name');
        }])
            ->withCount('users')
            ->orderBy('name')
            ->get();

        $allPermissions = Permission::orderBy('name')->get(['id', 'name']);

        // Group permissions by prefix/domain
        $groupedPermissions = [];
        $domainLabels = [
            'master-data' => 'Master Data',
            'registration' => 'Pendaftaran Kunjungan',
            'medical-record' => 'Rekam Medis (EMR)',
            'pharmacy' => 'Farmasi & Apotek',
            'cashier' => 'Kasir & Tagihan',
            'diagnostics' => 'Penunjang Medis (Lab/Rad)',
            'inpatient' => 'Rawat Inap',
            'rbac' => 'RBAC & Akses',
            'audit' => 'Audit & Log Trail',
        ];

        foreach ($allPermissions as $perm) {
            $parts = explode('.', $perm->name);
            $domainKey = $parts[0] ?? 'other';
            $label = $domainLabels[$domainKey] ?? ucfirst($domainKey);

            if (! isset($groupedPermissions[$domainKey])) {
                $groupedPermissions[$domainKey] = [
                    'domain' => $domainKey,
                    'label' => $label,
                    'permissions' => [],
                ];
            }

            $groupedPermissions[$domainKey]['permissions'][] = [
                'name' => $perm->name,
                'resource' => $parts[1] ?? '',
                'action' => $parts[2] ?? '',
            ];
        }

        return Inertia::render('rbac/role/list/index', [
            'roles' => $roles,
            'groupedPermissions' => array_values($groupedPermissions),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        activity()
            ->causedBy($request->user())
            ->performedOn($role)
            ->withProperties(['role' => $role->name, 'permissions' => $validated['permissions'] ?? []])
            ->log("Membuat role baru: {$role->name}");

        return redirect()->route('rbac.roles.index')->with('success', "Role {$role->name} berhasil dibuat.");
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, Role $role): RedirectResponse
    {
        $validated = $request->validated();

        if ($role->name === 'super-admin') {
            return back()->with('error', 'Hak akses super-admin tidak dapat diubah.');
        }

        $role->syncPermissions($validated['permissions']);

        activity()
            ->causedBy($request->user())
            ->performedOn($role)
            ->withProperties(['role' => $role->name, 'permission_count' => count($validated['permissions'])])
            ->log("Memperbarui permissions untuk role {$role->name}");

        return redirect()->route('rbac.roles.index')->with('success', "Hak akses role {$role->name} berhasil diperbarui.");
    }
}
