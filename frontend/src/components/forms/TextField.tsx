import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';

type TextFieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  rows?: number;
  registration: UseFormRegisterReturn;
  error?: FieldError;
};

export function TextField({
  label,
  type = 'text',
  placeholder,
  rows,
  registration,
  error,
}: TextFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {rows ? (
        <textarea className="input min-h-24 resize-y" rows={rows} placeholder={placeholder} {...registration} />
      ) : (
        <input className="input" type={type} placeholder={placeholder} {...registration} />
      )}
      {error ? <span className="text-xs font-medium text-rose-600">{error.message}</span> : null}
    </label>
  );
}
