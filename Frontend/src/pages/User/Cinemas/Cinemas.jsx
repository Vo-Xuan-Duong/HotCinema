import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Phone, Clock, Star, Home, Store, ChevronRight, Grid, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Empty } from '@/components/ui/empty';
import { Pagination } from '@/components/ui/pagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import cinemaService from '@/services/cinemaService';
import regionService from '@/services/regionService';
import ContentLoader from '@/components/Loading/ContentLoader';
import useNotification from '@/hooks/useNotification';

const Cinemas = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const notification = useNotification();
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all'); // Lưu slug của region
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);

    const [cinemas, setCinemas] = useState([]);
    const [regions, setRegions] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        current: 1,
        pageSize: 9
    });

    // Load regions once
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const regionsResponse = await regionService.getAllRegions();
                const regionsData = Array.isArray(regionsResponse?.data?.content)
                    ? regionsResponse.data.content
                    : (Array.isArray(regionsResponse?.data) ? regionsResponse.data : []);
                // Lưu toàn bộ region objects với slug
                setRegions(regionsData);
            } catch (error) {
                console.error('Error loading regions:', error);
                notification.error('Không thể tải danh sách khu vực');
            }
        };
        fetchRegions();
    }, []);

    // Load cinemas with pagination
    useEffect(() => {
        const fetchCinemas = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage - 1, // API thường dùng 0-based index
                    size: pageSize
                };

                const cinemasResponse = await cinemaService.getAllCinemas(params);

                // Xử lý response có phân trang
                let cinemasData = [];
                let paginationData = {
                    total: 0,
                    totalPages: 0,
                    current: currentPage,
                    pageSize: pageSize
                };

                if (cinemasResponse?.data) {
                    // Nếu có cấu trúc phân trang Spring Boot
                    if (cinemasResponse.data.content) {
                        cinemasData = Array.isArray(cinemasResponse.data.content)
                            ? cinemasResponse.data.content
                            : [];
                        paginationData = {
                            total: cinemasResponse.data.totalElements || 0,
                            totalPages: cinemasResponse.data.totalPages || 0,
                            current: (cinemasResponse.data.number || 0) + 1,
                            pageSize: cinemasResponse.data.size || pageSize
                        };
                    }
                    // Nếu là array trực tiếp
                    else if (Array.isArray(cinemasResponse.data)) {
                        cinemasData = cinemasResponse.data;
                        paginationData = {
                            total: cinemasData.length,
                            totalPages: Math.ceil(cinemasData.length / pageSize),
                            current: currentPage,
                            pageSize: pageSize
                        };
                    }
                }

                setCinemas(cinemasData);
                setPagination(paginationData);
            } catch (error) {
                console.error('Error loading cinemas:', error);
                notification.error('Không thể tải danh sách rạp chiếu');
                setCinemas([]);
                setPagination({
                    total: 0,
                    totalPages: 0,
                    current: 1,
                    pageSize: pageSize
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCinemas();
    }, [currentPage, pageSize, notification]);

    // Filter cinemas client-side (search và region filter)
    const filteredCinemas = cinemas.filter(cinema => {
        const matchesSearch = !searchText ||
            cinema.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            cinema.address?.toLowerCase().includes(searchText.toLowerCase());

        // Kiểm tra region theo slug hoặc name
        const cinemaRegionSlug = typeof cinema.region === 'object' ? cinema.region?.slug : null;
        const cinemaRegionName = typeof cinema.region === 'object' ? cinema.region?.name : null;
        const matchesRegion = selectedRegion === 'all' ||
            cinemaRegionSlug === selectedRegion ||
            cinemaRegionName === selectedRegion;

        return matchesSearch && matchesRegion;
    });

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        if (size) {
            setPageSize(size);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Reset về trang 1 khi filter thay đổi
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchText, selectedRegion]);

    if (loading) {
        return <ContentLoader message="Đang tải danh sách rạp..." />;
    }

    return (
        <div className="bg-background relative min-h-screen pb-16 pt-16 overflow-hidden">
            {/* Cinematic Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-[20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-700"></div>
            </div>
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-16 relative z-10">
                {/* Hero Title */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/80 to-primary">
                        HỆ THỐNG RẠP CHIẾU
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Tìm rạp chiếu phim gần bạn nhất và trải nghiệm không gian điện ảnh đỉnh cao
                    </p>
                </div>
                <div className="mb-12">
                    <Card className="rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-2xl overflow-hidden p-2">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                <Input
                                    placeholder="Tìm kiếm tên rạp hoặc địa chỉ..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="pl-10 h-12 rounded-xl bg-background/50 border-white/10 text-base transition-all duration-300 focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline" className="w-full h-12 rounded-xl bg-background/50 border-white/10 font-semibold text-base transition-all duration-300 hover:border-primary hover:text-primary"
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span>Khu vực</span>
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={() => setSelectedRegion('all')}
                                        className={selectedRegion === 'all' ? 'bg-primary/10' : ''}
                                    >
                                        Tất cả khu vực
                                    </DropdownMenuItem>
                                    {Array.isArray(regions) && regions.map(region => (
                                        <DropdownMenuItem
                                            key={region.id || region.slug || region.name}
                                            onClick={() => setSelectedRegion(region.slug || region.name)}
                                            className={selectedRegion === (region.slug || region.name) ? 'bg-primary/10' : ''}
                                        >
                                            {region.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Card>
                </div>

                <div className="mt-6">
                    {filteredCinemas.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCinemas.map((cinema, index) => (
                                    <Link key={cinema.id} to={`/cinemas/${cinema.id}`} className="no-underline text-inherit block h-full">
                                        <Card className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 hover:shadow-[0_15px_30px_rgba(229,9,20,0.15)] hover:-translate-y-2 hover:border-primary/50 cursor-pointer h-full overflow-hidden group">
                                            <div className="relative">
                                                <div className="relative w-full h-[200px] md:h-[240px] lg:h-[220px] overflow-hidden bg-black/50">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        style={{ minHeight: '100%' }}
                                                        className="border-0 scale-100 group-hover:scale-105 transition-transform duration-500 absolute inset-0"
                                                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(cinema.address)}&zoom=15`}
                                                        allowFullScreen
                                                        title={cinema.name}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
                                                </div>

                                                <div className="p-5">
                                                    <div className="flex gap-4 items-start mb-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                                                                <span className="text-white font-bold text-lg">
                                                                    {cinema.name?.substring(0, 2).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="m-0 mb-2 text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                                                {cinema.name}
                                                            </h4>

                                                            <div className="flex items-start gap-2 mb-3">
                                                                <MapPin className="text-primary mt-0.5 flex-shrink-0 h-4 w-4" />
                                                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                                                                    {cinema.address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-red-700 border-0 font-semibold text-sm tracking-wide shadow-md hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all duration-300"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.location.href = `/cinemas/${cinema.id}`;
                                                        }}
                                                    >
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        <span>XEM LỊCH CHIẾU</span>
                                                        <ChevronRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            <div className="flex justify-center items-center mt-12 pt-8 border-t border-border">
                                <Pagination
                                    page={pagination.current}
                                    totalItems={pagination.total}
                                    itemsPerPage={pagination.pageSize}
                                    onPageChange={handlePageChange}
                                    onPageSizeChange={handlePageChange}
                                    showSizeChanger
                                    pageSizeOptions={['9', '18', '27', '36']}
                                />
                            </div>
                        </>
                    ) : (
                        <Card className="rounded-2xl shadow-lg border-0">
                            <Empty
                                description={
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground text-lg font-medium">
                                            Không tìm thấy rạp chiếu phim nào
                                        </p>
                                        <div className="mt-4">
                                            <p className="text-gray-400 text-sm">
                                                Thử thay đổi từ khóa tìm kiếm hoặc khu vực
                                            </p>
                                        </div>
                                    </div>
                                }
                            />
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cinemas;
