import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { NumberStepper } from '@/components/ui/number-stepper';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge-count';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Empty } from '@/components/ui/empty';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Coffee,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Flame,
  DollarSign,
  ShoppingCart,
  Home
} from 'lucide-react';
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import useNotification from '@/hooks/useNotification';

const FoodBeverage = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const notification = useNotification();
  const [formValues, setFormValues] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    description: '',
    image: '',
    isPopular: false
  });
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Báº¯p rang bÆ¡',
      category: 'food',
      price: 25000,
      originalPrice: 30000,
      stock: 50,
      rating: 4.5,
      sales: 120,
      image: 'https://via.placeholder.com/100x100?text=Popcorn',
      description: 'Báº¯p rang bÆ¡ thÆ¡m ngon, giÃ²n tan',
      isPopular: true
    },
    {
      id: 2,
      name: 'Coca Cola',
      category: 'drink',
      price: 15000,
      originalPrice: 15000,
      stock: 100,
      rating: 4.2,
      sales: 200,
      image: 'https://via.placeholder.com/100x100?text=Cola',
      description: 'NÆ°á»›c ngá»t Coca Cola mÃ¡t láº¡nh',
      isPopular: false
    },
    {
      id: 3,
      name: 'Combo Phim + Báº¯p + NÆ°á»›c',
      category: 'combo',
      price: 45000,
      originalPrice: 60000,
      stock: 30,
      rating: 4.8,
      sales: 80,
      image: 'https://via.placeholder.com/100x100?text=Combo',
      description: 'Combo tiáº¿t kiá»‡m cho 2 ngÆ°á»i',
      isPopular: true
    }
  ]);

  const stats = [
    { title: 'Tá»•ng sáº£n pháº©m', value: products.length, icon: <Coffee className="h-6 w-6" /> },
    { title: 'Doanh thu thÃ¡ng', value: '15.2M', icon: <DollarSign className="h-6 w-6" /> },
    { title: 'ÄÆ¡n hÃ ng', value: products.reduce((a, b) => a + b.sales, 0), icon: <ShoppingCart className="h-6 w-6" /> },
    {
      title: 'Tá»· lá»‡ bÃ¡n',
      value:
        products.length > 0
          ? Math.round((products.filter(p => p.sales > 0).length / products.length) * 100) + '%'
          : '0%',
      icon: <Flame className="h-6 w-6" />
    }
  ];

  const handleCreateProduct = () => {
    setIsEditMode(false);
    setSelectedProduct(null);
    setFormValues({
      name: '',
      category: '',
      price: '',
      originalPrice: '',
      stock: '',
      description: '',
      image: '',
      isPopular: false
    });
    setIsModalVisible(true);
  };

  const handleEditProduct = (record) => {
    setIsEditMode(true);
    setSelectedProduct(record);
    setFormValues({
      name: record.name || '',
      category: record.category || '',
      price: record.price || '',
      originalPrice: record.originalPrice || '',
      stock: record.stock || '',
      description: record.description || '',
      image: record.image || '',
      isPopular: record.isPopular || false
    });
    setIsModalVisible(true);
  };

  const handleViewProduct = (record) => {
    setSelectedProduct(record);
    setIsDetailModalVisible(true);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter(item => item.id !== id));
    notification.success('ÄÃ£ xÃ³a sáº£n pháº©m!');
  };

  const handleModalOk = (e) => {
    e?.preventDefault();
    // Validation
    if (!formValues.name?.trim()) {
      notification.error('Vui lÃ²ng nháº­p tÃªn sáº£n pháº©m!');
      return;
    }
    if (!formValues.category) {
      notification.error('Vui lÃ²ng chá»n danh má»¥c!');
      return;
    }
    if (!formValues.price || formValues.price <= 0) {
      notification.error('Vui lÃ²ng nháº­p giÃ¡ bÃ¡n há»£p lá»‡!');
      return;
    }
    if (!formValues.stock || formValues.stock < 0) {
      notification.error('Vui lÃ²ng nháº­p sá»‘ lÆ°á»£ng tá»“n kho há»£p lá»‡!');
      return;
    }

    let imageUrl = formValues.image;
    if (Array.isArray(imageUrl) && imageUrl.length > 0 && imageUrl[0].url) {
      imageUrl = imageUrl[0].url;
    } else if (Array.isArray(imageUrl) && imageUrl.length > 0 && imageUrl[0].thumbUrl) {
      imageUrl = imageUrl[0].thumbUrl;
    } else if (typeof imageUrl !== 'string' || !imageUrl) {
      imageUrl = 'https://via.placeholder.com/100x100?text=Image';
    }
    const newProduct = {
      name: formValues.name.trim(),
      category: formValues.category,
      price: Number(formValues.price),
      originalPrice: Number(formValues.originalPrice) || Number(formValues.price),
      stock: Number(formValues.stock),
      description: formValues.description?.trim() || '',
      image: imageUrl,
      isPopular: formValues.isPopular || false,
      id: isEditMode && selectedProduct ? selectedProduct.id : Date.now(),
      rating: isEditMode && selectedProduct ? selectedProduct.rating : 4.0,
      sales: isEditMode && selectedProduct ? selectedProduct.sales : 0
    };
    if (isEditMode && selectedProduct) {
      setProducts(products.map(item => item.id === selectedProduct.id ? newProduct : item));
      notification.success('Cáº­p nháº­t sáº£n pháº©m thÃ nh cÃ´ng!');
    } else {
      setProducts([newProduct, ...products]);
      notification.success('ThÃªm sáº£n pháº©m thÃ nh cÃ´ng!');
    }
    setIsModalVisible(false);
    setSelectedProduct(null);
    setIsEditMode(false);
    setFormValues({
      name: '',
      category: '',
      price: '',
      originalPrice: '',
      stock: '',
      description: '',
      image: '',
      isPopular: false
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
    setIsEditMode(false);
    setFormValues({
      name: '',
      category: '',
      price: '',
      originalPrice: '',
      stock: '',
      description: '',
      image: '',
      isPopular: false
    });
  };

  const handleDetailModalCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedProduct(null);
  };

  const columns = [
    {
      title: 'Sáº£n pháº©m',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.image || 'https://via.placeholder.com/60x60?text=Image'}
            alt={text}
            className="w-16 h-16 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/60x60?text=Image';
            }}
          />
          <div>
            <div className="font-semibold text-gray-800">{text}</div>
            <div className="text-xs text-gray-500">{record.description}</div>
            {record.isPopular && (
              <Badge className="bg-yellow-500 text-white text-xs mt-1">
                Phá»• biáº¿n
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Danh má»¥c',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const categoryConfig = {
          food: { color: 'orange', text: 'Äá»“ Äƒn', icon: <Coffee className="h-3 w-3" /> },
          drink: { color: 'blue', text: 'Äá»“ uá»‘ng', icon: <Coffee className="h-3 w-3" /> },
          combo: { color: 'green', text: 'Combo', icon: <Flame className="h-3 w-3" /> }
        };
        const config = categoryConfig[category] || { color: 'default', text: category };
        return (
          <StatusBadge tone={config.color} leading={config.icon}>
            {config.text}
          </StatusBadge>
        );
      }
    },
    {
      title: 'GiÃ¡',
      key: 'price',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-semibold text-red-600">
            {record.price.toLocaleString('vi-VN')}Ä‘
          </div>
          {record.originalPrice > record.price && (
            <div className="line-through text-xs text-gray-500">
              {record.originalPrice.toLocaleString('vi-VN')}Ä‘
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tá»“n kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <div>
          <div className="font-semibold text-gray-800">{stock}</div>
          <Progress
            value={Math.min((stock / 100) * 100, 100)}
            className="mt-1 h-2"
          />
        </div>
      )
    },
    {
      title: 'ÄÃ¡nh giÃ¡',
      key: 'rating',
      render: (_, record) => (
        <div>
          <StarRating
            readOnly
            value={record.rating}
            precision={0.5}
            className="text-yellow-400"
          />
          <div className="text-xs text-gray-500">
            {record.rating}/5 ({record.sales} Ä‘Ã£ bÃ¡n)
          </div>
        </div>
      )
    },
    {
      title: 'Thao tÃ¡c',
      key: 'actions',
      render: (_, record) => (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => handleViewProduct(record)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiáº¿t</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => handleEditProduct(record)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chá»‰nh sá»­a</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a sáº£n pháº©m nÃ y?')) {
                      handleDeleteProduct(record.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>XÃ³a</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-6"
        items={[
          {
            title: 'Dashboard',
            icon: <Home className="h-4 w-4" />,
            href: '/admin/dashboard'
          },
          {
            title: 'Quáº£n lÃ½ Ä‘á»“ Äƒn & Ä‘á»“ uá»‘ng',
            icon: <Coffee className="h-4 w-4" />
          }
        ]}
      />

      <div className="mb-6">
        <h2 className="m-0 text-2xl font-bold">
          Quáº£n lÃ½ Ä‘á»“ Äƒn & Ä‘á»“ uá»‘ng
        </h2>
        <p className="text-gray-600 mt-1">
          Quáº£n lÃ½ menu, inventory vÃ  doanh thu F&B
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{stat.title}</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{stat.value}</div>
              </div>
              <div className="text-2xl text-red-600">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="m-0 text-lg font-semibold">Danh sÃ¡ch sáº£n pháº©m</h4>
          <Button
            onClick={handleCreateProduct}
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            ThÃªm sáº£n pháº©m
          </Button>
        </div>

        <SegmentedTabs
          defaultSelectedId="all"
          className="mt-4"
          sections={[
            {
              key: 'all',
              label: 'Táº¥t cáº£',
              children: (
                <DataTable
                  fields={columns}
                  rows={products}
                  getRowId="id"
                />
              )
            },
            {
              key: 'food',
              label: 'Äá»“ Äƒn',
              children: (
                <DataTable
                  fields={columns}
                  rows={products.filter(p => p.category === 'food')}
                  getRowId="id"
                />
              )
            },
            {
              key: 'drink',
              label: 'Äá»“ uá»‘ng',
              children: (
                <DataTable
                  fields={columns}
                  rows={products.filter(p => p.category === 'drink')}
                  getRowId="id"
                />
              )
            },
            {
              key: 'combo',
              label: 'Combo',
              children: (
                <DataTable
                  fields={columns}
                  rows={products.filter(p => p.category === 'combo')}
                  getRowId="id"
                />
              )
            }
          ]}
        />
      </Card>

      <ResponsiveDialog
        heading={isEditMode ? 'Chá»‰nh sá»­a sáº£n pháº©m' : 'ThÃªm sáº£n pháº©m má»›i'}
        open={isModalVisible}
        onClose={handleModalCancel}
        maxWidth={600}
        actions={null}
      >
        <form onSubmit={handleModalOk} className="space-y-4 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TÃªn sáº£n pháº©m <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nháº­p tÃªn sáº£n pháº©m"
                value={formValues.name}
                onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh má»¥c <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.category}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chá»n danh má»¥c" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Äá»“ Äƒn</SelectItem>
                  <SelectItem value="drink">Äá»“ uá»‘ng</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GiÃ¡ bÃ¡n <span className="text-red-500">*</span>
              </label>
              <NumberStepper
                placeholder="Nháº­p giÃ¡"
                value={formValues.price}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, price: value || '' }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GiÃ¡ gá»‘c
              </label>
              <NumberStepper
                placeholder="Nháº­p giÃ¡ gá»‘c"
                value={formValues.originalPrice}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, originalPrice: value || '' }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tá»“n kho <span className="text-red-500">*</span>
              </label>
              <NumberStepper
                placeholder="Nháº­p sá»‘ lÆ°á»£ng"
                value={formValues.stock}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, stock: value || '' }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sáº£n pháº©m phá»• biáº¿n
              </label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  checked={formValues.isPopular}
                  onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, isPopular: checked }))}
                />
                <span className="text-sm text-gray-700">KÃ­ch hoáº¡t</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MÃ´ táº£
            </label>
            <Textarea
              rows={3}
              placeholder="Nháº­p mÃ´ táº£ sáº£n pháº©m"
              value={formValues.description}
              onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HÃ¬nh áº£nh
            </label>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Nháº­p URL hÃ¬nh áº£nh"
                value={formValues.image}
                onChange={(e) => setFormValues(prev => ({ ...prev, image: e.target.value }))}
              />
              {formValues.image && (
                <img
                  src={formValues.image}
                  alt="Preview"
                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalCancel}
            >
              Há»§y
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {isEditMode ? 'Cáº­p nháº­t' : 'ThÃªm'}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiáº¿t sáº£n pháº©m"
        open={isDetailModalVisible}
        onClose={handleDetailModalCancel}
        maxWidth={500}
        actions={null}
      >
        {selectedProduct && (
          <div className="text-center p-4">
            <img
              src={selectedProduct.image || 'https://via.placeholder.com/100x100?text=Image'}
              alt={selectedProduct.name}
              className="w-24 h-24 rounded-lg object-cover mx-auto mb-4 border border-gray-200"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/100x100?text=Image';
              }}
            />
            <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
            <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
            <Separator className="my-4" />
            <DetailList
              columns={1}
              items={[
                {
                  label: 'Danh má»¥c',
                  children: selectedProduct.category === 'food' ? 'Äá»“ Äƒn' : selectedProduct.category === 'drink' ? 'Äá»“ uá»‘ng' : 'Combo'
                },
                {
                  label: 'GiÃ¡ bÃ¡n',
                  children: `${selectedProduct.price.toLocaleString('vi-VN')}Ä‘`
                },
                {
                  label: 'GiÃ¡ gá»‘c',
                  children: `${selectedProduct.originalPrice.toLocaleString('vi-VN')}Ä‘`
                },
                {
                  label: 'Tá»“n kho',
                  children: selectedProduct.stock
                },
                {
                  label: 'Phá»• biáº¿n',
                  children: selectedProduct.isPopular ? 'CÃ³' : 'KhÃ´ng'
                },
                {
                  label: 'ÄÃ¡nh giÃ¡',
                  children: `${selectedProduct.rating}/5 (${selectedProduct.sales} Ä‘Ã£ bÃ¡n)`
                }
              ]}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleDetailModalCancel}>
                ÄÃ³ng
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setIsDetailModalVisible(false);
                  handleEditProduct(selectedProduct);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chá»‰nh sá»­a
              </Button>
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default FoodBeverage;
