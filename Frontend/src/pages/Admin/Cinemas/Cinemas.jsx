import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableWrapper } from '@/components/ui/table-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tag } from '@/components/ui/tag';
import { Tooltip } from '@/components/ui/tooltip';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Store,
  MapPin,
  Home,
  Search,
  X,
  Building2
} from 'lucide-react';
import useNotification from '@/hooks/useNotification';
import cinemaService from '@/services/cinemaService';
import regionService from '@/services/regionService';

const Cinemas = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [cinemas, setCinemas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState(null);

  // Load regions on mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Load data when component mounts or when filters/pagination change
  // Note: searchText is handled client-side via getFilteredCinemas()
  useEffect(() => {
    loadCinemas();
  }, [pagination.current, pagination.pageSize, statusFilter, regionFilter]);

  const loadCinemas = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.current - 1, // Backend uses 0-based indexing
        size: pagination.pageSize
      };

      // Apply filters
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (regionFilter) {
        params.cityId = regionFilter; // Backend still uses cityId but data comes from regions
      }

      const response = await cinemaService.getAllCinemas(params);
      console.log('Cinemas response:', response);

      // Handle paginated response
      const cinemasData = response?.data?.content || response?.data || [];
      const total = response?.data?.totalElements || cinemasData.length;

      setCinemas(cinemasData);
      setPagination(prev => ({
        ...prev,
        total
      }));
    } catch (error) {
      console.error('Error loading cinemas:', error);
      notification.error('Lỗi khi tải danh sách rạp');
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      const regionsResponse = await regionService.getRegionsAllNoPage();
      console.log('Regions response:', regionsResponse);

      let regionsData = [];
      if (Array.isArray(regionsResponse?.data)) {
        regionsData = regionsResponse.data;
      } else if (Array.isArray(regionsResponse?.data?.data)) {
        regionsData = regionsResponse.data.data;
      } else if (regionsResponse?.data) {
        regionsData = regionsResponse.data.content || regionsResponse.data.regions || [];
      }

      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading regions:', error);
      notification.error('Lỗi khi tải danh sách khu vực');
    }
  };

  // Filter cinemas by search text
  const getFilteredCinemas = () => {
    if (!searchText) return cinemas;
    return cinemas.filter(cinema => {
      const matchesSearch = cinema.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        cinema.address?.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  };

  // Calculate statistics
  const cinemaStats = {
    total: pagination.total,
    active: cinemas.filter(c => c.status === 'active' || c.isActive).length,
    totalRooms: cinemas.reduce((sum, c) => sum + (c.numberOfRooms || 0), 0),
  };

  // Handle delete cinema
  const handleDeleteCinema = async (cinemaId) => {
    try {
      await cinemaService.deleteCinema(cinemaId);
      notification.success('Xóa rạp chiếu phim thành công!');
      await loadCinemas(); // Reload current page
    } catch (error) {
      console.error('Error deleting cinema:', error);
      notification.error(error.response?.data?.message || 'Lỗi khi xóa rạp');
    }
  };

  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
  };

  // Handle filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  const handleRegionFilterChange = (value) => {
    setRegionFilter(value === 'all' ? null : value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setRegionFilter(null);
    setSearchText('');
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const hasActiveFilters = statusFilter !== 'all' || regionFilter || searchText;

  // Render trạng thái
  const renderStatus = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Hoạt động' },
      inactive: { color: 'red', text: 'Không hoạt động' },
      maintenance: { color: 'orange', text: 'Bảo trì' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image, record) => (
        <img
          src={image || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="}
          alt={record.name}
          className="w-[60px] h-[40px] object-cover rounded"
        />
      ),
    },
    {
      title: 'Tên rạp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span
          onClick={() => navigate(`/admin/cinemas/detail/${record.id}`)}
          style={{
            color: '#1890ff',
            cursor: 'pointer',
            fontWeight: 500,
            textDecoration: 'underline'
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Phòng chiếu',
      dataIndex: 'numberOfRooms',
      key: 'numberOfRooms',
      width: 100,
      align: 'center',
      // render: (rooms) => rooms?.length || 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: renderStatus,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Chỉnh sửa">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/cinemas/${record.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Xóa">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa rạp này?')) {
                  handleDeleteCinema(record.id);
                }
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  // Scroll to top when pagination changes
  const tableRef = React.useRef(null);
  const handleTableChange = (page, pageSize) => {
    handlePageChange(page, pageSize);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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
              title: 'Quản lý rạp',
              icon: <Building2 className="h-4 w-4" />
            }
          ]}
        />

        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-gray-900 mb-2 text-2xl font-bold">
              Quản lý Rạp Chiếu Phim
            </h2>
            <p className="text-gray-600 block">
              Quản lý thông tin các rạp chiếu phim trong hệ thống
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/cinemas/create')}
            size="lg"
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm rạp mới
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-sm">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên rạp, địa chỉ..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    className="rounded-lg pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">Trạng thái</label>
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">Khu vực</label>
                <Select
                  value={regionFilter ? regionFilter.toString() : "all"}
                  onValueChange={handleRegionFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả khu vực</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id.toString()}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-200">
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Search className="h-4 w-4" /> Đang lọc:
                </span>
                {statusFilter !== 'all' && (
                  <Tag color="blue" className="flex items-center gap-1 pr-1">
                    <span>Trạng thái: {statusFilter === 'active' ? 'Hoạt động' : statusFilter === 'inactive' ? 'Không hoạt động' : 'Bảo trì'}</span>
                    <button
                      onClick={() => handleStatusFilterChange('all')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label="Xóa bộ lọc"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Tag>
                )}
                {regionFilter && (
                  <Tag color="green" className="flex items-center gap-1 pr-1">
                    <span>Khu vực: {regions.find(r => r.id === regionFilter)?.name || regionFilter}</span>
                    <button
                      onClick={() => handleRegionFilterChange('all')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label="Xóa bộ lọc"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Tag>
                )}
                {searchText && (
                  <Tag color="info" className="flex items-center gap-1 pr-1">
                    <span>Tìm kiếm: {searchText}</span>
                    <button
                      onClick={() => setSearchText('')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Tag>
                )}
                <Button
                  onClick={handleClearFilters}
                  className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                  variant="outline"
                  size="sm"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Cinemas Table */}
        <div ref={tableRef}>
          <Card className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="border-b border-gray-200 px-5 py-4 mb-0">
              <h3 className="text-base font-semibold m-0">Danh sách rạp chiếu phim</h3>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : (
                <>
                  <TableWrapper
                    columns={columns}
                    data={getFilteredCinemas()}
                    rowKey="id"
                    pagination={false}
                  />
                  <div className="mt-4 text-right">
                    <Pagination
                      current={pagination.current}
                      pageSize={pagination.pageSize}
                      total={pagination.total}
                      onPageChange={(page, pageSize) => handleTableChange(page, pageSize)}
                      showSizeChanger
                      showTotal={(total) => `Tổng ${total} rạp`}
                      pageSizeOptions={['5', '10', '20', '50']}
                    />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cinemas;
