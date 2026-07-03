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
      <div className="text-red-500 text-lg font-medium">Algo deu errado</div>
      <p className="text-sm text-gray-500 max-w-md text-center">
        {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
