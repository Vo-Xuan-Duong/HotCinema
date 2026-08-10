import { Navigate, useLocation } from "react-router-dom"
import useAuth from "@/hooks/useAuth"

function RequireAuth({ children }) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  return children
}

export default RequireAuth
