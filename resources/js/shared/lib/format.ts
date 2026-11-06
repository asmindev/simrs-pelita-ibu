const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeZone: 'Asia/Jakarta',
});

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
});

export function formatCurrency(value: number): string {
    return currencyFormatter.format(value);
}

export function formatDate(value: string | Date): string {
    return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
    return dateTimeFormatter.format(new Date(value));
}
