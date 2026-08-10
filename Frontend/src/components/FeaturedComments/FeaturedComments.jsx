import { ArrowRight, CheckCircle2, Eye, Play, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const commentsData = [
  {
    movieImg: 'https://cdn.momocdn.net/img/1234.jpg',
    movieTitle: 'Thám Tử Kiên: Kỳ Án Không Đầu',
    rating: 9.5,
    views: '25.4K',
    comments: [
      {
        user: 'Hồ Gia Vi',
        time: '02/05/2025',
        bought: true,
        content: 'Đó giờ ít không đánh giá cao phim Việt vì bao lần thất vọng rồi nhưng thấy trang Chê phim 1.3 khen lắm nên cũng tò mò đi xem...',
      },
      {
        user: 'Bùi Phạm Đăng Thư',
        time: '29/04/2025',
        bought: true,
        content: 'Phim rất cuốn, diễn xuất tốt và phần hình ảnh đáng để trải nghiệm ngoài rạp.',
      },
    ],
  },
  {
    movieImg: 'https://cdn.momocdn.net/img/5678.jpg',
    movieTitle: 'Doraemon Movie 44: Nobita và Cuộc Phiêu Lưu',
    rating: 9.3,
    views: '7.2K',
    comments: [
      {
        user: 'Mạng Đức Tân',
        time: '22 giờ trước',
        bought: false,
        content: 'Một phần phim nhẹ nhàng, vui nhộn và phù hợp để xem cùng gia đình.',
      },
      {
        user: 'Đào Thảo Vy',
        time: 'hôm qua',
        bought: true,
        content: 'Phim hay, kịch bản vui nhộn và có nhiều khoảnh khắc dễ thương.',
      },
    ],
  },
  {
    movieImg: 'https://cdn.momocdn.net/img/9101.jpg',
    movieTitle: 'Mưa Lửa - Anh Trai Vượt Ngàn Chông Gai Movie',
    rating: 9.8,
    views: '4.3K',
    comments: [
      {
        user: 'Vương Ngọc Khánh Quỳnh',
        time: '6 giờ trước',
        bought: true,
        content: 'Cảm ơn vì đã đến. Một mùa hè rực rỡ và rất nhiều cảm xúc đáng nhớ.',
      },
      {
        user: 'Hà Thị Vân Anh',
        time: 'hôm qua',
        bought: false,
        content: 'Một trải nghiệm nhiều cảm xúc, đặc biệt phù hợp với những người đã theo dõi hành trình trước đó.',
      },
    ],
  },
];

const FeaturedComments = () => (
  <section className="border-y bg-muted/30 py-12 sm:py-16">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-2xl sm:mb-10">
        <p className="text-sm font-medium text-primary">Cộng đồng HotCinema</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Bình luận nổi bật</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Những đánh giá được quan tâm từ người xem phim tại HotCinema.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {commentsData.map((item) => (
          <Card key={item.movieTitle} className="overflow-hidden shadow-sm">
            <div className="group relative h-48 overflow-hidden bg-muted">
              <img
                src={item.movieImg}
                alt={item.movieTitle}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/90 text-primary shadow-md hover:bg-primary hover:text-primary-foreground"
                aria-label={`Xem ${item.movieTitle}`}
              >
                <Play className="h-4 w-4 fill-current" />
              </Button>

              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="line-clamp-1 text-base font-semibold">{item.movieTitle}</h3>
                <div className="mt-2 flex items-center gap-4 text-xs text-white/80">
                  <span className="flex items-center gap-1.5 font-medium text-white">
                    <Star className="h-4 w-4 fill-current" style={{ color: 'hsl(var(--warning))' }} />
                    {item.rating}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {item.views}
                  </span>
                </div>
              </div>
            </div>

            <CardContent className="divide-y p-0">
              {item.comments.map((comment) => (
                <article key={`${item.movieTitle}-${comment.user}-${comment.time}`} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{comment.user}</span>
                        {comment.bought && (
                          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Đã mua
                          </Badge>
                        )}
                      </div>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">{comment.time}</time>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{comment.content}</p>
                </article>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button type="button" variant="outline">
          Xem thêm bình luận
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  </section>
);

export default FeaturedComments;
