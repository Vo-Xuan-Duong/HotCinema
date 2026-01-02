import React from 'react';

const featuredMovies = [
  {
    title: 'Ma Không Đầu',
    date: '17.10.2025',
    genre: 'Kinh Dị, Hài, Giật gân',
    poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    description: 'Một câu chuyện rùng rợn về một hồn ma không đầu ám ảnh một ngôi làng cổ kính...'
  },
  {
    title: 'Doraemon: Nobita và Vùng Đất Mới',
    date: '25.10.2025',
    genre: 'Hoạt hình, Phiêu lưu',
    poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    description: 'Nobita cùng bạn bè khám phá vùng đất mới đầy bí ẩn và thử thách.'
  },
  {
    title: 'Dune: Part Two',
    date: '01.11.2025',
    genre: 'Khoa học viễn tưởng, Hành động',
    poster: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
    description: 'Cuộc chiến giành quyền lực trên hành tinh cát tiếp tục với những pha hành động mãn nhãn.'
  }
];

const HeroOverlayFeatured = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/75 to-black/[0.98] backdrop-blur-sm backdrop-brightness-95 z-[1] flex flex-col justify-center items-center px-6 py-12 animate-[fadeInOverlay_0.7s_cubic-bezier(0.4,0,0.2,1)]">
    <h2 className="text-4xl font-bold text-white mb-9 tracking-wide animate-[fadeInTitle_0.8s_cubic-bezier(0.4,0,0.2,1)]"
      style={{ textShadow: '0 4px 24px rgba(0, 0, 0, 0.7)' }}>
      Phim sắp ra mắt đặc sắc
    </h2>
    <div className="flex gap-10 flex-wrap justify-center">
      {featuredMovies.map((movie, idx) => (
        <div
          className="bg-[rgba(30,30,30,0.92)] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] p-7 px-5 max-w-[340px] min-w-[240px] text-white flex flex-col items-center transition-all duration-250 hover:shadow-[0_24px_64px_rgba(0,0,0,0.55)] hover:scale-105 animate-[fadeInCard_0.9s_cubic-bezier(0.4,0,0.2,1)]"
          key={idx}
        >
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-[130px] h-[190px] min-w-[180px] object-cover rounded-xl mb-[18px] border-2 border-white/10 transition-shadow duration-200 hover:shadow-[0_12px_32px_rgba(229,9,20,0.18)]"
          />
          <div className="text-center min-w-[140px]">
            <h3 className="text-xl font-bold mb-2.5 tracking-wide">{movie.title}</h3>
            <p className="text-[1.05rem] text-yellow-400 mb-1.5 font-medium">Khởi chiếu: {movie.date}</p>
            <p className="text-base text-gray-400 mb-2.5">{movie.genre}</p>
            <p className="text-base mb-4 text-gray-100 min-h-[44px]">{movie.description}</p>
            <button className="bg-gradient-to-r from-primary to-red-500 text-white border-none rounded-[10px] py-3 px-8 text-[1.08rem] font-bold cursor-pointer shadow-[0_2px_12px_rgba(229,9,20,0.18)] transition-all duration-200 tracking-wide hover:shadow-[0_4px_16px_rgba(229,9,20,0.3)] hover:scale-105 active:scale-100">
              Đặt vé ngay
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HeroOverlayFeatured;
