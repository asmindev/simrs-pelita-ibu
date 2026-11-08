import { useForm } from '@inertiajs/react';
import { CheckSquare, Key, Loader2, Square } from 'lucide-react';
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
import { Label } from '@/shared/ui/label';

import type { GroupedPermission, Role } from '../../../types/rbac';

type Props = {
    role: Role | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupedPermissions: GroupedPermission[];
};

export function RoleMatrixDialog({
    role,
    open,
    onOpenChange,
    groupedPermissions,
}: Props) {
    const isSuperAdmin = role?.name === 'super-admin';

    const { data, setData, put, processing, reset } = useForm({
        permissions: (role?.permissions?.map((p) => p.name) || []) as string[],
    });

    useEffect(() => {
        if (open && role) {
            setData({
                permissions: (role.permissions?.map((p) => p.name) ||
                    []) as string[],
            });
        }
    }, [role, open]);

    function togglePermission(permName: string) {
        if (isSuperAdmin) return;

        if (data.permissions.includes(permName)) {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permName),
            );
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    }

    function toggleDomain(group: GroupedPermission) {
        if (isSuperAdmin) return;

        const groupNames = group.permissions.map((p) => p.name);
        const allSelected = groupNames.every((n) =>
            data.permissions.includes(n),
        );

        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter((p) => !groupNames.includes(p)),
            );
        } else {
            const next = Array.from(
                new Set([...data.permissions, ...groupNames]),
            );
            setData('permissions', next);
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!role) return;

        put(route('rbac.roles.permissions.update', role.id), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="size-5 text-primary" />
                        Matriks Hak Akses: {role?.name}
                    </DialogTitle>
                    <DialogDescription>
                        {isSuperAdmin
                            ? 'Role super-admin memiliki semua hak akses secara default (Gate::before).'
                            : `Atur izin spesifik untuk peran "${role?.name}".`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {groupedPermissions.map((group) => {
                            const groupNames = group.permissions.map(
                                (p) => p.name,
                            );
                            const allSelected =
                                groupNames.length > 0 &&
                                groupNames.every((n) =>
                                    data.permissions.includes(n),
                                );

                            return (
                                <div
                                    key={group.domain}
                                    className="space-y-2 rounded-lg border border-border p-3"
                                >
                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                        <h4 className="text-xs font-semibold tracking-wider text-primary uppercase">
                                            {group.label}
                                        </h4>
                                        {!isSuperAdmin && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[11px]"
                                                onClick={() =>
                                                    toggleDomain(group)
                                                }
                                            >
                                                {allSelected ? (
                                                    <>
                                                        <Square className="mr-1 size-3" />
                                                        Batal Pilih Semua
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckSquare className="mr-1 size-3" />
                                                        Pilih Semua
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 md:grid-cols-3">
                                        {group.permissions.map((perm) => (
                                            <div
                                                key={perm.name}
                                                className="flex items-start space-x-2"
                                            >
                                                <Checkbox
                                                    id={`perm-${perm.name}`}
                                                    checked={
                                                        isSuperAdmin ||
                                                        data.permissions.includes(
                                                            perm.name,
                                                        )
                                                    }
                                                    disabled={isSuperAdmin}
                                                    onCheckedChange={() =>
                                                        togglePermission(
                                                            perm.name,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`perm-${perm.name}`}
                                                    className="cursor-pointer text-[11px] leading-tight font-normal text-muted-foreground hover:text-foreground"
                                                >
                                                    <span className="font-mono text-foreground">
                                                        {perm.resource}.
                                                        {perm.action}
                                                    </span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Tutup
                        </Button>
                        {!isSuperAdmin && (
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Izin Akses'
                                )}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
