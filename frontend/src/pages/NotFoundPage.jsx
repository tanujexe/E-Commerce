/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-md">
        <p className="font-display font-bold text-9xl text-dark-900 leading-none mb-2">404</p>
        <div className="w-20 h-1 bg-primary-500 rounded-full mx-auto mb-6" />
        <h1 className="font-display font-bold text-3xl text-dark-900 mb-3">Page Not Found</h1>
        <p className="text-dark-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn btn-ghost border border-dark-200 gap-2">
            <FiArrowLeft size={15} /> Go Back
          </button>
          <Link to="/" className="btn btn-primary gap-2">
            <FiHome size={15} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
