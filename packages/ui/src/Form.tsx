import { cn } from "./cn";

export const Form = (
  props: React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >,
) => <form {...props} className={cn("flex flex-col gap-3", props.className)} />;
