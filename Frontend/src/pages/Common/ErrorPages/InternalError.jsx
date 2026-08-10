import { ServerCrash } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

const InternalError = () => (
  <ErrorState
    code="500"
    title="Có lỗi xảy ra"
    description="Máy chủ chưa thể xử lý yêu cầu lúc này. Bạn có thể thử tải lại trang hoặc quay về trang chủ."
    icon={ServerCrash}
    retry
  />
);

export default InternalError;
