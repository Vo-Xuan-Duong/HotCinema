import {
  Clapperboard,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const informationLinks = [
  ['Về chúng tôi', '/about'],
  ['Tuyển dụng', '/careers'],
  ['Tin tức', '/news'],
  ['Liên hệ', '/contact'],
];

const supportLinks = [
  ['Trợ giúp', '/help'],
  ['FAQ', '/faq'],
  ['Hướng dẫn đặt vé', '/booking-guide'],
  ['Điều khoản', '/terms'],
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

const FooterLinkList = ({ title, links }) => (
  <div>
    <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
    <ul className="space-y-1.5">
      {links.map(([label, href]) => (
        <li key={href}>
          <a href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-card text-card-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Clapperboard className="h-4 w-4" />
              </span>
              <span className="font-semibold tracking-tight text-foreground">HotCinema</span>
            </div>
            <p className="mt-2 max-w-lg text-sm leading-5 text-muted-foreground">
              Tìm phim, chọn rạp, đặt ghế và quản lý vé trong một trải nghiệm thống nhất.
            </p>

            <div className="mt-3 flex gap-1.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <FooterLinkList title="Thông tin" links={informationLinks} />
          </div>

          <div className="md:col-span-2">
            <FooterLinkList title="Hỗ trợ" links={supportLinks} />
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Liên hệ</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>1900-xxxx</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>info@hotcinemas.vn</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} HotCinema. Tất cả quyền được bảo lưu.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="/terms" className="transition-colors hover:text-foreground">Điều khoản</a>
            <a href="/privacy" className="transition-colors hover:text-foreground">Bảo mật</a>
            <a href="/cookies" className="transition-colors hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
