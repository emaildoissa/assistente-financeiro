'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Criar Conta</CardTitle>
          <p className="text-sm text-gray-500">Primeiro acesso</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Seu Nome</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Maria Silva" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
              <Input value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="Minha Empresa" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Conta'}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">Entre</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
