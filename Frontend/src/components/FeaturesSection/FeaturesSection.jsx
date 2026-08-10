import { Armchair, Film, Smartphone, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Film,
    title: 'Phim mới nhất',
    description: 'Cập nhật phim mới và các suất chiếu hiện có tại HotCinema.',
  },
  {
    icon: Volume2,
    title: 'Âm thanh chất lượng',
    description: 'Không gian âm thanh và hình ảnh được tối ưu cho từng phòng chiếu.',
  },
  {
    icon: Armchair,
    title: 'Ghế ngồi thoải mái',
    description: 'Sơ đồ ghế trực quan giúp chọn nhanh vị trí phù hợp trước khi thanh toán.',
  },
  {
    icon: Smartphone,
    title: 'Đặt vé dễ dàng',
    description: 'Chọn phim, rạp, suất chiếu và nhận vé điện tử trong một luồng thống nhất.',
  },
];

const FeaturesSection = () => (
  <section className="border-y border-border bg-background py-6">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div>
          <p className="text-xs font-medium text-primary">Trải nghiệm HotCinema</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Tại sao chọn HotCinema?</h2>
        </div>
        <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
          Một hành trình đặt vé rõ ràng, nhất quán và dễ sử dụng trên mọi thiết bị.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="h-full transition-colors hover:border-primary/40">
            <CardContent className="flex h-full items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
