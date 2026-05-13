import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

const Unauthorized = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-slate-50">
    <ShieldAlert size={72} className="text-red-500 mb-6" />
    <h1 className="text-3xl font-extrabold text-blue-900 mb-3">Access Denied</h1>
    <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
      You don't have permission to view this page. Contact your administrator if you believe this is an error.
    </p>
    <Link to={ROUTES.HOME} className="btn btn-primary">
      <Home size={18} /> Back to Home
    </Link>
  </div>
);

export default Unauthorized;
