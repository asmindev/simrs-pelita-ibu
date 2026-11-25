export type StockLocationUsage =
    | 'internal'
    | 'supplier'
    | 'customer'
    | 'inventory';

export type UsageOption = {
    value: StockLocationUsage;
    label: string;
};

export const USAGE_LABELS: Record<StockLocationUsage, string> = {
    internal: 'Lokasi Internal',
    supplier: 'Supplier / Vendor',
    customer: 'Pasien / Konsumen',
    inventory: 'Penyesuaian / Loss',
};

export type WarehouseLocation = {
    id: number;
    code: string;
    name: string;
    usage: StockLocationUsage;
    description: string | null;
    is_default_warehouse: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    active_items_count?: number;
    total_stock?: number | null;
    total_valuation?: number;
};

export type WarehouseQuant = {
    id: number;
    stock_location_id: number;
    product_id: number;
    product_batch_id: number;
    quantity: number;
    product?: {
        id: number;
        code: string;
        name: string;
        product_type: string;
        unit_of_measure: string;
    } | null;
    product_batch?: {
        id: number;
        batch_number: string;
        expiry_date: string;
        buy_price: number;
    } | null;
};

export type WarehouseMovement = {
    id: number;
    reference_number: string | null;
    type:
        | 'in'
        | 'out'
        | 'transfer'
        | 'dispensing'
        | 'adjustment'
        | 'return'
        | 'opname';
    quantity: number;
    balance_before: number;
    balance_after: number;
    unit_cost: number;
    total_value: number;
    origin: string | null;
    reason: string | null;
    created_at: string;
    product?: {
        id: number;
        code: string;
        name: string;
        unit_of_measure: string;
    } | null;
    product_batch?: {
        id: number;
        batch_number: string;
    } | null;
    source_location?: {
        id: number;
        code: string;
        name: string;
    } | null;
    destination_location?: {
        id: number;
        code: string;
        name: string;
    } | null;
    user?: {
        id: number;
        name: string;
    } | null;
};

export type WarehouseFilters = {
    search?: string;
    usage?: string;
    status?: string;
};

export type WarehouseStatistics = {
    total_locations: number;
    internal_count: number;
    active_count: number;
    total_on_hand: number;
};

export type { Paginated, PaginationLink } from '@/shared/types/pagination';
