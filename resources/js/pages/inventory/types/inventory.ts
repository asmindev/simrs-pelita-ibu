export type StockLocationUsage =
    | 'internal'
    | 'supplier'
    | 'customer'
    | 'inventory';

export type StockLocation = {
    id: number;
    code: string;
    name: string;
    usage: StockLocationUsage;
    is_default_warehouse: boolean;
};

export type ProductBatchSummary = {
    id: number;
    product_id: number;
    batch_number: string;
    expiry_date: string;
    current_quantity: number;
    buy_price: number;
    stock_quants?: Array<{
        id: number;
        product_batch_id: number;
        stock_location_id: number;
        quantity: number;
    }>;
};

export type ProductInfo = {
    id: number;
    code: string;
    name: string;
    product_type?: 'drug' | 'medical_supply' | 'reagent' | 'general';
    form: string | null;
    unit_of_measure: string;
    price?: number;
    category?: {
        id: number;
        name: string;
    } | null;
    batches?: ProductBatchSummary[];
};

export type StockQuant = {
    id: number;
    stock_location_id: number;
    product_id: number;
    product_batch_id: number;
    quantity: number;
    location?: StockLocation;
    product?: ProductInfo;
    product_batch?: ProductBatch;
};

export type ProductBatch = {
    id: number;
    product_id: number;
    batch_number: string;
    expiry_date: string;
    initial_quantity: number;
    current_quantity: number;
    buy_price: number;
    is_active: boolean;
    created_at: string;
    product?: ProductInfo;
    stock_quants?: StockQuant[];
};

export type WarehouseProductStockItem = {
    stock_location_id: number;
    location_code: string;
    location_name: string;
    product_id: number;
    product_code: string;
    product_name: string;
    product_form: string | null;
    unit_of_measure: string;
    total_quantity: number;
    total_value: number;
    avg_buy_price: number;
    nearest_expiry: string | null;
};

export type StockMovementType =
    | 'in'
    | 'out'
    | 'transfer'
    | 'dispensing'
    | 'adjustment'
    | 'return'
    | 'opname';

export type StockMovement = {
    id: number;
    reference_number: string | null;
    product_id: number;
    product_batch_id: number | null;
    source_location_id: number | null;
    destination_location_id: number | null;
    type: StockMovementType;
    quantity: number;
    balance_before: number;
    balance_after: number;
    unit_cost: number;
    total_value: number;
    origin: string | null;
    state: string;
    reason: string | null;
    created_at: string;
    product?: {
        id: number;
        name: string;
        code: string;
        unit_of_measure?: string;
    };
    source_location?: {
        id: number;
        code: string;
        name: string;
        usage?: StockLocationUsage;
    } | null;
    destination_location?: {
        id: number;
        code: string;
        name: string;
        usage?: StockLocationUsage;
    } | null;
    user?: {
        id: number;
        name: string;
    };
};

export type StockValuationLayer = {
    id: number;
    product_id: number;
    product_batch_id: number | null;
    stock_movement_id: number;
    stock_location_id: number | null;
    quantity: number;
    remaining_qty: number;
    unit_cost: number;
    value: number;
    remaining_value: number;
    reference: string | null;
    description: string | null;
    created_at: string;
    product?: {
        id: number;
        name: string;
        code: string;
        unit_of_measure?: string;
    };
    location?: {
        id: number;
        code: string;
        name: string;
    } | null;
    stock_movement?: {
        id: number;
        reference_number: string | null;
        type: StockMovementType;
    } | null;
    user?: {
        id: number;
        name: string;
    };
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
