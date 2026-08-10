import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  Camera,
  Clock,
  Copy,
  Download,
  Eye,
  Loader2,
  Lock,
  Printer,
  RefreshCw,
  Ticket,
  User,
} from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import bookingService from '@/services/bookingService';
import ticketService from '@/services/ticketService';
import userService from '@/services/userService';
import { uploadAvatar } from '@/utils/cloudinary';

const PAGE_SIZE = 5;

const initialProfile = {
  fullName: '',
  email: '',
  phone: '',
  birthDate: '',
};

const initialPassword = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
}).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};

const getStatus = (status) => {
  const value = String(status || '').toUpperCase();
  const map = {
    PENDING: { tone: 'warning', label: 'Chờ xử lý' },
    CONFIRMED: { tone: 'success', label: 'Đã xác nhận' },
    PAID: { tone: 'success', label: 'Đã thanh toán' },
    COMPLETED: { tone: 'success', label: 'Hoàn thành' },
    CANCELLED: { tone: 'destructive', label: 'Đã hủy' },
    CANCELED: { tone: 'destructive', label: 'Đã hủy' },
    FAILED: { tone: 'destructive', label: 'Thất bại' },
    REFUNDED: { tone: 'info', label: 'Đã hoàn tiền' },
  };
  return map[value] || { tone: 'neutral', label: status || 'N/A' };
};

const AccountSettings = () => {
  const { user, updateProfile, syncUser } = useAuth();
  const notification = useNotification();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(initialProfile);
  const [password, setPassword] = useState(initialPassword);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [generatedQr, setGeneratedQr] = useState('');

  useEffect(() => {
    setProfile({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      birthDate: user?.birthDate || '',
    });
  }, [user]);

  const avatarUrl = avatarPreview || user?.avatarUrl || user?.avatar || '';
  const displayName = user?.fullName || user?.username || user?.email || 'Người dùng';
  const initials = useMemo(() => {
    const source = displayName.trim();
    if (!source) return 'U';
    return source.split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase();
  }, [displayName]);

  const loadHistory = async (page = historyPage) => {
    if (!user?.id) return;
    setHistoryLoading(true);
    try {
      const response = await bookingService.getBookingHistoryByUserId(user.id, {
        page: page - 1,
        size: PAGE_SIZE,
      });
      const items = Array.isArray(response) ? response : (response?.content || []);
      setHistory(items);
      setHistoryTotal(response?.totalElements ?? items.length);
      setHistoryPage(page);
    } catch (error) {
      setHistory([]);
      setHistoryTotal(0);
      notification.error(error?.message || 'Không thể tải lịch sử đặt vé');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) loadHistory(1);
  }, [user?.id]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!profile.fullName.trim() || !profile.email.trim()) {
      notification.warning('Vui lòng nhập họ tên và email');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        phoneNumber: profile.phone.trim(),
        birthDate: profile.birthDate || null,
      });
      notification.success('Cập nhật thông tin thành công');
    } catch (error) {
      notification.error(error?.response?.data?.message || error?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!user?.id) return;
    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      notification.warning('Vui lòng nhập đầy đủ thông tin mật khẩu');
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      notification.warning('Mật khẩu xác nhận không khớp');
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword(user.id, {
        oldPassword: password.currentPassword,
        newPassword: password.newPassword,
        confirmNewPassword: password.confirmPassword,
      });
      setPassword(initialPassword);
      notification.success('Đổi mật khẩu thành công');
    } catch (error) {
      notification.error(error?.response?.data?.message || error?.message || 'Không thể đổi mật khẩu');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      notification.warning('Chỉ có thể tải lên file ảnh');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notification.warning('Ảnh phải nhỏ hơn 2MB');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarLoading(true);
    try {
      const uploadedUrl = await uploadAvatar(file);
      await userService.updateAvatar(user.id, uploadedUrl);
      syncUser({ ...user, avatar: uploadedUrl, avatarUrl: uploadedUrl });
      setAvatarPreview('');
      notification.success('Cập nhật avatar thành công');
    } catch (error) {
      setAvatarPreview('');
      notification.error(error?.message || 'Không thể cập nhật avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const openBookingDetail = async (bookingCode) => {
    if (!bookingCode) return;
    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedBooking(null);
    setGeneratedQr('');
    try {
      const booking = await bookingService.getBookingByCode(bookingCode);
      setSelectedBooking(booking);
      if (!booking?.qrCodeBase64 && booking?.bookingCode) {
        setGeneratedQr(await QRCode.toDataURL(`BOOKING:${booking.bookingCode}`, {
          width: 250,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        }));
      }
    } catch (error) {
      setDetailOpen(false);
      notification.error(error?.message || 'Không thể tải chi tiết đặt vé');
    } finally {
      setDetailLoading(false);
    }
  };

  const downloadTicket = async (booking = selectedBooking) => {
    if (!booking?.id) {
      notification.warning('Không tìm thấy booking để tải vé');
      return;
    }
    try {
      const blob = await ticketService.downloadBookingPDF(booking.id);
      ticketService.triggerDownload(blob, `ticket-${booking.bookingCode || booking.id}.pdf`);
      notification.success('Tải vé thành công');
    } catch (error) {
      notification.error(error?.message || 'Không thể tải vé');
    }
  };

  const copyBookingCode = async () => {
    if (!selectedBooking?.bookingCode) return;
    await navigator.clipboard.writeText(selectedBooking.bookingCode);
    notification.success('Đã sao chép mã đặt vé');
  };

  if (!user) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <Alert variant="warning" showIcon message="Bạn cần đăng nhập" description="Vui lòng đăng nhập để xem cài đặt tài khoản." />
      </main>
    );
  }

  const detailStatus = getStatus(selectedBooking?.status);
  const detailQr = selectedBooking?.qrCodeBase64
    ? `data:image/png;base64,${selectedBooking.qrCodeBase64}`
    : generatedQr;

  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cài đặt tài khoản</h1>
        <p className="mt-1 text-muted-foreground">Quản lý hồ sơ, bảo mật và lịch sử đặt vé của bạn.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xl font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              size="icon"
              className="absolute -bottom-1 -right-1 rounded-full"
              disabled={avatarLoading}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Đổi ảnh đại diện"
            >
              {avatarLoading ? <Loader2 className="animate-spin" /> : <Camera />}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="truncate text-xl font-semibold">{displayName}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">Ảnh JPG/PNG, tối đa 2MB.</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-5">
        <div className="overflow-x-auto pb-1">
          <TabsList className="min-w-max justify-start">
            <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Hồ sơ</TabsTrigger>
            <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Bảo mật</TabsTrigger>
            <TabsTrigger value="history"><Clock className="mr-2 h-4 w-4" />Lịch sử vé</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin tài khoản đang sử dụng.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="profile-name">Họ và tên</Label>
                  <Input
                    id="profile-name"
                    value={profile.fullName}
                    onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">Số điện thoại</Label>
                  <Input
                    id="profile-phone"
                    value={profile.phone}
                    onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-birth-date">Ngày sinh</Label>
                  <Input
                    id="profile-birth-date"
                    type="date"
                    value={profile.birthDate || ''}
                    onChange={(event) => setProfile((current) => ({ ...current, birthDate: event.target.value }))}
                  />
                </div>
                <div className="flex items-end justify-end sm:col-span-2">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile && <Loader2 className="animate-spin" />}
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Mật khẩu & bảo mật</CardTitle>
              <CardDescription>Đổi mật khẩu cho tài khoản hiện tại.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                  <InputPassword
                    id="current-password"
                    value={password.currentPassword}
                    onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))}
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <InputPassword
                    id="new-password"
                    value={password.newPassword}
                    onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                  <InputPassword
                    id="confirm-password"
                    value={password.confirmPassword}
                    onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword && <Loader2 className="animate-spin" />}
                  Đổi mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Lịch sử đặt vé</CardTitle>
                <CardDescription>Các đơn đặt vé của tài khoản này.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadHistory(historyPage)} disabled={historyLoading}>
                <RefreshCw className={historyLoading ? 'animate-spin' : ''} />
                Làm mới
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {historyLoading ? (
                <div className="flex min-h-48 items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tải lịch sử...
                </div>
              ) : history.length === 0 ? (
                <Empty description="Chưa có đơn đặt vé" image={<Ticket className="mb-4 h-14 w-14 text-muted-foreground/35" />} />
              ) : (
                <div className="space-y-3">
                  {history.map((booking) => {
                    const status = getStatus(booking.status);
                    const code = booking.bookingCode || String(booking.id || '');
                    return (
                      <div key={booking.id || code} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{booking.movieTitle || booking.movie?.title || 'Vé xem phim'}</p>
                            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.cinemaName || booking.cinema?.name || 'N/A'}
                            {booking.roomName ? ` · ${booking.roomName}` : ''}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {code ? `Mã ${code} · ` : ''}{formatDateTime(booking.bookingDate || booking.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <strong>{formatMoney(booking.finalAmount ?? booking.totalPrice ?? booking.totalAmount)}</strong>
                          <Button variant="outline" size="sm" onClick={() => openBookingDetail(code)} disabled={!code}>
                            <Eye />Chi tiết
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {historyTotal > PAGE_SIZE && (
                <Pagination
                  page={historyPage}
                  totalItems={historyTotal}
                  itemsPerPage={PAGE_SIZE}
                  onPageChange={loadHistory}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ResponsiveDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedBooking(null);
          setGeneratedQr('');
        }}
        heading={selectedBooking?.bookingCode ? `Vé ${selectedBooking.bookingCode}` : 'Chi tiết đặt vé'}
        description="Thông tin vé được tải trực tiếp từ hệ thống đặt vé."
        maxWidth={760}
        actions={selectedBooking ? (
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={copyBookingCode}><Copy />Sao chép mã</Button>
            <Button variant="outline" onClick={() => window.print()}><Printer />In</Button>
            <Button onClick={() => downloadTicket()}><Download />Tải PDF</Button>
          </div>
        ) : null}
      >
        {detailLoading ? (
          <div className="flex min-h-56 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />Đang tải vé...
          </div>
        ) : selectedBooking ? (
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="space-y-4 text-center">
              {detailQr ? (
                <img src={detailQr} alt="QR Code" className="mx-auto h-52 w-52 rounded-md border bg-white p-2" />
              ) : (
                <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                  QR không khả dụng
                </div>
              )}
              <StatusBadge tone={detailStatus.tone}>{detailStatus.label}</StatusBadge>
            </div>
            <DetailList columns={2}>
              <DetailItem label="Mã đặt vé">{selectedBooking.bookingCode || 'N/A'}</DetailItem>
              <DetailItem label="Phim">{selectedBooking.movieTitle || 'N/A'}</DetailItem>
              <DetailItem label="Rạp">{selectedBooking.cinemaName || 'N/A'}</DetailItem>
              <DetailItem label="Phòng">{selectedBooking.roomName || 'N/A'}</DetailItem>
              <DetailItem label="Suất chiếu">{formatDateTime(selectedBooking.showtimeDateTime)}</DetailItem>
              <DetailItem label="Ghế">
                {selectedBooking.seats?.map((seat) => seat.seatName || seat.name).filter(Boolean).join(', ') || 'N/A'}
              </DetailItem>
              <DetailItem label="Tổng tiền">{formatMoney(selectedBooking.finalAmount ?? selectedBooking.totalPrice ?? selectedBooking.totalAmount)}</DetailItem>
              <DetailItem label="Ngày đặt">{formatDateTime(selectedBooking.bookingDate)}</DetailItem>
            </DetailList>
          </div>
        ) : null}
      </ResponsiveDialog>
    </main>
  );
};

export default AccountSettings;
