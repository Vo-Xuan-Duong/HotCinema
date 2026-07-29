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

            // Gá»i API Ä‘á»ƒ láº¥y danh sÃ¡ch reviews
            const response = await reviewService.getAllReviews({
                page: currentPage - 1, // Backend sá»­ dá»¥ng page index tá»« 0
                size: pageSize,
                sort: 'createdAt,desc'
            });

            // Xá»­ lÃ½ response tá»« API
            const reviewsData = response?.content || response?.data?.content || response?.data || [];
            const totalElements = response?.totalElements || response?.data?.totalElements || reviewsData.length;

            // Map dá»¯ liá»‡u tá»« ReviewResponse sang format hiá»‡n táº¡i
            const mappedComments = reviewsData.map(review => ({
                id: review.id,
                comment: review.comment,
                rating: review.rating,
                userId: review.userId,
                fullName: review.fullName,
                avatarUrl: review.avatarUrl,
                createdAt: review.createdAt,
                replies: review.replies || [],
                // Giá»¯ láº¡i cÃ¡c field cÅ© Ä‘á»ƒ tÆ°Æ¡ng thÃ­ch (náº¿u API khÃ´ng tráº£ vá»)
                userName: review.fullName,
                userAvatar: review.avatarUrl,
                movieId: review.movieId || null, // CÃ³ thá»ƒ cáº§n fetch thÃªm tá»« movie service
                movieTitle: review.movieTitle || 'N/A', // CÃ³ thá»ƒ cáº§n fetch thÃªm tá»« movie service
                status: review.status || 'pending', // CÃ³ thá»ƒ cáº§n thÃªm field status vÃ o ReviewResponse
                likes: review.likes || 0,
                reports: review.reports || 0,
                isReported: (review.reports || 0) > 0,
                reportReasons: review.reportReasons || []
            }));

            setComments(mappedComments);

            // Cáº­p nháº­t pagination
            setPagination(prev => ({
                ...prev,
                total: totalElements,
                current: currentPage,
                pageSize: pageSize
            }));

            // Load movies for filter
            try {
                const movieResponse = await movieService.getAllMovies({ page: 0, size: 100 });
                const movieData = movieResponse?.content || movieResponse?.data?.content || movieResponse?.data || [];
                setMovies(Array.isArray(movieData) ? movieData : []);

                // Náº¿u reviews khÃ´ng cÃ³ movieTitle, map tá»« movies list
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
            notification.error('Lá»—i khi táº£i danh sÃ¡ch bÃ¬nh luáº­n');
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
            notification.success('ÄÃ£ duyá»‡t bÃ¬nh luáº­n');
        } catch (error) {
            console.error('Error approving comment:', error);
            notification.error(error?.response?.data?.message || 'Lá»—i khi duyá»‡t bÃ¬nh luáº­n');
        }
    };

    const handleRejectComment = async (commentId) => {
        try {
            await reviewService.rejectReview(commentId);

            // Reload comments to get updated data
            await loadComments(pagination.current, pagination.pageSize);
            notification.success('ÄÃ£ tá»« chá»‘i bÃ¬nh luáº­n');
        } catch (error) {
            console.error('Error rejecting comment:', error);
            notification.error(error?.response?.data?.message || 'Lá»—i khi tá»« chá»‘i bÃ¬nh luáº­n');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await reviewService.deleteReview(commentId);

            // Reload comments to get updated data
            await loadComments(pagination.current, pagination.pageSize);
            notification.success('ÄÃ£ xÃ³a bÃ¬nh luáº­n');
        } catch (error) {
            console.error('Error deleting comment:', error);
            notification.error(error?.response?.data?.message || 'Lá»—i khi xÃ³a bÃ¬nh luáº­n');
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
            case 'approved': return 'ÄÃ£ duyá»‡t';
            case 'pending': return 'Chá» duyá»‡t';
            case 'rejected': return 'ÄÃ£ tá»« chá»‘i';
            default: return status;
        }
    };

    const columns = [
        {
            title: 'NgÆ°á»i dÃ¹ng',
            key: 'user',
            width: 200,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={record.avatarUrl || record.userAvatar} />
                        <AvatarFallback className="bg-gray-200">
                            <User className="h-5 w-5 text-gray-500" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <span className="font-semibold">{record.fullName || record.userName}</span>
                        <br />
                        <span className="text-gray-500 text-xs">
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
            title: 'ÄÃ¡nh giÃ¡',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            render: (rating) => (
                <div className="flex items-center gap-2">
                    <StarRating readOnly value={rating} stars={5} className="text-yellow-400" />
                    <span className="text-sm text-gray-600">{rating}/5</span>
                </div>
            ),
        },
        {
            title: 'BÃ¬nh luáº­n',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment) => (
                <p className="m-0 max-w-[300px] line-clamp-2">
                    {comment}
                </p>
            ),
        },
        {
            title: 'NgÃ y táº¡o',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: (date) => formatDate(date),
        },
        {
            title: 'Thao tÃ¡c',
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
                            <TooltipContent>Xem chi tiáº¿t</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all"
                                    onClick={() => {
                                        if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a bÃ¬nh luáº­n nÃ y?')) {
                                            handleDeleteComment(record.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    <span className="text-xs font-medium">XÃ³a</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>XÃ³a bÃ¬nh luáº­n</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            ),
        },
    ];

    const tabItems = [
        { key: 'all', label: `Táº¥t cáº£ (${comments.length})`, icon: <MessageSquare /> },
        { key: 'pending', label: `Chá» duyá»‡t (${comments.filter(c => c.status === 'pending').length})`, icon: <Filter /> },
        { key: 'approved', label: `ÄÃ£ duyá»‡t (${comments.filter(c => c.status === 'approved').length})`, icon: <Check /> },
        { key: 'rejected', label: `ÄÃ£ tá»« chá»‘i (${comments.filter(c => c.status === 'rejected').length})`, icon: <X /> }
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
                        title: 'Quáº£n lÃ½ bÃ¬nh luáº­n',
                        icon: <MessageSquare className="h-4 w-4" />
                    }
                ]}
            />

            {/* Header */}
            <Card className="mb-6 shadow-lg border-0 bg-white">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">
                                Quáº£n lÃ½ BÃ¬nh luáº­n
                            </h2>
                            <p className="text-gray-500 text-sm m-0 mt-1">
                                Quáº£n lÃ½ vÃ  duyá»‡t cÃ¡c bÃ¬nh luáº­n tá»« ngÆ°á»i dÃ¹ng
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-[250px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                TÃ¬m kiáº¿m
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="TÃ¬m kiáº¿m bÃ¬nh luáº­n, ngÆ°á»i dÃ¹ng, phim..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                        </div>

                        <div className="w-[220px]">
                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                Lá»c theo phim
                            </label>
                            <div className="relative">
                                <Select
                                    value={movieFilter || "all"}
                                    onValueChange={setMovieFilter}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Táº¥t cáº£ phim" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[9999]">
                                        <SelectItem value="all">Táº¥t cáº£ phim</SelectItem>
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
                                Lá»c theo tráº¡ng thÃ¡i
                            </label>
                            <div className="relative">
                                <Select
                                    value={statusFilter || "all"}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="h-10 w-full">
                                        <SelectValue placeholder="Táº¥t cáº£" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="z-[9999]">
                                        <SelectItem value="all">Táº¥t cáº£</SelectItem>
                                        <SelectItem value="pending">Chá» duyá»‡t</SelectItem>
                                        <SelectItem value="approved">ÄÃ£ duyá»‡t</SelectItem>
                                        <SelectItem value="rejected">ÄÃ£ tá»« chá»‘i</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Comments Table */}
            <Card className="shadow-lg border-0 bg-white">
                <div className="p-6">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">Äang táº£i dá»¯ liá»‡u...</p>
                        </div>
                    ) : filteredComments.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium">KhÃ´ng tÃ¬m tháº¥y bÃ¬nh luáº­n nÃ o</p>
                            <p className="text-gray-400 text-sm mt-2">Thá»­ thay Ä‘á»•i bá»™ lá»c Ä‘á»ƒ tÃ¬m kiáº¿m</p>
                        </div>
                    ) : (
                        <>
                            <DataTable
                                fields={columns}
                                data={getPaginatedComments()}
                                getRowId="id"
                                pageControls={false}
                                className="overflow-x-auto border border-gray-200 rounded-lg"
                            />
                            {pagination.total > 0 && (
                                <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        Hiá»ƒn thá»‹ {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tá»•ng sá»‘ {pagination.total} bÃ¬nh luáº­n
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
                heading="Chi tiáº¿t bÃ¬nh luáº­n"
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
                        <Card className="mb-4 border border-gray-200 shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <User className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-gray-900 m-0">ThÃ´ng tin ngÆ°á»i dÃ¹ng</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={selectedComment.avatarUrl || selectedComment.userAvatar} />
                                        <AvatarFallback className="bg-gray-200">
                                            <User className="h-8 w-8 text-gray-500" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="text-lg font-semibold m-0 text-gray-900">{selectedComment.fullName || selectedComment.userName}</h4>
                                        <span className="text-gray-500 text-sm">ID: {selectedComment.userId}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Movie Info */}
                        <Card className="mb-4 border border-gray-200 shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <Video className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-gray-900 m-0">ThÃ´ng tin phim</h3>
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
                        <Card className="mb-4 border border-gray-200 shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-gray-900 m-0">Ná»™i dung bÃ¬nh luáº­n</h3>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-700">ÄÃ¡nh giÃ¡:</span>
                                        <StarRating readOnly value={selectedComment.rating} stars={5} className="text-yellow-400" />
                                        <span className="ml-2 text-gray-600 font-medium">{selectedComment.rating}/5</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 block mb-2">BÃ¬nh luáº­n:</span>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-indigo-500">
                                            <p className="m-0 text-gray-700 leading-relaxed">{selectedComment.comment}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">NgÃ y táº¡o:</span>
                                        <span className="text-gray-600">{formatDate(selectedComment.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Status & Stats */}
                        <Card className="mb-4 border border-gray-200 shadow-sm">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <AlertTriangle className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-semibold text-gray-900 m-0">Tráº¡ng thÃ¡i & Thá»‘ng kÃª</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Tráº¡ng thÃ¡i</span>
                                        <StatusBadge tone={getStatusColor(selectedComment.status)}>
                                            {getStatusText(selectedComment.status)}
                                        </StatusBadge>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">LÆ°á»£t thÃ­ch</span>
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-red-500" />
                                            <span className="font-semibold text-gray-900">{selectedComment.likes}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">LÆ°á»£t bÃ¡o cÃ¡o</span>
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            <span className="font-semibold text-gray-900">{selectedComment.reports}</span>
                                        </div>
                                    </div>
                                </div>
                                {selectedComment.reportReasons && selectedComment.reportReasons.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <span className="text-sm text-gray-600 block mb-2">LÃ½ do bÃ¡o cÃ¡o:</span>
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
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
                                        Duyá»‡t bÃ¬nh luáº­n
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
                                        Tá»« chá»‘i
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="destructive"
                                className="shadow-md hover:shadow-lg transition-all"
                                onClick={() => {
                                    if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a bÃ¬nh luáº­n nÃ y?')) {
                                        handleDeleteComment(selectedComment.id);
                                        setShowDetailModal(false);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                XÃ³a bÃ¬nh luáº­n
                            </Button>
                        </div>
                    </div>
                )}
            </ResponsiveDialog>
        </div>
    );
};

export default Comments;
