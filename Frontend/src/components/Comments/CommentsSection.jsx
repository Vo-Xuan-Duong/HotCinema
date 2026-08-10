import { useCallback, useEffect, useState } from 'react';
import { Clock, Edit, Loader2, MessageCircle, Reply, Send, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import reviewService from '@/services/reviewService';

const PAGE_SIZE = 10;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const getDisplayName = (review) => review?.fullName || review?.userName || 'Người dùng';

const mapReview = (review) => ({
  ...review,
  userName: review.fullName || review.userName,
  userAvatarUrl: review.avatarUrl || review.userAvatarUrl,
  replies: (review.replies || []).map((reply) => ({
    ...reply,
    userName: reply.fullName || reply.userName,
    userAvatarUrl: reply.avatarUrl || reply.userAvatarUrl,
  })),
});

const ReviewAvatar = ({ review, size = 'md' }) => {
  const displayName = getDisplayName(review);
  return (
    <Avatar className={size === 'sm' ? 'h-8 w-8 shrink-0' : 'h-10 w-10 shrink-0'}>
      <AvatarImage src={review?.avatarUrl || review?.userAvatarUrl} alt={displayName} />
      <AvatarFallback>
        <User className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </AvatarFallback>
    </Avatar>
  );
};

const InlineEditor = ({
  text,
  rating,
  setText,
  setRating,
  onCancel,
  onSave,
  submitting,
  compact = false,
}) => (
  <Card className="mt-3 border-primary/20 bg-muted/20 shadow-none">
    <CardContent className={compact ? 'space-y-3 p-3' : 'space-y-4 p-4'}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Xếp hạng</label>
        <div className="flex items-center gap-2">
          <StarRating value={rating} onValueChange={setRating} />
          <span className="text-xs text-muted-foreground">{rating || 0}/5</span>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Nội dung</label>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Nhập nội dung..."
          maxLength={500}
          className={compact ? 'min-h-20 resize-none' : 'min-h-24 resize-none'}
        />
        <p className="text-right text-xs text-muted-foreground">{text.length}/500 ký tự</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Hủy</Button>
        <Button type="button" size="sm" onClick={onSave} disabled={!text.trim() || rating === 0 || submitting}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
          Lưu thay đổi
        </Button>
      </div>
    </CardContent>
  </Card>
);

const CommentsSection = ({ movieId }) => {
  const { user, isAuthenticated } = useAuth();
  const notification = useNotification();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, size: PAGE_SIZE, totalPages: 0, totalElements: 0 });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [expandedReplies, setExpandedReplies] = useState({});

  const sortParam = {
    newest: 'createdAt,desc',
    oldest: 'createdAt,asc',
    rating: 'rating,desc',
  }[sortBy] || 'createdAt,desc';

  const loadAverageRating = useCallback(async () => {
    if (!movieId) return;
    try {
      const data = await reviewService.getAverageRating(movieId);
      setAverageRating(Number(data?.averageRating) || 0);
      setRatingCount(Number(data?.countRating ?? data?.count) || 0);
    } catch (error) {
      console.error('Error loading average rating:', error);
      setAverageRating(0);
      setRatingCount(0);
    }
  }, [movieId]);

  const loadComments = useCallback(async (page = 0, { append = false } = {}) => {
    if (!movieId) return;
    append ? setLoadingMore(true) : setLoading(true);

    try {
      const response = await reviewService.getReviewsByMovie(movieId, {
        page,
        size: PAGE_SIZE,
        sort: sortParam,
      });
      const content = Array.isArray(response) ? response : response?.content || [];
      const mapped = content.map(mapReview);

      setComments((previous) => append ? [...previous, ...mapped] : mapped);
      setPagination({
        page: Array.isArray(response) ? page : response?.number ?? page,
        size: Array.isArray(response) ? PAGE_SIZE : response?.size ?? PAGE_SIZE,
        totalPages: Array.isArray(response) ? 1 : response?.totalPages ?? 1,
        totalElements: Array.isArray(response) ? response.length : response?.totalElements ?? mapped.length,
      });
    } catch (error) {
      console.error('Error loading comments:', error);
      if (!append) setComments([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [movieId, sortParam]);

  useEffect(() => {
    if (!movieId) return;
    loadComments(0);
    loadAverageRating();
  }, [movieId, sortBy, loadAverageRating, loadComments]);

  const refreshReviews = async () => {
    await Promise.all([loadComments(0), loadAverageRating()]);
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !user || !movieId || rating === 0) return;

    setIsSubmitting(true);
    try {
      await reviewService.createReview({
        movieId: Number(movieId),
        comment: newComment.trim(),
        rating: Number(rating),
      });
      setNewComment('');
      setRating(0);
      await refreshReviews();
      notification.success('Đã gửi bình luận thành công');
    } catch (error) {
      console.error('Error submitting comment:', error);
      notification.error(error.response?.data?.message || 'Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!replyText.trim() || !isAuthenticated || !user || !movieId) return;

    setIsSubmitting(true);
    try {
      await reviewService.addReply(parentId, {
        movieId: Number(movieId),
        comment: replyText.trim(),
        rating: 5,
      });
      setReplyText('');
      setReplyingTo(null);
      await refreshReviews();
      notification.success('Đã gửi phản hồi thành công');
    } catch (error) {
      console.error('Error submitting reply:', error);
      notification.error(error.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await reviewService.deleteReview(commentId);
      await refreshReviews();
      notification.success('Đã xóa bình luận thành công');
    } catch (error) {
      console.error('Error deleting comment:', error);
      notification.error(error.response?.data?.message || 'Không thể xóa bình luận. Vui lòng thử lại.');
    }
  };

  const startEdit = (review) => {
    if (!user || !review?.userId || String(user.id) !== String(review.userId)) {
      notification.error('Bạn chỉ có thể chỉnh sửa bình luận của chính mình');
      return;
    }
    setEditingComment(review.id);
    setEditText(review.comment || '');
    setEditRating(Number(review.rating) || 0);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
    setEditRating(0);
  };

  const findReview = (reviewId) => {
    for (const comment of comments) {
      if (comment.id === reviewId) return { review: comment, parentId: null };
      const reply = comment.replies?.find((item) => item.id === reviewId);
      if (reply) return { review: reply, parentId: comment.id };
    }
    return null;
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim() || editRating === 0) return;
    const target = findReview(commentId);

    if (!target?.review || !user || String(user.id) !== String(target.review.userId)) {
      notification.error('Bạn chỉ có thể chỉnh sửa bình luận của chính mình');
      cancelEdit();
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.updateReview(commentId, {
        movieId: Number(movieId),
        comment: editText.trim(),
        rating: Number(editRating),
        parentId: target.parentId ? Number(target.parentId) : null,
      });
      cancelEdit();
      await refreshReviews();
      notification.success('Đã cập nhật bình luận thành công');
    } catch (error) {
      console.error('Error updating comment:', error);
      notification.error(error.response?.data?.message || 'Không thể cập nhật bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm">Đang tải bình luận...</span>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Đánh giá và bình luận</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StarRating readOnly value={averageRating} />
            <span className="font-semibold">{averageRating.toFixed(1)}/5</span>
            <span className="text-sm text-muted-foreground">{ratingCount} đánh giá</span>
          </div>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="rating">Đánh giá cao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isAuthenticated && user ? (
        <Card id="comment-form" className="mb-6 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <form onSubmit={handleSubmitComment} className="flex gap-3">
              <ReviewAvatar review={{ fullName: user.fullName || user.name, avatarUrl: user.avatarUrl }} />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Đánh giá của bạn</span>
                  <StarRating value={rating} onValueChange={setRating} />
                  <span className="text-xs text-muted-foreground">{rating || 0}/5</span>
                </div>
                <Textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                  className="min-h-24 resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">{newComment.length}/500 ký tự</span>
                  <Button type="submit" size="sm" disabled={!newComment.trim() || rating === 0 || isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Gửi đánh giá
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-primary/20 bg-primary/5 shadow-none">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <MessageCircle className="h-9 w-9 text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Đăng nhập để bình luận và đánh giá phim.</p>
            <Button asChild size="sm" className="mt-4"><Link to="/auth/login">Đăng nhập</Link></Button>
          </CardContent>
        </Card>
      )}

      {comments.length === 0 ? (
        <Card><CardContent className="py-4"><Empty description="Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận." /></CardContent></Card>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => {
            const ownsComment = user && comment.userId && String(user.id) === String(comment.userId);
            const visibleReplies = expandedReplies[comment.id] ? comment.replies : comment.replies?.slice(0, 2);

            return (
              <Card key={comment.id} className="shadow-none">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex gap-3">
                    <ReviewAvatar review={comment} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{getDisplayName(comment)}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                        <StarRating readOnly value={Number(comment.rating) || 0} />
                      </div>

                      {editingComment === comment.id ? (
                        <InlineEditor
                          text={editText}
                          rating={editRating}
                          setText={setEditText}
                          setRating={setEditRating}
                          onCancel={cancelEdit}
                          onSave={() => handleUpdateComment(comment.id)}
                          submitting={isSubmitting}
                        />
                      ) : (
                        <>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{comment.comment}</p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {isAuthenticated && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                                <Reply className="mr-1.5 h-3.5 w-3.5" />Trả lời
                              </Button>
                            )}
                            {ownsComment && (
                              <>
                                <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(comment)}>
                                  <Edit className="mr-1.5 h-3.5 w-3.5" />Sửa
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => window.confirm('Bạn có chắc muốn xóa bình luận này?') && handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />Xóa
                                </Button>
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {replyingTo === comment.id && isAuthenticated && (
                        <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                          <Textarea
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            placeholder="Viết phản hồi của bạn..."
                            className="min-h-20 resize-none"
                            maxLength={500}
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Hủy</Button>
                            <Button type="button" size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyText.trim() || isSubmitting}>
                              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                              Gửi phản hồi
                            </Button>
                          </div>
                        </div>
                      )}

                      {comment.replies?.length > 0 && (
                        <div className="mt-5 space-y-4 border-l-2 border-border pl-4 sm:ml-4">
                          {visibleReplies.map((reply) => {
                            const ownsReply = user && reply.userId && String(user.id) === String(reply.userId);
                            return (
                              <div key={reply.id} className="flex gap-3">
                                <ReviewAvatar review={reply} size="sm" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-semibold">{getDisplayName(reply)}</p>
                                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(reply.createdAt)}</p>
                                    </div>
                                    {Number(reply.rating) > 0 && <StarRating readOnly value={Number(reply.rating)} className="scale-90 origin-right" />}
                                  </div>

                                  {editingComment === reply.id ? (
                                    <InlineEditor
                                      compact
                                      text={editText}
                                      rating={editRating}
                                      setText={setEditText}
                                      setRating={setEditRating}
                                      onCancel={cancelEdit}
                                      onSave={() => handleUpdateComment(reply.id)}
                                      submitting={isSubmitting}
                                    />
                                  ) : (
                                    <>
                                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{reply.comment}</p>
                                      {ownsReply && (
                                        <div className="mt-2 flex gap-1">
                                          <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(reply)}>
                                            <Edit className="mr-1.5 h-3 w-3" />Sửa
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => window.confirm('Bạn có chắc muốn xóa phản hồi này?') && handleDeleteComment(reply.id)}
                                          >
                                            <Trash2 className="mr-1.5 h-3 w-3" />Xóa
                                          </Button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {comment.replies.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedReplies((previous) => ({ ...previous, [comment.id]: !previous[comment.id] }))}
                            >
                              {expandedReplies[comment.id] ? 'Ẩn bớt' : `Xem thêm ${comment.replies.length - 2} phản hồi`}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pagination.page < pagination.totalPages - 1 && (
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="outline" onClick={() => loadComments(pagination.page + 1, { append: true })} disabled={loadingMore}>
            {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xem thêm bình luận
          </Button>
        </div>
      )}

      {comments.length > 0 && <><Separator className="mt-8" /><p className="mt-3 text-center text-xs text-muted-foreground">{pagination.totalElements} bình luận và phản hồi</p></>}
    </section>
  );
};

export default CommentsSection;
