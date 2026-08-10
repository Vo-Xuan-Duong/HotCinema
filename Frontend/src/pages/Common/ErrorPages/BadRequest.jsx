import { CircleAlert } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

const BadRequest = () => (
  <ErrorState
    code="400"
    title="Yêu cầu không hợp lệ"
    description="Thông tin gửi lên chưa hợp lệ hoặc không thể xử lý. Hãy kiểm tra dữ liệu và thử lại."
    icon={CircleAlert}
  />
);

export default BadRequest;
