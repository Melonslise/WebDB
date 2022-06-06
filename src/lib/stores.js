import { writable } from "svelte/store";

export const authorized = writable(false);
export const role = writable("user");