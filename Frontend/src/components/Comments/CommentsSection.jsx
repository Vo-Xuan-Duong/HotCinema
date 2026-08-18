import { useCallback, useEffect, useState } from 'react';
import { Edit, Loader2, MessageCircle, Reply, Send, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import reviewService from '@/services/reviewService';
import { normalizeResourceId } from '@/utils/resourceId';

const PAGE_SIZE = 10;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const mapReview = (review = {}) => ({
  ...review,
  userName: review.fullName || review.userName || 'Người dùng',
  userAvatarUrl: review.avatarUrl || review.userAvatarUrl,
  replies: (review.replies || []).map((reply) => ({
    ...reply,
    userName: reply.fullName || reply.userName || 'Người dùng',
    userAvatarUrl: reply.avatarUrl || reply.userAvatarUrl,
  })),
});

const ReviewAvatar = ({ review, small = false }) => (
  <Avatar className={small ? 'h-8 w-8 shrink-0' : 'h-10 w-10 shrink-0'}>
    <AvatarImage src={review?.avatarUrl || review?.userAvatarUrl} alt={review?.fullName || review?.userName || 'Người dùng'} />
    <AvatarFallback><User className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} /></AvatarFallback>
  </Avatar>
);

const CommentsSection = ({ movieId }) => {
  const supported = reviewService.isSupported();
  const normalizedMovieId = normalizeResourceId(movieId);
  const { user, isAuthenticated } = useAuth();
  const notification = useNotification();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(supported);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);

  const sort = {
    newest: 'createdAt,desc',
    oldest: 'createdAt,asc',
    rating: 'rating,desc',
  }[sortBy] || 'createdAt,desc';

  const loadRating = useCallback(async () => {
    if (!supported || normalizedMovieId == null) return;
    try {
      const data = await reviewService.getAverageRating(normalizedMovieId);
      setAverageRating(Number(data?.averageRating) || 0);
      setRatingCount(Number(data?.countRating ?? data?.count) || 0);
    } catch {
      setAverageRating(0);
      setRatingCount(0);
    }
  }, [normalizedMovieId, supported]);

  const loadComments = useCallback(async (page = 0, append = false) => {
    if (!supported || normalizedMovieId == null) {
      setComments([]);
      setLoading(false);
      return;
    }
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const response = await reviewService.getReviewsByMovie(normalizedMovieId, {
        page,
        size: PAGE_SIZE,
        sort,
      });
      const rows = (Array.isArray(response) ? response : response?.content || []).map(mapReview);
      setComments((current) => append ? [...current, ...rows] : rows);
      setPagination({
        page: Array.isArray(response) ? page : Number(response?.number ?? page),
        totalPages: Array.isArray(response) ? 1 : Number(response?.totalPages ?? 1),
        totalElements: Array.isArray(response) ? rows.length : Number(response?.totalElements ?? rows.length),
      });
    } catch (error) {
      console.error('Error loading reviews:', error);
      if (!append) setComments([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [normalizedMovieId, sort, supported]);

  useEffect(() => {
    loadComments(0, false);
    loadRating();
  }, [loadComments, loadRating]);

  const refresh = async () => Promise.all([loadComments(0, false), loadRating()]);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated || !user || normalizedMovieId == null || !newComment.trim() || rating === 0) return;
    setSubmitting(true);
    try {
      await reviewService.createReview({
        movieId: normalizedMovieId,
        comment: newComment.trim(),
        rating: Number(rating),
      });
      setNewComment('');
      setRating(0);
      await refresh();
      notification.success('Đã gửi đánh giá');
    } catch (error) {
      notification.error(error?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId) => {
    if (!replyText.trim() || normalizedMovieId == null) return;
    setSubmitting(true);
    try {
      await reviewService.addReply(parentId, {
        movieId: normalizedMovieId,
        comment: replyText.trim(),
        rating: 5,
      });
      setReplyText('');
      setReplyingTo(null);
      await refresh();
      notification.success('Đã gửi phản hồi');
    } catch (error) {
      notification.error(error?.message || 'Không thể gửi phản hồi');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    setSubmitting(true);
    try {
      await reviewService.deleteReview(reviewId);
      await refresh();
      notification.success('Đã xóa bình luận');
    } catch (error) {
      notification.error(error?.message || 'Không thể xóa bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (review) => {
    if (!user || String(user.id) !== String(review.userId)) {
      notification.error('Bạn chỉ có thể sửa bình luận của chính mình');
      return;
    }
    setEditing(review);
    setEditText(review.comment || review.content || '');
    setEditRating(Number(review.rating) || 0);
  };

  const saveEdit = async () => {
    if (!editing || !editText.trim() || editRating === 0 || normalizedMovieId == null) return;
    setSubmitting(true);
    try {
      await reviewService.updateReview(editing.id, {
        movieId: normalizedMovieId,
        comment: editText.trim(),
        rating: Number(editRating),
        parentId: editing.parentId ? normalizeResourceId(editing.parentId) : null,
      });
      setEditing(null);
      setEditText('');
      setEditRating(0);
      await refresh();
      notification.success('Đã cập nhật bình luận');
    } catch (error) {
      notification.error(error?.message || 'Không thể cập nhật bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  if (!supported) {
    return (
      <section className="mx-auto w-full max-w-4xl py-8">
        <Alert
          type="info"
          showIcon
          message="Đánh giá phim chưa khả dụng"
          description="Backend hiện chưa có ReviewController. FE ẩn form và không tạo dữ liệu review giả trong real mode."
        />
      </section>
    );
  }

  if (loading && comments.length === 0) {
    return <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải đánh giá...</div>;
  }

  return (
    <section className="mx-auto w-full max-w-4xl py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Đánh giá và bình luận</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3"><StarRating readOnly value={averageRating} /><strong>{averageRating.toFixed(1)}/5</strong><span className="text-sm text-muted-foreground">{ratingCount} đánh giá</span></div>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Mới nhất</SelectItem><SelectItem value="oldest">Cũ nhất</SelectItem><SelectItem value="rating">Đánh giá cao</SelectItem></SelectContent></Select>
      </div>

      {isAuthenticated && user ? (
        <Card className="mb-6"><CardContent className="p-4"><form onSubmit={submitReview} className="flex gap-3"><ReviewAvatar review={user} /><div className="flex-1 space-y-3"><div className="flex items-center gap-2"><span className="text-sm font-medium">Đánh giá của bạn</span><StarRating value={rating} onValueChange={setRating} /></div><Textarea value={newComment} onChange={(event) => setNewComment(event.target.value)} maxLength={500} placeholder="Chia sẻ cảm nhận của bạn..." /><div className="flex justify-end"><Button type="submit" size="sm" disabled={!newComment.trim() || rating === 0 || submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Gửi đánh giá</Button></div></div></form></CardContent></Card>
      ) : (
        <Card className="mb-6 bg-primary/5"><CardContent className="flex flex-col items-center p-6 text-center"><MessageCircle className="h-8 w-8 text-primary" /><p className="mt-2 text-sm text-muted-foreground">Đăng nhập để bình luận và đánh giá phim.</p><Button asChild size="sm" className="mt-3"><Link to="/auth/login">Đăng nhập</Link></Button></CardContent></Card>
      )}

      {comments.length === 0 ? (
        <Empty description="Chưa có đánh giá nào" />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const mine = user && String(user.id) === String(comment.userId);
            return (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <ReviewAvatar review={comment} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium">{comment.userName}</p><p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p></div><StarRating readOnly value={Number(comment.rating || 0)} /></div>
                      {editing?.id === comment.id ? (
                        <div className="mt-3 space-y-3"><StarRating value={editRating} onValueChange={setEditRating} /><Textarea value={editText} onChange={(event) => setEditText(event.target.value)} /><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(null)}>Hủy</Button><Button size="sm" onClick={saveEdit} disabled={submitting}><Edit className="h-4 w-4" />Lưu</Button></div></div>
                      ) : <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{comment.comment || comment.content}</p>}

                      <div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyText(''); }}><Reply className="h-4 w-4" />Trả lời</Button>{mine && <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(comment)}><Edit className="h-4 w-4" />Sửa</Button>}{mine && <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteReview(comment.id)}><Trash2 className="h-4 w-4" />Xóa</Button>}</div>

                      {replyingTo === comment.id && <div className="mt-3 flex gap-2"><Textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Viết phản hồi..." /><Button size="sm" onClick={() => submitReply(comment.id)} disabled={!replyText.trim() || submitting}><Send className="h-4 w-4" /></Button></div>}

                      {comment.replies?.length > 0 && <div className="mt-4 space-y-3 border-l pl-4">{comment.replies.map((reply) => <div key={reply.id} className="flex gap-2"><ReviewAvatar review={reply} small /><div><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">{reply.userName}</span><span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span></div><p className="mt-1 text-sm text-muted-foreground">{reply.comment || reply.content}</p></div></div>)}</div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination.page + 1 < pagination.totalPages && <div className="mt-5 flex justify-center"><Button variant="outline" onClick={() => loadComments(pagination.page + 1, true)} disabled={loadingMore}>{loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}Tải thêm</Button></div>}
    </section>
  );
};

export default CommentsSection;
