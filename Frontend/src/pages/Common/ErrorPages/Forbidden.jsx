import { ShieldAlert } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

const Forbidden = () => (
  <ErrorState
    code="403"
    title="Không có quyền truy cập"
    description="Tài khoản hiện tại không có quyền sử dụng khu vực này. Hãy quay lại trang chính hoặc liên hệ quản trị viên."
    icon={ShieldAlert}
  />
);

export default Forbidden;
