import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, Clock, Copy, Edit, Eye, Gift, KeyRound, Loader2, PauseCircle, Percent, Plus, Trash2 } from 'lucide-react';
import dayjs from '@/utils/dayjsConfig';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Pagination } from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import promotionService from '@/services/promotionService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_RULE_FORM = {
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minimumOrderAmount: 0,
  maxDiscountAmount: 0,
  usageLimit: 100,
  usagePerUser: 1,
  startAt: '',
  endAt: '',
  status: 'DRAFT',
};

const DEFAULT_CODE_FORM = {
  id: null,
  code: '',
  usageLimit: 100,
  usedCount: 0,
  active: true,
};

const DISCOUNT_TYPES = [
  ['PERCENTAGE', 'Giảm theo phần trăm'],
  ['FIXED_AMOUNT', 'Giảm số tiền cố định'],
];

const RULE_STATUSES = [
  ['DRAFT', 'Bản nháp'],
  ['ACTIVE', 'Đang hoạt động'],
  ['INACTIVE', 'Tạm dừng'],
  ['EXPIRED', 'Hết hạn'],
];

const ruleStatusMeta = (promotion) => {
  const status = String(promotion?.status || 'DRAFT').toUpperCase();
  const now = dayjs();
  const start = promotion?.startAt ? dayjs(promotion.startAt) : null;
  const end = promotion?.endAt ? dayjs(promotion.endAt) : null;

  if (status === 'EXPIRED' || (end?.isValid() && end.isBefore(now))) {
    return { key: 'EXPIRED', label: 'Hết hạn', tone: 'destructive', icon: Ban };
  }
  if (status === 'DRAFT') return { key: 'DRAFT', label: 'Bản nháp', tone: 'neutral', icon: Clock };
  if (start?.isValid() && start.isAfter(now) && status === 'ACTIVE') {
    return { key: 'SCHEDULED', label: 'Chờ bắt đầu', tone: 'info', icon: Clock };
  }
  if (status === 'ACTIVE') return { key: 'ACTIVE', label: 'Đang hoạt động', tone: 'success', icon: CheckCircle2 };
  return { key: 'INACTIVE', label: 'Tạm dừng', tone: 'warning', icon: PauseCircle };
};

const extractPage = (response) => {
  if (Array.isArray(response)) return { content: response, totalElements: response.length };
  const content = Array.isArray(response?.content) ? response.content : [];
  return {
    content,
    totalElements: Number(response?.totalElements ?? response?.total ?? content.length),
  };
};

const toInputDateTime = (value) => value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '';
const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
const formatDateTime = (value) => value && dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';

const discountLabel = (promotion) => promotion.discountType === 'PERCENTAGE'
  ? `${Number(promotion.discountValue || 0).toLocaleString('vi-VN')}%`
  : money(promotion.discountValue);

const Promotions = () => {
  const notification = useNotification();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [ruleFormOpen, setRuleFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [codesOpen, setCodesOpen] = useState(false);
  const [codeFormOpen, setCodeFormOpen] = useState(false);
  const [codesLoading, setCodesLoading] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [ruleForm, setRuleForm] = useState(DEFAULT_RULE_FORM);
  const [codes, setCodes] = useState([]);
  const [codeForm, setCodeForm] = useState(DEFAULT_CODE_FORM);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await promotionService.getAllPromotions(
        pagination.current - 1,
        pagination.pageSize,
        'createdAt,desc',
      );
      const page = extractPage(response);
      setPromotions(page.content);
      setPagination((current) => ({ ...current, total: page.totalElements }));
    } catch (error) {
      console.error('Error loading promotions:', error);
      setPromotions([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error(error?.message || 'Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [notification, pagination.current, pagination.pageSize]);

  useEffect(() => { loadPromotions(); }, [loadPromotions]);

  const pageStats = useMemo(() => ({
    active: promotions.filter((promotion) => ruleStatusMeta(promotion).key === 'ACTIVE').length,
    scheduled: promotions.filter((promotion) => ruleStatusMeta(promotion).key === 'SCHEDULED').length,
    inactive: promotions.filter((promotion) => ['DRAFT', 'INACTIVE'].includes(ruleStatusMeta(promotion).key)).length,
  }), [promotions]);

  const openCreate = () => {
    setEditingPromotion(null);
    setRuleForm(DEFAULT_RULE_FORM);
    setRuleFormOpen(true);
  };

  const openEdit = (promotion) => {
    setEditingPromotion(promotion);
    setRuleForm({
      name: promotion.name || '',
      description: promotion.description || '',
      discountType: promotion.discountType || 'PERCENTAGE',
      discountValue: Number(promotion.discountValue || 0),
      minimumOrderAmount: Number(promotion.minimumOrderAmount || 0),
      maxDiscountAmount: Number(promotion.maxDiscountAmount || 0),
      usageLimit: Number(promotion.usageLimit || 0),
      usagePerUser: Number(promotion.usagePerUser || 1),
      startAt: toInputDateTime(promotion.startAt),
      endAt: toInputDateTime(promotion.endAt),
      status: String(promotion.status || 'DRAFT').toUpperCase(),
    });
    setRuleFormOpen(true);
  };

  const closeRuleForm = () => {
    setRuleFormOpen(false);
    setEditingPromotion(null);
    setRuleForm(DEFAULT_RULE_FORM);
  };

  const validateRule = () => {
    if (!ruleForm.name.trim() || !ruleForm.description.trim()) return 'Vui lòng nhập tên và mô tả khuyến mãi';
    if (Number(ruleForm.discountValue) <= 0) return 'Giá trị giảm phải lớn hơn 0';
    if (ruleForm.discountType === 'PERCENTAGE' && Number(ruleForm.discountValue) > 100) return 'Giảm phần trăm không thể vượt 100%';
    if (Number(ruleForm.minimumOrderAmount) < 0 || Number(ruleForm.maxDiscountAmount) < 0) return 'Các ngưỡng tiền không được âm';
    if (Number(ruleForm.usageLimit) < 1) return 'Usage limit phải lớn hơn 0';
    if (Number(ruleForm.usagePerUser) < 1 || Number(ruleForm.usagePerUser) > Number(ruleForm.usageLimit)) return 'Usage per user phải từ 1 đến usage limit';
    if (!ruleForm.startAt || !ruleForm.endAt) return 'Vui lòng nhập thời gian bắt đầu và kết thúc';
    if (!dayjs(ruleForm.startAt).isBefore(dayjs(ruleForm.endAt))) return 'Thời gian bắt đầu phải trước thời gian kết thúc';
    return null;
  };

  const saveRule = async (event) => {
    event.preventDefault();
    const validationError = validateRule();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const payload = {
      name: ruleForm.name.trim(),
      description: ruleForm.description.trim(),
      discountType: ruleForm.discountType,
      discountValue: Number(ruleForm.discountValue),
      maxDiscountAmount: Number(ruleForm.maxDiscountAmount),
      minimumOrderAmount: Number(ruleForm.minimumOrderAmount),
      startAt: ruleForm.startAt,
      endAt: ruleForm.endAt,
      usageLimit: Number(ruleForm.usageLimit),
      usagePerUser: Number(ruleForm.usagePerUser),
      status: ruleForm.status,
    };

    setSaving(true);
    try {
      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, payload);
        notification.success('Cập nhật rule khuyến mãi thành công');
      } else {
        await promotionService.createPromotion(payload);
        notification.success('Tạo rule khuyến mãi thành công');
      }
      closeRuleForm();
      await loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu khuyến mãi');
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (promotion) => {
    const meta = ruleStatusMeta(promotion);
    if (meta.key === 'EXPIRED') return;
    setBusyId(promotion.id);
    try {
      if (String(promotion.status).toUpperCase() === 'ACTIVE') {
        await promotionService.deactivatePromotion(promotion.id);
        notification.success('Đã tạm dừng khuyến mãi');
      } else {
        await promotionService.activatePromotion(promotion.id);
        notification.success('Đã kích hoạt khuyến mãi');
      }
      await loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      notification.error(error?.message || 'Không thể thay đổi trạng thái khuyến mãi');
    } finally {
      setBusyId(null);
    }
  };

  const deleteRule = async (promotion) => {
    if (!window.confirm(`Xóa rule “${promotion.name}”? Các PromotionCode liên quan có thể bị ràng buộc bởi backend.`)) return;
    setBusyId(promotion.id);
    try {
      await promotionService.deletePromotion(promotion.id);
      notification.success('Đã xóa rule khuyến mãi');
      if (promotions.length === 1 && pagination.current > 1) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadPromotions();
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa khuyến mãi');
    } finally {
      setBusyId(null);
    }
  };

  const loadCodes = useCallback(async (promotion) => {
    if (!promotion?.id) return;
    setCodesLoading(true);
    try {
      const rows = await promotionService.listCodesForPromotion(promotion.id);
      setCodes(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error('Error loading promotion codes:', error);
      setCodes([]);
      notification.error(error?.message || 'Không thể tải mã khuyến mãi');
    } finally {
      setCodesLoading(false);
    }
  }, [notification]);

  const openCodes = async (promotion) => {
    setSelectedPromotion(promotion);
    setCodesOpen(true);
    await loadCodes(promotion);
  };

  const openCreateCode = () => {
    setCodeForm({
      ...DEFAULT_CODE_FORM,
      usageLimit: Math.max(1, Number(selectedPromotion?.usageLimit || 100)),
    });
    setCodeFormOpen(true);
  };

  const openEditCode = (code) => {
    setCodeForm({
      id: code.id,
      code: code.code,
      usageLimit: Number(code.usageLimit || 0),
      usedCount: Number(code.usedCount || 0),
      active: Boolean(code.active),
    });
    setCodeFormOpen(true);
  };

  const validateCode = () => {
    if (!codeForm.code.trim()) return 'Vui lòng nhập code';
    if (!/^[A-Z0-9_-]+$/.test(codeForm.code.trim().toUpperCase())) return 'Code chỉ dùng chữ in hoa, số, _ hoặc -';
    if (Number(codeForm.usageLimit) < 1) return 'Usage limit của code phải lớn hơn 0';
    if (Number(codeForm.usedCount) < 0 || Number(codeForm.usedCount) > Number(codeForm.usageLimit)) return 'Used count phải nằm trong usage limit';
    return null;
  };

  const saveCode = async (event) => {
    event.preventDefault();
    if (!selectedPromotion?.id) return;
    const validationError = validateCode();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        promotionId: selectedPromotion.id,
        code: codeForm.code.trim().toUpperCase(),
        usageLimit: Number(codeForm.usageLimit),
        usedCount: Number(codeForm.usedCount),
        active: codeForm.active,
      };
      if (codeForm.id) {
        await promotionService.updateCode(codeForm.id, payload);
        notification.success('Cập nhật promotion code thành công');
      } else {
        await promotionService.createCode(selectedPromotion.id, payload);
        notification.success('Tạo promotion code thành công');
      }
      setCodeFormOpen(false);
      setCodeForm(DEFAULT_CODE_FORM);
      await loadCodes(selectedPromotion);
    } catch (error) {
      console.error('Error saving promotion code:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu promotion code');
    } finally {
      setSaving(false);
    }
  };

  const toggleCode = async (code) => {
    setBusyId(code.id);
    try {
      await promotionService.toggleCode(code, !code.active);
      notification.success(code.active ? 'Đã tắt code' : 'Đã bật code');
      await loadCodes(selectedPromotion);
    } catch (error) {
      notification.error(error?.message || 'Không thể đổi trạng thái code');
    } finally {
      setBusyId(null);
    }
  };

  const deleteCode = async (code) => {
    if (!window.confirm(`Xóa code ${code.code}?`)) return;
    setBusyId(code.id);
    try {
      await promotionService.deleteCode(code, selectedPromotion?.id);
      notification.success('Đã xóa promotion code');
      await loadCodes(selectedPromotion);
    } catch (error) {
      notification.error(error?.message || 'Không thể xóa promotion code');
    } finally {
      setBusyId(null);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      notification.success('Đã sao chép code');
    } catch {
      notification.error('Không thể sao chép code');
    }
  };

  const columns = [
    {
      title: 'Rule khuyến mãi',
      key: 'promotion',
      render: (_, record) => (
        <div className="min-w-[240px]">
          <button type="button" onClick={() => { setSelectedPromotion(record); setDetailOpen(true); }} className="block max-w-full truncate text-left font-medium hover:text-primary">{record.name}</button>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{record.description}</p>
        </div>
      ),
    },
    {
      title: 'Mức giảm',
      key: 'discount',
      render: (_, record) => <div><p className="font-semibold text-primary">{discountLabel(record)}</p><p className="text-xs text-muted-foreground">Đơn tối thiểu {money(record.minimumOrderAmount)}</p></div>,
    },
    {
      title: 'Thời gian',
      key: 'period',
      render: (_, record) => <div className="min-w-[170px] text-xs"><p>{formatDateTime(record.startAt)}</p><p className="text-muted-foreground">→ {formatDateTime(record.endAt)}</p></div>,
    },
    {
      title: 'Giới hạn',
      key: 'limit',
      render: (_, record) => <div><p className="font-medium">{Number(record.usageLimit || 0).toLocaleString('vi-VN')} lượt</p><p className="text-xs text-muted-foreground">{Number(record.usagePerUser || 0)} / user</p></div>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const meta = ruleStatusMeta(record);
        const Icon = meta.icon;
        return <StatusBadge tone={meta.tone} leading={<Icon className="h-3 w-3" />}>{meta.label}</StatusBadge>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const busy = busyId === record.id;
        const active = String(record.status).toUpperCase() === 'ACTIVE';
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedPromotion(record); setDetailOpen(true); }} aria-label="Xem rule"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chi tiết rule</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCodes(record)} aria-label="Quản lý code"><KeyRound className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Promotion codes</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Sửa rule"><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chỉnh sửa</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy || ruleStatusMeta(record).key === 'EXPIRED'} onClick={() => toggleRule(record)} aria-label={active ? 'Tạm dừng' : 'Kích hoạt'}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <PauseCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>{active ? 'Tạm dừng' : 'Kích hoạt'}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={busy} onClick={() => deleteRule(record)} aria-label="Xóa rule"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xóa rule</TooltipContent></Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý khuyến mãi"
        description="Promotion là rule giảm giá; PromotionCode là mã coupon riêng liên kết tới rule."
        breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Khuyến mãi' }]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Thêm rule</Button>}
      />

      <Alert type="info" showIcon message="Rule và code được quản lý độc lập" description="Một Promotion có thể có nhiều PromotionCode trên backend. Booking lookup theo code sẽ resolve code trước, sau đó áp dụng rule tương ứng." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Tổng rule</p><p className="mt-1 text-2xl font-semibold">{pagination.total}</p></div><Gift className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Active trên trang</p><p className="mt-1 text-2xl font-semibold">{pageStats.active}</p></div><Percent className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Chờ / tạm dừng</p><p className="mt-1 text-2xl font-semibold">{pageStats.scheduled + pageStats.inactive}</p></div><Clock className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách promotion rule</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải khuyến mãi...</div>
          ) : promotions.length === 0 ? (
            <Empty description="Chưa có promotion rule" />
          ) : (
            <DataTable fields={columns} rows={promotions} getRowId="id" pageControls={false} />
          )}
          {pagination.total > 0 && <Pagination className="mt-5 border-t pt-5" page={pagination.current} itemsPerPage={pagination.pageSize} totalItems={pagination.total} allowPageSizeChange allowPageJump onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))} onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))} showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} rule`} />}
        </CardContent>
      </Card>

      <ResponsiveDialog heading={editingPromotion ? 'Chỉnh sửa promotion rule' : 'Thêm promotion rule'} open={ruleFormOpen} onClose={closeRuleForm} maxWidth={780}>
        <form onSubmit={saveRule} className="space-y-5">
          <label className="block space-y-2 text-sm font-medium"><span>Tên *</span><Input value={ruleForm.name} onChange={(event) => setRuleForm((current) => ({ ...current, name: event.target.value }))} required /></label>
          <label className="block space-y-2 text-sm font-medium"><span>Mô tả *</span><Textarea rows={3} value={ruleForm.description} onChange={(event) => setRuleForm((current) => ({ ...current, description: event.target.value }))} required /></label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium"><span>Loại giảm *</span><Select value={ruleForm.discountType} onValueChange={(value) => setRuleForm((current) => ({ ...current, discountType: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DISCOUNT_TYPES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Giá trị giảm *</span><NumberStepper min={0} value={ruleForm.discountValue} onValueChange={(value) => setRuleForm((current) => ({ ...current, discountValue: value ?? 0 }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Giảm tối đa</span><NumberStepper min={0} value={ruleForm.maxDiscountAmount} onValueChange={(value) => setRuleForm((current) => ({ ...current, maxDiscountAmount: value ?? 0 }))} /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium"><span>Đơn tối thiểu</span><NumberStepper min={0} value={ruleForm.minimumOrderAmount} onValueChange={(value) => setRuleForm((current) => ({ ...current, minimumOrderAmount: value ?? 0 }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Usage limit *</span><NumberStepper min={1} value={ruleForm.usageLimit} onValueChange={(value) => setRuleForm((current) => ({ ...current, usageLimit: value ?? 1 }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Usage / user *</span><NumberStepper min={1} value={ruleForm.usagePerUser} onValueChange={(value) => setRuleForm((current) => ({ ...current, usagePerUser: value ?? 1 }))} /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Bắt đầu *</span><Input type="datetime-local" value={ruleForm.startAt} onChange={(event) => setRuleForm((current) => ({ ...current, startAt: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Kết thúc *</span><Input type="datetime-local" value={ruleForm.endAt} onChange={(event) => setRuleForm((current) => ({ ...current, endAt: event.target.value }))} required /></label>
          </div>

          <label className="block space-y-2 text-sm font-medium"><span>Trạng thái *</span><Select value={ruleForm.status} onValueChange={(value) => setRuleForm((current) => ({ ...current, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RULE_STATUSES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>

          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeRuleForm}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingPromotion ? 'Lưu rule' : 'Tạo rule'}</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog heading="Chi tiết promotion rule" open={detailOpen} onClose={() => { setDetailOpen(false); setSelectedPromotion(null); }} maxWidth={720} actions={selectedPromotion ? [<Button key="close" variant="outline" onClick={() => { setDetailOpen(false); setSelectedPromotion(null); }}>Đóng</Button>, <Button key="codes" variant="outline" onClick={() => { setDetailOpen(false); openCodes(selectedPromotion); }}><KeyRound className="h-4 w-4" />Codes</Button>, <Button key="edit" onClick={() => { const promotion = selectedPromotion; setDetailOpen(false); openEdit(promotion); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>] : null}>
        {selectedPromotion && (
          <DetailList columns={2}>
            <DetailItem label="Tên">{selectedPromotion.name}</DetailItem>
            <DetailItem label="Trạng thái">{ruleStatusMeta(selectedPromotion).label}</DetailItem>
            <DetailItem label="Loại giảm">{DISCOUNT_TYPES.find(([value]) => value === selectedPromotion.discountType)?.[1] || selectedPromotion.discountType}</DetailItem>
            <DetailItem label="Giá trị">{discountLabel(selectedPromotion)}</DetailItem>
            <DetailItem label="Đơn tối thiểu">{money(selectedPromotion.minimumOrderAmount)}</DetailItem>
            <DetailItem label="Giảm tối đa">{money(selectedPromotion.maxDiscountAmount)}</DetailItem>
            <DetailItem label="Usage limit">{selectedPromotion.usageLimit}</DetailItem>
            <DetailItem label="Usage / user">{selectedPromotion.usagePerUser}</DetailItem>
            <DetailItem label="Bắt đầu">{formatDateTime(selectedPromotion.startAt)}</DetailItem>
            <DetailItem label="Kết thúc">{formatDateTime(selectedPromotion.endAt)}</DetailItem>
            <DetailItem label="Mô tả" wide>{selectedPromotion.description}</DetailItem>
            <DetailItem label="Promotion ID" wide>{selectedPromotion.id}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>

      <ResponsiveDialog heading={`Promotion codes${selectedPromotion?.name ? ` · ${selectedPromotion.name}` : ''}`} open={codesOpen} onClose={() => { setCodesOpen(false); setCodes([]); setSelectedPromotion(null); }} maxWidth={820} actions={<Button onClick={openCreateCode} disabled={!selectedPromotion}><Plus className="h-4 w-4" />Thêm code</Button>}>
        {codesLoading ? (
          <div className="flex min-h-36 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải code...</div>
        ) : codes.length === 0 ? (
          <Empty description="Rule này chưa có promotion code" />
        ) : (
          <div className="space-y-3">
            {codes.map((code) => {
              const percent = code.usageLimit > 0 ? Math.min(100, (Number(code.usedCount || 0) / Number(code.usageLimit)) * 100) : 0;
              const busy = busyId === code.id;
              return (
                <Card key={code.id || code.code} className="shadow-none">
                  <CardContent className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_180px_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><StatusBadge tone={code.active ? 'success' : 'neutral'}>{code.code}</StatusBadge><Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(code.code)}><Copy className="h-3.5 w-3.5" /></Button></div>
                      <div className="mt-2 flex items-center gap-2"><Progress value={percent} className="h-2 flex-1" /><span className="text-xs text-muted-foreground">{code.usedCount}/{code.usageLimit}</span></div>
                    </div>
                    <StatusBadge tone={code.active ? 'success' : 'neutral'}>{code.active ? 'Đang dùng' : 'Đã tắt'}</StatusBadge>
                    <div className="flex items-center gap-1 md:justify-end"><Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => openEditCode(code)}><Edit className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => toggleCode(code)}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : code.active ? <PauseCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</Button><Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={busy} onClick={() => deleteCode(code)}><Trash2 className="h-4 w-4" /></Button></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ResponsiveDialog>

      <ResponsiveDialog heading={codeForm.id ? 'Chỉnh sửa promotion code' : 'Thêm promotion code'} open={codeFormOpen} onClose={() => { setCodeFormOpen(false); setCodeForm(DEFAULT_CODE_FORM); }} maxWidth={560}>
        <form onSubmit={saveCode} className="space-y-5">
          <label className="block space-y-2 text-sm font-medium"><span>Code *</span><Input value={codeForm.code} onChange={(event) => setCodeForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="SUMMER2026" required /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium"><span>Usage limit *</span><NumberStepper min={1} value={codeForm.usageLimit} onValueChange={(value) => setCodeForm((current) => ({ ...current, usageLimit: value ?? 1 }))} /></label><label className="space-y-2 text-sm font-medium"><span>Used count *</span><NumberStepper min={0} value={codeForm.usedCount} onValueChange={(value) => setCodeForm((current) => ({ ...current, usedCount: value ?? 0 }))} /></label></div>
          <label className="block space-y-2 text-sm font-medium"><span>Trạng thái *</span><Select value={codeForm.active ? 'active' : 'inactive'} onValueChange={(value) => setCodeForm((current) => ({ ...current, active: value === 'active' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Đang hoạt động</SelectItem><SelectItem value="inactive">Tạm tắt</SelectItem></SelectContent></Select></label>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => { setCodeFormOpen(false); setCodeForm(DEFAULT_CODE_FORM); }}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{codeForm.id ? 'Lưu code' : 'Tạo code'}</Button></div>
        </form>
      </ResponsiveDialog>
    </div>
  );
};

export default Promotions;
