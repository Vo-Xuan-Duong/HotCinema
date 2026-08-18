import { useEffect, useMemo } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const describeError = (error) => {
  if (isRouteErrorResponse(error)) {
    return {
      status: error.status,
      title: error.status === 404 ? 'Không tìm thấy nội dung' : 'Không thể mở trang này',
      message: error.statusText || error.data?.message || 'Router không thể hoàn tất yêu cầu.',
    };
  }

  return {
    status: error?.status || error?.response?.status || 500,
    title: 'Giao diện gặp lỗi',
    message: error?.message || 'Đã xảy ra lỗi không mong muốn khi hiển thị trang.',
  };
};

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const details = useMemo(() => describeError(error), [error]);

  useEffect(() => {
    console.error('Route error boundary:', error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-xl">
        <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">HTTP / UI {details.status}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{details.title}</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{details.message}</p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />Tải lại ứng dụng
            </Button>
            <Button type="button" onClick={() => navigate('/', { replace: true })}>
              <Home className="h-4 w-4" />Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export { describeError };
export default RouteErrorBoundary;
