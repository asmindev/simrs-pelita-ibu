import { useForm } from '@inertiajs/react';
import {
    CheckSquare,
    Info,
    Loader2,
    ShieldCheck,
    Square,
    UserPlus,
    Users,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect } from 'react';

import { route } from '@/shared/lib/route';
import { Badge } from '@/shared/ui/badge';
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

    const isSuperAdminSelected = data.roles.includes('super-admin');

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

    function handleSelectAllUnits() {
        if (data.unit_ids.length === availableUnits.length) {
            setData('unit_ids', []);
        } else {
            setData(
                'unit_ids',
                availableUnits.map((u) => u.id),
            );
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
            <DialogContent className="max-h-[90vh] min-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? (
                            <>
                                <Users className="size-5 text-primary" />
                                Edit Data Pengguna & Hak Akses
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
                            ? 'Ubah informasi profil, penugasan peran medis/administrasi, dan unit kerja staf.'
                            : 'Daftarkan akun staf baru dan tentukan peran akses serta unit kerjanya.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="user-name">
                                Nama Lengkap{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="user-name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
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
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
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
                    </div>

                    {/* Roles Assignment */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-xs font-semibold">
                                    Penugasan Peran (Roles)
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Pengguna dapat memiliki lebih dari satu
                                    peran operasional (cross-role).
                                </p>
                            </div>
                            {data.roles.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-[11px]"
                                >
                                    {data.roles.length} peran dipilih
                                </Badge>
                            )}
                        </div>

                        {isSuperAdminSelected && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                                <div>
                                    <div className="font-semibold text-primary">
                                        Role Super Administrator Aktif
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Akun ini secara otomatis memiliki akses
                                        penuh tanpa batasan ke seluruh menu,
                                        tindakan, serta unit pelayanan di rumah
                                        sakit (bypass otorisasi global).
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
                            {availableRoles.map((role) => {
                                const isSelected = data.roles.includes(
                                    role.name,
                                );
                                const isSuper = role.name === 'super-admin';

                                return (
                                    <label
                                        key={role.id}
                                        htmlFor={`role-${role.id}`}
                                        className={`flex cursor-pointer items-start space-x-2.5 rounded-md border p-2.5 transition-colors ${
                                            isSelected
                                                ? isSuper
                                                    ? 'border-primary/40 bg-primary/10'
                                                    : 'border-border bg-secondary/60'
                                                : 'border-border/60 bg-card hover:bg-muted/40'
                                        }`}
                                    >
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                toggleRole(role.name)
                                            }
                                            className="mt-0.5"
                                        />
                                        <div className="flex-1 space-y-0.5 leading-tight">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs font-semibold text-foreground">
                                                    {role.name}
                                                </span>
                                                {isSuper && (
                                                    <Badge
                                                        variant="default"
                                                        className="h-4 px-1 text-[9px]"
                                                    >
                                                        Global
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Units Assignment */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-xs font-semibold">
                                    Unit Pelayanan Terkait (Scoping Akses Data)
                                </Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Membatasi data pasien, kunjungan, dan order
                                    yang dapat diakses staf.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[11px]"
                                onClick={handleSelectAllUnits}
                            >
                                {data.unit_ids.length ===
                                availableUnits.length ? (
                                    <>
                                        <Square className="mr-1 size-3" />
                                        Batal Semua
                                    </>
                                ) : (
                                    <>
                                        <CheckSquare className="mr-1 size-3" />
                                        Pilih Semua ({availableUnits.length})
                                    </>
                                )}
                            </Button>
                        </div>

                        {data.unit_ids.length === 0 && (
                            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                                <Info className="size-3.5 shrink-0 text-muted-foreground" />
                                <span>
                                    Jika tidak ada unit yang dipilih, staf dapat
                                    mengakses seluruh unit pelayanan (akses
                                    lintas fasilitas).
                                </span>
                            </div>
                        )}

                        <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">
                            {availableUnits.map((unit) => {
                                const isSelected = data.unit_ids.includes(
                                    unit.id,
                                );
                                return (
                                    <label
                                        key={unit.id}
                                        htmlFor={`unit-${unit.id}`}
                                        className={`flex cursor-pointer items-center space-x-2 rounded-md border p-2 text-xs transition-colors ${
                                            isSelected
                                                ? 'border-border bg-secondary/60 font-medium text-foreground'
                                                : 'border-border/60 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                        }`}
                                    >
                                        <Checkbox
                                            id={`unit-${unit.id}`}
                                            checked={isSelected}
                                            onCheckedChange={() =>
                                                toggleUnit(unit.id)
                                            }
                                        />
                                        <span className="flex-1 truncate">
                                            {unit.name}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="ml-auto text-[10px]"
                                        >
                                            {unit.code}
                                        </Badge>
                                    </label>
                                );
                            })}
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
