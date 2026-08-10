import { FileQuestion } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

const NotFound = () => (
  <ErrorState
    code="404"
    title="Không tìm thấy trang"
    description="Trang bạn yêu cầu không tồn tại, đã được di chuyển hoặc đường dẫn không còn hợp lệ."
    icon={FileQuestion}
  />
);

export default NotFound;
