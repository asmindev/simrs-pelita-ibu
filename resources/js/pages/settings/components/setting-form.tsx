import { Building2, Globe, Image as ImageIcon, Printer, Save, Upload } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useForm } from '@inertiajs/react';

import { FormField } from '@/shared/components/form-field';
import { route } from '@/shared/lib/route';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Textarea } from '@/shared/ui/textarea';

import type { HospitalSetting } from '../types/setting';

interface SettingFormProps {
    setting: HospitalSetting;
}

export function SettingForm({ setting }: SettingFormProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(setting.logo_url);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(setting.favicon_url);

    const { data, setData, post, processing, errors } = useForm({
        app_name: setting.app_name || '',
        app_tagline: setting.app_tagline || '',
        hospital_name: setting.hospital_name || '',
        hospital_code: setting.hospital_code || '',
        license_number: setting.license_number || '',
        phone: setting.phone || '',
        email: setting.email || '',
        address: setting.address || '',
        city: setting.city || '',
        province: setting.province || '',
        postal_code: setting.postal_code || '',
        print_header: setting.print_header || '',
        print_footer: setting.print_footer || '',
        logo: null as File | null,
        favicon: null as File | null,
    });

    function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    function handleFaviconChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('favicon', file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="branding" className="space-y-4">
                <div className="border-b border-border pb-px">
                    <TabsList className="h-10 bg-muted/40 p-1 text-muted-foreground">
                        <TabsTrigger
                            value="branding"
                            className="gap-2 px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <ImageIcon className="size-3.5" />
                            <span>Branding & Tampilan</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="facility"
                            className="gap-2 px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <Building2 className="size-3.5" />
                            <span>Profil Fasilitas</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="print"
                            className="gap-2 px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                        >
                            <Printer className="size-3.5" />
                            <span>Kop & Cetak Dokumen</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab 1: Branding & Identitas Visual */}
                <TabsContent value="branding" className="m-0 space-y-4 focus-visible:outline-none">
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="border-b border-border pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Identitas Aplikasi & Logo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Nama Aplikasi"
                                    htmlFor="app_name"
                                    error={errors.app_name}
                                    hint="Tampil di browser tab, sidebar atas, dan sistem."
                                >
                                    <Input
                                        id="app_name"
                                        value={data.app_name}
                                        onChange={(e) => setData('app_name', e.target.value)}
                                        placeholder="Contoh: SIMRS Pelita Ibu"
                                        className="h-8 bg-background text-xs"
                                        required
                                    />
                                </FormField>

                                <FormField
                                    label="Tagline / Sub-Nama Aplikasi"
                                    htmlFor="app_tagline"
                                    error={errors.app_tagline}
                                    hint="Deskripsi singkat di bawah nama aplikasi sidebar."
                                >
                                    <Input
                                        id="app_tagline"
                                        value={data.app_tagline}
                                        onChange={(e) => setData('app_tagline', e.target.value)}
                                        placeholder="Contoh: Sistem Informasi Manajemen Rumah Sakit"
                                        className="h-8 bg-background text-xs"
                                    />
                                </FormField>
                            </div>

                            <div className="grid gap-6 border-t border-border pt-4 sm:grid-cols-2">
                                {/* Upload Logo */}
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-foreground">
                                            Logo Aplikasi & Dokumen
                                        </label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Format PNG, JPG, atau SVG (Maks. 2MB). Ditampilkan di sidebar dan cetak kuitansi.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30 p-1">
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Preview Logo"
                                                    className="size-full object-contain"
                                                />
                                            ) : (
                                                <ImageIcon className="size-6 text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <input
                                                id="logo-input"
                                                type="file"
                                                accept="image/png,image/jpeg,image/svg+xml"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('logo-input')?.click()}
                                                className="h-8 gap-1.5 text-xs font-medium"
                                            >
                                                <Upload className="size-3.5" />
                                                Pilih File Logo
                                            </Button>
                                            {errors.logo && (
                                                <p className="text-xs text-destructive">{errors.logo}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Favicon */}
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-foreground">
                                            Favicon Browser Tab
                                        </label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Format ICO, PNG, atau SVG (Maks. 1MB). Icon tab jendela browser.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30 p-2">
                                            {faviconPreview ? (
                                                <img
                                                    src={faviconPreview}
                                                    alt="Preview Favicon"
                                                    className="size-8 object-contain"
                                                />
                                            ) : (
                                                <Globe className="size-6 text-muted-foreground" />
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <input
                                                id="favicon-input"
                                                type="file"
                                                accept="image/x-icon,image/png,image/svg+xml"
                                                onChange={handleFaviconChange}
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('favicon-input')?.click()}
                                                className="h-8 gap-1.5 text-xs font-medium"
                                            >
                                                <Upload className="size-3.5" />
                                                Pilih File Favicon
                                            </Button>
                                            {errors.favicon && (
                                                <p className="text-xs text-destructive">{errors.favicon}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 2: Profil Fasilitas Kesehatan */}
                <TabsContent value="facility" className="m-0 space-y-4 focus-visible:outline-none">
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="border-b border-border pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Data Faskes & Kontak Resmi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <FormField
                                    label="Nama Rumah Sakit / Faskes"
                                    htmlFor="hospital_name"
                                    error={errors.hospital_name}
                                >
                                    <Input
                                        id="hospital_name"
                                        value={data.hospital_name}
                                        onChange={(e) => setData('hospital_name', e.target.value)}
                                        placeholder="Contoh: RS Pelita Ibu"
                                        className="h-8 bg-background text-xs"
                                        required
                                    />
                                </FormField>

                                <FormField
                                    label="Kode Faskes (Kemenkes / BPJS)"
                                    htmlFor="hospital_code"
                                    error={errors.hospital_code}
                                >
                                    <Input
                                        id="hospital_code"
                                        value={data.hospital_code}
                                        onChange={(e) => setData('hospital_code', e.target.value)}
                                        placeholder="Contoh: 7371001"
                                        className="h-8 bg-background text-xs font-mono"
                                    />
                                </FormField>

                                <FormField
                                    label="Nomor Izin Operasional"
                                    htmlFor="license_number"
                                    error={errors.license_number}
                                >
                                    <Input
                                        id="license_number"
                                        value={data.license_number}
                                        onChange={(e) => setData('license_number', e.target.value)}
                                        placeholder="Contoh: 503/001/IO-RS/DPMPTSP"
                                        className="h-8 bg-background text-xs font-mono"
                                    />
                                </FormField>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Nomor Telepon / Hotline"
                                    htmlFor="phone"
                                    error={errors.phone}
                                >
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Contoh: (0411) 872222"
                                        className="h-8 bg-background text-xs"
                                    />
                                </FormField>

                                <FormField
                                    label="Email Resmi"
                                    htmlFor="email"
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Contoh: info@pelita-ibu.ac.id"
                                        className="h-8 bg-background text-xs"
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Alamat Lengkap"
                                htmlFor="address"
                                error={errors.address}
                            >
                                <Textarea
                                    id="address"
                                    rows={2}
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Jalan, nomor, kelurahan, kecamatan..."
                                    className="bg-background text-xs"
                                />
                            </FormField>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <FormField
                                    label="Kota / Kabupaten"
                                    htmlFor="city"
                                    error={errors.city}
                                >
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Contoh: Makassar"
                                        className="h-8 bg-background text-xs"
                                    />
                                </FormField>

                                <FormField
                                    label="Provinsi"
                                    htmlFor="province"
                                    error={errors.province}
                                >
                                    <Input
                                        id="province"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                        placeholder="Contoh: Sulawesi Selatan"
                                        className="h-8 bg-background text-xs"
                                    />
                                </FormField>

                                <FormField
                                    label="Kode Pos"
                                    htmlFor="postal_code"
                                    error={errors.postal_code}
                                >
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="Contoh: 90222"
                                        className="h-8 bg-background text-xs font-mono"
                                    />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab 3: Kop & Catatan Dokumen Cetak */}
                <TabsContent value="print" className="m-0 space-y-4 focus-visible:outline-none">
                    <Card className="border-border bg-card shadow-xs">
                        <CardHeader className="border-b border-border pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground">
                                Format Kop Surat & Dokumen Cetak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <FormField
                                label="Kop Dokumen Resmi (Header)"
                                htmlFor="print_header"
                                error={errors.print_header}
                                hint="Teks baris atas pada cetak kuitansi, resep, dan laporan klinis."
                            >
                                <Textarea
                                    id="print_header"
                                    rows={2}
                                    value={data.print_header}
                                    onChange={(e) => setData('print_header', e.target.value)}
                                    placeholder="RUMAH SAKIT UMUM PELITA IBU&#10;Jl. Kemerdekaan KM. 12 No. 8, Telp. (0411) 872222"
                                    className="bg-background text-xs font-mono"
                                />
                            </FormField>

                            <FormField
                                label="Catatan Kaki Dokumen (Footer)"
                                htmlFor="print_footer"
                                error={errors.print_footer}
                                hint="Pesan penutup pada struk kasir atau lembar serah obat."
                            >
                                <Textarea
                                    id="print_footer"
                                    rows={2}
                                    value={data.print_footer}
                                    onChange={(e) => setData('print_footer', e.target.value)}
                                    placeholder="Semoga lekas sembuh. Simpan kuitansi ini sebagai bukti pembayaran yang sah."
                                    className="bg-background text-xs"
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-2">
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-8.5 gap-1.5 text-xs font-medium"
                >
                    <Save className="size-3.5" />
                    {processing ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}
                </Button>
            </div>
        </form>
    );
}
