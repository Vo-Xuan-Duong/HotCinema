import { Clapperboard, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const FooterLinkList = ({ title, links }) => (
  <div>
    <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
    <ul className="space-y-1.5">
      {links.map(([label, href]) => (
        <li key={href}>
          <Link to={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-card text-card-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Clapperboard className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-semibold tracking-tight text-foreground">HotCinema</span>
            </Link>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              Tìm phim, chọn rạp, đặt ghế và quản lý vé trong một trải nghiệm thống nhất.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <a
                href="tel:19006420"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                1900 6420
              </a>
              <a
                href="mailto:info@hotcinemas.vn"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                info@hotcinemas.vn
              </a>
            </div>
          </div>

          <div className="md:col-span-2">
            <FooterLinkList title="Thông tin" links={informationLinks} />
          </div>

          <div className="md:col-span-2">
            <FooterLinkList title="Hỗ trợ" links={supportLinks} />
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Địa điểm</h3>
            <div className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>TP. Hồ Chí Minh, Việt Nam</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Thông tin rạp và địa chỉ cụ thể được hiển thị trong trang Rạp chiếu.
            </p>
            <Link to="/cinemas" className="mt-2 inline-flex text-sm font-medium text-primary hover:underline">
              Xem hệ thống rạp
            </Link>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} HotCinema. Tất cả quyền được bảo lưu.</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Chính sách">
            <Link to="/terms" className="transition-colors hover:text-foreground">Điều khoản</Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">Bảo mật</Link>
            <Link to="/cookies" className="transition-colors hover:text-foreground">Cookies</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
