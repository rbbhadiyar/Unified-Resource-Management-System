import API from "./axios";

export const getUsers = () => API.get("/users/");

export const getDefaulters = () => API.get("/users/defaulters");

export const blockUser = (userId: number) => API.post(`/users/${userId}/block`);

export const unblockUser = (userId: number) => API.post(`/users/${userId}/unblock`);
