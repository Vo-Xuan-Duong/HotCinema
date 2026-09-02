import { useState } from 'react';
import { Headphones, MessageCircle, Phone, X } from 'lucide-react';
import ChatModal from '@/components/ChatModal/ChatModal';
import { Button } from '@/components/ui/button';

const FloatingSupport = () => {
  const [expanded, setExpanded] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  const openChat = () => {
    setExpanded(false);
    setChatModalOpen(true);
  };

  return (
    <>
      <nav
        className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] items-end gap-2 sm:bottom-6 sm:right-6"
        aria-label="Hỗ trợ khách hàng"
      >
        {expanded && (
          <div
            id="customer-support-actions"
            className="flex flex-col items-stretch gap-2 rounded-xl border border-border bg-card/95 p-2 text-card-foreground shadow-lg backdrop-blur sm:flex-row"
          >
            <Button asChild type="button" variant="outline" size="sm" className="justify-start gap-2">
              <a href="tel:19006420" aria-label="Gọi hotline 1900 6420">
                <Phone className="h-4 w-4" />
                <span>1900 6420</span>
              </a>
            </Button>
            <Button type="button" variant="outline" size="sm" className="justify-start gap-2" onClick={openChat}>
              <MessageCircle className="h-4 w-4" />
              <span>Chat hỗ trợ</span>
            </Button>
          </div>
        )}

        <Button
          type="button"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full shadow-lg sm:h-14 sm:w-14"
          aria-label={expanded ? 'Đóng menu hỗ trợ khách hàng' : 'Mở menu hỗ trợ khách hàng'}
          aria-expanded={expanded}
          aria-controls="customer-support-actions"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <X className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
        </Button>
      </nav>

      <ChatModal open={chatModalOpen} onClose={() => setChatModalOpen(false)} />
    </>
  );
};

export default FloatingSupport;
