import { router } from '@inertiajs/react';
import { FileText, Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';

import { TableToolbar } from '@/shared/components/table-toolbar';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';

type Props = {
    filters: {
        report_type: string;
        search: string;
    };
    current: number;
    total: number;
    actions?: ReactNode;
};

export function ClinicalReportFilters({
    filters,
    current,
    total,
    actions,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [reportType, setReportType] = useState(filters.report_type || 'all');

    function submit(event: FormEvent) {
        event.preventDefault();

        router.get(
            route('medical-record.reports.index'),
            {
                search: search || undefined,
                report_type: reportType === 'all' ? undefined : reportType,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function reset() {
        setSearch('');
        setReportType('all');

        router.get(
            route('medical-record.reports.index'),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <TableToolbar
            title="Daftar Dokumen Laporan Klinis"
            description="Pusat arsip laporan operasi, kelahiran, dan kematian."
            icon={FileText}
            current={current}
            total={total}
            actions={actions}
        >
            <form
                onSubmit={submit}
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
            >
                <div className="relative min-w-48 flex-1 sm:w-64 sm:flex-none">
                    <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="report-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Judul, nama pasien, No. RM..."
                        className="h-8 bg-background pl-8 text-xs"
                        aria-label="Cari laporan"
                    />
                </div>

                <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger
                        id="report-type"
                        className="h-8 w-44 bg-background text-xs"
                        aria-label="Kategori laporan"
                    >
                        <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        <SelectItem value="surgery">Laporan Operasi</SelectItem>
                        <SelectItem value="birth">
                            Keterangan Kelahiran
                        </SelectItem>
                        <SelectItem value="death">
                            Keterangan Kematian
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    type="submit"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                >
                    Cari
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                    onClick={reset}
                >
                    Reset
                </Button>
            </form>
        </TableToolbar>
    );
}
