import API from "./axios";

export const getRules = () => API.get("/rules/");

export const updateRule = (ruleId: number, value: number) =>
  API.put(`/rules/${ruleId}`, { value });

export const bulkUpdateRules = (items: { rule_id: number; value: number }[]) =>
  API.put("/rules/bulk", items);
