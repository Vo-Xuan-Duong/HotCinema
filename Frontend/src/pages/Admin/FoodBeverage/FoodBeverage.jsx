import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Coffee, Edit, Eye, Loader2, Package, Plus, Sparkles, Trash2, TriangleAlert } from 'lucide-react';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import concessionService from '@/services/concessionService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_FORM = {
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  stock: '',
  description: '',
  image: '',
  isPopular: false,
};

const categoryMeta = (category) => {
  const normalized = String(category || '').toLowerCase();
  if (normalized === 'food') return { key: 'food', label: 'Đồ ăn', tone: 'warning' };
  if (normalized === 'drink') return { key: 'drink', label: 'Đồ uống', tone: 'info' };
  if (normalized === 'combo') return { key: 'combo', label: 'Combo', tone: 'success' };
  return { key: normalized || 'other', label: category || 'Khác', tone: 'neutral' };
};

const stockMeta = (stock) => {
  const value = Number(stock || 0);
  if (value <= 0) return { label: 'Hết hàng', tone: 'destructive' };
  if (value < 10) return { label: 'Sắp hết', tone: 'warning' };
  return { label: 'Còn hàng', tone: 'success' };
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const FoodBeverage = () => {
  const notification = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await concessionService.list({ page: 0, size: 500 });
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading concessions:', error);
      setProducts([]);
      notification.error(error?.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const stats = useMemo(() => ({
    total: products.length,
    popular: products.filter((item) => item.isPopular).length,
    lowStock: products.filter((item) => Number(item.stock || 0) > 0 && Number(item.stock || 0) < 10).length,
    outOfStock: products.filter((item) => Number(item.stock || 0) <= 0).length,
  }), [products]);

  const openCreate = () => {
    setSelectedProduct(null);
    setFormValues(DEFAULT_FORM);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setSelectedProduct(record);
    setFormValues({
      name: record.name || '',
      category: categoryMeta(record.category).key,
      price: record.price ?? '',
      originalPrice: record.originalPrice ?? '',
      stock: record.stock ?? '',
      description: record.description || '',
      image: record.image || record.imageUrl || '',
      isPopular: Boolean(record.isPopular),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedProduct(null);
    setFormValues(DEFAULT_FORM);
  };

  const openDetail = (record) => {
    setSelectedProduct(record);
    setDetailOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValues.name.trim()) {
      notification.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!formValues.category) {
      notification.error('Vui lòng chọn danh mục');
      return;
    }
    if (Number(formValues.price) <= 0) {
      notification.error('Giá bán phải lớn hơn 0');
      return;
    }
    if (formValues.stock === '' || Number(formValues.stock) < 0) {
      notification.error('Tồn kho phải lớn hơn hoặc bằng 0');
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      category: formValues.category,
      price: Number(formValues.price),
      originalPrice: Number(formValues.originalPrice) || Number(formValues.price),
      stock: Number(formValues.stock),
      description: formValues.description.trim(),
      image: formValues.image.trim() || '/brand-placeholder.svg',
      isPopular: Boolean(formValues.isPopular),
    };

    try {
      setSaving(true);
      if (selectedProduct) {
        await concessionService.update(selectedProduct.id, payload);
        notification.success('Cập nhật sản phẩm thành công');
      } else {
        await concessionService.create(payload);
        notification.success('Thêm sản phẩm thành công');
      }
      closeForm();
      await loadProducts();
    } catch (error) {
      console.error('Error saving concession:', error);
      notification.error(error?.message || 'Không thể lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Xóa sản phẩm ${record.name}?`)) return;
    try {
      await concessionService.delete(record.id);
      notification.success('Đã xóa sản phẩm');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting concession:', error);
      notification.error(error?.message || 'Không thể xóa sản phẩm');
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="flex min-w-[240px] items-center gap-3">
          <img
            src={record.image || record.imageUrl || '/brand-placeholder.svg'}
            alt={record.name}
            className="h-14 w-14 rounded-md border object-cover"
            onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
          />
          <div className="min-w-0">
            <button type="button" className="block max-w-full truncate text-left font-medium hover:text-primary" onClick={() => openDetail(record)}>
              {record.name}
            </button>
            <p className="line-clamp-1 text-xs text-muted-foreground">{record.description || 'Chưa có mô tả'}</p>
            {record.isPopular && <StatusBadge tone="warning" className="mt-1">Phổ biến</StatusBadge>}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const meta = categoryMeta(category);
        return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
      },
    },
    {
      title: 'Giá bán',
      key: 'price',
      render: (_, record) => (
        <div>
          <p className="font-medium text-foreground">{formatMoney(record.price)}</p>
          {Number(record.originalPrice || 0) > Number(record.price || 0) && (
            <p className="text-xs text-muted-foreground line-through">{formatMoney(record.originalPrice)}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => {
        const meta = stockMeta(stock);
        return (
          <div className="space-y-1">
            <p className="font-medium">{Number(stock || 0)}</p>
            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(record)} aria-label="Xem sản phẩm"><Eye className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiết</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Chỉnh sửa sản phẩm"><Edit className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(record)} aria-label="Xóa sản phẩm"><Trash2 className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Xóa</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  const tableFor = (category) => {
    const rows = category === 'all'
      ? products
      : products.filter((product) => categoryMeta(product.category).key === category);

    if (loading) {
      return (
        <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải sản phẩm...
        </div>
      );
    }
    if (rows.length === 0) return <Empty description="Không có sản phẩm trong danh mục này" />;
    return <DataTable fields={columns} rows={rows} getRowId="id" pageControls={false} />;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Đồ ăn & đồ uống"
        description="Quản lý menu concession, giá bán và tồn kho tại HotCinema."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Đồ ăn & đồ uống' },
        ]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Thêm sản phẩm</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng sản phẩm', value: stats.total, icon: Coffee },
          { label: 'Sản phẩm phổ biến', value: stats.popular, icon: Sparkles },
          { label: 'Sắp hết hàng', value: stats.lowStock, icon: TriangleAlert },
          { label: 'Hết hàng', value: stats.outOfStock, icon: Package },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách sản phẩm</CardTitle></CardHeader>
        <CardContent>
          <SegmentedTabs
            defaultSelectedId="all"
            sections={[
              { key: 'all', label: 'Tất cả', children: tableFor('all') },
              { key: 'food', label: 'Đồ ăn', children: tableFor('food') },
              { key: 'drink', label: 'Đồ uống', children: tableFor('drink') },
              { key: 'combo', label: 'Combo', children: tableFor('combo') },
            ]}
          />
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        description="Cập nhật thông tin bán hàng và tồn kho của sản phẩm."
        open={formOpen}
        onClose={closeForm}
        maxWidth={680}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Tên sản phẩm <span className="text-destructive">*</span></span>
              <Input value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} placeholder="Bắp rang bơ" required />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Danh mục <span className="text-destructive">*</span></span>
              <Select value={formValues.category} onValueChange={(value) => setFormValues((current) => ({ ...current, category: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Đồ ăn</SelectItem>
                  <SelectItem value="drink">Đồ uống</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium">
              <span>Giá bán <span className="text-destructive">*</span></span>
              <NumberStepper min={0} value={formValues.price} onValueChange={(value) => setFormValues((current) => ({ ...current, price: value ?? '' }))} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Giá gốc</span>
              <NumberStepper min={0} value={formValues.originalPrice} onValueChange={(value) => setFormValues((current) => ({ ...current, originalPrice: value ?? '' }))} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Tồn kho <span className="text-destructive">*</span></span>
              <NumberStepper min={0} value={formValues.stock} onValueChange={(value) => setFormValues((current) => ({ ...current, stock: value ?? '' }))} />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium">
            <span>Mô tả</span>
            <Textarea rows={3} value={formValues.description} onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả sản phẩm" />
          </label>

          <label className="block space-y-2 text-sm font-medium">
            <span>URL hình ảnh</span>
            <Input value={formValues.image} onChange={(event) => setFormValues((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." />
          </label>

          {formValues.image && (
            <img src={formValues.image} alt="Xem trước sản phẩm" className="h-28 w-28 rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
          )}

          <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
            <Checkbox checked={formValues.isPopular} onCheckedChange={(checked) => setFormValues((current) => ({ ...current, isPopular: checked === true }))} />
            <span><span className="font-medium">Sản phẩm phổ biến</span><span className="block text-xs text-muted-foreground">Đánh dấu để ưu tiên hiển thị trong menu.</span></span>
          </label>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{selectedProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết sản phẩm"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth={560}
        actions={selectedProduct ? [
          <Button key="close" variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>,
          <Button key="edit" onClick={() => { setDetailOpen(false); openEdit(selectedProduct); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedProduct && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img src={selectedProduct.image || selectedProduct.imageUrl || '/brand-placeholder.svg'} alt={selectedProduct.name} className="h-20 w-20 rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
              <div><h3 className="font-semibold">{selectedProduct.name}</h3><p className="text-sm text-muted-foreground">{selectedProduct.description || 'Chưa có mô tả'}</p></div>
            </div>
            <DetailList columns={2}>
              <DetailItem label="Danh mục"><StatusBadge tone={categoryMeta(selectedProduct.category).tone}>{categoryMeta(selectedProduct.category).label}</StatusBadge></DetailItem>
              <DetailItem label="Tồn kho"><StatusBadge tone={stockMeta(selectedProduct.stock).tone}>{Number(selectedProduct.stock || 0)} · {stockMeta(selectedProduct.stock).label}</StatusBadge></DetailItem>
              <DetailItem label="Giá bán">{formatMoney(selectedProduct.price)}</DetailItem>
              <DetailItem label="Giá gốc">{formatMoney(selectedProduct.originalPrice || selectedProduct.price)}</DetailItem>
              <DetailItem label="Phổ biến">{selectedProduct.isPopular ? 'Có' : 'Không'}</DetailItem>
            </DetailList>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default FoodBeverage;
