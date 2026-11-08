import { Head, Link } from '@inertiajs/react';
import { Key, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { DataTable } from '@/shared/components/data-table';
import { PageHeader } from '@/shared/components/page-header';
import { Pagination } from '@/shared/components/pagination';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';

import type { BreakGlassGrant, PaginatedData } from '../../types/rbac';
import { getBreakGlassColumns } from './components/break-glass-columns';
import { BreakGlassFilters } from './components/break-glass-filters';
import { BreakGlassReviewDialog } from './components/break-glass-review-dialog';
import { BreakGlassStatistics } from './components/break-glass-statistics';

type Props = {
    grants: PaginatedData<BreakGlassGrant>;
    filters: {
        search: string;
        status: string;
    };
    statistics: {
        total_grants: number;
        active_grants: number;
        pending_review: number;
        reviewed_grants: number;
    };
};

export default function BreakGlassListIndex({
    grants,
    filters,
    statistics,
}: Props) {
    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedGrant, setSelectedGrant] = useState<BreakGlassGrant | null>(
        null,
    );

    function handleReview(grant: BreakGlassGrant) {
        setSelectedGrant(grant);
        setReviewOpen(true);
    }

    const columns = useMemo(
        () => getBreakGlassColumns({ onReview: handleReview }),
        [],
    );

    return (
        <div className="space-y-6">
            <Head title="Akses Darurat Break-Glass — SIMRS" />

            <PageHeader
                title="Akses Darurat (Break-Glass)"
                description="Tinjau dan audit rekaman pembukaan rekam medis pasien dalam kondisi kedaruratan klinis."
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('rbac.users.index')}>
                                <Users className="mr-1.5 size-4" />
                                Daftar Pengguna
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('rbac.roles.index')}>
                                <Key className="mr-1.5 size-4" />
                                Matriks Role
                            </Link>
                        </Button>
                    </div>
                }
            />

            <BreakGlassStatistics statistics={statistics} />

            <DataTable<BreakGlassGrant>
                columns={columns}
                rows={grants.data}
                rowKey={(g) => g.id}
                empty="Tidak ada catatan akses break-glass yang ditemukan."
                toolbar={
                    <BreakGlassFilters
                        filters={filters}
                        current={grants.data.length}
                        total={grants.total}
                    />
                }
                footer={
                    <Pagination
                        links={grants.links}
                        from={grants.from}
                        to={grants.to}
                        total={grants.total}
                    />
                }
            />

            <BreakGlassReviewDialog
                grant={selectedGrant}
                open={reviewOpen}
                onOpenChange={setReviewOpen}
            />
        </div>
    );
}
