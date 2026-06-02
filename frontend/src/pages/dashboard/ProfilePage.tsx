import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getProfile, updateProfile } from '../../api/profileApi';
import { TextField } from '../../components/forms/TextField';
import type { ProfileUpdate, UserProfile } from '../../types/profile';

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdate>();

  useEffect(() => {
    void getProfile().then((nextProfile) => {
      setProfile(nextProfile);
      reset(nextProfile);
    });
  }, [reset]);

  async function submit(input: ProfileUpdate) {
    const nextProfile = await updateProfile(input);
    setProfile(nextProfile);
    reset(nextProfile);
    setMessage('Profile saved.');
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Profile</h1>
        <p className="mt-1 text-slate-600">Control how your public page looks and reads.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <form className="panel space-y-4 p-5" onSubmit={handleSubmit(submit)}>
          <TextField
            label="Name"
            registration={register('name', { required: 'Name is required' })}
            error={errors.name}
          />
          <TextField
            label="Username"
            registration={register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Use at least 3 characters' },
              pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, underscores, and dashes' },
            })}
            error={errors.username}
          />
          <TextField label="Bio" registration={register('bio')} rows={4} />
          <TextField
            label="Avatar URL"
            type="url"
            registration={register('avatar_url', {
              pattern: { value: /^(https?:\/\/.+)?$/i, message: 'Use a valid http or https URL' },
            })}
            error={errors.avatar_url}
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Theme</span>
            <select className="input" {...register('theme')}>
              <option value="sunset">Sunset</option>
              <option value="forest">Forest</option>
              <option value="midnight">Midnight</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
          {message ? <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p> : null}
          <button className="btn-primary" disabled={isSubmitting} type="submit">
            <Save size={17} /> Save profile
          </button>
        </form>
        <aside className="panel p-5">
          <h2 className="text-lg font-bold">Public preview</h2>
          <div className="mt-4 rounded-lg bg-gradient-to-br from-teal-500 via-sky-500 to-rose-400 p-5 text-center text-white">
            <img
              className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover"
              src={profile?.avatar_url || 'https://api.dicebear.com/9.x/thumbs/svg?seed=minilinks'}
              alt=""
            />
            <p className="mt-4 text-xl font-bold">{profile?.name ?? 'Your name'}</p>
            <p className="text-sm text-white/80">@{profile?.username ?? 'username'}</p>
            <p className="mt-3 text-sm text-white/90">{profile?.bio || 'Your bio will appear here.'}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
