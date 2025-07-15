import { cn } from "./cn";

export const AnimatePing = (props: { className?: string }) => (
  <span className={cn("absolute -top-5 right-0 flex size-3", props.className)}>
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
    <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
  </span>
);
