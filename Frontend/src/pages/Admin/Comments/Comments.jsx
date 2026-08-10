import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge-count';
import { Tabs } from '@/components/ui/tabs';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
    Eye,
    Trash2,
    Check,
    X,
    Search,
    MessageSquare,
    Heart,
    AlertTriangle,
    Filter,
    User,
    Home,
    Video,
    Loader2
} from 'lucide-react';
import moviesData from '@/data/movies.json';
import reviewService from '@/services/reviewService';
import movieService from '@/services/movieService';
import useNotification from '@/hooks/useNotification';

const Comments = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [comments, setComments] = useState([]);
    const [filteredComments, setFilteredComments] = useState([]);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [movieFilter, setMovieFilter] = useState('all');
    const [selectedComment, setSelectedComment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        loadComments(1, 10);
    }, []);

    useEffect(() => {
        filterComments();
    }, [comments, searchText, statusFilter, movieFilter, activeTab]);

    // Reset pagination when filters change
    useEffect(() => {
        if (pagination.current !== 1) {
            setPagination(prev => ({ ...prev, current: 1 }));
        }
    }, [searchText, statusFilter, movieFilter, activeTab]);

    const loadComments = async (currentPage = pagination.current, pageSize = pagination.pageSize) => {
        try {
            setLoading(true);

            // Gọi API để lấy danh sách reviews
            const response = await reviewService.getAllReviews({
                page: currentPage - 1, // Backend sử dụng page index từ 0
                size: pageSize,
                sort: 'createdAt,desc'
            });

            // Xử lý response từ API
            const reviewsData = response?.content || response?.data?.content || response?.data || [];
            const totalElements = response?.totalElements || response?.data?.totalElements || reviewsData.length;

            // Map dữ liệu từ ReviewResponse sang format hiện tại
            const mappedComments = reviewsData.map(review => ({
                id: review.id,
                comment: review.comment,
                rating: review.rating,
                userId: review.userId,
                fullName: review.fullName,
                avatarUrl: review.avatarUrl,
                createdAt: review.createdAt,
                replies: review.replies || [],
                // Giữ các trường cần thiết nếu API không trả về.
                userName: review.fullName,
                userAvatar: review.avatarUrl,
                movieId: review.movieId || null, // Có thể cần fetch thêm từ movie service
                movieTitle: review.movieTitle || 'N/A', // Có thể cần fetch thêm từ movie service
                status: review.status || 'pending', // Có thể cần thêm field status vào ReviewResponse
                likes: review.likes || 0,
                reports: review.reports || 0,
                isReported: (review.reports || 0) > 0,
                reportReasons: review.reportReasons || []
            }));

            setComments(mappedComments);

            // Cập nhật pagination
            setPagination(prev => ({
                ...prev,
                total: totalElements,
                current: currentPage,
                pageSize: pageSize
            }));

            // Load movies for filter
            try {
                const movieResponse = await movieService.listPage({ page: 0, size: 100 });
                const movieData = movieResponse?.content || movieResponse?.data?.content || movieResponse?.data || [];
                setMovies(Array.isArray(movieData) ? movieData : []);

                // Nếu reviews không có movieTitle, map từ movies list
                if (mappedComments.some(c => !c.movieTitle || c.movieTitle === 'N/A')) {
                    const commentsWithMovies = mappedComments.map(comment => {
                        if (!comment.movieTitle || comment.movieTitle === 'N/A') {
                            const movie = movieData.find(m => m.id === comment.movieId);
                            return {
                                ...comment,
                                movieTitle: movie?.title || 'N/A'
                            };
                        }
                        return comment;
                    });
                    setComments(commentsWithMovies);
                }
            } catch (err) {
                console.error('Error loading movies:', err);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            notification.error('Lỗi khi tải danh sách bình luận');
            // Fallback to empty array on error
            setComments([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const filterComments = () => {
        let filtered = [...comments];

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(comment => comment.status === activeTab);
        }

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(comment =>
                comment.comment?.toLowerCase().includes(searchText.toLowerCase()) ||
                (comment.fullName || comment.userName)?.toLowerCase().includes(searchText.toLowerCase()) ||
                comment.movieTitle?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(comment => comment.status === statusFilter);
        }

        // Filter by movie
        if (movieFilter !== 'all') {
            filtered = filtered.filter(comment => comment.movieId === parseInt(movieFilter));
        }

        setFilteredComments(filtered);

        // Update pagination total based on filtered results
        // Note: If we want server-side pagination, we should pass filters to loadComments
        setPagination(prev => ({
            ...prev,
            total: filtered.length,
            current: filtered.length > 0 ? prev.current : 1 // Reset to page 1 if no results
        }));
    };

    const handleApproveComment = async (commentId) => {
        try {
            await reviewService.approveReview(commentId);

            // Reload comments to get updated data
            await loadComments(pagination.current, pagination.pageSize);
            notification.success('Đã duyệt bình luận');
        } catch (error) {
            console.error('Error approving comment:', error);
            notification.error(error?.response?.data?.message || 'Lỗi khi duyệt bình luận');
        }
    };

    const handleRejectComment = async (commentId) => {
        try {
            await reviewService.rejectReview(commentId);

            // Reload comments to get updated data
            await loadComments(pagination.current, pagination.pageSize);
            notification.success('Đã từ chối bình luận');
        } catch (error) {
            console.error('Error rejecting comment:', error);
            notification.error(error?.response?.data?.message || 'Lỗi khi từ chối bình luận');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await reviewService.deleteReview(commentId);

            // Reload comments to get updated data
            await loadComments(pagination.current, pagination.pageSize);
            notification.success('Đã xóa bình luận');
        } catch (error) {
            console.error('Error deleting comment:', error);
            notification.error(error?.response?.data?.message || 'Lỗi khi xóa bình luận');
        }
    };

    const handleViewDetail = (comment) => {
        setSelectedComment(comment);
        setShowDetailModal(true);
    };

    // Handle table change (pagination)
    const handleTableChange = (page, pageSize) => {
        const newPageSize = pageSize || pagination.pageSize;
        setPagination(prev => ({
            current: page,
            pageSize: newPageSize,
            total: prev.total
        }));
        loadComments(page, newPageSize);
    };

    // Handle page size change
    const handlePageSizeChange = (current, newPageSize) => {
        setPagination(prev => ({
            current: 1,
            pageSize: newPageSize,
            total: prev.total
        }));
        loadComments(1, newPageSize);
    };

    // Get paginated comments from filtered results
    const getPaginatedComments = () => {
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredComments.slice(start, end);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // Handle both LocalDateTime string and Date object
            const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
            return date.toLocaleString('vi-VN');
        } catch (error) {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'pending': return 'orange';
            case 'rejected': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'Đã duyệt';
            case 'pending': return 'Chờ duyệt';
            case 'rejected': return 'Đã từ chối';
            default: return status;
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            width: 200,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={record.avatarUrl || record.userAvatar} />
                        <AvatarFallback className="bg-gray-200">
                            <User className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <span className="font-semibold">{record.fullName || record.userName}</span>
                        <br />
                        <span className="text-muted-foreground text-xs">
                            ID: {record.userId}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Phim',
            dataIndex: 'movieTitle',
            key: 'movieTitle',
            width: 150,
            render: (title, record) => (
                <Button
                    variant="link"
                    onClick={() => navigate(`/admin/movies/${record.movieId}`)}
                    className="p-0 h-auto"
                >
                    {title}
                </Button>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            render: (rating) => (
                <div className="flex items-center gap-2">
                    <StarRating readOnly value={rating} stars={5} className="text-yellow-400" />
                    <span className="text-sm text-muted-foreground">{rating}/5</span>
                </div>
            ),
        },
        {
            title: 'Bình luận',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment) => (
                <p className="m-0 max-w-[300px] line-clamp-2">
                    {comment}
                </p>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: (date) => formatDate(date),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 250,
            render: (_, record) => (
                <TooltipProvider>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all"
                                    onClick={() => handleViewDetail(record)}
                                >
                                    <Eye className="h-4 w-4 mr-1.5" />
                                    <span className="text-xs font-medium">Xem</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all"
                                    onClick={() => {
                                        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
                                            handleDeleteComment(record.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    <span className="text-xs font-medium">Xóa</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xóa bình luận</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            ),
        },
    ];

    const tabItems = [
        { key: 'all', label: `Tất cả (${comments.length})`, icon: <MessageSquare /> },
        { key: 'pending', label: `Chờ duyệt (${comments.filter(c => c.status === 'pending').length})`, icon: <Filter /> },
        { key: 'approved', label: `Đã duyệt (${comments.filter(c => c.status === 'approved').length})`, icon: <Check /> },
        { key: 'rejected', label: `Đã từ chối (${comments.filter(c => c.status === 'rejected').length})`, icon: <X /> }
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
                        title: 'Quản lý bình luận',
                        icon: <MessageSquare className="h-4 w-4" />
                    }
                ]}
            />

            {/* Header */}
            <Card className="mb-6 shadow-lg border-0 bg-card">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground m-0">
                                Quản lý Bình luận
                            </h2>
                            <p className="text-muted-foreground text-sm m-0 mt-1">
                                Quản lý và duyệt các bình luận từ người dùng
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-end bg-background p-4 rounded-lg border border-border">
                        <div className="flex-1 min-w-[250px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm bình luận, người dùng, phim..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                        </div>

                        <div className="w-[220px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                Lọc theo phim
                            </label>
                            <div className="relative">
                                <Select
                                    value={movieFilter || "all"}
                                    onValueChange={setMovieFilter}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Tất cả phim" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[9999]">
                                        <SelectItem value="all">Tất cả phim</SelectItem>
                                        {movies.length > 0 ? movies.map(movie => (
                                            <SelectItem key={movie.id} value={movie.id.toString()}>
                                                {movie.title}
                                            </SelectItem>
                                        )) : (moviesData && moviesData.length > 0 && moviesData.map(movie => (
                                            <SelectItem key={movie.id} value={movie.id.toString()}>
                                                {movie.title}
                                            </SelectItem>
                                        )))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="w-[200px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                                <Filter className="h-4 w-4" />
                                Lọc theo trạng thái
                            </label>
                            <div className="relative">
                                <Select
                                    value={statusFilter || "all"}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Tất cả" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[9999]">
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                                        <SelectItem value="approved">Đã duyệt</SelectItem>
                                        <SelectItem value="rejected">Đã từ chối</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Comments Table */}
            <Card className="shadow-lg border-0 bg-card">
                <div className="p-6">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredComments.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg font-medium">Không tìm thấy bình luận nào</p>
                            <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc để tìm kiếm</p>
                        </div>
                    ) : (
                        <>
                            <DataTable
                                fields={columns}
                                data={getPaginatedComments()}
                                getRowId="id"
                                pageControls={false}
                                className="overflow-x-auto border border-border rounded-lg"
                            />
                            {pagination.total > 0 && (
                                <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border">
                                    <div className="text-sm text-muted-foreground">
                                        Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tổng số {pagination.total} bình luận
                                    </div>
                                    <Pagination
                                        page={pagination.current}
                                        itemsPerPage={pagination.pageSize}
                                        totalItems={pagination.total}
                                        allowPageSizeChange={true}
                                        allowPageJump={true}
                                        onPageChange={handleTableChange}
                                        onPageSizeChange={handlePageSizeChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>

            {/* Comment Detail Modal */}
            <ResponsiveDialog
                heading="Chi tiết bình luận"
                open={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedComment(null);
                }}
                actions={null}
                maxWidth={800}
            >
                {selectedComment && (
                    <div>
                        {/* User Info */}
                        <Card className="mb-4 border border-border shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                    <User className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-foreground m-0">Thông tin người dùng</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={selectedComment.avatarUrl || selectedComment.userAvatar} />
                                        <AvatarFallback className="bg-gray-200">
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="text-lg font-semibold m-0 text-foreground">{selectedComment.fullName || selectedComment.userName}</h4>
                                        <span className="text-muted-foreground text-sm">ID: {selectedComment.userId}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Movie Info */}
                        <Card className="mb-4 border border-border shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                    <Video className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-foreground m-0">Thông tin phim</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700">Phim:</span>
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-indigo-600 hover:text-indigo-700 font-medium"
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            navigate(`/admin/movies/${selectedComment.movieId}`);
                                        }}
                                    >
                                        {selectedComment.movieTitle}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Comment Content */}
                        <Card className="mb-4 border border-border shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-foreground m-0">Nội dung bình luận</h3>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-700">Đánh giá:</span>
                                        <StarRating readOnly value={selectedComment.rating} stars={5} className="text-yellow-400" />
                                        <span className="ml-2 text-muted-foreground font-medium">{selectedComment.rating}/5</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 block mb-2">Bình luận:</span>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-indigo-500">
                                            <p className="m-0 text-gray-700 leading-relaxed">{selectedComment.comment}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">Ngày tạo:</span>
                                        <span className="text-muted-foreground">{formatDate(selectedComment.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Status & Stats */}
                        <Card className="mb-4 border border-border shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                                    <AlertTriangle className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-foreground m-0">Trạng thái & Thống kê</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Trạng thái</span>
                                        <StatusBadge tone={getStatusColor(selectedComment.status)}>
                                            {getStatusText(selectedComment.status)}
                                        </StatusBadge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Lượt thích</span>
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-red-500" />
                                            <span className="font-semibold text-foreground">{selectedComment.likes}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Lượt báo cáo</span>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            <span className="font-semibold text-foreground">{selectedComment.reports}</span>
                                        </div>
                                    </div>
                                </div>
                                {selectedComment.reportReasons && selectedComment.reportReasons.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <span className="text-sm text-muted-foreground block mb-2">Lý do báo cáo:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedComment.reportReasons.map((reason, index) => (
                                                <StatusBadge key={index} tone="red">{reason}</StatusBadge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            {selectedComment.status === 'pending' && (
                                <>
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                                        onClick={() => {
                                            handleApproveComment(selectedComment.id);
                                            setShowDetailModal(false);
                                        }}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Duyệt bình luận
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="shadow-md hover:shadow-lg transition-all"
                                        onClick={() => {
                                            handleRejectComment(selectedComment.id);
                                            setShowDetailModal(false);
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Từ chối
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="destructive"
                                className="shadow-md hover:shadow-lg transition-all"
                                onClick={() => {
                                    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
                                        handleDeleteComment(selectedComment.id);
                                        setShowDetailModal(false);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa bình luận
                            </Button>
                        </div>
                    </div>
                )}
            </ResponsiveDialog>
        </div>
    );
};

export default Comments;
