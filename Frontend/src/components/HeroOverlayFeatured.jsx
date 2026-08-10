import { CalendarDays, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const featuredMovies = [
  {
    title: 'Ma Không Đầu',
    date: '17.10.2025',
    genre: 'Kinh Dị, Hài, Giật gân',
    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    description: 'Một câu chuyện rùng rợn về một hồn ma không đầu ám ảnh một ngôi làng cổ kính...',
  },
  {
    title: 'Doraemon: Nobita và Vùng Đất Mới',
    date: '25.10.2025',
    genre: 'Hoạt hình, Phiêu lưu',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    description: 'Nobita cùng bạn bè khám phá vùng đất mới đầy bí ẩn và thử thách.',
  },
  {
    title: 'Dune: Part Two',
    date: '01.11.2025',
    genre: 'Khoa học viễn tưởng, Hành động',
    poster: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
    description: 'Cuộc chiến giành quyền lực trên hành tinh cát tiếp tục với những pha hành động mãn nhãn.',
  },
];

const HeroOverlayFeatured = () => (
  <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center bg-black/75 px-4 py-10 text-white backdrop-blur-sm sm:px-6">
    <div className="mb-8 max-w-2xl text-center">
      <p className="text-sm font-medium text-primary-foreground/75">HotCinema tuyển chọn</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Phim sắp ra mắt đặc sắc</h2>
    </div>

    <div className="grid w-full max-w-5xl gap-4 md:grid-cols-3">
      {featuredMovies.map((movie) => (
        <Card key={movie.title} className="border-white/10 bg-background/90 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-background">
          <CardContent className="p-4 sm:p-5">
            <div className="flex gap-4 md:flex-col">
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-36 w-24 shrink-0 rounded-md object-cover md:h-56 md:w-full"
                loading="lazy"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="line-clamp-2 text-lg font-semibold tracking-tight">{movie.title}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  <span>Khởi chiếu {movie.date}</span>
                </div>
                <p className="mt-2 line-clamp-1 text-xs font-medium text-primary">{movie.genre}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-5 text-muted-foreground">{movie.description}</p>

                <Button type="button" size="sm" className="mt-4 w-full md:mt-5">
                  <Ticket className="mr-2 h-4 w-4" />
                  Đặt vé ngay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default HeroOverlayFeatured;
