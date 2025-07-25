import type { PropsWithChildren } from "react";
import { cn } from "./cn";

export const Alert = ({
  children,
  type = "info",
}: PropsWithChildren<{
  type?: "info" | "error" | "success" | "warning";
  className?: string;
}>) => (
  <div
    role="alert"
    className={cn(
      "alert",
      type === "info" && "alert-info",
      type === "error" && "alert-error",
      type === "success" && "alert-success",
      type === "warning" && "alert-warning",
    )}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className="h-6 w-6 shrink-0 stroke-current"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <span>{children}</span>
  </div>
);
