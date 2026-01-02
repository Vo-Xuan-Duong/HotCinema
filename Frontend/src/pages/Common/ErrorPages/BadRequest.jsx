import React from 'react';

const BadRequest = () => (
  <div className="min-h-screen w-screen flex flex-col items-center justify-center text-center bg-whitebg-gray-900 py-10 px-4">
    <div className="mb-6 animate-bounce">
      <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="100" fill="#e3f2fd"/>
        <rect x="70" y="90" width="60" height="30" rx="10" fill="#fff"/>
        <rect x="90" y="110" width="20" height="10" rx="3" fill="#2196f3"/>
        <rect x="80" y="70" width="40" height="10" rx="5" fill="#2196f3"/>
      </svg>
    </div>
    <h1 className="text-7xl font-black text-blue-600text-blue-400 my-2 tracking-wider animate-pulse">400</h1>
    <p className="text-xl text-gray-700text-gray-300 mb-8 leading-relaxed">Yêu cầu không hợp lệ.<br/>Vui lòng kiểm tra lại thông tin gửi lên.</p>
    <a className="inline-block px-9 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold no-underline shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-xl" href="/">Quay về trang chủ</a>
  </div>
);

export default BadRequest; 