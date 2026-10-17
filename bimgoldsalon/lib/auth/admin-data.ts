import "server-only";
import { cache } from "react";
import { getAdminSnapshot } from "./api";
export const getSnapshot = cache(getAdminSnapshot);
