import React from 'react';

const Forbidden = () => (
  <div className="min-h-screen w-screen flex flex-col items-center justify-center text-center bg-whitebg-gray-900 py-10 px-4">
    <div className="mb-6 animate-bounce">
      <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#ffe0b2"/>
        <rect x="60" y="80" width="80" height="40" rx="12" fill="#fff3e0" stroke="#ff9800" strokeWidth="4"/>
        <rect x="90" y="100" width="20" height="20" rx="5" fill="#ff9800"/>
        <rect x="80" y="70" width="40" height="10" rx="5" fill="#ff9800"/>
      </svg>
    </div>
    <h1 className="text-7xl font-black text-orange-600text-orange-400 my-2 tracking-wider animate-pulse">403</h1>
    <p className="text-xl text-gray-700text-gray-300 mb-8 leading-relaxed">Bạn không có quyền truy cập trang này.<br/>Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.</p>
    <a className="inline-block px-9 py-3 bg-orange-600 text-white rounded-full text-lg font-semibold no-underline shadow-lg shadow-orange-500/30 transition-all duration-200 hover:bg-orange-700 hover:-translate-y-0.5 hover:shadow-xl" href="/">Quay về trang chủ</a>
  </div>
);

export default Forbidden; 