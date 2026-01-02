import React from 'react';

const InternalError = () => (
  <div className="min-h-screen w-screen flex flex-col items-center justify-center text-center bg-whitebg-gray-900 py-10 px-4">
    <div className="mb-6 animate-bounce">
      <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#ffe0e0"/>
        <ellipse cx="100" cy="120" rx="50" ry="20" fill="#fff"/>
        <rect x="80" y="60" width="40" height="40" rx="10" fill="#ff5252"/>
        <rect x="95" y="75" width="10" height="20" rx="3" fill="#fff"/>
      </svg>
    </div>
    <h1 className="text-7xl font-black text-red-600text-red-400 my-2 tracking-wider animate-pulse">500</h1>
    <p className="text-xl text-gray-700text-gray-300 mb-8 leading-relaxed">Có lỗi xảy ra trên máy chủ.<br/>Vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
    <a className="inline-block px-9 py-3 bg-red-600 text-white rounded-full text-lg font-semibold no-underline shadow-lg shadow-red-500/30 transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-xl" href="/">Quay về trang chủ</a>
  </div>
);

export default InternalError; 