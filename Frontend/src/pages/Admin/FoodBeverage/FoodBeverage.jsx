import { useCallback, useEffect, useMemo, useState } from 'react';
import { Coffee, Edit, Eye, Loader2, Package, Plus, Store, Trash2, TriangleAlert } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import cinemaService from '@/services/cinemaService';
import concessionService from '@/services/concessionService';
import useNotification from '@/hooks/useNotification';
import { sameResourceId } from '@/utils/resourceId';

const EMPTY_FORM = {
  code: '',
  name: '',
  categoryId: '',
  price: '',
  stock: '',
  description: '',
  imageUrl: '',
  status: 'ACTIVE',
  isAvailable: true,
};

const formatMoney = (value) => value == null
  ? 'Chưa cấu hình'
  : `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const stockMeta = (stock, available = true) => {
  if (!available) return { label: 'Ngừng bán', tone: 'neutral' };
  const value = Number(stock || 0);
  if (value <= 0) return { label: 'Hết hàng', tone: 'destructive' };
  if (value < 10) return { label: 'Sắp hết', tone: 'warning' };
  return { label: 'Còn hàng', tone: 'success' };
};

const makeProductCode = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .slice(0, 40);

const FoodBeverage = () => {
  const notification = useNotification();
  const [cinemas, setCinemas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);

  const selectedCinema = useMemo(
    () => cinemas.find((cinema) => sameResourceId(cinema.id, selectedCinemaId)) || null,
    [cinemas, selectedCinemaId],
  );

  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      setMetadataLoading(true);
      try {
        const [cinemaRows, categoryRows] = await Promise.all([
          cinemaService.getAllCinemasNoPagination(),
          concessionService.getCategories(),
        ]);
        if (cancelled) return;

        const activeCinemas = (Array.isArray(cinemaRows) ? cinemaRows : [])
          .filter((cinema) => cinema.status !== 'INACTIVE');
        const normalizedCategories = Array.isArray(categoryRows) ? categoryRows : [];

        setCinemas(activeCinemas);
        setCategories(normalizedCategories);
        setSelectedCinemaId((current) => current || String(activeCinemas[0]?.id || ''));
      } catch (error) {
        if (cancelled) return;
        setCinemas([]);
        setCategories([]);
        notification.error(error?.message || 'Không thể tải dữ liệu rạp và danh mục sản phẩm');
      } finally {
        if (!cancelled) setMetadataLoading(false);
      }
    };

    loadMetadata();
    return () => { cancelled = true; };
  }, [notification]);

  const loadProducts = useCallback(async () => {
    if (!selectedCinemaId) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await concessionService.list({
        cinemaId: selectedCinemaId,
        page: 0,
        size: 500,
      });
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading cinema products:', error);
      setProducts([]);
      notification.error(error?.message || 'Không thể tải menu của rạp');
    } finally {
      setLoading(false);
    }
  }, [notification, selectedCinemaId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const stats = useMemo(() => ({
    total: products.length,
    available: products.filter((item) => item.isAvailable).length,
    lowStock: products.filter((item) => item.isAvailable && Number(item.stock || 0) > 0 && Number(item.stock || 0) < 10).length,
    outOfStock: products.filter((item) => item.isAvailable && Number(item.stock || 0) <= 0).length,
  }), [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter((product) => sameResourceId(product.categoryId, categoryFilter));
  }, [categoryFilter, products]);

  const categoryFor = (product) => categories.find((category) => sameResourceId(category.id, product.categoryId));

  const openCreate = () => {
    if (!selectedCinemaId) {
      notification.warning('Vui lòng chọn rạp trước khi thêm sản phẩm');
      return;
    }
    if (categories.length === 0) {
      notification.warning('Backend chưa có ProductCategory. Hãy tạo danh mục sản phẩm trước.');
      return;
    }
    setSelectedProduct(null);
    setFormValues({ ...EMPTY_FORM, categoryId: String(categories[0].id) });
    setFormOpen(true);
  };

  const openEdit = (record) => {
    const matchedCategory = categoryFor(record)
      || categories.find((category) => String(category.code || '').toLowerCase() === String(record.category || '').toLowerCase());

    setSelectedProduct(record);
    setFormValues({
      code: record.code || '',
      name: record.name || '',
      categoryId: String(record.categoryId || matchedCategory?.id || ''),
      price: record.price ?? '',
      stock: record.stock ?? record.stockQuantity ?? '',
      description: record.description || '',
      imageUrl: record.imageUrl || record.image || '',
      status: String(record.status || 'ACTIVE').toUpperCase(),
      isAvailable: Boolean(record.isAvailable),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedProduct(null);
    setFormValues(EMPTY_FORM);
  };

  const openDetail = (record) => {
    setSelectedProduct(record);
    setDetailOpen(true);
  };

  const validateForm = () => {
    if (!formValues.code.trim()) return 'Vui lòng nhập mã sản phẩm';
    if (!/^[A-Z0-9_\-]+$/.test(formValues.code.trim())) return 'Mã sản phẩm chỉ dùng chữ in hoa, số, _ hoặc -';
    if (!formValues.name.trim()) return 'Vui lòng nhập tên sản phẩm';
    if (!formValues.categoryId) return 'Vui lòng chọn danh mục';
    if (!formValues.description.trim()) return 'Vui lòng nhập mô tả sản phẩm';
    if (!formValues.imageUrl.trim()) return 'Vui lòng nhập URL hình ảnh';
    if (Number(formValues.price) <= 0) return 'Giá bán phải lớn hơn 0';
    if (formValues.stock === '' || Number(formValues.stock) < 0) return 'Tồn kho phải lớn hơn hoặc bằng 0';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const category = categories.find((item) => sameResourceId(item.id, formValues.categoryId));
    const payload = {
      cinemaId: selectedCinemaId,
      productId: selectedProduct?.productId,
      cinemaProductId: selectedProduct?.cinemaProductId,
      code: formValues.code.trim().toUpperCase(),
      name: formValues.name.trim(),
      categoryId: formValues.categoryId,
      category: String(category?.code || category?.name || '').toLowerCase(),
      price: Number(formValues.price),
      stock: Number(formValues.stock),
      stockQuantity: Number(formValues.stock),
      description: formValues.description.trim(),
      imageUrl: formValues.imageUrl.trim(),
      image: formValues.imageUrl.trim(),
      status: formValues.status,
      isAvailable: formValues.status === 'ACTIVE' && formValues.isAvailable,
    };

    setSaving(true);
    try {
      if (selectedProduct) {
        await concessionService.update(selectedProduct, payload);
        notification.success('Cập nhật sản phẩm và tồn kho thành công');
      } else {
        await concessionService.create(payload);
        notification.success('Đã thêm sản phẩm vào menu rạp');
      }
      closeForm();
      await loadProducts();
    } catch (error) {
      console.error('Error saving cinema product:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (record) => {
    const cinemaName = selectedCinema?.name || 'rạp này';
    if (!window.confirm(`Gỡ ${record.name} khỏi menu ${cinemaName}? Sản phẩm trong catalog chung sẽ được giữ lại.`)) return;

    try {
      await concessionService.removeFromCinema(record);
      notification.success('Đã gỡ sản phẩm khỏi menu rạp');
      await loadProducts();
    } catch (error) {
      console.error('Error removing cinema product:', error);
      notification.error(error?.message || 'Không thể gỡ sản phẩm khỏi menu');
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div className="flex min-w-[250px] items-center gap-3">
          <img
            src={record.imageUrl || record.image || '/brand-placeholder.svg'}
            alt={record.name}
            className="h-14 w-14 rounded-md border object-cover"
            onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
          />
          <div className="min-w-0">
            <button type="button" className="block max-w-full truncate text-left font-medium hover:text-primary" onClick={() => openDetail(record)}>
              {record.name || 'Chưa có tên'}
            </button>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{record.code || '—'}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{record.description || 'Chưa có mô tả'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (_, record) => {
        const category = categoryFor(record);
        return <StatusBadge tone="info">{category?.name || record.categoryName || record.category || 'Chưa phân loại'}</StatusBadge>;
      },
    },
    {
      title: 'Giá bán',
      key: 'price',
      render: (_, record) => <span className="font-medium">{formatMoney(record.price)}</span>,
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      render: (_, record) => {
        const meta = stockMeta(record.stock, record.isAvailable);
        return (
          <div className="space-y-1">
            <p className="font-medium">{Number(record.stock || 0)}</p>
            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          </div>
        );
      },
    },
    {
      title: 'Catalog',
      key: 'catalogStatus',
      render: (_, record) => (
        <StatusBadge tone={record.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {record.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ẩn'}
        </StatusBadge>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(record)} aria-label="Xem sản phẩm"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xem chi tiết</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Chỉnh sửa sản phẩm"><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chỉnh sửa</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleRemove(record)} aria-label="Gỡ khỏi menu rạp"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Gỡ khỏi menu rạp</TooltipContent></Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  if (metadataLoading) {
    return <div className="flex min-h-72 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải cấu hình menu...</div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Đồ ăn & đồ uống"
        description="Quản lý catalog sản phẩm và giá/tồn kho theo từng rạp."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Đồ ăn & đồ uống' },
        ]}
        actions={<Button onClick={openCreate} disabled={!selectedCinemaId || categories.length === 0}><Plus className="h-4 w-4" />Thêm vào menu</Button>}
      />

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>Rạp đang quản lý</span>
            <Select value={selectedCinemaId} onValueChange={(value) => { setSelectedCinemaId(value); setCategoryFilter('all'); }}>
              <SelectTrigger><SelectValue placeholder="Chọn rạp" /></SelectTrigger>
              <SelectContent>
                {cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}{cinema.city ? ` · ${cinema.city}` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Lọc theo danh mục</span>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      {cinemas.length === 0 ? (
        <Empty description="Chưa có rạp hoạt động để cấu hình menu" />
      ) : categories.length === 0 ? (
        <Empty description="Backend chưa có ProductCategory. Cần tạo danh mục trước khi thêm sản phẩm." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Sản phẩm trong menu', value: stats.total, icon: Coffee },
              { label: 'Đang bán', value: stats.available, icon: Store },
              { label: 'Sắp hết hàng', value: stats.lowStock, icon: TriangleAlert },
              { label: 'Hết hàng', value: stats.outOfStock, icon: Package },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div><Icon className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Menu · {selectedCinema?.name || 'Rạp'}</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải menu...</div>
              ) : filteredProducts.length === 0 ? (
                <Empty description={categoryFilter === 'all' ? 'Rạp này chưa có sản phẩm trong menu' : 'Không có sản phẩm trong danh mục này'} />
              ) : (
                <DataTable fields={columns} rows={filteredProducts} getRowId="id" pageControls={false} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <ResponsiveDialog
        heading={selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm vào menu'}
        description={`Giá và tồn kho áp dụng riêng cho ${selectedCinema?.name || 'rạp đang chọn'}.`}
        open={formOpen}
        onClose={closeForm}
        maxWidth={720}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Mã sản phẩm *</span><Input value={formValues.code} onChange={(event) => setFormValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))} onBlur={() => { if (!formValues.code.trim()) setFormValues((current) => ({ ...current, code: makeProductCode(current.name) })); }} placeholder="POPCORN_CARAMEL" required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Tên sản phẩm *</span><Input value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} placeholder="Bắp rang caramel" required /></label>
          </div>

          <label className="block space-y-2 text-sm font-medium"><span>Danh mục *</span><Select value={formValues.categoryId} onValueChange={(value) => setFormValues((current) => ({ ...current, categoryId: value }))}><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name} · {category.code}</SelectItem>)}</SelectContent></Select></label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Giá bán *</span><NumberStepper min={0} value={formValues.price} onValueChange={(value) => setFormValues((current) => ({ ...current, price: value ?? '' }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Tồn kho *</span><NumberStepper min={0} value={formValues.stock} onValueChange={(value) => setFormValues((current) => ({ ...current, stock: value ?? '' }))} /></label>
          </div>

          <label className="block space-y-2 text-sm font-medium"><span>Mô tả *</span><Textarea rows={3} value={formValues.description} onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả sản phẩm" required /></label>
          <label className="block space-y-2 text-sm font-medium"><span>URL hình ảnh *</span><Input value={formValues.imageUrl} onChange={(event) => setFormValues((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." required /></label>
          {formValues.imageUrl && <img src={formValues.imageUrl} alt="Xem trước sản phẩm" className="h-28 w-28 rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Trạng thái catalog</span><Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value, isAvailable: value === 'ACTIVE' ? current.isAvailable : false }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Hoạt động</SelectItem><SelectItem value="INACTIVE">Tạm ẩn</SelectItem></SelectContent></Select></label>
            <label className="flex items-center gap-3 self-end rounded-md border p-3 text-sm"><Checkbox checked={formValues.isAvailable} disabled={formValues.status !== 'ACTIVE'} onCheckedChange={(checked) => setFormValues((current) => ({ ...current, isAvailable: checked === true }))} /><span><span className="font-medium">Đang bán tại rạp</span><span className="block text-xs text-muted-foreground">Tắt để tạm ngừng bán nhưng vẫn giữ tồn kho.</span></span></label>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeForm}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{selectedProduct ? 'Lưu thay đổi' : 'Thêm vào menu'}</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết sản phẩm"
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedProduct(null); }}
        maxWidth={620}
        actions={selectedProduct ? [
          <Button key="close" variant="outline" onClick={() => { setDetailOpen(false); setSelectedProduct(null); }}>Đóng</Button>,
          <Button key="edit" onClick={() => { const product = selectedProduct; setDetailOpen(false); openEdit(product); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedProduct && (
          <div className="space-y-5">
            <div className="flex items-center gap-4"><img src={selectedProduct.imageUrl || selectedProduct.image || '/brand-placeholder.svg'} alt={selectedProduct.name} className="h-20 w-20 rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} /><div><h3 className="font-semibold">{selectedProduct.name}</h3><p className="text-sm text-muted-foreground">{selectedProduct.description || 'Chưa có mô tả'}</p></div></div>
            <DetailList columns={2}>
              <DetailItem label="Mã sản phẩm">{selectedProduct.code || '—'}</DetailItem>
              <DetailItem label="Danh mục">{categoryFor(selectedProduct)?.name || selectedProduct.categoryName || '—'}</DetailItem>
              <DetailItem label="Rạp">{selectedCinema?.name || '—'}</DetailItem>
              <DetailItem label="Giá bán">{formatMoney(selectedProduct.price)}</DetailItem>
              <DetailItem label="Tồn kho">{Number(selectedProduct.stock || 0)}</DetailItem>
              <DetailItem label="Đang bán">{selectedProduct.isAvailable ? 'Có' : 'Không'}</DetailItem>
              <DetailItem label="Catalog">{selectedProduct.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ẩn'}</DetailItem>
              <DetailItem label="Inventory ID">{selectedProduct.cinemaProductId || '—'}</DetailItem>
            </DetailList>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default FoodBeverage;
