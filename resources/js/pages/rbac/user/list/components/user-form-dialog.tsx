import { useForm } from '@inertiajs/react';
import { Loader2, UserPlus, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';

import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

import type { Role, Unit, User } from '../../../types/rbac';

type Props = {
    user?: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableRoles: Role[];
    availableUnits: Unit[];
};

export function UserFormDialog({
    user,
    open,
    onOpenChange,
    availableRoles,
    availableUnits,
}: Props) {
    const isEdit = Boolean(user);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: (user?.roles?.map((r) => r.name) || []) as string[],
        unit_ids: (user?.units?.map((u) => u.id) || []) as number[],
    });

    useEffect(() => {
        if (open) {
            setData({
                name: user?.name || '',
                email: user?.email || '',
                password: '',
                roles: (user?.roles?.map((r) => r.name) || []) as string[],
                unit_ids: (user?.units?.map((u) => u.id) || []) as number[],
            });
        }
    }, [user, open]);

    function toggleRole(roleName: string) {
        if (data.roles.includes(roleName)) {
            setData(
                'roles',
                data.roles.filter((r) => r !== roleName),
            );
        } else {
            setData('roles', [...data.roles, roleName]);
        }
    }

    function toggleUnit(unitId: number) {
        if (data.unit_ids.includes(unitId)) {
            setData(
                'unit_ids',
                data.unit_ids.filter((id) => id !== unitId),
            );
        } else {
            setData('unit_ids', [...data.unit_ids, unitId]);
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (isEdit && user) {
            put(route('rbac.users.update', user.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(route('rbac.users.store'), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? (
                            <>
                                <Users className="size-5 text-primary" />
                                Edit Data Pengguna
                            </>
                        ) : (
                            <>
                                <UserPlus className="size-5 text-primary" />
                                Tambah Pengguna Baru
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Ubah informasi profil dan hak akses peran staf.'
                            : 'Daftarkan akun staf baru dan tentukan peran aksesnya.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="user-name">
                            Nama Lengkap{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="user-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: dr. Budi Santoso, Sp.A"
                            className="bg-background text-xs"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="user-email">
                            Alamat Email{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="user-email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@rs.local"
                            className="bg-background text-xs"
                            required
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="user-password">
                            Password{' '}
                            {!isEdit && (
                                <span className="text-destructive">*</span>
                            )}
                            {isEdit && (
                                <span className="text-[11px] text-muted-foreground">
                                    (kosongkan jika tidak ingin diubah)
                                </span>
                            )}
                        </Label>
                        <Input
                            id="user-password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            placeholder="Minimal 8 karakter"
                            className="bg-background text-xs"
                            required={!isEdit}
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Roles Assignment */}
                    <div className="space-y-2">
                        <Label>Penugasan Peran (Roles)</Label>
                        <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3">
                            {availableRoles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.name)}
                                        onCheckedChange={() =>
                                            toggleRole(role.name)
                                        }
                                    />
                                    <Label
                                        htmlFor={`role-${role.id}`}
                                        className="cursor-pointer text-xs font-normal"
                                    >
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Units Assignment */}
                    <div className="space-y-2">
                        <Label>Unit Pelayanan Terkait</Label>
                        <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-border p-3">
                            {availableUnits.map((unit) => (
                                <div
                                    key={unit.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`unit-${unit.id}`}
                                        checked={data.unit_ids.includes(
                                            unit.id,
                                        )}
                                        onCheckedChange={() =>
                                            toggleUnit(unit.id)
                                        }
                                    />
                                    <Label
                                        htmlFor={`unit-${unit.id}`}
                                        className="cursor-pointer text-xs font-normal"
                                    >
                                        {unit.name} ({unit.code})
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : isEdit ? (
                                'Simpan Perubahan'
                            ) : (
                                'Buat Pengguna'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
