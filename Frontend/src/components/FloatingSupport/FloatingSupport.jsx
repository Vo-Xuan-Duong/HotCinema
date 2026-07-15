import React, { useState, useEffect } from 'react';
import { Headphones, MessageCircle, Phone } from 'lucide-react';
import ChatModal from '@/components/ChatModal/ChatModal';

const FloatingSupport = () => {
    const [chatModalOpen, setChatModalOpen] = useState(false);

    useEffect(() => {
        console.log('FloatingSupport mounted');
        return () => console.log('FloatingSupport unmounted');
    }, []);

    return (
        <>
            {/* Custom Floating Support Buttons */}
            <div className="fixed right-6 bottom-6 z-[2147483647] flex flex-row items-center gap-3 pointer-events-auto visible opacity-100 group">
                <div className="flex flex-row gap-3 opacity-0 translate-x-5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative text-white text-base shadow-[0_4px_16px_rgba(0,0,0,0.15)] pointer-events-auto bg-gradient-to-br from-green-500 to-green-700 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_8px_24px_rgba(82,196,26,0.4)]"
                        onClick={() => window.open('tel:19006420')}
                    >
                        <Phone className="h-5 w-5" />
                        <span className="absolute right-full top-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded-md text-xs whitespace-nowrap mr-3 opacity-0 pointer-events-none transition-opacity duration-300 hover:opacity-100 after:content-[''] after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-l-black/80">
                            Hotline: 1900-6420
                        </span>
                    </div>
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative text-white text-base shadow-[0_4px_16px_rgba(0,0,0,0.15)] pointer-events-auto bg-gradient-to-br from-purple-600 to-purple-800 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_8px_24px_rgba(114,46,209,0.4)]"
                        onClick={() => setChatModalOpen(true)}
                    >
                        <MessageCircle className="h-5 w-5" />
                        <span className="absolute right-full top-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded-md text-xs whitespace-nowrap mr-3 opacity-0 pointer-events-none transition-opacity duration-300 hover:opacity-100 after:content-[''] after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-l-black/80">
                            Chat trực tuyến
                        </span>
                    </div>
                </div>
                <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center cursor-pointer text-white text-xl shadow-[0_6px_20px_rgba(24,144,255,0.4)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative pointer-events-auto animate-[pulseGlow_2s_ease-in-out_infinite] hover:from-blue-400 hover:to-blue-600 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_10px_30px_rgba(24,144,255,0.6)] hover:animate-none">
                    <Headphones className="h-6 w-6" />
                    <span className="absolute right-full top-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded-md text-xs whitespace-nowrap mr-3 opacity-0 pointer-events-none transition-opacity duration-300 hover:opacity-100 after:content-[''] after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[5px] after:border-transparent after:border-l-black/80">
                        Hỗ trợ khách hàng
                    </span>
                </div>
            </div>

            {/* Chat Modal */}
            {chatModalOpen && (
                <ChatModal open={chatModalOpen} onClose={() => setChatModalOpen(false)} />
            )}
        </>
    );
};

export default FloatingSupport;
