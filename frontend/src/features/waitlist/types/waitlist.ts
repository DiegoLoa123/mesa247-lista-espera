export type WaitlistStatus =
  | "WAITING" | "CALLED" | "SEATED" | "LEFT" | "NO_SHOW";

export interface JoinWaitlistRequest {
  name: string;
  phone: string;
  party_size: number;
}

export interface WaitlistEntry {
  id: number;
  location_id: number;
  name: string;
  phone: string;
  party_size: number;
  status: WaitlistStatus;
  created_at: string;
  called_at: string | null;
}

export interface UpdateWaitlistStatusRequest {
  status: WaitlistStatus;
}