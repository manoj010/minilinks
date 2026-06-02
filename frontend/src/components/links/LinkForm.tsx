import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TextField } from '../forms/TextField';
import type { Link, LinkInput } from '../../types/link';

type LinkFormProps = {
  editing?: Link | null;
  onSubmit: (input: LinkInput) => Promise<void>;
  onCancel?: () => void;
};

export function LinkForm({ editing, onSubmit, onCancel }: LinkFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkInput>({
    defaultValues: { title: '', url: '', description: '', icon: '', is_active: true },
  });

  useEffect(() => {
    reset(
      editing
        ? {
            title: editing.title,
            url: editing.url,
            description: editing.description,
            icon: editing.icon,
            is_active: editing.is_active,
            position: editing.position,
          }
        : { title: '', url: '', description: '', icon: '', is_active: true },
    );
  }, [editing, reset]);

  async function submit(input: LinkInput) {
    await onSubmit(input);
    if (!editing) reset({ title: '', url: '', description: '', icon: '', is_active: true });
  }

  return (
    <form className="panel p-4" onSubmit={handleSubmit(submit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Title"
          placeholder="My portfolio"
          registration={register('title', { required: 'Title is required' })}
          error={errors.title}
        />
        <TextField
          label="URL"
          type="url"
          placeholder="https://example.com"
          registration={register('url', {
            required: 'URL is required',
            pattern: { value: /^https?:\/\/.+/i, message: 'Use a valid http or https URL' },
          })}
          error={errors.url}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px]">
        <TextField label="Description" registration={register('description')} rows={2} />
        <TextField label="Icon" placeholder="globe" registration={register('icon')} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input className="h-4 w-4 accent-teal-600" type="checkbox" {...register('is_active')} />
          Active
        </label>
        <div className="flex gap-2">
          {editing && onCancel ? (
            <button className="btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            <Save size={17} /> {editing ? 'Save link' : 'Add link'}
          </button>
        </div>
      </div>
    </form>
  );
}
