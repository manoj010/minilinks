import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login } from '../../api/authApi';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import { TextField } from '../../components/forms/TextField';
import { AuthShell } from '../../components/layout/AuthShell';
import type { LoginInput } from '../../types/auth';
import { setToken } from '../../utils/auth';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>();

  useEffect(() => {
    const oauthError = searchParams.get('oauth_error');
    if (oauthError) {
      setError(oauthError);
    }
  }, [searchParams]);

  async function submit(input: LoginInput) {
    setError('');
    try {
      const response = await login(input);
      setToken(response.access_token);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password.');
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your public profile and links."
      switchText="New to MiniLinks?"
      switchHref="/register"
      switchLabel="Create an account"
    >
      <div className="space-y-5">
        <OAuthButtons />
        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <TextField
            label="Email"
            type="email"
            registration={register('email', { required: 'Email is required' })}
            error={errors.email}
          />
          <TextField
            label="Password"
            type="password"
            registration={register('password', { required: 'Password is required' })}
            error={errors.password}
          />
          {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
          <button className="btn-primary w-full" disabled={isSubmitting} type="submit">
            <LogIn size={18} /> Sign in
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
