import { Wrench } from 'lucide-react';
import { ErrorState } from '@/components/ui/error-state';

const Maintenance = () => (
  <ErrorState
    code="Maintenance"
    title="Hệ thống đang bảo trì"
    description="Một số chức năng đang tạm dừng để nâng cấp. Vui lòng quay lại sau ít phút."
    icon={Wrench}
    retry
  />
);

export default Maintenance;
