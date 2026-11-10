import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/table';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    render: (row: T, index?: number) => ReactNode;
    className?: string;
};

type Props<T> = {
    columns: DataTableColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    empty?: ReactNode;
    toolbar?: ReactNode;
    footer?: ReactNode;
    className?: string;
};

export function DataTable<T>({
    columns,
    rows,
    rowKey,
    empty,
    toolbar,
    footer,
    className,
}: Props<T>) {
    return (
        <Card
            className={cn(
                'overflow-hidden border-none bg-muted p-0 shadow-none',
                className,
            )}
        >
            <CardContent className="flex flex-col p-0.5">
                {toolbar}

                <div className="overflow-hidden rounded-lg border bg-background">
                    {rows.length === 0 ? (
                        <div className="bg-muted/30 px-3 py-12 text-center text-xs text-muted-foreground sm:text-sm">
                            {empty ?? 'Tidak ada data.'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className={column.className}
                                        >
                                            {column.header}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, index) => (
                                    <TableRow
                                        key={rowKey(row)}
                                        className="transition-colors duration-150 hover:bg-accent/40"
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className={column.className}
                                            >
                                                {column.render(row, index)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {footer}
            </CardContent>
        </Card>
    );
}
