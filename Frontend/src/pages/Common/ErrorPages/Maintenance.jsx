import React from 'react';

const Maintenance = () => (
  <div className="min-h-screen w-screen flex flex-col items-center justify-center text-center bg-whitebg-gray-900 py-10 px-4">
    <div className="mb-6 animate-bounce">
      <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#fff9c4"/>
        <rect x="70" y="110" width="60" height="20" rx="8" fill="#fffde7"/>
        <rect x="90" y="80" width="20" height="40" rx="6" fill="#fbc02d"/>
        <rect x="80" y="70" width="40" height="10" rx="5" fill="#fbc02d"/>
      </svg>
    </div>
    <h1 className="text-7xl font-black text-yellow-600text-yellow-400 my-2 tracking-wider animate-pulse">Bảo trì</h1>
    <p className="text-xl text-gray-700text-gray-300 mb-8 leading-relaxed">Hệ thống đang được bảo trì.<br/>Vui lòng quay lại sau ít phút nữa.</p>
    <a className="inline-block px-9 py-3 bg-yellow-600 text-white rounded-full text-lg font-semibold no-underline shadow-lg shadow-yellow-500/30 transition-all duration-200 hover:bg-yellow-700 hover:-translate-y-0.5 hover:shadow-xl" href="/">Quay về trang chủ</a>
  </div>
);

export default Maintenance; 