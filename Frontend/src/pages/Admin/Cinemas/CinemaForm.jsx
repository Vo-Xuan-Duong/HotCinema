import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Separator } from '../../../components/ui/separator';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Home,
    Loader2,
    Building2
} from 'lucide-react';
import cinemaService from '../../../services/cinemaService';
import regionService from '../../../services/regionService';
import { useNotification } from '../../../hooks/useNotification';

const CinemaForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingCinema, setLoadingCinema] = useState(false);
    const [regions, setRegions] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [cinemaData, setCinemaData] = useState(null);
    const [formValues, setFormValues] = useState({
        name: '',
        status: 'active',
        cityId: '',
        address: '',
        description: '',
        image: ''
    });

    const isEditMode = !!id;

    useEffect(() => {
        const loadRegions = async () => {
            try {
                const response = await regionService.getRegionsAllNoPage();
                const regionsData = Array.isArray(response?.data)
                    ? response.data
                    : (response?.data?.data || []);
                setRegions(regionsData);
            } catch (error) {
                console.error('Error loading regions:', error);
            }
        };
        loadRegions();
    }, []);

    // Load cinema data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadCinema = async () => {
                try {
                    setLoadingCinema(true);
                    const response = await cinemaService.getCinemaById(id);
                    const cinema = response?.data?.data || response?.data || response;

                    // Set preview image
                    if (cinema.image) {
                        setPreviewImage(cinema.image);
                    }

                    // Set form values
                    setCinemaData(cinema);
                    setFormValues({
                        name: cinema.name || '',
                        status: cinema.status || 'active',
                        cityId: cinema.cityId || cinema.city?.id || '',
                        address: cinema.address || '',
                        description: cinema.description || '',
                        image: cinema.image || ''
                    });
                } catch (error) {
                    console.error('Error loading cinema:', error);
                    showNotification('error', 'Lỗi', 'Không thể tải thông tin rạp');
                    navigate('/admin/cinemas');
                } finally {
                    setLoadingCinema(false);
                }
            };
            loadCinema();
        }
    }, [id, isEditMode, navigate, showNotification]);

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormValues(prev => ({ ...prev, image: url }));
        if (url && (url.startsWith('http') || url.startsWith('https'))) {
            setPreviewImage(url);
        } else {
            setPreviewImage(null);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // Prepare data for API
            const submitData = {
                name: values.name.trim(),
                status: values.status,
                cityId: parseInt(values.cityId),
                address: values.address.trim(),
                description: values.description?.trim() || '',
                image: values.image?.trim() || ''
            };

            if (isEditMode) {
                await cinemaService.updateCinema(id, submitData);
                showNotification('success', 'Thành công', 'Cập nhật rạp chiếu phim thành công!');
            } else {
                await cinemaService.createCinema(submitData);
                showNotification('success', 'Thành công', 'Thêm rạp chiếu phim thành công!');
            }

            navigate('/admin/cinemas');
        } catch (error) {
            console.error('Error saving cinema:', error);
            showNotification(
                'error',
                'Lỗi',
                error.response?.data?.message || `Lỗi khi ${isEditMode ? 'cập nhật' : 'thêm'} rạp`
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingCinema) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
        );
    }

    return (
        <div className="" style={{ position: 'relative', zIndex: 1 }}>
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
                        title: 'Quản lý rạp',
                        icon: <Building2 className="h-4 w-4" />,
                        href: '/admin/cinemas'
                    },
                    {
                        title: isEditMode ? 'Chỉnh sửa rạp' : 'Thêm rạp mới'
                    }
                ]}
            />

            {/* Header */}
            <div className="mb-2">
                <div className="flex items-center gap-4 mb-4">
                    <div>
                        <h2 className="m-0 mb-2 text-gray-800 text-2xl font-bold">
                            {isEditMode ? 'Chỉnh Sửa Rạp' : 'Thêm Rạp Mới'}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="rounded-xl shadow-md border border-gray-200">
                <div className="p-6">
                    {loadingCinema ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Đang tải thông tin rạp...</p>
                        </div>
                    ) : (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            // Validate required fields
                            if (!formValues.name?.trim()) {
                                showNotification('error', 'Lỗi', 'Vui lòng nhập tên rạp');
                                return;
                            }
                            if (!formValues.cityId) {
                                showNotification('error', 'Lỗi', 'Vui lòng chọn khu vực');
                                return;
                            }
                            if (!formValues.address?.trim()) {
                                showNotification('error', 'Lỗi', 'Vui lòng nhập địa chỉ');
                                return;
                            }
                            handleSubmit(formValues);
                        }}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column - Main Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                                            Thông tin cơ bản
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Tên rạp <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Nhập tên rạp"
                                                value={formValues.name}
                                                onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Trạng thái <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                value={formValues.status}
                                                onValueChange={(value) => setFormValues(prev => ({ ...prev, status: value }))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Hoạt động</SelectItem>
                                                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                                                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Khu vực <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            value={formValues.cityId ? formValues.cityId.toString() : undefined}
                                            onValueChange={(value) => setFormValues(prev => ({ ...prev, cityId: value }))}
                                            disabled={regions.length === 0}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={regions.length === 0 ? "Đang tải..." : "Chọn khu vực"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regions.length === 0 ? (
                                                    <div className="px-2 py-1.5 text-sm text-gray-500 text-center">
                                                        Đang tải...
                                                    </div>
                                                ) : (
                                                    regions.map(region => (
                                                        <SelectItem key={region.id} value={region.id.toString()}>
                                                            {region.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <Textarea
                                            rows={3}
                                            placeholder="Nhập địa chỉ chi tiết"
                                            value={formValues.address}
                                            onChange={(e) => setFormValues(prev => ({ ...prev, address: e.target.value }))}
                                            required
                                            className="w-full resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Mô tả
                                        </label>
                                        <Textarea
                                            rows={4}
                                            placeholder="Nhập mô tả về rạp (tùy chọn)"
                                            value={formValues.description}
                                            onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full resize-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Mô tả về rạp chiếu phim, tiện ích, và các thông tin khác
                                        </p>
                                    </div>
                                </div>

                                {/* Right Column - Image */}
                                <div className="lg:col-span-1">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                                                Hình ảnh
                                            </h4>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Hình ảnh URL
                                            </label>
                                            <div className="relative">
                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="https://example.com/image.jpg"
                                                    value={formValues.image}
                                                    onChange={handleImageUrlChange}
                                                    className="pl-10"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Nhập URL hình ảnh từ internet
                                            </p>
                                        </div>

                                        {/* Image Preview */}
                                        {previewImage ? (
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Xem trước
                                                </label>
                                                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="w-full h-auto object-cover"
                                                        onError={(e) => {
                                                            e.target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                                                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">
                                                    Chưa có hình ảnh
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Nhập URL để xem trước
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-8" />

                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate('/admin/cinemas')}
                                    className="w-full sm:w-auto"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {isEditMode ? 'Cập nhật rạp' : 'Thêm rạp mới'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CinemaForm;

