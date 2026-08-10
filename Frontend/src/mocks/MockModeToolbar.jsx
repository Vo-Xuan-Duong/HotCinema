import { Database, RefreshCw, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { clearAuthData } from '@/utils/authStorage';
import { MOCK_API_ENABLED, resetMockDatabase, setMockApiEnabled } from '@/mocks/mockConfig';
import { resetRuntimeMockDatabase } from '@/mocks/mockDatabase';

const reload = () => window.location.reload();

const MockModeToolbar = () => {
  if (!import.meta.env.DEV) return null;

  const toggleMode = () => {
    clearAuthData();
    setMockApiEnabled(!MOCK_API_ENABLED);
    reload();
  };

  const resetData = () => {
    resetMockDatabase();
    resetRuntimeMockDatabase();
    clearAuthData();
    reload();
  };

  return (
    <aside className="fixed bottom-4 left-4 z-[100] w-[min(360px,calc(100vw-2rem))] rounded-lg border bg-card/95 p-3 text-card-foreground shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Frontend test mode</p>
            <StatusBadge tone={MOCK_API_ENABLED ? 'success' : 'neutral'}>
              Mock {MOCK_API_ENABLED ? 'ON' : 'OFF'}
            </StatusBadge>
          </div>
          {MOCK_API_ENABLED ? (
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <p>Admin: <span className="font-medium text-foreground">admin@hotcinema.vn</span> / admin123</p>
              <p>Customer: <span className="font-medium text-foreground">customer@hotcinema.vn</span> / customer123</p>
              <p>Mã giảm giá: <span className="font-medium text-foreground">HOT20</span> hoặc WELCOME50</p>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Frontend đang gọi API thật theo VITE_API_BASE_URL.</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={toggleMode}>
          <Server className="h-3.5 w-3.5" />
          {MOCK_API_ENABLED ? 'Dùng API thật' : 'Bật mock'}
        </Button>
        {MOCK_API_ENABLED && (
          <Button type="button" size="sm" variant="ghost" onClick={resetData}>
            <RefreshCw className="h-3.5 w-3.5" />
            Reset dữ liệu
          </Button>
        )}
      </div>
    </aside>
  );
};

export default MockModeToolbar;
