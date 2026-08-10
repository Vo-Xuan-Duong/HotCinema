import { Armchair, Film, Smartphone, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Film,
    title: 'Phim mới nhất',
    description: 'Cập nhật những bộ phim mới và các suất chiếu đang có tại hệ thống HotCinema.',
  },
  {
    icon: Volume2,
    title: 'Âm thanh chất lượng',
    description: 'Trải nghiệm không gian âm thanh và hình ảnh được tối ưu cho từng phòng chiếu.',
  },
  {
    icon: Armchair,
    title: 'Ghế ngồi thoải mái',
    description: 'Theo dõi sơ đồ ghế trực quan và chọn vị trí phù hợp trước khi thanh toán.',
  },
  {
    icon: Smartphone,
    title: 'Đặt vé dễ dàng',
    description: 'Chọn phim, rạp, suất chiếu và nhận vé điện tử trong một luồng thống nhất.',
  },
];

const FeaturesSection = () => (
  <section className="border-y border-border bg-background py-14 sm:py-16">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Trải nghiệm HotCinema</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Tại sao chọn HotCinema?</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Một hành trình đặt vé rõ ràng, nhất quán và dễ sử dụng trên mọi thiết bị.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="h-full shadow-sm transition-colors hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
