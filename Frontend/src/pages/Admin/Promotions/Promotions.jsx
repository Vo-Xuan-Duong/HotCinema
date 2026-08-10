import React, { useCallback, useEffect, useState } from 'react';
import { Ban, Clock, Copy, Edit, Eye, Gift, Loader2, PauseCircle, Percent, PlayCircle, Plus, Trash2 } from 'lucide-react';
import dayjs from '@/utils/dayjsConfig';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
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

const DEFAULT_FORM = {
  name: '',
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minPurchaseAmount: 0,
  maxDiscountAmount: 0,
  usageLimit: 100,
  startDate: '',
  endDate: '',
};

const discountTypes = [
  { value: 'PERCENTAGE', label: 'Giảm theo phần trăm' },
  { value: 'FIXED_AMOUNT', label: 'Giảm số tiền cố định' },
];

const statusMeta = (promotion) => {
  if (!promotion) return { key: 'expired', label: 'Hết hạn', tone: 'destructive', icon: Ban };
  const now = new Date();
  const start = new Date(promotion.startDate);
  const end = new Date(promotion.endDate);
  if (!Number.isNaN(start.getTime()) && start > now) return { key: 'scheduled', label: 'Chờ bắt đầu', tone: 'info', icon: Clock };
  if (!Number.isNaN(end.getTime()) && end < now) return { key: 'expired', label: 'Hết hạn', tone: 'destructive', icon: Ban };
  if (promotion.isActive === true) return { key: 'active', label: 'Đang hoạt động', tone: 'success', icon: PlayCircle };
  return { key: 'paused', label: 'Tạm dừng', tone: 'warning', icon: PauseCircle };
};

const extractPage = (response) => {
  if (Array.isArray(response)) return { content: response, totalElements: response.length };
  const content = Array.isArray(response?.content) ? response.content : [];
  return {
    content,
    totalElements: Number(response?.totalElements ?? response?.total ?? content.length),
  };
};

const toInputDateTime = (value) => value ? dayjs(value).format('YYYY-MM-DDTHH:mm') : '';
const toApiDateTime = (value) => value && value.split(':').length === 2 ? `${value}:00` : value || null;
const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const readableList = (values, preferredKeys = ['name', 'title']) => {
  if (!Array.isArray(values) || values.length === 0) return 'Không giới hạn';
  return values.map((item) => {
    if (typeof item !== 'object' || item === null) return String(item);
    for (const key of preferredKeys) {
      if (item[key]) return String(item[key]);
    }
    return String(item.id ?? '');
  }).filter(Boolean).join(', ') || 'Không giới hạn';
};

const Promotions = () => {
  const notification = useNotification();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await promotionService.getAllPromotions(
        pagination.current - 1,
        pagination.pageSize,
        'id,desc'
      );
      const page = extractPage(response);
      setPromotions(page.content);
      setPagination((current) => ({ ...current, total: page.totalElements }));
    } catch (error) {
      console.error('Error loading promotions:', error);
      setPromotions([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error('Không thể tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  const openCreate = () => {
    setEditingPromotion(null);
    setFormValues(DEFAULT_FORM);
    setFormOpen(true);
  };

  const openEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormValues({
      name: promotion.name || '',
      code: promotion.code || '',
      description: promotion.description || '',
      discountType: promotion.discountType || 'PERCENTAGE',
      discountValue: Number(promotion.discountValue || 0),
      minPurchaseAmount: Number(promotion.minPurchase ?? promotion.minPurchaseAmount ?? 0),
      maxDiscountAmount: Number(promotion.maxDiscount ?? promotion.maxDiscountAmount ?? 0),
      usageLimit: Number(promotion.usageLimit || 1),
      startDate: toInputDateTime(promotion.startDate),
      endDate: toInputDateTime(promotion.endDate),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPromotion(null);
    setFormValues(DEFAULT_FORM);
  };

  const openDetail = (promotion) => {
    setSelectedPromotion(promotion);
    setDetailOpen(true);
  };

  const validateForm = () => {
    if (!formValues.name.trim() || !formValues.code.trim() || !formValues.description.trim()) return 'Vui lòng điền đầy đủ thông tin bắt buộc';
    if (Number(formValues.discountValue) <= 0) return 'Giá trị giảm phải lớn hơn 0';
    if (formValues.discountType === 'PERCENTAGE' && Number(formValues.discountValue) > 100) return 'Giảm theo phần trăm không thể vượt quá 100%';
    if (Number(formValues.usageLimit) < 1) return 'Giới hạn sử dụng phải lớn hơn 0';
    if (!formValues.startDate || !formValues.endDate) return 'Vui lòng chọn thời gian áp dụng';
    if (new Date(formValues.startDate) >= new Date(formValues.endDate)) return 'Ngày bắt đầu phải trước ngày kết thúc';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const payload = {
      code: formValues.code.trim().toUpperCase(),
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      discountType: formValues.discountType,
      discountValue: Number(formValues.discountValue),
      startDate: toApiDateTime(formValues.startDate),
      endDate: toApiDateTime(formValues.endDate),
      minPurchase: Number(formValues.minPurchaseAmount || 0),
      maxDiscount: Number(formValues.maxDiscountAmount || 0),
      usageLimit: Number(formValues.usageLimit),
    };

    try {
      setSaving(true);
      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion.id, payload);
        notification.success('Cập nhật khuyến mãi thành công');
      } else {
        await promotionService.createPromotion(payload);
        notification.success('Tạo khuyến mãi thành công');
      }
      closeForm();
      await loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      notification.error(error?.response?.data?.message || 'Không thể lưu khuyến mãi');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promotion) => {
    const meta = statusMeta(promotion);
    if (meta.key === 'expired') return;
    try {
      setBusyId(promotion.id);
      if (promotion.isActive === true) {
        await promotionService.deactivatePromotion(promotion.id);
        notification.success('Đã tạm dừng khuyến mãi');
      } else {
        await promotionService.activatePromotion(promotion.id);
        notification.success('Đã kích hoạt khuyến mãi');
      }
      await loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      notification.error(error?.response?.data?.message || 'Không thể thay đổi trạng thái khuyến mãi');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (promotion) => {
    if (!window.confirm(`Xóa khuyến mãi ${promotion.name}? Hành động này không thể hoàn tác.`)) return;
    try {
      setBusyId(promotion.id);
      await promotionService.deletePromotion(promotion.id);
      notification.success('Đã xóa khuyến mãi');
      if (promotions.length === 1 && pagination.current > 1) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadPromotions();
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      notification.error(error?.response?.data?.message || 'Không thể xóa khuyến mãi');
    } finally {
      setBusyId(null);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      notification.success('Đã sao chép mã khuyến mãi');
    } catch {
      notification.error('Không thể sao chép mã khuyến mãi');
    }
  };

  const columns = [
    {
      title: 'Khuyến mãi',
      key: 'promotion',
      render: (_, record) => (
        <div className="min-w-[220px] space-y-2">
          <button type="button" onClick={() => openDetail(record)} className="block max-w-full truncate text-left font-medium hover:text-primary">{record.name}</button>
          <div className="flex items-center gap-1.5">
            <StatusBadge tone="info">{record.code}</StatusBadge>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(record.code)} aria-label="Sao chép mã khuyến mãi"><Copy className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Mức giảm',
      key: 'discount',
      render: (_, record) => {
        const percentage = String(record.discountType).toUpperCase() === 'PERCENTAGE';
        return (
          <div className="space-y-1">
            <StatusBadge tone={percentage ? 'info' : 'warning'}>{percentage ? 'Phần trăm' : 'Cố định'}</StatusBadge>
            <p className="font-medium">{percentage ? `${Number(record.discountValue || 0)}%` : money(record.discountValue)}</p>
          </div>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'period',
      render: (_, record) => (
        <div className="text-sm">
          <p>{dayjs(record.startDate).format('DD/MM/YYYY')}</p>
          <p className="text-xs text-muted-foreground">đến {dayjs(record.endDate).format('DD/MM/YYYY')}</p>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const meta = statusMeta(record);
        const Icon = meta.icon;
        return <StatusBadge tone={meta.tone} leading={<Icon className="h-3.5 w-3.5" />}>{meta.label}</StatusBadge>;
      },
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      render: (_, record) => {
        const used = Number(record.usedCount || 0);
        const limit = Number(record.usageLimit || 0);
        const value = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
        return (
          <div className="min-w-32 space-y-1">
            <p className="text-sm">{used}/{limit || '∞'}</p>
            {limit > 0 && <Progress value={value} status={value >= 90 ? 'exception' : value >= 70 ? 'warning' : 'normal'} />}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const meta = statusMeta(record);
        const busy = busyId === record.id;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(record)} aria-label="Xem khuyến mãi"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xem chi tiết</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Chỉnh sửa khuyến mãi"><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chỉnh sửa</TooltipContent></Tooltip>
              {meta.key !== 'expired' && (
                <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => handleToggle(record)} aria-label={record.isActive ? 'Tạm dừng khuyến mãi' : 'Kích hoạt khuyến mãi'}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : record.isActive ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>{record.isActive ? 'Tạm dừng' : 'Kích hoạt'}</TooltipContent></Tooltip>
              )}
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={busy} onClick={() => handleDelete(record)} aria-label="Xóa khuyến mãi"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xóa</TooltipContent></Tooltip>
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
        description="Tạo voucher, quản lý thời gian áp dụng, giới hạn sử dụng và trạng thái kích hoạt."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Khuyến mãi' },
        ]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Tạo khuyến mãi</Button>}
      />

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách khuyến mãi</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải khuyến mãi...</div>
          ) : promotions.length === 0 ? (
            <Empty description="Chưa có khuyến mãi nào" />
          ) : (
            <DataTable fields={columns} rows={promotions} getRowId="id" pageControls={false} />
          )}
          {pagination.total > 0 && (
            <Pagination
              className="mt-5 border-t pt-5"
              page={pagination.current}
              itemsPerPage={pagination.pageSize}
              totalItems={pagination.total}
              allowPageSizeChange
              allowPageJump
              onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))}
              onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} khuyến mãi`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
        description="Lượt đã sử dụng được hệ thống ghi nhận tự động và không thể chỉnh sửa thủ công."
        open={formOpen}
        onClose={closeForm}
        maxWidth={820}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Tên khuyến mãi <span className="text-destructive">*</span></span><Input value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} placeholder="Giảm 20% vé cuối tuần" required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Mã voucher <span className="text-destructive">*</span></span><Input value={formValues.code} onChange={(event) => setFormValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="WEEKEND20" className="uppercase" required /></label>
          </div>

          <label className="block space-y-2 text-sm font-medium"><span>Mô tả <span className="text-destructive">*</span></span><Textarea value={formValues.description} onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Điều kiện và nội dung chương trình" required /></label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2 text-sm font-medium"><span>Loại giảm</span><Select value={formValues.discountType} onValueChange={(value) => setFormValues((current) => ({ ...current, discountType: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{discountTypes.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Giá trị giảm</span><NumberStepper min={0} value={formValues.discountValue} onValueChange={(value) => setFormValues((current) => ({ ...current, discountValue: value ?? 0 }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Đơn tối thiểu</span><NumberStepper min={0} value={formValues.minPurchaseAmount} onValueChange={(value) => setFormValues((current) => ({ ...current, minPurchaseAmount: value ?? 0 }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Giảm tối đa</span><NumberStepper min={0} value={formValues.maxDiscountAmount} onValueChange={(value) => setFormValues((current) => ({ ...current, maxDiscountAmount: value ?? 0 }))} /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium"><span>Giới hạn sử dụng</span><NumberStepper min={1} value={formValues.usageLimit} onValueChange={(value) => setFormValues((current) => ({ ...current, usageLimit: value ?? 1 }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Bắt đầu <span className="text-destructive">*</span></span><Input type="datetime-local" value={formValues.startDate} onChange={(event) => setFormValues((current) => ({ ...current, startDate: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Kết thúc <span className="text-destructive">*</span></span><Input type="datetime-local" value={formValues.endDate} onChange={(event) => setFormValues((current) => ({ ...current, endDate: event.target.value }))} required /></label>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeForm}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{editingPromotion ? 'Lưu thay đổi' : 'Tạo khuyến mãi'}</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết khuyến mãi"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth={760}
        actions={selectedPromotion ? [
          <Button key="close" variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>,
          <Button key="edit" onClick={() => { setDetailOpen(false); openEdit(selectedPromotion); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedPromotion && (() => {
          const meta = statusMeta(selectedPromotion);
          const Icon = meta.icon;
          const percentage = String(selectedPromotion.discountType).toUpperCase() === 'PERCENTAGE';
          return (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2"><StatusBadge tone="info">{selectedPromotion.code}</StatusBadge><StatusBadge tone={meta.tone} leading={<Icon className="h-3.5 w-3.5" />}>{meta.label}</StatusBadge></div>
              <p className="text-sm text-muted-foreground">{selectedPromotion.description || 'Chưa có mô tả'}</p>
              <DetailList columns={2}>
                <DetailItem label="Mức giảm">{percentage ? `${Number(selectedPromotion.discountValue || 0)}%` : money(selectedPromotion.discountValue)}</DetailItem>
                <DetailItem label="Lượt sử dụng">{Number(selectedPromotion.usedCount || 0)} / {Number(selectedPromotion.usageLimit || 0) || 'Không giới hạn'}</DetailItem>
                <DetailItem label="Đơn tối thiểu">{money(selectedPromotion.minPurchase ?? selectedPromotion.minPurchaseAmount)}</DetailItem>
                <DetailItem label="Giảm tối đa">{money(selectedPromotion.maxDiscount ?? selectedPromotion.maxDiscountAmount)}</DetailItem>
                <DetailItem label="Bắt đầu">{dayjs(selectedPromotion.startDate).format('DD/MM/YYYY HH:mm')}</DetailItem>
                <DetailItem label="Kết thúc">{dayjs(selectedPromotion.endDate).format('DD/MM/YYYY HH:mm')}</DetailItem>
                {selectedPromotion.applicableMovies?.length > 0 && <DetailItem label="Phim áp dụng" wide>{readableList(selectedPromotion.applicableMovies, ['title', 'name'])}</DetailItem>}
                {selectedPromotion.applicableCinemas?.length > 0 && <DetailItem label="Rạp áp dụng" wide>{readableList(selectedPromotion.applicableCinemas, ['name'])}</DetailItem>}
                {selectedPromotion.applicableDays?.length > 0 && <DetailItem label="Ngày áp dụng" wide>{readableList(selectedPromotion.applicableDays)}</DetailItem>}
              </DetailList>
            </div>
          );
        })()}
      </ResponsiveDialog>
    </div>
  );
};

export default Promotions;
