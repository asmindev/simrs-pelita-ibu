import { ErrorPage } from '@/shared/components/error-page';

export default function Forbidden() {
    return (
        <ErrorPage
            status={403}
            title="Akses ditolak"
            description="Anda tidak memiliki izin untuk membuka halaman ini."
        />
    );
}
