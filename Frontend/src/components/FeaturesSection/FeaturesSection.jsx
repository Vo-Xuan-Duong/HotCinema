import React from 'react';
import { Card } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🎬',
      title: 'Phim mới nhất',
      description: 'Cập nhật những bộ phim bom tấn mới nhất từ Hollywood'
    },
    {
      icon: '🎵',
      title: 'Âm thanh chất lượng',
      description: 'Hệ thống âm thanh Dolby Atmos cho trải nghiệm tuyệt vời'
    },
    {
      icon: '🪑',
      title: 'Ghế ngồi thoải mái',
      description: 'Ghế ngồi cao cấp với khả năng điều chỉnh và sưởi ấm'
    },
    {
      icon: '📱',
      title: 'Đặt vé dễ dàng',
      description: 'Đặt vé online nhanh chóng và thuận tiện'
    }
  ];

  return (
    <section className="bg-card md:py-20 md:mt-10 sm:py-16 sm:mt-10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-4 sm:px-4">
        <h2 className="text-center mb-12 bg-gradient-to-br from-gray-800 to-green-600 bg-clip-text text-transparent text-4xl font-bold md:text-3xl sm:text-2xl sm:mb-8">
          Tại sao chọn HotCinemas?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="transition-all duration-300 rounded-2xl overflow-hidden h-full hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-8 flex flex-col items-center text-center md:p-6 sm:p-5"
            >
              <div className="text-5xl mb-4 block animate-[iconFloat_3s_ease-in-out_infinite] drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] md:text-4xl sm:text-4xl">
                {feature.icon}
              </div>
              <h4 className="text-foreground mb-4 text-xl font-semibold">
                {feature.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed text-sm m-0">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 