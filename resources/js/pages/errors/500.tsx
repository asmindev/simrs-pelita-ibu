import { ErrorPage } from '@/shared/components/error-page';

export default function ServerError() {
    return (
        <ErrorPage
            status={500}
            title="Terjadi kesalahan"
            description="Terjadi kesalahan pada server. Silakan coba lagi."
        />
    );
}
