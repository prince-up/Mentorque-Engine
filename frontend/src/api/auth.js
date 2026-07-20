import { api, get, post } from "./client.js";

export async function login(role, data) {
  return api("POST", `/api/auth/login/${role}`, data, { skipAuthRedirect: true });
}

export async function me() {
  return api("GET", `/api/auth/me?_=${Date.now()}`, null, { skipAuthRedirect: true });
}
