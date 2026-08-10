import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import supportService from '@/services/supportService';
import useNotification from '@/hooks/useNotification';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Textarea } from '@/components/ui/textarea';

const initialMessage = {
  id: 'welcome',
  type: 'bot',
  text: 'Xin chào! Bạn cần HotCinemas hỗ trợ vấn đề gì?',
};

const ChatModal = ({ open, onClose }) => {
  const notification = useNotification();
  const [messages, setMessages] = useState([initialMessage]);
  const [conversationId, setConversationId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || sending) return;

    const userMessage = { id: `user-${Date.now()}`, type: 'user', text: content };
    setMessages((items) => [...items, userMessage]);
    setInputValue('');
    setSending(true);
    setError('');

    try {
      const result = await supportService.sendMessage(content, conversationId);
      setConversationId(result?.conversationId || conversationId);
      setMessages((items) => [...items, {
        id: result?.messageId || `support-${Date.now()}`,
        type: 'bot',
        text: result?.message || result?.reply || 'Yêu cầu của bạn đã được tiếp nhận.',
      }]);
    } catch (requestError) {
      const message = requestError?.message || 'Kênh hỗ trợ hiện chưa sẵn sàng.';
      setError(message);
      notification.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      actions={null}
      maxWidth={420}
      heading={
        <div className="flex items-center gap-3">
          <Avatar className="flex size-9 items-center justify-center bg-primary text-primary-foreground">
            <Bot className="size-5" />
          </Avatar>
          <div>
            <div className="text-sm font-semibold">Hỗ trợ HotCinemas</div>
            <div className="text-xs text-muted-foreground">Phản hồi qua hệ thống hỗ trợ</div>
          </div>
        </div>
      }
    >
      <div className="flex h-[min(65vh,480px)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          {error && (
            <Alert
              variant="destructive"
              message="Không thể gửi tin nhắn"
              description={`${error} Tin nhắn chưa được gửi; bạn có thể thử lại.`}
            />
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <Avatar className="flex size-8 shrink-0 items-center justify-center bg-muted">
                {message.type === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
              </Avatar>
              <div className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {message.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Đang gửi tới bộ phận hỗ trợ...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-end gap-2 border-t p-3">
          <Textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập nội dung cần hỗ trợ"
            rows={2}
            className="min-h-10 resize-none"
          />
          <Button size="icon" onClick={handleSend} disabled={!inputValue.trim() || sending} aria-label="Gửi tin nhắn">
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};

export default ChatModal;
