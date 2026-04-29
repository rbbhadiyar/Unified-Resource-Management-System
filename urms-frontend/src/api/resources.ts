import API from "./axios";

export const getResources = () => API.get("/resources/");
export const getResourceTypes = () => API.get("/resources/types");
export const createResource = (data: unknown) => API.post("/resources/", data);
export const updateResource = (id: number, data: unknown) => API.put(`/resources/${id}`, data);
export const deleteResource = (id: number) => API.delete(`/resources/${id}`);
