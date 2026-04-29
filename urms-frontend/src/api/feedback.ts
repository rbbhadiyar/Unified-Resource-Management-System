import API from "./axios";

export type FeedbackScope = "resource" | "overall";

export const getEligibleReturns = () => API.get("/feedback/eligible");

export const getMyFeedback = () => API.get("/feedback/mine");

export const getAdminFeedback = () => API.get("/feedback/admin");

export const submitFeedback = (data: {
  scope: FeedbackScope;
  request_id?: number | null;
  rating: number;
  comment?: string | null;
  category?: string | null;
}) => API.post("/feedback/", data);
