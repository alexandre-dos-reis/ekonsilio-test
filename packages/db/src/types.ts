import { userRoleEnum, statusConvEnum } from "./schema";

export type StatusConv = (typeof statusConvEnum)["enumValues"][number];
export type UserRole = (typeof userRoleEnum)["enumValues"][number];
