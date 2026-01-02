import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Pagination } from '../../../components/ui/pagination';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Tag } from '../../../components/ui/tag';
import { InputNumber } from '../../../components/ui/input-number';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../../../components/ui/tooltip';
import { Progress } from '../../../components/ui/progress';
import { Tabs } from '../../../components/ui/tabs';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import { Loader2 } from 'lucide-react';
import {
    Plus,
    Edit,
    Trash2,
    Copy,
    Eye,
    Gift,
    Percent,
    Clock,
    Ban,
    PlayCircle,
    PauseCircle,
    Home
} from 'lucide-react';
import dayjs from '../../../utils/dayjsConfig';
import promotionService from '../../../services/promotionService';
import movieService from '../../../services/movieService';
import cinemaService from '../../../services/cinemaService';
import useNotification from '../../../hooks/useNotification';

const Promotions = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [vouchers, setVouchers] = useState([]);
    const [movies, setMovies] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [stats, setStats] = useState({
        totalVouchers: 0,
        activeVouchers: 0,
        totalUsage: 0,
        totalSavings: 0
    });

    const [formValues, setFormValues] = useState({
        name: '',
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minPurchaseAmount: 50000,
        maxDiscountAmount: 100000,
        usageLimit: 100,
        usedCount: 0,
        startDate: '',
        endDate: ''
    });

    const voucherTypes = [
        { value: 'PERCENTAGE', label: 'Giảm giá theo phần trăm', icon: <Percent className="h-4 w-4" /> },
        { value: 'FIXED_AMOUNT', label: 'Giảm giá cố định', icon: <Gift className="h-4 w-4" /> }
    ];

    // Status được tính toán từ isActive, startDate và endDate (không có field status từ API)
    const statusConfig = {
        active: { label: 'Đang hoạt động', color: 'success', icon: <PlayCircle className="h-4 w-4" /> },
        paused: { label: 'Tạm dừng', color: 'warning', icon: <PauseCircle className="h-4 w-4" /> },
        scheduled: { label: 'Chờ kích hoạt', color: 'processing', icon: <Clock className="h-4 w-4" /> },
        expired: { label: 'Hết hạn', color: 'error', icon: <Ban className="h-4 w-4" /> }
    };

    // Helper function để tính toán status từ promotion data
    const calculateStatus = (promotion) => {
        if (!promotion) return 'expired';

        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);

        if (startDate > now) {
            return 'scheduled';
        } else if (endDate < now) {
            return 'expired';
        } else if (promotion.isActive === true) {
            return 'active';
        } else {
            return 'paused';
        }
    };

    const daysOfWeek = [
        { value: 'monday', label: 'Thứ 2' },
        { value: 'tuesday', label: 'Thứ 3' },
        { value: 'wednesday', label: 'Thứ 4' },
        { value: 'thursday', label: 'Thứ 5' },
        { value: 'friday', label: 'Thứ 6' },
        { value: 'saturday', label: 'Thứ 7' },
        { value: 'sunday', label: 'Chủ nhật' }
    ];

    useEffect(() => {
        loadData();
    }, [activeTab, pagination.current, pagination.pageSize]);

    // Reset pagination when tab changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [activeTab]);

    const loadData = async (currentPage = pagination.current, pageSize = pagination.pageSize) => {
        try {
            setLoading(true);

            // Load vouchers - API chỉ có getAllVouchers và getActiveVouchers
            let voucherResponse;
            if (activeTab === 'active') {
                // Sử dụng endpoint active promotions
                voucherResponse = await promotionService.getActivePromotions(
                    currentPage - 1,
                    pageSize,
                    'name,asc'
                );
            } else {
                // Lấy tất cả và filter client-side cho các tab khác
                voucherResponse = await promotionService.getAllPromotions(
                    currentPage - 1,
                    pageSize,
                    'id,desc'
                );
            }

            // Load movies and cinemas
            const [movieResponse, cinemaResponse] = await Promise.all([
                movieService.getAllMovies(0, 100),
                cinemaService.getAllCinemas(0, 100)
            ]);

            // Extract data from API response (apiClient already unwraps response.data)
            const voucherData = voucherResponse?.content || voucherResponse?.data?.content || (Array.isArray(voucherResponse) ? voucherResponse : []);
            const movieData = movieResponse?.content || movieResponse?.data?.content || (Array.isArray(movieResponse) ? movieResponse : []);
            const cinemaData = cinemaResponse?.content || cinemaResponse?.data?.content || (Array.isArray(cinemaResponse) ? cinemaResponse : []);

            setVouchers(Array.isArray(voucherData) ? voucherData : []);
            setMovies(Array.isArray(movieData) ? movieData : []);
            setCinemas(Array.isArray(cinemaData) ? cinemaData : []);

            // Update pagination
            const totalElements = voucherResponse?.totalElements || voucherResponse?.data?.totalElements || (Array.isArray(voucherData) ? voucherData.length : 0);
            setPagination(prev => ({
                ...prev,
                total: totalElements
            }));

            // Calculate stats from loaded data
            calculateStats(Array.isArray(voucherData) ? voucherData : []);

        } catch (error) {
            notification.error('Lỗi khi tải dữ liệu voucher');
            console.error('Error loading data:', error);
            setVouchers([]);
            setMovies([]);
            setCinemas([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (voucherData) => {
        const totalVouchers = voucherData.length;
        const activeVouchers = voucherData.filter(p => p.isActive === true).length;
        const totalUsage = voucherData.reduce((sum, p) => sum + (p.usedCount || 0), 0);

        // Estimate total savings (simplified calculation)
        const totalSavings = voucherData.reduce((sum, p) => {
            const usedCount = p.usedCount || 0;
            if (p.discountType === 'FIXED_AMOUNT') {
                return sum + (p.discountValue * usedCount);
            } else if (p.discountType === 'PERCENTAGE') {
                return sum + ((p.minPurchaseAmount * p.discountValue / 100) * usedCount);
            }
            return sum;
        }, 0);

        setStats({
            totalVouchers,
            activeVouchers,
            totalUsage,
            totalSavings
        });
    };

    const handleCreateVoucher = () => {
        setEditingVoucher(null);
        setFormValues({
            name: '',
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minPurchaseAmount: 50000,
            maxDiscountAmount: 100000,
            usageLimit: 100,
            usedCount: 0,
            startDate: '',
            endDate: ''
        });
        setModalVisible(true);
    };

    const handleEditVoucher = (voucher) => {
        setEditingVoucher(voucher);
        // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
        const startDate = voucher.startDate ? dayjs(voucher.startDate).format('YYYY-MM-DDTHH:mm') : '';
        const endDate = voucher.endDate ? dayjs(voucher.endDate).format('YYYY-MM-DDTHH:mm') : '';

        setFormValues({
            name: voucher.name || '',
            code: voucher.code || '',
            description: voucher.description || '',
            discountType: voucher.discountType || 'PERCENTAGE',
            discountValue: voucher.discountValue || 10,
            minPurchaseAmount: voucher.minPurchase || voucher.minPurchaseAmount || 0,
            maxDiscountAmount: voucher.maxDiscount || voucher.maxDiscountAmount || 0,
            usageLimit: voucher.usageLimit || 100,
            usedCount: voucher.usedCount || 0,
            startDate: startDate,
            endDate: endDate
        });
        setModalVisible(true);
    };

    const handleSaveVoucher = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formValues.name || !formValues.code || !formValues.description) {
            notification.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        if (!formValues.startDate || !formValues.endDate) {
            notification.error('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
            return;
        }
        if (new Date(formValues.startDate) >= new Date(formValues.endDate)) {
            notification.error('Ngày bắt đầu phải trước ngày kết thúc');
            return;
        }

        try {
            setLoading(true);

            const { startDate, endDate, ...otherValues } = formValues;

            // Format data theo API request body (PromotionRequest)
            // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO format (YYYY-MM-DDTHH:mm:ss)
            const formatDateTime = (dateTimeString) => {
                if (!dateTimeString) return null;
                // If already has seconds, return as is, otherwise add :00
                return dateTimeString.includes(':') && dateTimeString.split(':').length === 2
                    ? `${dateTimeString}:00`
                    : dateTimeString;
            };

            const voucherData = {
                code: otherValues.code,
                name: otherValues.name,
                description: otherValues.description,
                discountType: otherValues.discountType,
                discountValue: otherValues.discountValue,
                startDate: formatDateTime(startDate),
                endDate: formatDateTime(endDate),
                minPurchase: otherValues.minPurchaseAmount || 0,
                maxDiscount: otherValues.maxDiscountAmount || 0,
                usageLimit: otherValues.usageLimit || 0,
                usedCount: otherValues.usedCount || 0
                // Note: isActive is not in PromotionRequest, backend manages it separately via activate/deactivate endpoints
            };

            if (editingVoucher) {
                // Update existing promotion
                await promotionService.updatePromotion(editingVoucher.id, voucherData);
                notification.success('Cập nhật voucher thành công');
            } else {
                // Create new promotion
                await promotionService.createPromotion(voucherData);
                notification.success('Tạo voucher thành công');
            }

            setModalVisible(false);
            setFormValues({
                name: '',
                code: '',
                description: '',
                discountType: 'PERCENTAGE',
                discountValue: 10,
                minPurchaseAmount: 50000,
                maxDiscountAmount: 100000,
                usageLimit: 100,
                usedCount: 0,
                startDate: '',
                endDate: ''
            });
            loadData(); // Reload data from API

        } catch (error) {
            notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher');
            console.error('Error saving voucher:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVoucher = useCallback(async (voucher) => {
        try {
            setLoading(true);
            await promotionService.deletePromotion(voucher.id);
            notification.success('Xóa voucher thành công');
            loadData(); // Reload data from API
        } catch (error) {
            notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa voucher');
            console.error('Error deleting voucher:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleToggleStatus = useCallback(async (voucher) => {
        try {
            setLoading(true);
            // Sử dụng API activate/deactivate trực tiếp
            if (voucher.isActive === true) {
                await promotionService.deactivatePromotion(voucher.id);
                notification.success('Tạm dừng promotion thành công');
            } else {
                await promotionService.activatePromotion(voucher.id);
                notification.success('Kích hoạt promotion thành công');
            }
            loadData(); // Reload data from API
        } catch (error) {
            notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
            console.error('Error toggling status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        notification.success('Đã sao chép mã voucher');
    };

    const handleViewVoucher = (voucher) => {
        setSelectedVoucher(voucher);
        setDetailModalVisible(true);
    };
    const handleDetailModalCancel = () => {
        setDetailModalVisible(false);
        setSelectedVoucher(null);
    };

    // Note: Filtering is handled server-side for 'active' tab, 
    // and client-side for other tabs (though this may need server-side support for better performance)
    const getFilteredVouchers = () => {
        // For 'active' tab, server already filters, so return as-is
        if (activeTab === 'active' || activeTab === 'all') {
            return vouchers;
        }

        // Client-side filtering for other tabs (should ideally be server-side)
        const now = new Date();
        if (activeTab === 'paused') {
            return vouchers.filter(p => p.isActive === false);
        } else if (activeTab === 'scheduled') {
            return vouchers.filter(p => new Date(p.startDate) > now);
        } else if (activeTab === 'expired') {
            return vouchers.filter(p => new Date(p.endDate) < now);
        }
        return vouchers;
    };

    // Handle table change (pagination)
    const handleTableChange = (page, pageSize) => {
        const newPageSize = pageSize || pagination.pageSize;
        setPagination(prev => ({
            current: page,
            pageSize: newPageSize,
            total: prev.total
        }));
        // Load data with new page immediately
        loadData(page, newPageSize);
    };

    // Handle page size change
    const handlePageSizeChange = (current, newPageSize) => {
        setPagination(prev => ({
            current: 1,
            pageSize: newPageSize,
            total: prev.total
        }));
        // Load data with new page size immediately
        loadData(1, newPageSize);
    };

    const columns = [
        {
            title: 'Tên voucher',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex flex-col gap-2">
                    <strong className="text-gray-900">{text}</strong>
                    <div className="flex items-center gap-2">
                        <Tag color="blue">{record.code}</Tag>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopyCode(record.code)}
                                        className="h-7 w-7 p-0"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Sao chép mã</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            )
        },
        {
            title: 'Loại & Giá trị',
            key: 'discount',
            render: (_, record) => {
                // Check if it's percentage type (case-insensitive)
                const isPercentage = record.discountType?.toUpperCase() === 'PERCENTAGE' ||
                    record.discountValue <= 100; // Fallback: assume percentage if value <= 100

                return (
                    <div className="flex flex-col gap-1">
                        <Tag color={isPercentage ? 'green' : 'orange'}>
                            {isPercentage ? '%' : 'VND'}
                        </Tag>
                        <span className="font-semibold text-gray-900">
                            {isPercentage
                                ? `${record.discountValue}%`
                                : `${Number(record.discountValue || 0).toLocaleString('vi-VN')}đ`
                            }
                        </span>
                    </div>
                );
            }
        },
        {
            title: 'Thời gian',
            key: 'period',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span className="text-gray-900">{dayjs(record.startDate).format('DD/MM/YYYY')}</span>
                    <span className="text-gray-400 text-xs">đến</span>
                    <span className="text-gray-900">{dayjs(record.endDate).format('DD/MM/YYYY')}</span>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                // Tính toán status từ isActive, startDate và endDate (không có field status từ API)
                const status = calculateStatus(record);
                const config = statusConfig[status];
                return (
                    <Tag color={config.color} className="flex items-center gap-1">
                        {config.icon}
                        {config.label}
                    </Tag>
                );
            }
        },
        {
            title: 'Sử dụng',
            key: 'usage',
            render: (_, record) => {
                const usedCount = record.usedCount || 0;
                const usageLimit = record.usageLimit || 0;
                const percentage = usageLimit > 0 ? (usedCount / usageLimit) * 100 : 0;

                return (
                    <div className="flex flex-col gap-1" style={{ minWidth: 120 }}>
                        <span className="text-gray-900">{usedCount}/{usageLimit}</span>
                        <Progress
                            percent={percentage}
                            status={percentage >= 90 ? 'exception' : percentage >= 70 ? 'active' : 'normal'}
                            showInfo={false}
                            className="h-2"
                        />
                    </div>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            align: 'center',
            render: (_, record) => (
                <TooltipProvider>
                    <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewVoucher(record)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditVoucher(record)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Chỉnh sửa</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm(record.isActive ? 'Bạn có chắc muốn tạm dừng voucher này?' : 'Bạn có chắc muốn kích hoạt voucher này?')) {
                                            handleToggleStatus(record);
                                        }
                                    }}
                                    className={`h-8 w-8 p-0 ${record.isActive ? '' : 'bg-green-50 hover:bg-green-100'}`}
                                >
                                    {record.isActive ? (
                                        <PauseCircle className="h-4 w-4" />
                                    ) : (
                                        <PlayCircle className="h-4 w-4 text-green-600" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{record.isActive ? 'Tạm dừng' : 'Kích hoạt'}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm('Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác.')) {
                                            handleDeleteVoucher(record);
                                        }
                                    }}
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:border-red-300"
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
            <div className="">
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
                            title: 'Quản lý khuyến mãi',
                            icon: <Gift className="h-4 w-4" />
                        }
                    ]}
                />

                {/* Header */}
                <Card className="p-6 bg-white rounded-xl shadow-md border border-gray-200 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Gift className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-gray-900 m-0 text-2xl font-bold">Quản lý Khuyến Mãi</h2>
                                <p className="text-sm text-gray-500 mt-1">Quản lý các chương trình khuyến mãi và voucher trong hệ thống</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleCreateVoucher}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-10 rounded-lg"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo khuyến mãi mới
                        </Button>
                    </div>
                </Card>

                {/* Promotions Table */}
                <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Danh sách khuyến mãi</h3>
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600 mb-4" />
                                <p className="text-gray-500">Đang tải dữ liệu...</p>
                            </div>
                        ) : vouchers.length === 0 ? (
                            <div className="p-12 text-center">
                                <Gift className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">Không có khuyến mãi nào</p>
                                <p className="text-gray-400 text-sm mt-2">Hãy tạo khuyến mãi mới để bắt đầu</p>
                            </div>
                        ) : (
                            <>
                                <TableWrapper
                                    columns={columns}
                                    data={getFilteredVouchers()}
                                    rowKey="id"
                                    pagination={false}
                                />
                                {pagination.total > 0 && (
                                    <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-200">
                                        <div className="text-sm text-gray-600">
                                            Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tổng số {pagination.total} khuyến mãi
                                        </div>
                                        <Pagination
                                            current={pagination.current}
                                            pageSize={pagination.pageSize}
                                            total={pagination.total}
                                            showSizeChanger={true}
                                            showQuickJumper={true}
                                            onChange={handleTableChange}
                                            onShowSizeChange={handlePageSizeChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Card>

                {/* Create/Edit Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                {editingVoucher ? (
                                    <Edit className="h-5 w-5 text-indigo-600" />
                                ) : (
                                    <Plus className="h-5 w-5 text-indigo-600" />
                                )}
                            </div>
                            <span className="text-xl font-semibold">
                                {editingVoucher ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
                            </span>
                        </div>
                    }
                    open={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        setFormValues({
                            name: '',
                            code: '',
                            description: '',
                            discountType: 'PERCENTAGE',
                            discountValue: 10,
                            minPurchaseAmount: 50000,
                            maxDiscountAmount: 100000,
                            usageLimit: 100,
                            usedCount: 0,
                            startDate: '',
                            endDate: ''
                        });
                    }}
                    footer={null}
                    width={900}
                >
                    <form onSubmit={handleSaveVoucher} className="space-y-6 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên voucher <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="VD: Giảm 20% vé cuối tuần"
                                    value={formValues.name}
                                    onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                                    className="h-10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã voucher <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="VD: WEEKEND20"
                                    value={formValues.code}
                                    onChange={(e) => setFormValues({ ...formValues, code: e.target.value.toUpperCase() })}
                                    className="h-10 uppercase"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                rows={3}
                                placeholder="Mô tả chi tiết về voucher..."
                                value={formValues.description}
                                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Gift className="h-4 w-4 text-gray-500" />
                                    Loại voucher <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.discountType}
                                    onValueChange={(value) => setFormValues({ ...formValues, discountType: value })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Chọn loại voucher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {voucherTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    {type.icon}
                                                    {type.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Percent className="h-4 w-4 text-gray-500" />
                                    Giá trị giảm <span className="text-red-500">*</span>
                                </label>
                                <InputNumber
                                    min={0}
                                    value={formValues.discountValue}
                                    onChange={(value) => setFormValues({ ...formValues, discountValue: value || 0 })}
                                    className="w-full h-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá trị đơn tối thiểu
                                </label>
                                <InputNumber
                                    min={0}
                                    value={formValues.minPurchaseAmount}
                                    onChange={(value) => setFormValues({ ...formValues, minPurchaseAmount: value || 0 })}
                                    className="w-full h-10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giảm tối đa
                                </label>
                                <InputNumber
                                    min={0}
                                    value={formValues.maxDiscountAmount}
                                    onChange={(value) => setFormValues({ ...formValues, maxDiscountAmount: value || 0 })}
                                    className="w-full h-10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giới hạn sử dụng
                                </label>
                                <InputNumber
                                    min={1}
                                    value={formValues.usageLimit}
                                    onChange={(value) => setFormValues({ ...formValues, usageLimit: value || 1 })}
                                    className="w-full h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số lượt đã sử dụng
                                </label>
                                <InputNumber
                                    min={0}
                                    value={formValues.usedCount}
                                    onChange={(value) => setFormValues({ ...formValues, usedCount: value || 0 })}
                                    className="w-full h-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    Ngày bắt đầu <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={formValues.startDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormValues({ ...formValues, startDate: value });
                                        // Validate endDate
                                        if (formValues.endDate && new Date(value) >= new Date(formValues.endDate)) {
                                            notification.error('Ngày bắt đầu phải trước ngày kết thúc');
                                        }
                                    }}
                                    className="h-10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    Ngày kết thúc <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={formValues.endDate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFormValues({ ...formValues, endDate: value });
                                        // Validate startDate
                                        if (formValues.startDate && new Date(value) <= new Date(formValues.startDate)) {
                                            notification.error('Ngày kết thúc phải sau ngày bắt đầu');
                                        }
                                    }}
                                    className="h-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setModalVisible(false);
                                    setFormValues({
                                        name: '',
                                        code: '',
                                        description: '',
                                        discountType: 'PERCENTAGE',
                                        discountValue: 10,
                                        minPurchaseAmount: 50000,
                                        maxDiscountAmount: 100000,
                                        usageLimit: 100,
                                        usedCount: 0,
                                        startDate: '',
                                        endDate: ''
                                    });
                                }}
                                className="h-10"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        {editingVoucher ? 'Cập nhật' : 'Tạo voucher'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Detail Modal */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Eye className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="text-xl font-semibold">Chi tiết voucher</span>
                        </div>
                    }
                    open={detailModalVisible}
                    onCancel={handleDetailModalCancel}
                    width={700}
                    footer={
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={handleDetailModalCancel}
                                className="h-10"
                            >
                                Đóng
                            </Button>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
                                onClick={() => {
                                    setDetailModalVisible(false);
                                    handleEditVoucher(selectedVoucher);
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                            </Button>
                        </div>
                    }
                >
                    {selectedVoucher && (() => {
                        const isPercentage = selectedVoucher.discountType?.toUpperCase() === 'PERCENTAGE';
                        const status = calculateStatus(selectedVoucher);
                        const statusInfo = statusConfig[status];

                        return (
                            <div className="space-y-6">
                                <Card className="p-4 border-l-4 border-l-indigo-500">
                                    <h3 className="text-lg font-semibold mb-2">{selectedVoucher.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Tag color="blue">{selectedVoucher.code}</Tag>
                                        <Tag color={statusInfo.color} className="flex items-center gap-1">
                                            {statusInfo.icon}
                                            {statusInfo.label}
                                        </Tag>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="p-4">
                                        <h4 className="font-semibold mb-3">Thông tin cơ bản</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Mô tả:</span>
                                                <p className="font-medium">{selectedVoucher.description || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Loại:</span>
                                                <p className="font-medium">
                                                    {voucherTypes.find(t => t.value === selectedVoucher.discountType)?.label || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Giá trị:</span>
                                                <p className="font-semibold text-indigo-600">
                                                    {isPercentage
                                                        ? `${selectedVoucher.discountValue}%`
                                                        : `${Number(selectedVoucher.discountValue || 0).toLocaleString('vi-VN')}đ`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-4">
                                        <h4 className="font-semibold mb-3">Điều kiện áp dụng</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Giá trị đơn tối thiểu:</span>
                                                <p className="font-medium">
                                                    {Number(selectedVoucher.minPurchase || selectedVoucher.minPurchaseAmount || 0).toLocaleString('vi-VN')}đ
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Giảm tối đa:</span>
                                                <p className="font-medium">
                                                    {Number(selectedVoucher.maxDiscount || selectedVoucher.maxDiscountAmount || 0).toLocaleString('vi-VN')}đ
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Lượt sử dụng:</span>
                                                <p className="font-medium">
                                                    {selectedVoucher.usedCount || 0}/{selectedVoucher.usageLimit || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                <Card className="p-4">
                                    <h4 className="font-semibold mb-3">Thời gian áp dụng</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>
                                            {dayjs(selectedVoucher.startDate).format('DD/MM/YYYY HH:mm')} - {dayjs(selectedVoucher.endDate).format('DD/MM/YYYY HH:mm')}
                                        </span>
                                    </div>
                                </Card>

                                {(selectedVoucher.applicableMovies?.length > 0 ||
                                    selectedVoucher.applicableCinemas?.length > 0 ||
                                    selectedVoucher.applicableDays?.length > 0 ||
                                    selectedVoucher.timeRange) && (
                                        <Card className="p-4">
                                            <h4 className="font-semibold mb-3">Điều kiện bổ sung</h4>
                                            <div className="space-y-2 text-sm">
                                                {selectedVoucher.applicableMovies?.length > 0 && (
                                                    <div>
                                                        <span className="text-gray-500">Áp dụng cho phim:</span>
                                                        <p className="font-medium">
                                                            {selectedVoucher.applicableMovies.map(id => movies.find(m => m.id === id)?.title).filter(Boolean).join(', ') || 'N/A'}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedVoucher.applicableCinemas?.length > 0 && (
                                                    <div>
                                                        <span className="text-gray-500">Áp dụng cho rạp:</span>
                                                        <p className="font-medium">
                                                            {selectedVoucher.applicableCinemas.map(id => cinemas.find(c => c.id === id)?.name).filter(Boolean).join(', ') || 'N/A'}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedVoucher.applicableDays?.length > 0 && (
                                                    <div>
                                                        <span className="text-gray-500">Ngày trong tuần áp dụng:</span>
                                                        <p className="font-medium">
                                                            {selectedVoucher.applicableDays.map(d => daysOfWeek.find(day => day.value === d)?.label).filter(Boolean).join(', ') || 'N/A'}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedVoucher.timeRange && (
                                                    <div>
                                                        <span className="text-gray-500">Khung giờ áp dụng:</span>
                                                        <p className="font-medium">
                                                            {selectedVoucher.timeRange.start} - {selectedVoucher.timeRange.end}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    )}

                                {(selectedVoucher.createdAt || selectedVoucher.createdBy) && (
                                    <Card className="p-4 bg-gray-50">
                                        <h4 className="font-semibold mb-3">Thông tin tạo</h4>
                                        <div className="space-y-2 text-sm">
                                            {selectedVoucher.createdAt && (
                                                <div>
                                                    <span className="text-gray-500">Ngày tạo:</span>
                                                    <p className="font-medium">
                                                        {dayjs(selectedVoucher.createdAt).format('DD/MM/YYYY HH:mm')}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedVoucher.createdBy && (
                                                <div>
                                                    <span className="text-gray-500">Người tạo:</span>
                                                    <p className="font-medium">{selectedVoucher.createdBy}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        );
                    })()}
                </Modal>
            </div>
        </div>
    );
};

export default Promotions;
