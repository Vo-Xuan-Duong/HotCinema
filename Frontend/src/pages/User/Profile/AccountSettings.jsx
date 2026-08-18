import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  ExternalLink,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Save,
  Ticket,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import bookingService from '@/services/bookingService';
import userService from '@/services/userService';
import { uploadAvatar } from '@/utils/cloudinary';
import { isUuid } from '@/utils/resourceId';

const EMPTY_PROFILE = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'OTHER',
  avatarUrl: '',
  status: 'ACTIVE',
};

const statusMeta = (status) => {
  const value = String(status || 'PENDING').toUpperCase();
  if (['CONFIRMED', 'PAID', 'COMPLETED'].includes(value)) return { label: value === 'COMPLETED' ? 'Hoàn thành' : 'Đã xác nhận', tone: 'success' };
  if (['CANCELLED', 'CANCELED'].includes(value)) return { label: 'Đã hủy', tone: 'neutral' };
  if (value === 'FAILED') return { label: 'Thất bại', tone: 'destructive' };
  if (value === 'REFUNDED') return { label: 'Đã hoàn tiền', tone: 'info' };
  return { label: 'Đang chờ', tone: 'warning' };
};

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
}).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};

const AccountSettings = () => {
  const { user, syncUser } = useAuth();
  const notification = useNotification();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileCapability, setProfileCapability] = useState('');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCapability, setHistoryCapability] = useState('');

  const displayName = profile.fullName || user?.fullName || user?.email || 'Người dùng';
  const initials = useMemo(() => displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U', [displayName]);

  const loadProfile = useCallback(async () => {
    if (!user?.id || !isUuid(user.id)) {
      setProfile({
        ...EMPTY_PROFILE,
        fullName: user?.fullName || '',
        email: user?.email || '',
        avatarUrl: user?.avatarUrl || user?.avatar || '',
      });
      setProfileCapability('JWT hiện không chứa user UUID hợp lệ để tải UserResponse.');
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileCapability('');
    try {
      const current = await userService.getUserById(user.id);
      const hydrated = {
        fullName: current?.fullName || user.fullName || '',
        email: current?.email || user.email || '',
        phone: current?.phone || current?.phoneNumber || '',
        dateOfBirth: current?.dateOfBirth || current?.birthDate || '',
        gender: String(current?.gender || 'OTHER').toUpperCase(),
        avatarUrl: current?.avatarUrl || current?.avatar || '',
        status: String(current?.status || 'ACTIVE').toUpperCase(),
      };
      setProfile(hydrated);
      syncUser({ ...user, ...current, phoneNumber: current?.phone, birthDate: current?.dateOfBirth });
    } catch (error) {
      console.error('Error loading account profile:', error);
      setProfile({
        ...EMPTY_PROFILE,
        fullName: user?.fullName || '',
        email: user?.email || '',
        avatarUrl: user?.avatarUrl || user?.avatar || '',
      });
      setProfileCapability(error?.message || 'Không thể tải hồ sơ User từ backend.');
    } finally {
      setProfileLoading(false);
    }
  }, [syncUser, user]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryCapability('');
    try {
      const response = await bookingService.getMyBookings({ page: 0, size: 20, sort: 'createdAt,desc' });
      setHistory(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Error loading account booking history:', error);
      setHistory([]);
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') {
        setHistoryCapability('Backend chưa có endpoint booking theo phiên đăng nhập. FE không tải toàn bộ booking rồi lọc trong browser.');
      } else {
        setHistoryCapability(error?.message || 'Không thể tải lịch sử booking.');
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const validateProfile = () => {
    if (!profile.fullName.trim()) return 'Vui lòng nhập họ tên';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) return 'Email không hợp lệ';
    if (!profile.phone.trim()) return 'Backend UserUpdateRequest yêu cầu số điện thoại';
    if (!profile.dateOfBirth) return 'Backend UserUpdateRequest yêu cầu ngày sinh';
    if (!['MALE', 'FEMALE', 'OTHER'].includes(profile.gender)) return 'Giới tính không hợp lệ';
    if (!profile.avatarUrl.trim()) return 'Backend UserUpdateRequest yêu cầu avatarUrl';
    return null;
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!user?.id || !isUuid(user.id)) return;
    const validationError = validateProfile();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await userService.updateUser(user.id, {
        fullName: profile.fullName.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        avatarUrl: profile.avatarUrl.trim(),
        status: profile.status,
      });
      syncUser({ ...user, ...updated, phoneNumber: updated?.phone, birthDate: updated?.dateOfBirth });
      setProfile((current) => ({
        ...current,
        fullName: updated?.fullName || current.fullName,
        email: updated?.email || current.email,
        phone: updated?.phone || current.phone,
        dateOfBirth: updated?.dateOfBirth || current.dateOfBirth,
        gender: updated?.gender || current.gender,
        avatarUrl: updated?.avatarUrl || current.avatarUrl,
        status: updated?.status || current.status,
      }));
      notification.success('Đã cập nhật hồ sơ');
    } catch (error) {
      notification.error(error?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notification.warning('Chỉ có thể tải lên file ảnh');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notification.warning('Ảnh phải nhỏ hơn 2MB');
      return;
    }

    setAvatarLoading(true);
    try {
      const uploadedUrl = await uploadAvatar(file);
      setProfile((current) => ({ ...current, avatarUrl: uploadedUrl }));
      notification.success('Ảnh đã tải lên. Bấm Lưu hồ sơ để cập nhật backend.');
    } catch (error) {
      notification.error(error?.message || 'Không thể tải avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <Alert type="warning" showIcon message="Bạn cần đăng nhập" description="Vui lòng đăng nhập để xem cài đặt tài khoản." />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Tài khoản của tôi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quản lý hồ sơ và dữ liệu booking theo capability backend hiện có.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Hồ sơ</TabsTrigger>
          <TabsTrigger value="security"><LockKeyhole className="mr-2 h-4 w-4" />Bảo mật</TabsTrigger>
          <TabsTrigger value="history"><Ticket className="mr-2 h-4 w-4" />Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Thông tin cá nhân</CardTitle><CardDescription>UserResponse được tải bằng UUID trong JWT; role từ JWT không bị ghi đè.</CardDescription></CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải hồ sơ...</div>
              ) : (
                <form onSubmit={saveProfile} className="space-y-5">
                  {profileCapability && <Alert type="info" showIcon message="Hồ sơ backend chưa đầy đủ" description={profileCapability} />}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20"><AvatarImage src={profile.avatarUrl} alt={displayName} /><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar>
                    <div className="space-y-2"><Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={avatarLoading}>{avatarLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}Chọn avatar</Button><p className="text-xs text-muted-foreground">Upload tối đa 2MB; URL chỉ được lưu vào User khi bấm Lưu hồ sơ.</p><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} /></div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="profile-name">Họ tên</Label><Input id="profile-name" value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} /></div>
                    <div className="space-y-2"><Label htmlFor="profile-email">Email</Label><Input id="profile-email" type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} /></div>
                    <div className="space-y-2"><Label htmlFor="profile-phone">Số điện thoại</Label><Input id="profile-phone" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} /></div>
                    <div className="space-y-2"><Label htmlFor="profile-birth">Ngày sinh</Label><Input id="profile-birth" type="date" value={profile.dateOfBirth} onChange={(event) => setProfile((current) => ({ ...current, dateOfBirth: event.target.value }))} /></div>
                    <div className="space-y-2"><Label htmlFor="profile-gender">Giới tính</Label><select id="profile-gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.gender} onChange={(event) => setProfile((current) => ({ ...current, gender: event.target.value }))}><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select></div>
                    <div className="space-y-2"><Label>Trạng thái tài khoản</Label><div className="flex h-10 items-center"><StatusBadge tone={profile.status === 'ACTIVE' ? 'success' : 'warning'}>{profile.status}</StatusBadge></div></div>
                  </div>

                  <div className="space-y-2"><Label htmlFor="profile-avatar">Avatar URL</Label><Input id="profile-avatar" value={profile.avatarUrl} onChange={(event) => setProfile((current) => ({ ...current, avatarUrl: event.target.value }))} /></div>

                  <div className="flex flex-wrap justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={loadProfile}><RefreshCw className="h-4 w-4" />Tải lại</Button><Button type="submit" disabled={savingProfile || Boolean(profileCapability)}>{savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu hồ sơ</Button></div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle>Bảo mật</CardTitle><CardDescription>Password lifecycle phải được xử lý bằng command backend chuyên dụng.</CardDescription></CardHeader>
            <CardContent>
              <Alert
                type="info"
                showIcon
                message="Đổi mật khẩu chưa khả dụng"
                description="Backend hiện chưa có endpoint đổi mật khẩu an toàn cho user đã đăng nhập. FE không ghi password/passwordHash qua generic User CRUD."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex-row items-center justify-between"><div><CardTitle>Lịch sử đặt vé</CardTitle><CardDescription>Chỉ tải qua endpoint booking theo phiên đăng nhập.</CardDescription></div><Button type="button" variant="outline" size="sm" onClick={loadHistory} disabled={historyLoading}>{historyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Làm mới</Button></CardHeader>
            <CardContent>
              {historyCapability && <Alert className="mb-4" type="info" showIcon message="Lịch sử booking chưa khả dụng" description={historyCapability} />}
              {historyLoading ? (
                <div className="flex min-h-36 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải lịch sử...</div>
              ) : history.length === 0 ? (
                <Empty description={historyCapability ? 'Cần backend ownership endpoint để hiển thị lịch sử.' : 'Bạn chưa có booking nào.'} />
              ) : (
                <div className="divide-y rounded-md border">
                  {history.map((booking) => {
                    const meta = statusMeta(booking.status || booking.bookingStatus || booking.paymentStatus);
                    const detailKey = MOCK_API_ENABLED ? (booking.bookingCode || booking.id) : booking.id;
                    return (
                      <div key={booking.id || booking.bookingCode} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="truncate">{booking.movieTitle || booking.movie?.title || booking.bookingCode || 'Booking'}</strong><StatusBadge tone={meta.tone}>{meta.label}</StatusBadge></div><p className="mt-1 text-xs text-muted-foreground">{booking.cinemaName || booking.cinema?.name || 'Rạp'} · {formatDateTime(booking.createdAt || booking.bookingDate)}</p><p className="mt-1 text-sm font-medium">{formatMoney(booking.totalAmount ?? booking.finalAmount ?? 0)}</p></div>
                        {detailKey && <Button asChild variant="outline" size="sm"><Link to={`/booking-detail/${encodeURIComponent(String(detailKey))}`}>Chi tiết<ExternalLink className="h-4 w-4" /></Link></Button>}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AccountSettings;
