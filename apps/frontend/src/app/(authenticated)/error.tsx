'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-error text-lg font-medium">Algo deu errado</div>
      <p className="text-sm text-text-muted max-w-md text-center">
        {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-black/80 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
