import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../../utils/auth';

export function OAuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Signing you in...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = params.get('access_token');
    if (!token) {
      setMessage('Could not finish sign in. Redirecting...');
      window.setTimeout(() => navigate('/login', { replace: true }), 1200);
      return;
    }
    setToken(token);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="panel max-w-sm px-6 py-5 text-center text-sm font-medium text-slate-600">{message}</div>
    </main>
  );
}
