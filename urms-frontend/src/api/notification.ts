import API from "./axios";

export const getNotifications = () => API.get("/notifications/");

export const markAsRead = (id: number) => API.post(`/notifications/${id}/read`);
