'use client';

import { FormEvent, useState } from 'react';
import WsLogo from '@/components/WsLogo';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.get('password') }),
      });

      if (res.ok) {
        window.location.href = '/admin';
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Authentication failed. Please verify your admin password.');
      }
    } catch {
      setError('Unable to reach server. Please check connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0a261f 0%, #0e382c 100%)',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <WsLogo size={80} textColor="#0e382c" goldColor="#c5a880" />
        </div>

        <h1 style={{ fontFamily: 'Cinzel, Georgia, serif', color: '#0e382c', margin: '4px 0 2px', fontSize: 24 }}>
          Waseem Cafe
        </h1>
        <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c5a880', fontWeight: 600, margin: '0 0 24px' }}>
          Admin Management Portal
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: '#182420' }}>
            Admin Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter admin access key"
              style={{
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #d4cabb',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#0e382c',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>

          {error && (
            <p role="alert" style={{ color: '#b91c1c', fontSize: 13, margin: 0, textAlign: 'center', fontWeight: 600 }}>
              {error}
            </p>
          )}

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <a href="/" style={{ color: '#0e382c', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              ← Return to Customer Menu
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
