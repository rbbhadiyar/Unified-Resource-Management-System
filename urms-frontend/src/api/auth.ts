import API from "./axios";

export const loginUser = (data: { email: string; password: string }) =>
  API.post("/auth/login", data);

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  year_of_study?: string;
  roll_number?: string;
}) => API.post("/auth/register", data);

export const updateProfile = (data: {
  name?: string;
  phone?: string;
  department?: string;
  year_of_study?: string;
  roll_number?: string;
}) => API.patch("/auth/me", data);

export const googleAuth = (id_token: string) =>
  API.post("/auth/google", { id_token });

export const getMe = () => API.get("/auth/me");

export const forgotPassword = (data: { email: string }) =>
  API.post("/auth/forgot-password", data);

export const resetPassword = (data: { token: string; new_password: string }) =>
  API.post("/auth/reset-password", data);
