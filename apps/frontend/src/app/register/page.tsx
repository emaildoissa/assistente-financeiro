'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name, tenantName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-text-main">Criar Conta</h1>
          <p className="text-sm text-text-muted mt-2">Primeiro acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-error border border-red-100">{error}</div>
          )}
          <div>
            <label className="block text-sm font-sans font-medium text-text-main mb-1.5">Seu Nome</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Maria Silva" required />
          </div>
          <div>
            <label className="block text-sm font-sans font-medium text-text-main mb-1.5">Nome da Empresa</label>
            <Input value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="Minha Empresa" required />
          </div>
          <div>
            <label className="block text-sm font-sans font-medium text-text-main mb-1.5">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-sans font-medium text-text-main mb-1.5">Senha</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Conta'}
          </Button>
          <p className="text-center text-sm text-text-muted">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">Entre</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
