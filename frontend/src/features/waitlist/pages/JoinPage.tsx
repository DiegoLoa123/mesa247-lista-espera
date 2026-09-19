import { type FormEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Logo } from "../../../shared/components/Logo";
import { joinWaitlist } from "../api/waitlistApi";
import { PartySizeSelector } from "../components/PartySizeSelector";

export function JoinPage() {
  const navigate = useNavigate();
  const { locationId } = useParams();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLocationId = Number(locationId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError("Completa tu nombre y teléfono.");
      return;
    }

    if (!currentLocationId) {
      setError("La sucursal no es válida.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const entry = await joinWaitlist(currentLocationId, {
        name: name.trim(),
        phone: phone.trim(),
        party_size: partySize,
      });

      navigate(`/queue/${entry.id}`, {
        state: {
          entry,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b10]">
      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-sky-500/[0.06] blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Servicio disponible
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <div className="w-full max-w-[460px]">
            {/* Encabezado */}
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400">
                Lista de espera · Hoy
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                La Terraza Azul
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
                Regístrate y conserva tu lugar mientras preparamos
                una mesa para ti.
              </p>
            </div>

            {/* Formulario */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-800/90 bg-[#0d131b]/95 p-5 shadow-2xl shadow-black/20 sm:p-7"
            >
              <div className="space-y-5">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Tu nombre
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. Carla"
                    maxLength={100}
                    autoComplete="name"
                    className="h-14 w-full rounded-xl border border-slate-700/80 bg-[#111821] px-4 text-[15px] text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500/70 focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Teléfono
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+51 987 654 321"
                    maxLength={20}
                    autoComplete="tel"
                    className="h-14 w-full rounded-xl border border-slate-700/80 bg-[#111821] px-4 text-[15px] text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500/70 focus:ring-4 focus:ring-sky-500/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Lo usaremos únicamente para identificar tu turno.
                  </p>
                </div>

                {/* Personas */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    ¿Cuántos son?
                  </label>

                  <PartySizeSelector
                    value={partySize}
                    onChange={setPartySize}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-14 w-full items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-950 transition hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Registrando..." : "Unirme a la cola"}
                </button>
              </div>
            </form>

            <div className="mt-5 flex items-start gap-3 px-1">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-400" />

              <p className="text-xs leading-5 text-slate-500">
                Al registrarte entrarás en la lista de espera de esta
                sucursal. Mantén esta página abierta para consultar tu
                turno.
              </p>
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