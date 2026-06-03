import { UserPlus } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { register as registerUser } from '../../api/authApi';
import { TextField } from '../../components/forms/TextField';
import { AuthShell } from '../../components/layout/AuthShell';
import type { RegisterInput } from '../../types/auth';
import { setToken } from '../../utils/auth';

export function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>();

  async function submit(input: RegisterInput) {
    setError('');
    try {
      const { confirmPassword, ...payload } = input;
      void confirmPassword;
      const response = await registerUser(payload);
      setToken(response.access_token);
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError(error.response.data?.detail ?? 'That email or username is already in use.');
        return;
      }
      setError('Could not create account. Please try again.');
    }
  }

  return (
    <AuthShell
      title="Create your profile"
      subtitle="Claim a username and start publishing links in minutes."
      switchText="Already have an account?"
      switchHref="/login"
      switchLabel="Sign in"
    >
      <form className="space-y-4" onSubmit={handleSubmit(submit)}>
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
        <TextField
          label="Email"
          type="email"
          registration={register('email', { required: 'Email is required' })}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          registration={register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Use at least 8 characters' },
            maxLength: { value: 72, message: 'Use 72 characters or fewer' },
          })}
          error={errors.password}
        />
        <TextField
          label="Confirm password"
          type="password"
          registration={register('confirmPassword', {
            required: 'Confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
          error={errors.confirmPassword}
        />
        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
        <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
          <UserPlus size={18} /> Create account
        </button>
      </form>
    </AuthShell>
  );
}
