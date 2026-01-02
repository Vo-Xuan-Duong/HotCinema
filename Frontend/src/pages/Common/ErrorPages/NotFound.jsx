import React from 'react';

const NotFound = () => (
  <div className="min-h-screen w-screen flex flex-col items-center justify-center text-center bg-whitebg-gray-900 py-10 px-4">
    <div className="mb-6 animate-bounce">
      <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#F8D7DA"/>
        <ellipse cx="70" cy="90" rx="15" ry="20" fill="#fff"/>
        <ellipse cx="130" cy="90" rx="15" ry="20" fill="#fff"/>
        <circle cx="70" cy="95" r="5" fill="#222"/>
        <circle cx="130" cy="95" r="5" fill="#222"/>
        <ellipse cx="100" cy="140" rx="35" ry="15" fill="#fff"/>
        <path d="M80 140 Q100 160 120 140" stroke="#222" strokeWidth="3" fill="none"/>
      </svg>
    </div>
    <h1 className="text-7xl font-black text-red-600text-red-400 my-2 tracking-wider animate-pulse">404</h1>
    <p className="text-xl text-gray-700text-gray-300 mb-8 leading-relaxed">Không tìm thấy trang bạn yêu cầu.<br/>Có lẽ bạn đã lạc vào vũ trụ song song?</p>
    <a className="inline-block px-9 py-3 bg-red-600 text-white rounded-full text-lg font-semibold no-underline shadow-lg shadow-red-500/30 transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-xl" href="/">Quay về trang chủ</a>
  </div>
);

export default NotFound; 