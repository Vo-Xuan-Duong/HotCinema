import { Navigate, useLocation } from 'react-router-dom';

/** Preserves `location.state` (e.g. `from`) when redirecting /login → /auth/login. */
const LoginRouteRedirect = () => {
  const location = useLocation();
  return <Navigate to="/auth/login" replace state={location.state} />;
};

export default LoginRouteRedirect;
