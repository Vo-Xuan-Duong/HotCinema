import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin, CreditCard, Banknote, Smartphone, QrCode } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const socialLinks = [
        { icon: <Facebook className="h-4 w-4" />, href: '#', label: 'Facebook' },
        { icon: <Instagram className="h-4 w-4" />, href: '#', label: 'Instagram' },
        { icon: <Twitter className="h-4 w-4" />, href: '#', label: 'Twitter' },
        { icon: <Youtube className="h-4 w-4" />, href: '#', label: 'Youtube' },
    ];

    const paymentMethods = [
        { icon: <CreditCard className="h-4 w-4" />, label: 'Thẻ tín dụng' },
        { icon: <Banknote className="h-4 w-4" />, label: 'Chuyển khoản' },
        { icon: <Smartphone className="h-4 w-4" />, label: 'Ví điện tử' },
        { icon: <QrCode className="h-4 w-4" />, label: 'QR Pay' },
    ];

    return (
        <footer className="bg-card text-card-foreground border-t border-border mt-auto transition-all duration-300">
            <div className="max-w-[1200px] mx-auto px-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5">
                        <div className="h-full">
                            <h3 className="text-primary mb-1.5 font-bold text-[0.95rem] bg-gradient-to-r from-primary to-[#ff8c00] bg-clip-text text-transparent">
                                🎬 HotCinemas
                            </h3>
                            <p className="text-muted-foreground leading-snug mb-2 block text-xs">
                                Hệ thống rạp chiếu phim hàng đầu Việt Nam, mang đến trải nghiệm
                                giải trí đỉnh cao với công nghệ hiện đại nhất.
                            </p>
                            <div className="mt-2 flex gap-4">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="inline-flex items-center justify-center w-7 h-7 bg-[var(--hover-bg)] text-[var(--text-secondary)] rounded-full no-underline transition-all duration-300 text-[13px] border border-border hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,107,53,0.3)] hover:border-primary"
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="h-full">
                            <h4 className="text-foreground mb-1.5 text-xs font-semibold">
                                Thông tin
                            </h4>
                            <ul className="list-none p-0 m-0 [&_li]:mb-0.5">
                                <li><a href="/about" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">Về chúng tôi</a></li>
                                <li><a href="/careers" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">Tuyển dụng</a></li>
                                <li><a href="/news" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">Tin tức</a></li>
                                <li><a href="/contact" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">Liên hệ</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="h-full">
                            <h4 className="text-foreground mb-1.5 text-xs font-semibold">
                                Hỗ trợ
                            </h4>
                            <ul className="list-none p-0 m-0 [&_li]:mb-0.5">
                                <li><a href="/help" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">Trợ giúp</a></li>
                                <li><a href="/faq" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">FAQ</a></li>
                                <li><a href="/booking-guide" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">Đặt vé</a></li>
                                <li><a href="/terms" className="text-muted-foreground transition-all duration-300 text-xs no-underline hover:text-primary">Điều khoản</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <div className="h-full">
                            <h4 className="text-foreground mb-1.5 text-xs font-semibold">
                                Liên hệ
                            </h4>
                            <div className="mt-2 flex flex-col gap-2">
                                <div className="flex items-start gap-1">
                                    <Phone className="text-primary mt-0.5 h-3 w-3" />
                                    <span className="text-muted-foreground text-xs">1900-xxxx</span>
                                </div>
                                <div className="flex items-start gap-1">
                                    <Mail className="text-primary mt-0.5 h-3 w-3" />
                                    <span className="text-muted-foreground text-xs">info@hotcinemas.vn</span>
                                </div>
                                <div className="flex items-start gap-1">
                                    <MapPin className="text-primary mt-0.5 h-3 w-3" />
                                    <span className="text-muted-foreground text-xs">Quận 1, TP.HCM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="border-border my-3" />

                <div className="py-1.5 pb-1">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <div>
                            <p className="text-muted-foreground text-[11px]">
                                © {currentYear} HotCinemas. Tất cả quyền được bảo lưu.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Separator orientation="vertical" className="h-4 border-border hidden md:block" />
                            <a href="/terms" className="text-muted-foreground text-[11px] no-underline transition-colors duration-300 hover:text-primary">Điều khoản</a>
                            <Separator orientation="vertical" className="h-4 border-border" />
                            <a href="/privacy" className="text-muted-foreground text-[11px] no-underline transition-colors duration-300 hover:text-primary">Bảo mật</a>
                            <Separator orientation="vertical" className="h-4 border-border" />
                            <a href="/cookies" className="text-muted-foreground text-[11px] no-underline transition-colors duration-300 hover:text-primary">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
