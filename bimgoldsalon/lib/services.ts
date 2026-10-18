/** Used when a service doesn't set its own. Editable per service in the admin. */
export const DEFAULT_DEPOSIT_PERCENT = 30;
/** Two stylists work at once, so each service can be booked twice at the same time */
export const DEFAULT_SERVICE_CAPACITY = 2;

/** What the public booking pages use. `id` is a string so existing code keeps working. */
export type Service = {
  id: string;
  name: string;
  category: string;
  image: string;
  featured: boolean;
  durationMin: number;
  /** e.g. "1hr - 2hr" */
  durationLabel: string;
  /** The "from" price */
  fromPrice: number;
  depositPercent: number;
  details: [label: string, text: string][];
};

export type AdminService = {
  id: number;
  name: string;
  category: string;
  price: number;
  durationMin: number;
  /** Optional text shown to customers instead of the exact duration */
  durationLabel: string;
  depositPercent: number;
  featured: boolean;
  /** How many clients can have this service at the same time */
  capacity: number;
  image: string;
  images: string[];
  extraInfo: Record<string, string>;
};

export type ServiceInput = Omit<AdminService, "id">;

/** Preview only. The database works out the real deposit when a booking is made. */
export const serviceDeposit = (price: number, percent: number) =>
  Math.round(price * percent) / 100;
