import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useParams,
} from "react-router-dom";

import { Logo } from "../../../shared/components/Logo";
import { getWaitlist } from "../api/waitlistApi";
import { WaitTimer } from "../components/WaitTimer";
import type { WaitlistEntry } from "../types/waitlist";

const REFRESH_INTERVAL = 5000;

interface NavigationState {
  entry?: WaitlistEntry;
}

export function QueuePage() {
  const { entryId } = useParams();
  const location = useLocation();

  const navigationState =
    location.state as NavigationState | null;

  const initialEntry = navigationState?.entry ?? null;

  const [entry, setEntry] =
    useState<WaitlistEntry | null>(initialEntry);

  const [position, setPosition] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(!initialEntry);
  const [error, setError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const currentEntryId = Number(entryId);

  /*
   * El POST anterior nos entrega location_id.
   *
   * Si el usuario acaba de registrarse, tenemos ese dato
   * en navigation state.
   *
   * Para este MVP utilizamos location 1 como fallback
   * cuando alguien refresca directamente la página.
   */
  const locationId = entry?.location_id ?? 1;

  const refreshQueue = useCallback(async () => {
    if (!currentEntryId) {
      setError("El turno solicitado no es válido.");
      setLoading(false);
      return;
    }

    try {
      const queue = await getWaitlist(locationId);

      const currentEntry = queue.find(
        (item) => item.id === currentEntryId,
      );

      if (!currentEntry) {
        setError(
          "No encontramos este turno dentro de la cola activa.",
        );
        return;
      }

      setEntry(currentEntry);

      /*
       * La posición se calcula únicamente entre
       * personas que continúan esperando.
       */
      const waitingEntries = queue.filter(
        (item) => item.status === "WAITING",
      );

      const waitingIndex = waitingEntries.findIndex(
        (item) => item.id === currentEntryId,
      );

      if (currentEntry.status === "WAITING") {
        setPosition(
          waitingIndex >= 0 ? waitingIndex + 1 : null,
        );
      } else {
        setPosition(null);
      }

      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError(
        "No pudimos actualizar tu turno. Intentaremos nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentEntryId, locationId]);

  useEffect(() => {
    refreshQueue();

    const interval = window.setInterval(
      refreshQueue,
      REFRESH_INTERVAL,
    );

    return () => window.clearInterval(interval);
  }, [refreshQueue]);

  if (loading && !entry) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b10]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />

          <p className="mt-4 text-sm text-slate-500">
            Consultando tu turno...
          </p>
        </div>
      </main>
    );
  }

  if (!entry) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b10] px-5">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold text-white">
            No encontramos tu turno
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ??
              "Este turno ya no se encuentra disponible."}
          </p>
        </div>
      </main>
    );
  }

  const isWaiting = entry.status === "WAITING";
  const isCalled = entry.status === "CALLED";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b10]">
      {/* Glow superior */}
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-sky-500/[0.06] blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span
              className={`h-2 w-2 rounded-full ${
                error
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
            />

            {error ? "Reconectando" : "Turno activo"}
          </div>
        </header>

        {/* Contenido */}
        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-[520px]">
            {/* Sucursal */}
            <div className="mb-7 text-center">
              <div className="mb-3 inline-flex items-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400">
                Lista de espera · Hoy
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                La Terraza Azul
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Hola, {entry.name}. Este es el estado de tu turno.
              </p>
            </div>

            {/* Card principal */}
            <div className="overflow-hidden rounded-3xl border border-slate-800/90 bg-[#0d131b]/95 shadow-2xl shadow-black/20">
              {/* Posición */}
              <div className="px-6 pb-8 pt-8 text-center sm:px-9">
                {isWaiting && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                      Estás en la cola
                    </p>

                    <div className="mt-4 text-[88px] font-black leading-none tracking-[-0.06em] text-white sm:text-[104px]">
                      {position ?? "—"}
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                      Tu posición actual
                    </p>
                  </>
                )}

                {isCalled && (
                  <>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                      <span className="text-2xl text-emerald-300">
                        ✓
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                      Mesa disponible
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-white">
                      ¡Es tu turno!
                    </h2>

                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                      Acércate al anfitrión. Tu mesa está lista
                      para recibirte.
                    </p>
                  </>
                )}
              </div>

              {/* Separador */}
              <div className="mx-6 border-t border-slate-800 sm:mx-9" />

              {/* Timer */}
              <div className="px-6 py-8 sm:px-9">
                <WaitTimer
                  createdAt={entry.created_at}
                  maxMinutes={30}
                />
              </div>

              {/* 30 o nada */}
              <div className="border-t border-slate-800 bg-[#101720] px-6 py-6 sm:px-9">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sm font-black text-sky-300">
                    30
                  </div>

                  <div>
                    <p className="font-bold tracking-tight text-white">
                      Compromiso de atención
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Nuestro compromiso es atenderte en un
                      máximo de 30 minutos. Tu lugar queda
                      registrado desde el momento en que te
                      uniste a la cola.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado de sincronización */}
            <div className="mt-5">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    error
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />

                {error ? (
                  <span>
                    Sin conexión · volveremos a intentar
                  </span>
                ) : (
                  <span>
                    Actualización automática cada 5 segundos
                  </span>
                )}
              </div>

              {lastUpdated && (
                <p className="mt-2 text-center text-[11px] text-slate-700">
                  Última consulta{" "}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-slate-700">
          Mesa247 · Lista de espera
        </footer>
      </div>
    </main>
  );
}