import type {
  JoinWaitlistRequest,
  WaitlistEntry,
} from "../types/waitlist";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function joinWaitlist(
  locationId: number,
  payload: JoinWaitlistRequest,
): Promise<WaitlistEntry> {
  const response = await fetch(
    `${API_URL}/api/locations/${locationId}/waitlist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("No pudimos registrarte en la cola.");
  }

  return response.json();
}

export async function getWaitlist(
  locationId: number,
): Promise<WaitlistEntry[]> {
  const response = await fetch(
    `${API_URL}/api/locations/${locationId}/waitlist`,
  );

  if (!response.ok) {
    throw new Error("No pudimos consultar la lista de espera.");
  }

  return response.json();
}

export async function callWaitlistEntry(
  entryId: number,
): Promise<WaitlistEntry> {
  const response = await fetch(
    `${API_URL}/api/waitlist/${entryId}/call`,
    {
      method: "PATCH",
      headers: {
        Accept: "*/*",
      },
    },
  );

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Este comensal ya fue llamado.");
    }

    throw new Error("No pudimos llamar al comensal.");
  }

  return response.json();
}