import {
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  Cookie,
  Info,
  Mail,
  Newspaper,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const pageContent = {
  '/about': {
    icon: Info,
    eyebrow: 'HotCinema',
    title: 'Về chúng tôi',
    description: 'HotCinema tập trung vào trải nghiệm khám phá phim, chọn suất chiếu, đặt ghế và quản lý vé trên một hành trình thống nhất.',
    sections: [
      ['Trải nghiệm liền mạch', 'Từ danh sách phim đến vé điện tử, giao diện được thiết kế để người dùng luôn biết bước tiếp theo cần thực hiện.'],
      ['Thông tin rõ ràng', 'Lịch chiếu, trạng thái ghế, giá vé và trạng thái thanh toán được trình bày nhất quán trên toàn hệ thống.'],
      ['Ưu tiên khả dụng', 'HotCinema hướng tới giao diện responsive, hỗ trợ bàn phím, light/dark theme và phản hồi rõ ràng cho mọi trạng thái.'],
    ],
  },
  '/careers': {
    icon: BriefcaseBusiness,
    eyebrow: 'Cơ hội nghề nghiệp',
    title: 'Tuyển dụng',
    description: 'Thông tin vị trí tuyển dụng sẽ được cập nhật theo nhu cầu vận hành của HotCinema.',
    sections: [
      ['Cách liên hệ', 'Bạn có thể gửi thông tin giới thiệu bản thân qua kênh liên hệ chính thức của HotCinema để được ghi nhận khi có vị trí phù hợp.'],
      ['Quy trình', 'Hồ sơ phù hợp sẽ được liên hệ trực tiếp. HotCinema không yêu cầu thanh toán phí trong quá trình ứng tuyển.'],
    ],
  },
  '/news': {
    icon: Newspaper,
    eyebrow: 'Cập nhật',
    title: 'Tin tức',
    description: 'Các cập nhật về phim, lịch chiếu và hoạt động nổi bật sẽ được tổng hợp tại đây.',
    sections: [
      ['Phim đang chiếu', 'Xem danh sách phim đang có suất chiếu và mở trang chi tiết để kiểm tra lịch theo ngày, rạp và định dạng.'],
      ['Phim sắp chiếu', 'Theo dõi các tựa phim sắp phát hành từ trang phim để chuẩn bị kế hoạch xem phim.'],
    ],
  },
  '/contact': {
    icon: Phone,
    eyebrow: 'Hỗ trợ',
    title: 'Liên hệ',
    description: 'Sử dụng các kênh dưới đây khi bạn cần hỗ trợ về tài khoản, đặt vé hoặc thanh toán.',
    sections: [
      ['Hotline', '1900 6420'],
      ['Email', 'info@hotcinemas.vn'],
      ['Hỗ trợ trong ứng dụng', 'Mở nút Hỗ trợ khách hàng ở góc dưới màn hình để bắt đầu cuộc trò chuyện.'],
    ],
  },
  '/help': {
    icon: CircleHelp,
    eyebrow: 'Trung tâm hỗ trợ',
    title: 'Trợ giúp',
    description: 'Các hướng dẫn ngắn giúp bạn xử lý những tình huống phổ biến khi sử dụng HotCinema.',
    sections: [
      ['Không thấy suất chiếu', 'Hãy kiểm tra lại ngày, rạp hoặc bộ lọc. Một số phim có thể chưa mở bán cho ngày bạn chọn.'],
      ['Ghế vừa chọn không còn khả dụng', 'Trạng thái ghế được cập nhật theo thời gian thực. Nếu ghế đã được người khác giữ hoặc đặt, hãy chọn ghế khác.'],
      ['Thanh toán chưa cập nhật', 'Giữ nguyên mã đặt vé và kiểm tra lại lịch sử đặt vé. Không tạo nhiều giao dịch mới cho cùng một booking khi trạng thái đang được xác nhận.'],
    ],
  },
  '/faq': {
    icon: CircleHelp,
    eyebrow: 'Câu hỏi thường gặp',
    title: 'FAQ',
    description: 'Các câu trả lời nhanh cho những câu hỏi thường gặp về đặt vé.',
    sections: [
      ['Tôi có cần đăng nhập để đặt vé?', 'Có. Đăng nhập giúp hệ thống xác định quyền giữ ghế, theo dõi booking và hiển thị vé điện tử của bạn.'],
      ['Tôi có thể xem lại vé ở đâu?', 'Sau khi thanh toán thành công, vé được hiển thị trong chi tiết booking và lịch sử đặt vé.'],
      ['Mã giảm giá được kiểm tra khi nào?', 'Mã được kiểm tra trước khi checkout và tổng tiền cuối cùng do backend xác nhận.'],
    ],
  },
  '/booking-guide': {
    icon: BookOpen,
    eyebrow: 'Hướng dẫn',
    title: 'Hướng dẫn đặt vé',
    description: 'Quy trình đặt vé trên HotCinema gồm các bước rõ ràng từ chọn phim đến nhận vé.',
    sections: [
      ['1. Chọn phim và suất chiếu', 'Mở phim bạn muốn xem, chọn ngày, rạp và suất chiếu phù hợp.'],
      ['2. Chọn ghế và combo', 'Chọn ghế còn trống, thêm bắp nước nếu cần và áp dụng mã giảm giá hợp lệ.'],
      ['3. Xác nhận và thanh toán', 'Kiểm tra thông tin booking trước khi chuyển sang cổng thanh toán.'],
      ['4. Nhận vé', 'Sau khi thanh toán được xác nhận, vé và QR được phát hành trong booking của bạn.'],
    ],
  },
  '/terms': {
    icon: ShieldCheck,
    eyebrow: 'Chính sách',
    title: 'Điều khoản sử dụng',
    description: 'Các nguyên tắc cơ bản khi sử dụng HotCinema để tìm suất chiếu, giữ ghế, đặt vé và quản lý booking.',
    sections: [
      ['Thông tin tài khoản', 'Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập và kiểm tra thông tin trước khi xác nhận giao dịch.'],
      ['Giữ ghế và booking', 'Ghế chỉ được giữ trong khoảng thời gian hệ thống quy định. Booking chưa hoàn tất có thể hết hạn và giải phóng tài nguyên.'],
      ['Thanh toán và hoàn tiền', 'Trạng thái thanh toán, điều kiện hủy và hoàn tiền được xác định theo booking và chính sách đang áp dụng tại thời điểm xử lý.'],
    ],
  },
  '/privacy': {
    icon: ShieldCheck,
    eyebrow: 'Quyền riêng tư',
    title: 'Bảo mật thông tin',
    description: 'HotCinema sử dụng dữ liệu cần thiết để vận hành tài khoản, booking, thanh toán và hỗ trợ người dùng.',
    sections: [
      ['Dữ liệu tài khoản', 'Thông tin tài khoản được sử dụng để xác thực, quản lý booking và cung cấp các chức năng dành cho thành viên.'],
      ['Dữ liệu giao dịch', 'Thông tin booking và trạng thái thanh toán được lưu để phục vụ phát hành vé, tra cứu và xử lý hỗ trợ.'],
      ['Bảo mật', 'Các thao tác có quyền truy cập được kiểm tra ở backend; giao diện không phải là lớp bảo vệ quyền duy nhất.'],
    ],
  },
  '/cookies': {
    icon: Cookie,
    eyebrow: 'Trình duyệt',
    title: 'Cookies và lưu trữ cục bộ',
    description: 'HotCinema có thể sử dụng cơ chế lưu trữ của trình duyệt cho các thiết lập giao diện và dữ liệu phiên cần thiết.',
    sections: [
      ['Thiết lập giao diện', 'Theme sáng/tối có thể được ghi nhớ để giữ trải nghiệm nhất quán giữa các lần truy cập.'],
      ['Phiên đăng nhập', 'Thông tin phiên cần thiết được quản lý để xác thực các yêu cầu tới API.'],
      ['Kiểm soát', 'Bạn có thể xóa dữ liệu trang web trong cài đặt trình duyệt; thao tác này có thể đăng xuất tài khoản và đặt lại tùy chọn.'],
    ],
  },
};

const InfoPage = () => {
  const { pathname } = useLocation();
  const content = pageContent[pathname] || pageContent['/help'];
  const Icon = content.icon;

  return (
    <div className="min-h-dvh bg-background pt-16 text-foreground">
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {content.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {content.description}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4">
          {content.sections.map(([title, description]) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
          <Button asChild>
            <Link to="/movies">Khám phá phim</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/cinemas">Xem rạp chiếu</Link>
          </Button>
          <Button asChild variant="ghost">
            <a href="mailto:info@hotcinemas.vn">
              <Mail className="h-4 w-4" />
              Liên hệ hỗ trợ
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default InfoPage;
