import API from "./axios";

export interface CreateRequestPayload {
  resource_id: number;
  loan_days: number;
  notes?: string | null;
}

export const createRequest = (data: CreateRequestPayload) =>
  API.post("/requests/create", data);

export const getRequests = () => API.get("/requests/");

export const approveRequest = (id: number) =>
  API.post(`/requests/${id}/approve`);

export const rejectRequest = (id: number) =>
  API.post(`/requests/${id}/reject`);
