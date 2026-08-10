import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Eye, Loader2, MessageSquare, Trash2, User, X } from 'lucide-react';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import movieService from '@/services/movieService';
import reviewService from '@/services/reviewService';
import useNotification from '@/hooks/useNotification';

const unwrapPage = (response) => {
  if (Array.isArray(response)) return { content: response, totalElements: response.length };
  const content = Array.isArray(response?.content) ? response.content : [];
  return {
    content,
    totalElements: Number(response?.totalElements ?? response?.total ?? content.length),
  };
};

const reviewStatus = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'APPROVED') return { value, label: 'Đã duyệt', tone: 'success' };
  if (value === 'PENDING') return { value, label: 'Chờ duyệt', tone: 'warning' };
  if (value === 'REJECTED') return { value, label: 'Đã từ chối', tone: 'destructive' };
  return { value, label: status ? String(status) : 'Chưa có trạng thái', tone: 'neutral' };
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};

const Comments = () => {
  const notification = useNotification();
  const [reviews, setReviews] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadMovies = useCallback(async () => {
    try {
      const result = await movieService.list({ page: 0, size: 200 });
      setMovies(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading movie references for reviews:', error);
      setMovies([]);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews({
        page: pagination.current - 1,
        size: pagination.pageSize,
        sort: 'createdAt,desc',
      });
      const page = unwrapPage(response);
      setReviews(page.content);
      setPagination((current) => ({ ...current, total: page.totalElements }));
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error('Không thể tải danh sách bình luận');
    } finally {
      setLoading(false);
    }
  }, [notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const movieById = useMemo(
    () => new Map(movies.map((movie) => [String(movie.id), movie])),
    [movies]
  );

  const movieTitleFor = (review) => review.movieTitle
    || movieById.get(String(review.movieId))?.title
    || (review.movieId ? `Phim #${review.movieId}` : 'Không có thông tin phim');

  const runModeration = async (review, action) => {
    try {
      setBusyId(review.id);
      if (action === 'approve') {
        await reviewService.approveReview(review.id);
        notification.success('Đã duyệt bình luận');
      } else if (action === 'reject') {
        await reviewService.rejectReview(review.id);
        notification.success('Đã từ chối bình luận');
      } else if (action === 'delete') {
        await reviewService.deleteReview(review.id);
        notification.success('Đã xóa bình luận');
      }
      setSelectedReview(null);
      if (action === 'delete' && reviews.length === 1 && pagination.current > 1) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadReviews();
      }
    } catch (error) {
      console.error(`Error ${action} review:`, error);
      notification.error(error?.response?.data?.message || 'Không thể cập nhật bình luận');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, review) => (
        <div className="flex min-w-[190px] items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={review.avatarUrl || review.userAvatarUrl} alt={review.fullName || 'Người dùng'} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{review.fullName || review.userName || `User #${review.userId || 'N/A'}`}</p>
            {review.userId && <p className="text-xs text-muted-foreground">ID: {review.userId}</p>}
          </div>
        </div>
      ),
    },
    {
      title: 'Phim',
      key: 'movie',
      render: (_, review) => <span className="text-sm">{movieTitleFor(review)}</span>,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => rating != null ? (
        <div className="flex items-center gap-2"><StarRating readOnly value={Number(rating)} stars={5} /><span className="text-xs text-muted-foreground">{rating}/5</span></div>
      ) : <span className="text-sm text-muted-foreground">Không có</span>,
    },
    {
      title: 'Bình luận',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment) => <p className="max-w-[360px] line-clamp-2 text-sm">{comment || 'Không có nội dung'}</p>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const meta = reviewStatus(status);
        return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, review) => {
        const meta = reviewStatus(review.status);
        const busy = busyId === review.id;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedReview(review)} aria-label="Xem bình luận"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xem chi tiết</TooltipContent></Tooltip>
              {meta.value !== 'APPROVED' && <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => runModeration(review, 'approve')} aria-label="Duyệt bình luận">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>Duyệt</TooltipContent></Tooltip>}
              {meta.value !== 'REJECTED' && <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => runModeration(review, 'reject')} aria-label="Từ chối bình luận"><X className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Từ chối</TooltipContent></Tooltip>}
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={busy} onClick={() => { if (window.confirm('Xóa bình luận này?')) runModeration(review, 'delete'); }} aria-label="Xóa bình luận"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xóa</TooltipContent></Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý bình luận"
        description="Kiểm duyệt review bằng dữ liệu và trạng thái do backend trả về; frontend không tự gán likes, reports hoặc trạng thái mặc định."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Bình luận' },
        ]}
      />

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-4 w-4 text-muted-foreground" />Danh sách bình luận</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải bình luận...</div>
          ) : reviews.length === 0 ? (
            <Empty description="Chưa có bình luận nào" />
          ) : (
            <DataTable fields={columns} rows={reviews} getRowId="id" pageControls={false} />
          )}

          {pagination.total > 0 && (
            <Pagination
              className="mt-5 border-t pt-5"
              page={pagination.current}
              itemsPerPage={pagination.pageSize}
              totalItems={pagination.total}
              allowPageSizeChange
              allowPageJump
              onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))}
              onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} bình luận`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        heading="Chi tiết bình luận"
        maxWidth={680}
        actions={selectedReview ? [
          <Button key="close" variant="outline" onClick={() => setSelectedReview(null)}>Đóng</Button>,
          reviewStatus(selectedReview.status).value !== 'APPROVED' ? <Button key="approve" disabled={busyId === selectedReview.id} onClick={() => runModeration(selectedReview, 'approve')}><Check className="h-4 w-4" />Duyệt</Button> : null,
        ].filter(Boolean) : null}
      >
        {selectedReview && (
          <div className="space-y-5">
            <DetailList columns={2}>
              <DetailItem label="Người dùng">{selectedReview.fullName || selectedReview.userName || `User #${selectedReview.userId || 'N/A'}`}</DetailItem>
              <DetailItem label="Phim">{movieTitleFor(selectedReview)}</DetailItem>
              <DetailItem label="Đánh giá">{selectedReview.rating != null ? `${selectedReview.rating}/5` : 'Không có'}</DetailItem>
              <DetailItem label="Trạng thái"><StatusBadge tone={reviewStatus(selectedReview.status).tone}>{reviewStatus(selectedReview.status).label}</StatusBadge></DetailItem>
              <DetailItem label="Ngày tạo" wide>{formatDate(selectedReview.createdAt)}</DetailItem>
              <DetailItem label="Nội dung" wide>{selectedReview.comment || 'Không có nội dung'}</DetailItem>
            </DetailList>
            {Array.isArray(selectedReview.replies) && selectedReview.replies.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold">Phản hồi ({selectedReview.replies.length})</h3>
                <div className="space-y-2">{selectedReview.replies.map((reply) => <div key={reply.id} className="rounded-md border p-3"><p className="text-sm font-medium">{reply.fullName || reply.userName || `User #${reply.userId || 'N/A'}`}</p><p className="mt-1 text-sm text-muted-foreground">{reply.comment || 'Không có nội dung'}</p></div>)}</div>
              </div>
            )}
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Comments;
