import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await api.auth.login({ email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="bg-[var(--background-panel)] p-8 rounded-xl border border-[var(--border)] w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-[var(--text-secondary)]">Sign in to continue to CodeAssess</p>
        </div>

        {error && (
          <div className="bg-[var(--error)] bg-opacity-20 border border-[var(--error)] text-[var(--error)] px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded mt-4 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[var(--text-secondary)] mt-8 text-sm">
          Don't have an account? <Link to="/register" className="text-[var(--primary)] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
