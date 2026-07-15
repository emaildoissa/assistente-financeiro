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
        className="px-5 py-2 bg-text-main text-white text-sm rounded-xl hover:bg-text-main/80 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
