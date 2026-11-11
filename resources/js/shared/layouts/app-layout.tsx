import { usePage } from "@inertiajs/react";
import type { ReactNode } from "react";

import { AppBreadcrumb } from "@/shared/components/app-breadcrumb";
import { ThemeSwitcher } from "@/shared/components/theme-switcher";
import { Separator } from "@/shared/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/shared/ui/sidebar";
import type { Auth } from "@/types/auth";
import type { Flash } from "@/types/flash";

import { AppSidebar } from "./app-sidebar";

type Props = {
    children: ReactNode;
};

export default function AppLayout({ children }: Props) {
    const { auth, name, flash, sidebarOpen } = usePage<{
        auth?: Auth;
        name: string;
        flash: Flash;
        sidebarOpen?: boolean;
    }>().props;

    return (
        <SidebarProvider defaultOpen={sidebarOpen ?? true}>
            <AppSidebar name={name ?? "SIMRS"} user={auth?.user} />

            <SidebarInset className="flex min-w-0 flex-col">
                <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2.5 border-b bg-background/95 px-2 shadow-xs backdrop-blur supports-backdrop-filter:bg-background/60">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-1 h-4" />
                    <AppBreadcrumb />
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <span className="truncate text-sm font-medium">
                            {auth?.user?.name ?? ""}
                        </span>
                    </div>
                </header>

                <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-auto p-2">
                    {flash?.success && (
                        <div
                            role="status"
                            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground"
                        >
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        >
                            {flash.error}
                        </div>
                    )}
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
