import API from "./axios";

export const getTransactions = () => API.get("/transactions/");
export const getDueSoon = (days = 3) => API.get("/transactions/due-soon", { params: { days } });
export const runReturnReminders = () => API.post("/transactions/run-reminders");

export const getPendingReturns = () => API.get("/transactions/pending-returns");

/** User: submit return for admin verification */
export const requestReturn = (payload: { transaction_id?: number; request_id?: number }) =>
  API.post("/transactions/request-return", payload);

/** Admin: complete return after physical verification */
export const confirmReturn = (payload: {
  transaction_id?: number;
  request_id?: number;
  damage_fine?: number;
}) => API.post("/transactions/confirm-return", payload);
