import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Metric } from '@/components/ui/metric';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge-count';
import { Tabs } from '@/components/ui/tabs';
import {
  Trophy,
  Flame,
  Clock,
  Calendar,
  Star,
  Eye,
  Heart,
  MessageCircle,
  Ticket,
  Award,
  Users,
  TrendingUp,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedContent = ({ movies = [] }) => {
  const [activeTab, setActiveTab] = useState('trending');

  // Mock data for featured content
  const trendingMovies = movies.slice(0, 5).map((movie, index) => ({
    ...movie,
    rank: index + 1,
    views: Math.floor(Math.random() * 1000000) + 100000,
    likes: Math.floor(Math.random() * 50000) + 5000,
    comments: Math.floor(Math.random() * 1000) + 100,
    trendingScore: Math.floor(Math.random() * 100) + 70
  }));

  const upcomingMovies = movies.slice(5, 10).map((movie, index) => ({
    ...movie,
    releaseDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
    preorders: Math.floor(Math.random() * 10000) + 1000,
    anticipation: Math.floor(Math.random() * 100) + 60
  }));

  const topRatedMovies = movies.slice(10, 15).map((movie, index) => ({
    ...movie,
    rank: index + 1,
    criticsScore: Math.floor(Math.random() * 30) + 70,
    audienceScore: Math.floor(Math.random() * 30) + 70,
    reviews: Math.floor(Math.random() * 500) + 50
  }));

  const newsData = [
    {
      id: 1,
      title: "Premiere sáº¯p tá»›i: Blockbuster mÃ¹a hÃ¨ 2024",
      content: "Nhá»¯ng bá»™ phim Ä‘Æ°á»£c mong chá» nháº¥t sáº½ ra máº¯t trong thÃ¡ng tá»›i...",
      time: "2 giá» trÆ°á»›c",
      category: "Tin tá»©c",
      views: 15420
    },
    {
      id: 2,
      title: "CÃ´ng nghá»‡ chiáº¿u phim má»›i táº¡i HotCinemas",
      content: "Tráº£i nghiá»‡m Ã¢m thanh Dolby Atmos vÃ  hÃ¬nh áº£nh 4K HDR...",
      time: "5 giá» trÆ°á»›c",
      category: "CÃ´ng nghá»‡",
      views: 8750
    },
    {
      id: 3,
      title: "Æ¯u Ä‘Ã£i Ä‘áº·c biá»‡t cuá»‘i tuáº§n",
      content: "Giáº£m giÃ¡ 30% cho táº¥t cáº£ suáº¥t chiáº¿u tá»« thá»© 6 Ä‘áº¿n chá»§ nháº­t...",
      time: "1 ngÃ y trÆ°á»›c",
      category: "Khuyáº¿n mÃ£i",
      views: 23100
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeUntilRelease = (date) => {
    const now = new Date();
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} ngÃ y`;
  };

  return (
    <section className="py-8 bg-white">
      <div className="max-w-[1200px] mx-auto px-8 md:px-6 sm:px-4">
        {/* Section Header */}
        <div className="mb-12 text-center flex items-center justify-center gap-4">
          <Avatar className="h-12 w-12 bg-[#ff6b35] flex items-center justify-center">
            <Trophy className="h-6 w-6 text-white" />
          </Avatar>
          <div>
            <h2 className="text-gray-800 m-0 font-bold text-2xl">
              Ná»™i dung ná»•i báº­t
            </h2>
            <p className="text-gray-600 text-base block mt-2">
              KhÃ¡m phÃ¡ nhá»¯ng Ä‘iá»u thÃº vá»‹ nháº¥t trong tháº¿ giá»›i Ä‘iá»‡n áº£nh
            </p>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="mb-8 bg-gray-50 rounded-xl p-1.5 flex gap-2">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-6 py-3 rounded-[10px] transition-all duration-300 text-[15px] font-semibold ${activeTab === 'trending'
                  ? 'text-white bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
                  : 'text-gray-600 hover:text-[#ff6b35] hover:bg-white hover:shadow-[0_2px_8px_rgba(255,107,53,0.15)] hover:-translate-y-0.5'
                }`}
            >
              <Flame className="h-4 w-4" />
              <span>Äang hot</span>
            </button>
            <button
              onClick={() => setActiveTab('toprated')}
              className={`flex items-center gap-2 px-6 py-3 rounded-[10px] transition-all duration-300 text-[15px] font-semibold ${activeTab === 'toprated'
                  ? 'text-white bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
                  : 'text-gray-600 hover:text-[#ff6b35] hover:bg-white hover:shadow-[0_2px_8px_rgba(255,107,53,0.15)] hover:-translate-y-0.5'
                }`}
            >
              <Star className="h-4 w-4" />
              <span>ÄÃ¡nh giÃ¡ cao</span>
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-6 py-3 rounded-[10px] transition-all duration-300 text-[15px] font-semibold ${activeTab === 'news'
                  ? 'text-white bg-gradient-to-br from-[#ff6b35] to-[#ff8c5a] shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
                  : 'text-gray-600 hover:text-[#ff6b35] hover:bg-white hover:shadow-[0_2px_8px_rgba(255,107,53,0.15)] hover:-translate-y-0.5'
                }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Tin tá»©c</span>
            </button>
          </div>

          {activeTab === 'trending' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Trending List */}
              <div className="lg:col-span-7">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="border-b border-gray-200 px-5 py-4 mb-0">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-gray-800 text-base font-semibold">Top phim trending</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col gap-3.5">
                      {trendingMovies.map((movie, index) => (
                        <div key={movie.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg transition-all duration-300 cursor-pointer hover:border-[#ff6b35] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(229,9,20,0.15)] hover:bg-gray-50">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary to-[#b20710] rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(229,9,20,0.3)]">
                            <span className="text-white text-sm font-semibold">
                              #{movie.rank}
                            </span>
                          </div>

                          <Avatar className="h-16 w-16 border-2 border-gray-200 flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h5 className="text-gray-800 m-0 mb-1 text-sm font-medium">
                              {movie.title}
                            </h5>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span className="text-gray-500 text-xs">
                                  {formatNumber(movie.views)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5" />
                                <span className="text-gray-500 text-xs">
                                  {formatNumber(movie.likes)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span className="text-gray-500 text-xs">
                                  {formatNumber(movie.comments)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0 relative w-[50px] h-[50px]">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="25"
                                cy="25"
                                r="20"
                                stroke="#e5e7eb"
                                strokeWidth="4"
                                fill="none"
                              />
                              <circle
                                cx="25"
                                cy="25"
                                r="20"
                                stroke="url(#gradient)"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - movie.trendingScore / 100)}`}
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#ff6b35" />
                                  <stop offset="100%" stopColor="#e55a28" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold">{movie.trendingScore}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <Metric
                    label="LÆ°á»£t xem hÃ´m nay"
                    value={2847521}
                    precision={0}
                    valueCss={{ color: '#ff6b35' }}
                    leading={<Eye className="h-4 w-4" />}
                    suffix="views"
                  />
                </Card>
                <Card className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <Metric
                    label="Phim má»›i tuáº§n nÃ y"
                    value={12}
                    valueCss={{ color: '#4285f4' }}
                    leading={<Flame className="h-4 w-4" />}
                    suffix="phim"
                  />
                </Card>
                <Card className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <Metric
                    label="ÄÃ¡nh giÃ¡ trung bÃ¬nh"
                    value={8.7}
                    precision={1}
                    valueCss={{ color: '#34d399' }}
                    leading={<Star className="h-4 w-4" />}
                    suffix="/ 10"
                  />
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'toprated' && (
            <div className="space-y-6">

              {topRatedMovies.map((movie, index) => (
                <Card key={movie.id} className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#b20710] rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(229,9,20,0.3)]">
                        <span className="text-white text-sm font-semibold">
                          #{movie.rank}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <Avatar className="h-20 w-20 border-2 border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                      </Avatar>
                    </div>

                    <div className="col-span-6">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-gray-800 m-0 text-base font-medium">
                          {movie.title}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {movie.genre} â€¢ {movie.releaseDate || '2024'}
                        </p>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />
                            <span className="text-sm">Critics: {movie.criticsScore}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-sm">Audience: {movie.audienceScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3 flex flex-col items-end gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-[#ff6b35]">
                          {((movie.criticsScore + movie.audienceScore) / 20).toFixed(1)}
                        </span>
                        <span className="text-gray-500">/10</span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {movie.reviews} Ä‘Ã¡nh giÃ¡
                      </p>
                      <Button size="sm">
                        Xem chi tiáº¿t
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">

                <div className="space-y-6">
                  {newsData.map((news, index) => (
                    <div key={news.id} className="relative pl-8 border-l-2 border-[#ff6b35]">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#ff6b35] rounded-full border-2 border-white" />
                      <Card className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="mb-3 flex items-center gap-3">
                          <Badge className="bg-[#ff6b35] text-white px-2 py-0.5 rounded text-xs">
                            {news.category}
                          </Badge>
                          <span className="text-gray-500 text-sm">{news.time}</span>
                        </div>
                        <h4 className="text-gray-800 m-0 mb-2 text-lg font-semibold">
                          {news.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {news.content}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="text-gray-500 text-sm">
                              {formatNumber(news.views)} lÆ°á»£t xem
                            </span>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary hover:text-[#ff6b35]"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            Äá»c thÃªm
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="border-b border-gray-200 px-5 py-4 mb-0">
                    <h3 className="text-gray-800 text-base font-semibold m-0">Tin ná»•i báº­t</h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    {newsData.slice(0, 3).map((news, index) => (
                      <div key={news.id} className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                        <h6 className="text-gray-800 text-sm font-semibold block mb-1">
                          {news.title}
                        </h6>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">
                            {news.time}
                          </span>
                          <span className="text-gray-500 text-xs">
                            â€¢ {formatNumber(news.views)} views
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </section>
  );
};

export default FeaturedContent;
