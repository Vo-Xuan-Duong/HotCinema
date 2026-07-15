import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Send, Bot, User, X } from 'lucide-react';
import useNotification from '@/hooks/useNotification';

const ChatModal = ({ open, onClose }) => {
    const notification = useNotification();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Xin chào! Tôi là trợ lý AI của HotCinemas. Tôi có thể giúp gì cho bạn?',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Simulate AI response
    const generateAIResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();

        // Các câu trả lời mẫu
        if (lowerMessage.includes('giá vé') || lowerMessage.includes('giá')) {
            return 'Giá vé phim dao động từ 45.000đ - 150.000đ tùy theo suất chiếu và loại phòng. Bạn có thể xem chi tiết giá vé khi chọn suất chiếu nhé!';
        } else if (lowerMessage.includes('đặt vé') || lowerMessage.includes('mua vé')) {
            return 'Để đặt vé, bạn có thể: \n1. Chọn phim muốn xem\n2. Chọn rạp và suất chiếu\n3. Chọn ghế ngồi\n4. Thanh toán online\nRất đơn giản và nhanh chóng!';
        } else if (lowerMessage.includes('phim') && (lowerMessage.includes('hay') || lowerMessage.includes('hot'))) {
            return 'Hiện tại chúng tôi có nhiều phim hot đang chiếu như phim hành động, tâm lý, kinh dị... Bạn có thể xem danh sách phim ở trang chủ hoặc trang Phim để biết thêm chi tiết!';
        } else if (lowerMessage.includes('rạp') || lowerMessage.includes('cinema')) {
            return 'Chúng tôi có hệ thống rạp trên toàn quốc. Bạn có thể xem danh sách rạp và địa chỉ chi tiết tại trang Rạp Chiếu Phim nhé!';
        } else if (lowerMessage.includes('thanh toán') || lowerMessage.includes('payment')) {
            return 'Chúng tôi hỗ trợ nhiều hình thức thanh toán: Thẻ ATM, Visa/MasterCard, Ví điện tử (Momo, ZaloPay, VNPay). An toàn và bảo mật 100%!';
        } else if (lowerMessage.includes('khuyến mãi') || lowerMessage.includes('giảm giá')) {
            return 'Chúng tôi thường xuyên có các chương trình khuyến mãi hấp dẫn! Bạn hãy theo dõi trang Khuyến Mãi hoặc đăng ký nhận thông báo để không bỏ lỡ nhé!';
        } else if (lowerMessage.includes('giờ chiếu') || lowerMessage.includes('lịch chiếu')) {
            return 'Bạn có thể xem lịch chiếu đầy đủ tại trang Lịch Chiếu. Lịch chiếu được cập nhật liên tục và bạn có thể lọc theo ngày, rạp để dễ dàng tìm kiếm!';
        } else if (lowerMessage.includes('hủy vé') || lowerMessage.includes('hoàn tiền')) {
            return 'Bạn có thể hủy vé trước giờ chiếu 24h để được hoàn tiền. Vui lòng vào phần Lịch sử đặt vé để thực hiện hoặc liên hệ hotline 1900-6420 để được hỗ trợ!';
        } else if (lowerMessage.includes('tài khoản') || lowerMessage.includes('đăng ký') || lowerMessage.includes('đăng nhập')) {
            return 'Bạn có thể đăng ký tài khoản miễn phí để tích điểm và nhận nhiều ưu đãi hấp dẫn! Việc đăng nhập cũng giúp bạn quản lý vé và lịch sử đặt vé dễ dàng hơn.';
        } else if (lowerMessage.includes('hotline') || lowerMessage.includes('liên hệ') || lowerMessage.includes('gọi')) {
            return 'Bạn có thể liên hệ hotline 1900-6420 (8h-22h hàng ngày) hoặc chat với chúng tôi tại đây. Chúng tôi luôn sẵn sàng hỗ trợ bạn!';
        } else if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thank')) {
            return 'Rất vui được hỗ trợ bạn! Chúc bạn có trải nghiệm xem phim tuyệt vời tại HotCinemas! 🎬🍿';
        } else if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'Xin chào! Rất vui được hỗ trợ bạn. Bạn cần tôi giúp gì về dịch vụ đặt vé xem phim?';
        } else {
            return 'Tôi hiểu câu hỏi của bạn. Bạn có thể hỏi tôi về:\n- Giá vé và cách đặt vé\n- Phim đang chiếu\n- Lịch chiếu và rạp\n- Thanh toán và khuyến mãi\n- Hoặc liên hệ hotline: 1900-6420';
        }
    };

    const handleSend = () => {
        if (!inputValue.trim()) {
            notification.warning('Vui lòng nhập tin nhắn!');
            return;
        }

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: inputValue,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI typing and response
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: generateAIResponse(inputValue),
                time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1500 + Math.random() * 1000); // Random delay 1.5-2.5s
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickQuestions = [
        'Giá vé bao nhiêu?',
        'Cách đặt vé?',
        'Phim hot đang chiếu',
        'Lịch chiếu hôm nay'
    ];

    const handleQuickQuestion = (question) => {
        setInputValue(question);
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={380}
            className="chat-modal"
            title={
                <div className="text-white flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                    </Avatar>
                    <div>
                        <div className="text-[13px] font-semibold text-white mb-0.5">Trợ lý AI HotCinemas</div>
                        <div className="text-[11px] text-white/90 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-[pulseDot_2s_ease-in-out_infinite]"></span>
                            Đang hoạt động
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-[380px] md:h-[350px]">
                {/* Quick Questions */}
                {messages.length <= 1 && (
                    <div className="p-3 bg-gray-50 rounded-xl mb-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-2 font-medium">Câu hỏi thường gặp:</div>
                        <div className="flex flex-wrap gap-1.5">
                            {quickQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleQuickQuestion(question)}
                                    className="rounded-[20px] border border-gray-200 bg-white text-gray-800 text-xs transition-all duration-300 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(24,144,255,0.2)] md:text-[11px] md:px-2.5 md:py-1"
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-gradient-to-br [&::-webkit-scrollbar-thumb]:from-blue-500 [&::-webkit-scrollbar-thumb]:to-purple-600 [&::-webkit-scrollbar-thumb]:rounded-sm">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 animate-[fadeInUp_0.3s_ease] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className="flex-shrink-0">
                                <Avatar className={`h-8 w-8 flex items-center justify-center ${msg.type === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                                    {msg.type === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                                </Avatar>
                            </div>
                            <div className={`flex-1 flex flex-col gap-1 ${msg.type === 'user' ? 'items-end' : ''}`}>
                                <div className={`max-w-[80%] md:max-w-[90%] px-3 py-2 rounded-2xl relative ${msg.type === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm shadow-[0_2px_8px_rgba(102,126,234,0.3)]' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200 rounded-bl-sm shadow-[0_2px_8px_rgba(24,144,255,0.1)]'}`}>
                                    <div className={`text-[13px] leading-relaxed break-words whitespace-pre-wrap ${msg.type === 'user' ? 'text-white' : 'text-gray-800'}`}>{msg.text}</div>
                                </div>
                                <div className="text-[11px] text-gray-400 px-1">{msg.time}</div>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <Avatar className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </Avatar>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="max-w-[80%] px-5 py-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200 rounded-2xl rounded-bl-sm shadow-[0_2px_8px_rgba(24,144,255,0.1)] flex gap-1.5 items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-[typing_1.4s_ease-in-out_infinite]"></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-[typing_1.4s_ease-in-out_infinite] [animation-delay:0.2s]"></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-[typing_1.4s_ease-in-out_infinite] [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-2.5 px-3 border-t border-gray-200 bg-white flex gap-2 items-end">
                    <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn... (Enter để gửi)"
                        rows={1}
                        className="flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-800 px-3 py-1.5 text-[13px] transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,144,255,0.1)] resize-none"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="rounded-2xl h-8 min-w-[60px] bg-gradient-to-br from-blue-500 to-purple-600 border-0 font-medium text-xs transition-all duration-300 hover:from-blue-400 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(24,144,255,0.4)] disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        <Send className="h-4 w-4 mr-1" />
                        Gửi
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ChatModal;
