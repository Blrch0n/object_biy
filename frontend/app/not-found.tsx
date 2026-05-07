import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
       <div className="bg-slate-800 p-8 flex flex-col items-center rounded-xl shadow-xl max-w-md w-full border border-slate-700">
          <h1 className="text-6xl font-black text-blue-500 mb-4 opacity-50">404</h1>
          <h2 className="text-2xl font-bold mb-4 text-white">Page Not Found</h2>
          <p className="text-slate-400 mb-8 text-sm text-center">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/"
            className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            Return Home
          </Link>
       </div>
    </main>
  );
}