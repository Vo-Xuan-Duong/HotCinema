import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge-count';
import { Star, Play, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';

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
        content: 'Đó giờ ít không đánh giá cao phim Việt vì bao lần thất vọng rồi nhưng thấy trang Chê phim 1.3 khen lắm nên cũng tò mò đi xem...'
      },
      {
        user: 'Bùi Phạm Đăng Thư',
        time: '29/04/2025',
        bought: true,
        content: 'Huhu phim siêu hay luôn á mn :)) Mê Công Sai Quan Án cựa tui quãaa. Đẹp trai diễn tinh thông mình. Bag Hai Mẫn siu đẹp và ...'
      }
    ]
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
        content: 'fhgxiiyfhct7hiccuviyvuvyuvyuvyugiyctuxytxcyxtuxbtyxr6xy'
      },
      {
        user: 'Đào Thảo Vy',
        time: 'hôm qua',
        bought: true,
        content: 'Phim hay nhm lồng tiếng quốc vương và vk ko đc hay cho lắm nhưng phim hay lắm nha đáng để đi xem kịch bản vui nhộn hài hước...'
      }
    ]
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
        content: 'Cảm ơn vì đã đến. Một mùa hè rực rỡ 2024. Chắc chắn em sẽ nhớ mãi 🔥'
      },
      {
        user: 'Hà Thị Vân Anh',
        time: 'hôm qua',
        bought: false,
        content: 'Lần xem này mình khóc từ đầu đến cuối, vì mình biết lần này mình phải nói lời tạm biệt thật rồi. "Mưa Lửa" và ATVNCG sẽ mãi luôn...'
      }
    ]
  }
];

const FeaturedComments = () => {
  return (
    <section className="py-16 pb-10 bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(229,9,20,0.03)] to-[rgba(229,9,20,0.08)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.05),transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#e50914] via-[#ff6b35] to-[#e50914] bg-clip-text text-transparent animate-gradient">
            Bình luận nổi bật
          </h2>
          <p className="text-gray-400 text-lg">Những đánh giá được yêu thích nhất từ cộng đồng</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {commentsData.map((item, idx) => (
            <Card 
              key={idx}
              className="bg-card/5 backdrop-blur-xl border-white/10 overflow-hidden group hover:bg-card/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20"
            >
              {/* Movie Image Header */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.movieImg} 
                  alt={item.movieTitle} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-card/95 hover:bg-[#e50914] text-[#e50914] hover:text-white shadow-xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-110"
                  >
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
                
                {/* Movie Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.movieTitle}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-yellow-300">{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/80">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{item.views}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="p-5 space-y-4">
                {item.comments.map((cmt, cidx) => (
                  <div 
                    key={cidx} 
                    className={`pb-4 ${cidx !== item.comments.length - 1 ? 'border-b border-white/10' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-white ${cmt.bought ? 'text-[#e50914]' : ''}`}>
                          {cmt.user}
                        </span>
                        {cmt.bought && (
                          <Badge variant="outline" className="bg-[#e50914]/20 border-[#e50914]/50 text-[#e50914] text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Đã mua
                          </Badge>
                        )}
                      </div>
                      <span className="text-white/50 text-xs">{cmt.time}</span>
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed line-clamp-3">
                      {cmt.content}
                    </p>
                    {cidx === item.comments.length - 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-[#e50914] hover:text-[#ff6b35] hover:bg-[#e50914]/10 p-0 h-auto"
                      >
                        Xem thêm
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Button
            variant="outline"
            size="lg"
            className="bg-card/5 backdrop-blur-xl border-2 border-[#e50914]/50 text-[#e50914] hover:bg-gradient-to-r hover:from-[#e50914] hover:to-[#ff6b35] hover:text-white hover:border-transparent shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 px-8 py-6 text-lg font-bold"
          >
            Xem tiếp nhé !
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedComments; 