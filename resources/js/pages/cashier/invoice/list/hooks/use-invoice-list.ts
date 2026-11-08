import { useState } from 'react';

import type { Invoice } from '../../../types/cashier';

export function useInvoiceList() {
    const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

    function handleOpenPayment(invoice: Invoice) {
        setPayingInvoice(invoice);
    }

    function handleClosePayment() {
        setPayingInvoice(null);
    }

    return {
        payingInvoice,
        handleOpenPayment,
        handleClosePayment,
    };
}
