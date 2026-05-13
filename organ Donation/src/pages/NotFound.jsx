import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Home } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-slate-50">
    <HeartPulse size={72} className="text-red-500 mb-6" />
    <h1 className="text-8xl font-extrabold text-blue-900 leading-none mb-2">404</h1>
    <h2 className="text-2xl font-bold text-slate-800 mb-3">Page Not Found</h2>
    <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to={ROUTES.HOME} className="btn btn-primary">
      <Home size={18} /> Back to Home
    </Link>
  </div>
);

export default NotFound;
