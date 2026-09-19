import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useParams } from "react-router-dom";

import { Logo } from "../../../shared/components/Logo";

import {
    callWaitlistEntry,
    getWaitlist,
} from "../../waitlist/api/waitlistApi";

import type { WaitlistEntry } from "../../waitlist/types/waitlist";

import { WaitAge } from "../components/WaitAge";

const REFRESH_INTERVAL_SECONDS = 5;

type SortField =
    | "created_at"
    | "name"
    | "party_size";

type SortDirection = "asc" | "desc";

interface BranchInfo {
    name: string;
    city: string;
    country: string;
    timezone: string;
}

const BRANCHES: Record<number, BranchInfo> = {
    1: {
        name: "La Terraza Azul",
        city: "Lima",
        country: "Perú",
        timezone: "America/Lima",
    },

    2: {
        name: "Cuatro Vientos",
        city: "Lima",
        country: "Perú",
        timezone: "America/Lima",
    },

    3: {
        name: "Casa Mediterránea",
        city: "Santiago",
        country: "Chile",
        timezone: "America/Santiago",
    },
};

function getWaitMinutes(createdAt: string) {
    return Math.max(
        0,
        Math.floor(
            (Date.now() - new Date(createdAt).getTime()) /
            60000,
        ),
    );
}

function getBranchHour(timezone: string) {
    const hourString = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        hour12: false,
    }).format(new Date());

    return Number(hourString);
}

function getBranchTime(timezone: string) {
    return new Intl.DateTimeFormat("es-PE", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date());
}

function getTodayLabel(timezone: string) {
    return new Intl.DateTimeFormat("es-PE", {
        timeZone: timezone,
        weekday: "long",
        day: "2-digit",
        month: "long",
    }).format(new Date());
}

export function HostPage() {
    const { locationId } = useParams();

    const currentLocationId = Number(locationId);

    const branch =
        BRANCHES[currentLocationId] ?? BRANCHES[1];

    const [entries, setEntries] = useState<
        WaitlistEntry[]
    >([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<
        string | null
    >(null);

    const [lastUpdated, setLastUpdated] =
        useState<Date | null>(null);

    const [updatingId, setUpdatingId] =
        useState<number | null>(null);

    const [filter, setFilter] =
        useState<"ALL" | "WAITING" | "CALLED">("ALL");

    const [sortField, setSortField] =
        useState<SortField>("created_at");

    const [sortDirection, setSortDirection] =
        useState<SortDirection>("asc");

    const [clockTick, setClockTick] =
        useState(Date.now());

    const [refreshCountdown, setRefreshCountdown] =
        useState(REFRESH_INTERVAL_SECONDS);

    const refreshQueue = useCallback(async () => {
        if (!currentLocationId) {
            return;
        }

        try {
            const data = await getWaitlist(
                currentLocationId,
            );

            setEntries(data);
            setLastUpdated(new Date());
            setRefreshCountdown(
                REFRESH_INTERVAL_SECONDS,
            );
            setError(null);
        } catch {
            setError(
                "No pudimos actualizar la cola.",
            );
        } finally {
            setLoading(false);
        }
    }, [currentLocationId]);

    /*
     * Auto refresh real cada 5 segundos.
     */
    useEffect(() => {
        refreshQueue();

        const interval = window.setInterval(() => {
            refreshQueue();
        }, REFRESH_INTERVAL_SECONDS * 1000);

        return () =>
            window.clearInterval(interval);
    }, [refreshQueue]);

    /*
     * Reloj + contador visual.
     */
    useEffect(() => {
        const interval = window.setInterval(() => {
            setClockTick(Date.now());

            setRefreshCountdown((current) => {
                if (current <= 1) {
                    return REFRESH_INTERVAL_SECONDS;
                }

                return current - 1;
            });
        }, 1000);

        return () =>
            window.clearInterval(interval);
    }, []);

    const branchHour = useMemo(
        () => getBranchHour(branch.timezone),
        [branch.timezone, clockTick],
    );

    const isDay =
        branchHour >= 6 && branchHour < 18;

    const branchTime = useMemo(
        () => getBranchTime(branch.timezone),
        [branch.timezone, clockTick],
    );

    const todayLabel = useMemo(
        () => getTodayLabel(branch.timezone),
        [branch.timezone, clockTick],
    );

    async function handleCall(entryId: number) {
        try {
            setUpdatingId(entryId);
            setError(null);

            const updated =
                await callWaitlistEntry(entryId);

            setEntries((current) =>
                current.map((entry) =>
                    entry.id === updated.id
                        ? updated
                        : entry,
                ),
            );

            setLastUpdated(new Date());
            setRefreshCountdown(
                REFRESH_INTERVAL_SECONDS,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No pudimos llamar al comensal.",
            );

            /*
             * Si hubo conflicto porque otro anfitrión
             * lo llamó primero, actualizamos la tabla.
             */
            await refreshQueue();
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleManualRefresh() {
        setRefreshCountdown(
            REFRESH_INTERVAL_SECONDS,
        );

        await refreshQueue();
    }

    function toggleSort(field: SortField) {
        if (sortField === field) {
            setSortDirection((current) =>
                current === "asc"
                    ? "desc"
                    : "asc",
            );

            return;
        }

        setSortField(field);
        setSortDirection("asc");
    }

    const visibleEntries = useMemo(() => {
        let result = [...entries];

        if (filter !== "ALL") {
            result = result.filter(
                (entry) => entry.status === filter,
            );
        }

        result.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case "name":
                    comparison = a.name.localeCompare(
                        b.name,
                    );
                    break;

                case "party_size":
                    comparison =
                        a.party_size - b.party_size;
                    break;

                case "created_at":
                default:
                    comparison =
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime();
            }

            return sortDirection === "asc"
                ? comparison
                : -comparison;
        });

        return result;
    }, [
        entries,
        filter,
        sortField,
        sortDirection,
        clockTick,
    ]);

    const waitingCount = entries.filter(
        (entry) =>
            entry.status === "WAITING",
    ).length;

    const calledCount = entries.filter(
        (entry) =>
            entry.status === "CALLED",
    ).length;

    const criticalCount = entries.filter(
        (entry) =>
            entry.status === "WAITING" &&
            getWaitMinutes(entry.created_at) >= 30,
    ).length;

    const sortArrow = (
        field: SortField,
    ) => {
        if (sortField !== field) {
            return "↕";
        }

        return sortDirection === "asc"
            ? "↑"
            : "↓";
    };

    return (
        <main className="min-h-screen bg-[#080b10] text-white">
            <div className="pointer-events-none fixed left-1/2 top-[-300px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-sky-500/[0.05] blur-[150px]" />

            <div className="relative mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
                {/* HEADER */}
                <header className="flex flex-col gap-6 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Logo />

                        <div className="mt-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    {branch.name}
                                </h1>

                                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
                                    {branch.city} ·{" "}
                                    {branch.country}
                                </span>
                            </div>

                            <p className="mt-2 capitalize text-sm text-slate-500">
                                Lista de espera · {todayLabel}
                            </p>
                        </div>
                    </div>

                    {/* Reloj sucursal */}
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#0d131b] px-4 py-3">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${isDay
                                    ? "bg-amber-400/10 text-amber-300"
                                    : "bg-indigo-400/10 text-indigo-300"
                                }`}
                        >
                            {isDay ? "☀" : "☾"}
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">
                                Hora de la sucursal
                            </p>

                            <p className="mt-0.5 font-mono text-sm font-semibold text-slate-200">
                                {branchTime}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-600">
                                {isDay ? "Horario diurno" : "Horario nocturno"}
                            </p>
                        </div>
                    </div>
                </header>

                {/* KPIs */}
                <section className="grid grid-cols-2 gap-3 py-6 lg:grid-cols-3">
                    <StatCard
                        label="Esperando"
                        value={waitingCount}
                        description="Pendientes de llamar"
                    />

                    <StatCard
                        label="Llamados"
                        value={calledCount}
                        description="Atendidos por anfitrión"
                    />

                    <StatCard
                        label="Demora crítica"
                        value={criticalCount}
                        description="Esperando 30+ min"
                        danger={criticalCount > 0}
                    />
                </section>

                {/* Leyenda */}
                <section className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800/80 bg-[#0d131b] px-4 py-3 text-xs">
                    <span className="mr-2 font-medium text-slate-500">
                        Tiempo desde llegada:
                    </span>

                    <LegendDot
                        color="bg-emerald-400"
                        label="0–19 min"
                    />

                    <LegendDot
                        color="bg-yellow-400"
                        label="20–24 min"
                    />

                    <LegendDot
                        color="bg-orange-400"
                        label="25–29 min"
                    />

                    <LegendDot
                        color="bg-red-400"
                        label="30+ min"
                    />
                </section>

                {/* TOOLBAR */}
                <section className="mb-4 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0d131b] p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <FilterButton
                            active={filter === "ALL"}
                            onClick={() => setFilter("ALL")}
                        >
                            Todos
                        </FilterButton>

                        <FilterButton
                            active={filter === "WAITING"}
                            onClick={() =>
                                setFilter("WAITING")
                            }
                        >
                            Esperando
                        </FilterButton>

                        <FilterButton
                            active={filter === "CALLED"}
                            onClick={() =>
                                setFilter("CALLED")
                            }
                        >
                            Llamados
                        </FilterButton>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Countdown visual */}
                        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#111821] px-3 py-2 text-xs">
                            <span
                                className={`h-2 w-2 rounded-full ${error
                                        ? "bg-amber-400"
                                        : "bg-emerald-400"
                                    }`}
                            />

                            <span className="text-slate-500">
                                Próxima actualización en
                            </span>

                            <span className="min-w-4 font-mono font-semibold text-slate-200">
                                {refreshCountdown}s
                            </span>
                        </div>

                        {lastUpdated && (
                            <div className="hidden text-xs text-slate-600 md:block">
                                Última:{" "}
                                {lastUpdated.toLocaleTimeString(
                                    [],
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    },
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleManualRefresh}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            ↻ Actualizar
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                        {error}
                    </div>
                )}

                {/* TABLA DESKTOP */}
                <section className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-[#0d131b] md:block">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#101720] text-xs uppercase tracking-wider text-slate-500">
                                    <th className="w-16 px-5 py-4">
                                        #
                                    </th>

                                    <SortableHeader
                                        label="Comensal"
                                        arrow={sortArrow("name")}
                                        onClick={() =>
                                            toggleSort("name")
                                        }
                                    />

                                    <th className="px-5 py-4">
                                        Teléfono
                                    </th>

                                    <SortableHeader
                                        label="Grupo"
                                        arrow={sortArrow("party_size")}
                                        onClick={() =>
                                            toggleSort("party_size")
                                        }
                                    />

                                    <SortableHeader
                                        label="Llegada / demora"
                                        arrow={sortArrow("created_at")}
                                        onClick={() =>
                                            toggleSort("created_at")
                                        }
                                    />

                                    <th className="px-5 py-4 text-right">
                                        Cambiar estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleEntries.map(
                                    (entry, index) => (
                                        <tr
                                            key={entry.id}
                                            className="border-b border-slate-800/70 transition last:border-0 hover:bg-slate-800/20"
                                        >
                                            <td className="px-5 py-4 font-mono text-sm text-slate-600">
                                                {String(
                                                    index + 1,
                                                ).padStart(2, "0")}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-100">
                                                        {entry.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-600">
                                                        Turno #{entry.id}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-400">
                                                {entry.phone}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-slate-200">
                                                    {entry.party_size}
                                                </span>

                                                <span className="ml-1 text-xs text-slate-600">
                                                    pers.
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-5">
                                                    <div>
                                                        <p className="text-xs text-slate-600">
                                                            Llegó
                                                        </p>

                                                        <p className="mt-1 font-mono text-xs text-slate-400">
                                                            {new Date(
                                                                entry.created_at,
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                },
                                                            )}
                                                        </p>
                                                    </div>

                                                    <WaitAge
                                                        createdAt={
                                                            entry.created_at
                                                        }
                                                    />
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                {entry.status ===
                                                    "WAITING" ? (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            updatingId ===
                                                            entry.id
                                                        }
                                                        onClick={() =>
                                                            handleCall(
                                                                entry.id,
                                                            )
                                                        }
                                                        className="inline-flex min-w-[110px] items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-white active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
                                                    >
                                                        {updatingId ===
                                                            entry.id
                                                            ? "Llamando..."
                                                            : "Llamar"}
                                                    </button>
                                                ) : (
                                                    <div className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300">
                                                        <span>✓</span>
                                                        Llamado
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading &&
                        visibleEntries.length === 0 && (
                            <EmptyState />
                        )}
                </section>

                {/* MOBILE */}
                <section className="space-y-3 md:hidden">
                    {visibleEntries.map(
                        (entry, index) => (
                            <div
                                key={entry.id}
                                className="rounded-2xl border border-slate-800 bg-[#0d131b] p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="font-mono text-xs text-slate-600">
                                            #
                                            {String(
                                                index + 1,
                                            ).padStart(2, "0")}
                                        </span>

                                        <h3 className="mt-2 text-lg font-semibold">
                                            {entry.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {entry.phone}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-semibold">
                                            {entry.party_size}
                                        </p>

                                        <p className="text-xs text-slate-600">
                                            personas
                                        </p>
                                    </div>
                                </div>

                                <div className="my-4 border-t border-slate-800" />

                                <div className="flex items-end justify-between gap-4">
                                    <WaitAge
                                        createdAt={
                                            entry.created_at
                                        }
                                    />

                                    {entry.status ===
                                        "WAITING" ? (
                                        <button
                                            type="button"
                                            disabled={
                                                updatingId === entry.id
                                            }
                                            onClick={() =>
                                                handleCall(entry.id)
                                            }
                                            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-950"
                                        >
                                            {updatingId === entry.id
                                                ? "Llamando..."
                                                : "Llamar"}
                                        </button>
                                    ) : (
                                        <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300">
                                            ✓ Llamado
                                        </span>
                                    )}
                                </div>
                            </div>
                        ),
                    )}

                    {!loading &&
                        visibleEntries.length === 0 && (
                            <EmptyState />
                        )}
                </section>
            </div>
        </main>
    );
}

/* ---------------------------------- */
/* Helpers visuales                    */
/* ---------------------------------- */

interface StatCardProps {
    label: string;
    value: number;
    description: string;
    danger?: boolean;
}

function StatCard({
    label,
    value,
    description,
    danger = false,
}: StatCardProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-[#0d131b] p-4 sm:p-5">
            <p className="text-xs font-medium text-slate-500">
                {label}
            </p>

            <p
                className={`mt-2 text-3xl font-bold ${danger
                        ? "text-red-300"
                        : "text-white"
                    }`}
            >
                {value}
            </p>

            <p className="mt-1 text-xs text-slate-600">
                {description}
            </p>
        </div>
    );
}

interface LegendDotProps {
    color: string;
    label: string;
}

function LegendDot({
    color,
    label,
}: LegendDotProps) {
    return (
        <span className="flex items-center gap-2 text-slate-400">
            <span
                className={`h-2 w-2 rounded-full ${color}`}
            />

            {label}
        </span>
    );
}

interface FilterButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

function FilterButton({
    active,
    onClick,
    children,
}: FilterButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${active
                    ? "bg-slate-100 text-slate-950"
                    : "border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
        >
            {children}
        </button>
    );
}

interface SortableHeaderProps {
    label: string;
    arrow: string;
    onClick: () => void;
}

function SortableHeader({
    label,
    arrow,
    onClick,
}: SortableHeaderProps) {
    return (
        <th className="px-5 py-4">
            <button
                type="button"
                onClick={onClick}
                className="flex items-center gap-2 transition hover:text-slate-300"
            >
                {label}

                <span className="text-slate-700">
                    {arrow}
                </span>
            </button>
        </th>
    );
}

function EmptyState() {
    return (
        <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/50 text-slate-500">
                ✓
            </div>

            <p className="mt-4 font-medium text-slate-300">
                No hay comensales aquí
            </p>

            <p className="mt-1 text-sm text-slate-600">
                No existen registros para el filtro seleccionado.
            </p>
        </div>
    );
}