<?php

namespace App\Http\Controllers\Rbac;

use App\Http\Controllers\Controller;
use App\Http\Requests\Rbac\StoreUserRequest;
use App\Http\Requests\Rbac\UpdateUserRequest;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = (string) $request->query('search', '');
        $roleFilter = (string) $request->query('role', '');

        $query = User::query()->with(['roles', 'units']);

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($roleFilter !== '' && $roleFilter !== 'all') {
            $query->role($roleFilter);
        }

        $users = $query->orderBy('name')->paginate(15)->withQueryString();

        $statistics = [
            'total_users' => User::count(),
            'total_roles' => Role::count(),
            'total_units' => Unit::count(),
            'total_super_admins' => User::role('super-admin')->count(),
        ];

        $availableRoles = Role::orderBy('name')->get(['id', 'name']);
        $availableUnits = Unit::orderBy('name')->get(['id', 'name', 'code', 'type']);

        return Inertia::render('rbac/user/list/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
            ],
            'statistics' => $statistics,
            'availableRoles' => $availableRoles,
            'availableUnits' => $availableUnits,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (! empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        if (isset($validated['unit_ids'])) {
            $user->units()->sync($validated['unit_ids']);
        }

        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->withProperties(['name' => $user->name, 'roles' => $validated['roles'] ?? []])
            ->log("Membuat user staf baru: {$user->name} ({$user->email})");

        return redirect()->route('rbac.users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        if (isset($validated['roles'])) {
            // Prevent removing super-admin role from the last super admin
            if ($user->hasRole('super-admin') && ! in_array('super-admin', $validated['roles'], true)) {
                $superAdminCount = User::role('super-admin')->count();
                if ($superAdminCount <= 1) {
                    return back()->with('error', 'Tidak dapat menghapus role super-admin dari akun super-admin terakhir.');
                }
            }

            $user->syncRoles($validated['roles']);
        }

        if (isset($validated['unit_ids'])) {
            $user->units()->sync($validated['unit_ids']);
        }

        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->withProperties(['name' => $user->name, 'roles' => $validated['roles'] ?? []])
            ->log("Memperbarui user staf: {$user->name}");

        return redirect()->route('rbac.users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        if ($request->user()?->id === $user->id) {
            abort(403, 'Tidak dapat menghapus akun sendiri.');
        }

        if ($user->hasRole('super-admin')) {
            abort(403, 'Tidak dapat menghapus akun super administrator.');
        }

        $userName = $user->name;
        $userEmail = $user->email;

        $user->delete();

        activity()
            ->causedBy($request->user())
            ->log("Menghapus user staf: {$userName} ({$userEmail})");

        return redirect()->route('rbac.users.index')->with('success', 'User berhasil dihapus.');
    }
}
