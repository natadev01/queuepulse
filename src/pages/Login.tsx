import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { signInWithGoogle, user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          QueuePulse
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Realtime Queue Manager
        </h1>
        <p className="mt-3 text-slate-500">
          Sign in to generate tickets, scan QR codes, and run the live
          dashboard.
        </p>
        <button
          onClick={signInWithGoogle}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
