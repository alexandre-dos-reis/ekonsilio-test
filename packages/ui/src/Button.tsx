import { cn } from "./cn";

export const Button = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
) => (
  <div className="flex items-center justify-center">
    <button {...props} className={cn("btn btn-primary", props.className)} />
  </div>
);
