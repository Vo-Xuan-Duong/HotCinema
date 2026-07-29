import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
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
      notification.error('Lá»—i khi táº£i danh sÃ¡ch ráº¡p');
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
      notification.error('Lá»—i khi táº£i danh sÃ¡ch khu vá»±c');
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
      notification.success('XÃ³a ráº¡p chiáº¿u phim thÃ nh cÃ´ng!');
      await loadCinemas(); // Reload current page
    } catch (error) {
      console.error('Error deleting cinema:', error);
      notification.error(error.response?.data?.message || 'Lá»—i khi xÃ³a ráº¡p');
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

  // Render tráº¡ng thÃ¡i
  const renderStatus = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Hoáº¡t Ä‘á»™ng' },
      inactive: { color: 'red', text: 'KhÃ´ng hoáº¡t Ä‘á»™ng' },
      maintenance: { color: 'orange', text: 'Báº£o trÃ¬' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <StatusBadge tone={config.color}>{config.text}</StatusBadge>;
  };

  // Cáº¥u hÃ¬nh cá»™t báº£ng
  const columns = [
    {
      title: 'HÃ¬nh áº£nh',
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
      title: 'TÃªn ráº¡p',
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
      title: 'Äá»‹a chá»‰',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'PhÃ²ng chiáº¿u',
      dataIndex: 'numberOfRooms',
      key: 'numberOfRooms',
      width: 100,
      align: 'center',
      // render: (rooms) => rooms?.length || 0,
    },
    {
      title: 'Tráº¡ng thÃ¡i',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: renderStatus,
    },
    {
      title: 'Thao tÃ¡c',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Chá»‰nh sá»­a">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/cinemas/${record.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="XÃ³a">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a ráº¡p nÃ y?')) {
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
              title: 'Quáº£n lÃ½ ráº¡p',
              icon: <Building2 className="h-4 w-4" />
            }
          ]}
        />

        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-gray-900 mb-2 text-2xl font-bold">
              Quáº£n lÃ½ Ráº¡p Chiáº¿u Phim
            </h2>
            <p className="text-gray-600 block">
              Quáº£n lÃ½ thÃ´ng tin cÃ¡c ráº¡p chiáº¿u phim trong há»‡ thá»‘ng
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/cinemas/create')}
            size="lg"
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            ThÃªm ráº¡p má»›i
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-sm">TÃ¬m kiáº¿m</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="TÃ¬m kiáº¿m theo tÃªn ráº¡p, Ä‘á»‹a chá»‰..."
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
                <label className="block mb-2 font-semibold text-sm">Tráº¡ng thÃ¡i</label>
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Táº¥t cáº£ tráº¡ng thÃ¡i" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
                    <SelectItem value="active">Hoáº¡t Ä‘á»™ng</SelectItem>
                    <SelectItem value="inactive">KhÃ´ng hoáº¡t Ä‘á»™ng</SelectItem>
                    <SelectItem value="maintenance">Báº£o trÃ¬</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-sm">Khu vá»±c</label>
                <Select
                  value={regionFilter ? regionFilter.toString() : "all"}
                  onValueChange={handleRegionFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Táº¥t cáº£ khu vá»±c" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Táº¥t cáº£ khu vá»±c</SelectItem>
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
                  <Search className="h-4 w-4" /> Äang lá»c:
                </span>
                {statusFilter !== 'all' && (
                  <StatusBadge tone="blue" className="flex items-center gap-1 pr-1">
                    <span>Tráº¡ng thÃ¡i: {statusFilter === 'active' ? 'Hoáº¡t Ä‘á»™ng' : statusFilter === 'inactive' ? 'KhÃ´ng hoáº¡t Ä‘á»™ng' : 'Báº£o trÃ¬'}</span>
                    <button
                      onClick={() => handleStatusFilterChange('all')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label="XÃ³a bá»™ lá»c"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </StatusBadge>
                )}
                {regionFilter && (
                  <StatusBadge tone="green" className="flex items-center gap-1 pr-1">
                    <span>Khu vá»±c: {regions.find(r => r.id === regionFilter)?.name || regionFilter}</span>
                    <button
                      onClick={() => handleRegionFilterChange('all')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label="XÃ³a bá»™ lá»c"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </StatusBadge>
                )}
                {searchText && (
                  <StatusBadge tone="info" className="flex items-center gap-1 pr-1">
                    <span>TÃ¬m kiáº¿m: {searchText}</span>
                    <button
                      onClick={() => setSearchText('')}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      aria-label="XÃ³a tÃ¬m kiáº¿m"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </StatusBadge>
                )}
                <Button
                  onClick={handleClearFilters}
                  className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                  variant="outline"
                  size="sm"
                >
                  XÃ³a bá»™ lá»c
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Cinemas Table */}
        <div ref={tableRef}>
          <Card className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="border-b border-gray-200 px-5 py-4 mb-0">
              <h3 className="text-base font-semibold m-0">Danh sÃ¡ch ráº¡p chiáº¿u phim</h3>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : (
                <>
                  <DataTable
                    fields={columns}
                    data={getFilteredCinemas()}
                    getRowId="id"
                    pageControls={false}
                  />
                  <div className="mt-4 text-right">
                    <Pagination
                      page={pagination.current}
                      itemsPerPage={pagination.pageSize}
                      totalItems={pagination.total}
                      onPageChange={(page, pageSize) => handleTableChange(page, pageSize)}
                      showSizeChanger
                      showTotal={(total) => `Tá»•ng ${total} ráº¡p`}
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
