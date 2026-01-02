import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { InputNumber } from '../../../components/ui/input-number';
import { Rate } from '../../../components/ui/rate';
import { Tag } from '../../../components/ui/tag';
import { Tabs } from '../../../components/ui/tabs';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge-count';
import { Progress } from '../../../components/ui/progress';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../../../components/ui/tooltip';
import { Empty } from '../../../components/ui/empty';
import { Descriptions } from '../../../components/ui/descriptions';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
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
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import useNotification from '../../../hooks/useNotification';

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
      name: 'Bắp rang bơ',
      category: 'food',
      price: 25000,
      originalPrice: 30000,
      stock: 50,
      rating: 4.5,
      sales: 120,
      image: 'https://via.placeholder.com/100x100?text=Popcorn',
      description: 'Bắp rang bơ thơm ngon, giòn tan',
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
      description: 'Nước ngọt Coca Cola mát lạnh',
      isPopular: false
    },
    {
      id: 3,
      name: 'Combo Phim + Bắp + Nước',
      category: 'combo',
      price: 45000,
      originalPrice: 60000,
      stock: 30,
      rating: 4.8,
      sales: 80,
      image: 'https://via.placeholder.com/100x100?text=Combo',
      description: 'Combo tiết kiệm cho 2 người',
      isPopular: true
    }
  ]);

  const stats = [
    { title: 'Tổng sản phẩm', value: products.length, icon: <Coffee className="h-6 w-6" /> },
    { title: 'Doanh thu tháng', value: '15.2M', icon: <DollarSign className="h-6 w-6" /> },
    { title: 'Đơn hàng', value: products.reduce((a, b) => a + b.sales, 0), icon: <ShoppingCart className="h-6 w-6" /> },
    {
      title: 'Tỷ lệ bán',
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
    notification.success('Đã xóa sản phẩm!');
  };

  const handleModalOk = (e) => {
    e?.preventDefault();
    // Validation
    if (!formValues.name?.trim()) {
      notification.error('Vui lòng nhập tên sản phẩm!');
      return;
    }
    if (!formValues.category) {
      notification.error('Vui lòng chọn danh mục!');
      return;
    }
    if (!formValues.price || formValues.price <= 0) {
      notification.error('Vui lòng nhập giá bán hợp lệ!');
      return;
    }
    if (!formValues.stock || formValues.stock < 0) {
      notification.error('Vui lòng nhập số lượng tồn kho hợp lệ!');
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
      notification.success('Cập nhật sản phẩm thành công!');
    } else {
      setProducts([newProduct, ...products]);
      notification.success('Thêm sản phẩm thành công!');
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
      title: 'Sản phẩm',
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
                Phổ biến
              </Badge>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        const categoryConfig = {
          food: { color: 'orange', text: 'Đồ ăn', icon: <Coffee className="h-3 w-3" /> },
          drink: { color: 'blue', text: 'Đồ uống', icon: <Coffee className="h-3 w-3" /> },
          combo: { color: 'green', text: 'Combo', icon: <Flame className="h-3 w-3" /> }
        };
        const config = categoryConfig[category] || { color: 'default', text: category };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Giá',
      key: 'price',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-semibold text-red-600">
            {record.price.toLocaleString('vi-VN')}đ
          </div>
          {record.originalPrice > record.price && (
            <div className="line-through text-xs text-gray-500">
              {record.originalPrice.toLocaleString('vi-VN')}đ
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tồn kho',
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
      title: 'Đánh giá',
      key: 'rating',
      render: (_, record) => (
        <div>
          <Rate
            disabled
            value={record.rating}
            allowHalf
            className="text-yellow-400"
          />
          <div className="text-xs text-gray-500">
            {record.rating}/5 ({record.sales} đã bán)
          </div>
        </div>
      )
    },
    {
      title: 'Thao tác',
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
              <TooltipContent>Xem chi tiết</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => handleEditProduct(record)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                      handleDeleteProduct(record.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xóa</TooltipContent>
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
            title: 'Quản lý đồ ăn & đồ uống',
            icon: <Coffee className="h-4 w-4" />
          }
        ]}
      />

      <div className="mb-6">
        <h2 className="m-0 text-2xl font-bold">
          Quản lý đồ ăn & đồ uống
        </h2>
        <p className="text-gray-600 mt-1">
          Quản lý menu, inventory và doanh thu F&B
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
          <h4 className="m-0 text-lg font-semibold">Danh sách sản phẩm</h4>
          <Button
            onClick={handleCreateProduct}
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>

        <Tabs
          defaultActiveKey="all"
          className="mt-4"
          items={[
            {
              key: 'all',
              label: 'Tất cả',
              children: (
                <TableWrapper
                  columns={columns}
                  data={products}
                  rowKey="id"
                  pagination={{
                    total: products.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} sản phẩm`
                  }}
                />
              )
            },
            {
              key: 'food',
              label: 'Đồ ăn',
              children: (
                <TableWrapper
                  columns={columns}
                  data={products.filter(p => p.category === 'food')}
                  rowKey="id"
                  pagination={{
                    total: products.filter(p => p.category === 'food').length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} sản phẩm`
                  }}
                />
              )
            },
            {
              key: 'drink',
              label: 'Đồ uống',
              children: (
                <TableWrapper
                  columns={columns}
                  data={products.filter(p => p.category === 'drink')}
                  rowKey="id"
                  pagination={{
                    total: products.filter(p => p.category === 'drink').length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} sản phẩm`
                  }}
                />
              )
            },
            {
              key: 'combo',
              label: 'Combo',
              children: (
                <TableWrapper
                  columns={columns}
                  data={products.filter(p => p.category === 'combo')}
                  rowKey="id"
                  pagination={{
                    total: products.filter(p => p.category === 'combo').length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} sản phẩm`
                  }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={600}
        footer={null}
      >
        <form onSubmit={handleModalOk} className="space-y-4 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên sản phẩm"
                value={formValues.name}
                onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.category}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Đồ ăn</SelectItem>
                  <SelectItem value="drink">Đồ uống</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán <span className="text-red-500">*</span>
              </label>
              <InputNumber
                placeholder="Nhập giá"
                value={formValues.price}
                onChange={(value) => setFormValues(prev => ({ ...prev, price: value || '' }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá gốc
              </label>
              <InputNumber
                placeholder="Nhập giá gốc"
                value={formValues.originalPrice}
                onChange={(value) => setFormValues(prev => ({ ...prev, originalPrice: value || '' }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tồn kho <span className="text-red-500">*</span>
              </label>
              <InputNumber
                placeholder="Nhập số lượng"
                value={formValues.stock}
                onChange={(value) => setFormValues(prev => ({ ...prev, stock: value || '' }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sản phẩm phổ biến
              </label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  checked={formValues.isPopular}
                  onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, isPopular: checked }))}
                />
                <span className="text-sm text-gray-700">Kích hoạt</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <Textarea
              rows={3}
              placeholder="Nhập mô tả sản phẩm"
              value={formValues.description}
              onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh
            </label>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Nhập URL hình ảnh"
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
              Hủy
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {isEditMode ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Chi tiết sản phẩm"
        open={isDetailModalVisible}
        onCancel={handleDetailModalCancel}
        width={500}
        footer={null}
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
            <Descriptions
              column={1}
              items={[
                {
                  label: 'Danh mục',
                  children: selectedProduct.category === 'food' ? 'Đồ ăn' : selectedProduct.category === 'drink' ? 'Đồ uống' : 'Combo'
                },
                {
                  label: 'Giá bán',
                  children: `${selectedProduct.price.toLocaleString('vi-VN')}đ`
                },
                {
                  label: 'Giá gốc',
                  children: `${selectedProduct.originalPrice.toLocaleString('vi-VN')}đ`
                },
                {
                  label: 'Tồn kho',
                  children: selectedProduct.stock
                },
                {
                  label: 'Phổ biến',
                  children: selectedProduct.isPopular ? 'Có' : 'Không'
                },
                {
                  label: 'Đánh giá',
                  children: `${selectedProduct.rating}/5 (${selectedProduct.sales} đã bán)`
                }
              ]}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleDetailModalCancel}>
                Đóng
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setIsDetailModalVisible(false);
                  handleEditProduct(selectedProduct);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FoodBeverage; 