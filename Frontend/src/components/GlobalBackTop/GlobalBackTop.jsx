import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const GlobalBackTop = ({ visibilityHeight = 200 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop;
      setVisible(scrolled > visibilityHeight);
    };

    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, [visibilityHeight]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed right-6 bottom-6 h-[50px] w-[50px] rounded-full bg-primary text-white",
        "border-2 border-white/30 shadow-[0_4px_20px_rgba(229,9,20,0.4)]",
        "backdrop-blur-[10px] transition-all duration-300",
        "hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(229,9,20,0.6)]",
        "z-50"
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
};

export default GlobalBackTop;
