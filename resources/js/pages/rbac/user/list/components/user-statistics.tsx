import { Building2, Key, ShieldAlert, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

type Props = {
    statistics: {
        total_users: number;
        total_roles: number;
        total_units: number;
        total_super_admins: number;
    };
};

export function UserStatistics({ statistics }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Total User / Staf
                    </CardTitle>
                    <Users className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_users}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Akun aktif terdaftar
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Peran (Roles)
                    </CardTitle>
                    <Key className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_roles}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Kategori wewenang
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Unit Terhubung
                    </CardTitle>
                    <Building2 className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_units}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Poli & instalasi medis
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                        Super Administrator
                    </CardTitle>
                    <ShieldAlert className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {statistics.total_super_admins}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Akses penuh sistem
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
