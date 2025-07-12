import { cn } from "./cn";

interface Props
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: Props) => (
  <fieldset className="fieldset">
    <legend className="fieldset-legend">{label}</legend>
    <input className={cn("input w-full", props.className)} {...props} />
    <p className="label text-error">{error}</p>
  </fieldset>
);
