import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
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
            text: 'Xin chÃ o! TÃ´i lÃ  trá»£ lÃ½ AI cá»§a HotCinemas. TÃ´i cÃ³ thá»ƒ giÃºp gÃ¬ cho báº¡n?',
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

        // CÃ¡c cÃ¢u tráº£ lá»i máº«u
        if (lowerMessage.includes('giÃ¡ vÃ©') || lowerMessage.includes('giÃ¡')) {
            return 'GiÃ¡ vÃ© phim dao Ä‘á»™ng tá»« 45.000Ä‘ - 150.000Ä‘ tÃ¹y theo suáº¥t chiáº¿u vÃ  loáº¡i phÃ²ng. Báº¡n cÃ³ thá»ƒ xem chi tiáº¿t giÃ¡ vÃ© khi chá»n suáº¥t chiáº¿u nhÃ©!';
        } else if (lowerMessage.includes('Ä‘áº·t vÃ©') || lowerMessage.includes('mua vÃ©')) {
            return 'Äá»ƒ Ä‘áº·t vÃ©, báº¡n cÃ³ thá»ƒ: \n1. Chá»n phim muá»‘n xem\n2. Chá»n ráº¡p vÃ  suáº¥t chiáº¿u\n3. Chá»n gháº¿ ngá»“i\n4. Thanh toÃ¡n online\nRáº¥t Ä‘Æ¡n giáº£n vÃ  nhanh chÃ³ng!';
        } else if (lowerMessage.includes('phim') && (lowerMessage.includes('hay') || lowerMessage.includes('hot'))) {
            return 'Hiá»‡n táº¡i chÃºng tÃ´i cÃ³ nhiá»u phim hot Ä‘ang chiáº¿u nhÆ° phim hÃ nh Ä‘á»™ng, tÃ¢m lÃ½, kinh dá»‹... Báº¡n cÃ³ thá»ƒ xem danh sÃ¡ch phim á»Ÿ trang chá»§ hoáº·c trang Phim Ä‘á»ƒ biáº¿t thÃªm chi tiáº¿t!';
        } else if (lowerMessage.includes('ráº¡p') || lowerMessage.includes('cinema')) {
            return 'ChÃºng tÃ´i cÃ³ há»‡ thá»‘ng ráº¡p trÃªn toÃ n quá»‘c. Báº¡n cÃ³ thá»ƒ xem danh sÃ¡ch ráº¡p vÃ  Ä‘á»‹a chá»‰ chi tiáº¿t táº¡i trang Ráº¡p Chiáº¿u Phim nhÃ©!';
        } else if (lowerMessage.includes('thanh toÃ¡n') || lowerMessage.includes('payment')) {
            return 'ChÃºng tÃ´i há»— trá»£ nhiá»u hÃ¬nh thá»©c thanh toÃ¡n: Tháº» ATM, Visa/MasterCard, VÃ­ Ä‘iá»‡n tá»­ (Momo, ZaloPay, VNPay). An toÃ n vÃ  báº£o máº­t 100%!';
        } else if (lowerMessage.includes('khuyáº¿n mÃ£i') || lowerMessage.includes('giáº£m giÃ¡')) {
            return 'ChÃºng tÃ´i thÆ°á»ng xuyÃªn cÃ³ cÃ¡c chÆ°Æ¡ng trÃ¬nh khuyáº¿n mÃ£i háº¥p dáº«n! Báº¡n hÃ£y theo dÃµi trang Khuyáº¿n MÃ£i hoáº·c Ä‘Äƒng kÃ½ nháº­n thÃ´ng bÃ¡o Ä‘á»ƒ khÃ´ng bá» lá»¡ nhÃ©!';
        } else if (lowerMessage.includes('giá» chiáº¿u') || lowerMessage.includes('lá»‹ch chiáº¿u')) {
            return 'Báº¡n cÃ³ thá»ƒ xem lá»‹ch chiáº¿u Ä‘áº§y Ä‘á»§ táº¡i trang Lá»‹ch Chiáº¿u. Lá»‹ch chiáº¿u Ä‘Æ°á»£c cáº­p nháº­t liÃªn tá»¥c vÃ  báº¡n cÃ³ thá»ƒ lá»c theo ngÃ y, ráº¡p Ä‘á»ƒ dá»… dÃ ng tÃ¬m kiáº¿m!';
        } else if (lowerMessage.includes('há»§y vÃ©') || lowerMessage.includes('hoÃ n tiá»n')) {
            return 'Báº¡n cÃ³ thá»ƒ há»§y vÃ© trÆ°á»›c giá» chiáº¿u 24h Ä‘á»ƒ Ä‘Æ°á»£c hoÃ n tiá»n. Vui lÃ²ng vÃ o pháº§n Lá»‹ch sá»­ Ä‘áº·t vÃ© Ä‘á»ƒ thá»±c hiá»‡n hoáº·c liÃªn há»‡ hotline 1900-6420 Ä‘á»ƒ Ä‘Æ°á»£c há»— trá»£!';
        } else if (lowerMessage.includes('tÃ i khoáº£n') || lowerMessage.includes('Ä‘Äƒng kÃ½') || lowerMessage.includes('Ä‘Äƒng nháº­p')) {
            return 'Báº¡n cÃ³ thá»ƒ Ä‘Äƒng kÃ½ tÃ i khoáº£n miá»…n phÃ­ Ä‘á»ƒ tÃ­ch Ä‘iá»ƒm vÃ  nháº­n nhiá»u Æ°u Ä‘Ã£i háº¥p dáº«n! Viá»‡c Ä‘Äƒng nháº­p cÅ©ng giÃºp báº¡n quáº£n lÃ½ vÃ© vÃ  lá»‹ch sá»­ Ä‘áº·t vÃ© dá»… dÃ ng hÆ¡n.';
        } else if (lowerMessage.includes('hotline') || lowerMessage.includes('liÃªn há»‡') || lowerMessage.includes('gá»i')) {
            return 'Báº¡n cÃ³ thá»ƒ liÃªn há»‡ hotline 1900-6420 (8h-22h hÃ ng ngÃ y) hoáº·c chat vá»›i chÃºng tÃ´i táº¡i Ä‘Ã¢y. ChÃºng tÃ´i luÃ´n sáºµn sÃ ng há»— trá»£ báº¡n!';
        } else if (lowerMessage.includes('cáº£m Æ¡n') || lowerMessage.includes('thank')) {
            return 'Ráº¥t vui Ä‘Æ°á»£c há»— trá»£ báº¡n! ChÃºc báº¡n cÃ³ tráº£i nghiá»‡m xem phim tuyá»‡t vá»i táº¡i HotCinemas! ðŸŽ¬ðŸ¿';
        } else if (lowerMessage.includes('xin chÃ o') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return 'Xin chÃ o! Ráº¥t vui Ä‘Æ°á»£c há»— trá»£ báº¡n. Báº¡n cáº§n tÃ´i giÃºp gÃ¬ vá» dá»‹ch vá»¥ Ä‘áº·t vÃ© xem phim?';
        } else {
            return 'TÃ´i hiá»ƒu cÃ¢u há»i cá»§a báº¡n. Báº¡n cÃ³ thá»ƒ há»i tÃ´i vá»:\n- GiÃ¡ vÃ© vÃ  cÃ¡ch Ä‘áº·t vÃ©\n- Phim Ä‘ang chiáº¿u\n- Lá»‹ch chiáº¿u vÃ  ráº¡p\n- Thanh toÃ¡n vÃ  khuyáº¿n mÃ£i\n- Hoáº·c liÃªn há»‡ hotline: 1900-6420';
        }
    };

    const handleSend = () => {
        if (!inputValue.trim()) {
            notification.warning('Vui lÃ²ng nháº­p tin nháº¯n!');
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
        'GiÃ¡ vÃ© bao nhiÃªu?',
        'CÃ¡ch Ä‘áº·t vÃ©?',
        'Phim hot Ä‘ang chiáº¿u',
        'Lá»‹ch chiáº¿u hÃ´m nay'
    ];

    const handleQuickQuestion = (question) => {
        setInputValue(question);
    };

    return (
        <ResponsiveDialog
            open={open}
            onClose={onClose}
            actions={null}
            maxWidth={380}
            className="chat-modal"
            heading={
                <div className="text-white flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                    </Avatar>
                    <div>
                        <div className="text-[13px] font-semibold text-white mb-0.5">Trá»£ lÃ½ AI HotCinemas</div>
                        <div className="text-[11px] text-white/90 flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-[pulseDot_2s_ease-in-out_infinite]"></span>
                            Äang hoáº¡t Ä‘á»™ng
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-[380px] md:h-[350px]">
                {/* Quick Questions */}
                {messages.length <= 1 && (
                    <div className="p-3 bg-gray-50 rounded-xl mb-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-2 font-medium">CÃ¢u há»i thÆ°á»ng gáº·p:</div>
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
                        placeholder="Nháº­p tin nháº¯n... (Enter Ä‘á»ƒ gá»­i)"
                        rows={1}
                        className="flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-800 px-3 py-1.5 text-[13px] transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(24,144,255,0.1)] resize-none"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="rounded-2xl h-8 min-w-[60px] bg-gradient-to-br from-blue-500 to-purple-600 border-0 font-medium text-xs transition-all duration-300 hover:from-blue-400 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(24,144,255,0.4)] disabled:bg-gray-200 disabled:text-gray-400"
                    >
                        <Send className="h-4 w-4 mr-1" />
                        Gá»­i
                    </Button>
                </div>
            </div>
        </ResponsiveDialog>
    );
};

export default ChatModal;
