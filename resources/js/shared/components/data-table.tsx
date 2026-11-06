import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    render: (row: T) => ReactNode;
    className?: string;
};

type Props<T> = {
    columns: DataTableColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    empty?: ReactNode;
    className?: string;
};

export function DataTable<T>({
    columns,
    rows,
    rowKey,
    empty,
    className,
}: Props<T>) {
    return (
        <div className={cn('overflow-x-auto rounded-lg border', className)}>
            <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    'px-3 py-2 font-medium whitespace-nowrap',
                                    column.className,
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-3 py-8 text-center text-muted-foreground"
                            >
                                {empty ?? 'Tidak ada data.'}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr
                                key={rowKey(row)}
                                className="border-t hover:bg-muted/30"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(
                                            'px-3 py-2',
                                            column.className,
                                        )}
                                    >
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
