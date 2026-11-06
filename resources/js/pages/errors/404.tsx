import { ErrorPage } from '@/shared/components/error-page';

export default function NotFound() {
    return (
        <ErrorPage
            status={404}
            title="Halaman tidak ditemukan"
            description="Halaman yang Anda cari tidak tersedia."
        />
    );
}
