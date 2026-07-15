import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import reviewService from '@/services/reviewService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge-count';
import { Separator } from '@/components/ui/separator';
import { Rate } from '@/components/ui/rate';
import {
  Star,
  Send,
  Reply,
  Edit,
  Trash2,
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Clock,
  User,
  Loader2
} from 'lucide-react';
import useNotification from '@/hooks/useNotification';

const CommentsSection = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0); // 1-5 sao
  const [sortBy, setSortBy] = useState('newest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [expandedReplies, setExpandedReplies] = useState({});
  const notification = useNotification();

  // Safely get auth context
  let user = null;
  let isAuthenticated = false;

  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
  } catch (error) {
    console.warn('Auth context not available:', error);
  }

  // Load comments and average rating from API
  useEffect(() => {
    if (movieId) {
      loadComments();
      loadAverageRating();
    }
  }, [movieId, sortBy]);

  const loadAverageRating = async () => {
    try {
      const result = await reviewService.getAverageRating(movieId);
      // Xử lý response có thể có nhiều cấu trúc
      const data = result?.data || result;
      setAverageRating(data?.averageRating || 0);
      setRatingCount(data?.countRating || 0);
    } catch (error) {
      console.error('Error loading average rating:', error);
      setAverageRating(0);
      setRatingCount(0);
    }
  };

  const loadComments = async (page = 0) => {
    try {
      setLoading(true);

      // Map sortBy to API sort parameter
      let sortParam;
      switch (sortBy) {
        case 'newest':
          sortParam = 'createdAt,desc';
          break;
        case 'oldest':
          sortParam = 'createdAt,asc';
          break;
        case 'rating':
          sortParam = 'rating,desc';
          break;
        default:
          sortParam = 'createdAt,desc';
      }

      const response = await reviewService.getReviewsByMovie(movieId, {
        page,
        size: pagination.size,
        sort: sortParam
      });

      // Xử lý response từ API (có thể có nhiều cấu trúc)
      const reviewsData = response?.content || response?.data?.content || response?.data || [];

      const mappedComments = reviewsData.map(review => ({
        id: review.id, // Long
        comment: review.comment, // String
        rating: review.rating, // Integer (1-5)
        userId: review.userId, // Long
        fullName: review.fullName, // String
        avatarUrl: review.avatarUrl, // String
        createdAt: review.createdAt, // LocalDateTime
        replies: (review.replies || []).map(reply => ({
          id: reply.id, // Long
          comment: reply.comment, // String
          rating: reply.rating, // Integer (1-5)
          userId: reply.userId, // Long
          fullName: reply.fullName, // String
          avatarUrl: reply.avatarUrl, // String
          createdAt: reply.createdAt, // LocalDateTime
          replies: reply.replies || [] // List<ReviewResponse> (nested, có thể rỗng)
        })),
        // Giữ lại các field cũ để tương thích
        userName: review.fullName,
        userAvatarUrl: review.avatarUrl,
        user: review.user || null
      }));

      setComments(mappedComments);
      setPagination({
        page: response?.number || response?.data?.number || 0,
        size: response?.size || response?.data?.size || 10,
        totalPages: response?.totalPages || response?.data?.totalPages || 0,
        totalElements: response?.totalElements || response?.data?.totalElements || mappedComments.length
      });
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !user || !movieId || rating === 0) return;

    setIsSubmitting(true);

    try {
      // ReviewRequest: { movieId: Long, comment: String, rating: Integer, parentId?: Long }
      const commentData = {
        movieId: Number(movieId), // Long
        comment: newComment.trim(), // String
        rating: Number(rating) // Integer (1-5)
        // parentId không có vì đây là review gốc
      };

      await reviewService.createReview(commentData);

      // Reload comments and average rating after successful creation
      await loadComments(0);
      await loadAverageRating();

      setNewComment('');
      setRating(0);
      notification.success('Đã gửi bình luận thành công');
    } catch (error) {
      console.error('Error submitting comment:', error);
      notification.error(error?.response?.data?.message || 'Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!replyText.trim() || !isAuthenticated || !user || !movieId) return;

    setIsSubmitting(true);

    try {
      // ReviewRequest: { movieId: Long, comment: String, rating: Integer, parentId?: Long }
      const replyData = {
        movieId: Number(movieId), // Long
        comment: replyText.trim(), // String
        rating: 5, // Integer (1-5), Reply mặc định 5 sao
        parentId: Number(parentId) // Long
      };

      await reviewService.addReply(parentId, replyData);

      // Reload comments after successful reply
      await loadComments(pagination.page);
      await loadAverageRating();

      setReplyText('');
      setReplyingTo(null);
      notification.success('Đã gửi phản hồi thành công');
    } catch (error) {
      console.error('Error submitting reply:', error);
      notification.error(error?.response?.data?.message || 'Không thể gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await reviewService.deleteReview(commentId);
      await loadComments(pagination.page);
      await loadAverageRating();
      notification.success('Đã xóa bình luận thành công');
    } catch (error) {
      console.error('Error deleting comment:', error);
      notification.error(error?.response?.data?.message || 'Không thể xóa bình luận. Vui lòng thử lại.');
    }
  };

  const handleEditComment = (comment) => {
    // Kiểm tra nếu userId của comment khớp với userId của user hiện tại
    if (!user || !comment.userId) {
      notification.error('Không thể chỉnh sửa bình luận này');
      return;
    }

    const commentUserId = String(comment.userId);
    const currentUserId = String(user.id);

    if (commentUserId !== currentUserId) {
      notification.error('Bạn chỉ có thể chỉnh sửa bình luận của chính mình');
      return;
    }

    setEditingComment(comment.id);
    setEditText(comment.comment);
    setEditRating(comment.rating || 0); // Backend trả về 1-5 sao
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim() || editRating === 0) return;

    // Tìm comment hoặc reply trong danh sách
    let targetComment = null;
    let parentId = null;

    // Tìm trong comments
    for (const comment of comments) {
      if (comment.id === commentId) {
        targetComment = comment;
        parentId = null; // Đây là comment gốc
        break;
      }
      // Tìm trong replies
      if (comment.replies && comment.replies.length > 0) {
        const reply = comment.replies.find(r => r.id === commentId);
        if (reply) {
          targetComment = reply;
          parentId = comment.id; // Đây là reply, parentId là id của comment cha
          break;
        }
      }
    }

    if (!targetComment || !user || !targetComment.userId) {
      notification.error('Không thể cập nhật bình luận này');
      setEditingComment(null);
      setEditText('');
      setEditRating(0);
      return;
    }

    if (String(user.id) !== String(targetComment.userId)) {
      notification.error('Bạn chỉ có thể chỉnh sửa bình luận của chính mình');
      setEditingComment(null);
      setEditText('');
      setEditRating(0);
      return;
    }

    setIsSubmitting(true);

    try {
      // ReviewRequest: { movieId: Long, comment: String, rating: Integer, parentId?: Long }
      const updateData = {
        movieId: Number(movieId), // Long
        comment: editText.trim(), // String
        rating: Number(editRating), // Integer (1-5)
        parentId: parentId ? Number(parentId) : null // Long (null cho review gốc, có giá trị cho reply)
      };

      await reviewService.updateReview(commentId, updateData);
      await loadComments(pagination.page);
      await loadAverageRating();

      setEditingComment(null);
      setEditText('');
      setEditRating(0);
      notification.success('Đã cập nhật bình luận thành công');
    } catch (error) {
      console.error('Error updating comment:', error);
      notification.error(error?.response?.data?.message || 'Không thể cập nhật bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
    setEditRating(0);
  };

  const renderStars = (starRating, interactive = false, onStarClick = null) => {
    // starRating là số sao từ 1-5
    return (
      <div className="flex gap-0.5 items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const displayRating = interactive ? (hoveredStar || starRating) : starRating;
          const isFilled = star <= Math.floor(displayRating);
          const isHalfFilled = star === Math.ceil(displayRating) && displayRating % 1 !== 0 && displayRating > Math.floor(displayRating);
          return (
            <div key={star} className="relative">
              <Star
                className={`h-5 w-5 ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${interactive ? 'transition-all duration-200 cursor-pointer hover:scale-110' : ''}`}
                onClick={() => interactive && onStarClick && onStarClick(star)}
                onMouseEnter={() => interactive && setHoveredStar(star)}
                onMouseLeave={() => interactive && setHoveredStar(0)}
              />
              {isHalfFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-600">Đang tải bình luận...</span>
      </div>
    );
  }

  return (
    <div className="py-8 w-full max-w-4xl mx-auto">
      {/* Header with title and rating */}
      <div className="mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đánh giá và Bình luận</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(averageRating)}
                <span className="font-bold text-lg text-gray-900 ml-2">
                  {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-gray-500 text-sm">/5</span>
              </div>
              <span className="text-gray-600 text-sm">
                {ratingCount} {ratingCount === 1 ? 'Đánh giá' : 'Đánh giá'}
              </span>
            </div>
          </div>
          <Button
            onClick={() => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })}
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
          >
            Viết đánh giá
          </Button>
        </div>
      </div>

      {isAuthenticated && user ? (
        <Card className="p-4 mb-6 border-gray-200 bg-white" id="comment-form">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <div className="flex gap-4 items-start">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={user.avatarUrl} alt={user.username || user.name} />
                <AvatarFallback className="bg-gray-200">
                  <User className="h-5 w-5 text-gray-500" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Đánh giá của bạn</label>
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(rating, true, setRating)}
                    {rating > 0 && (
                      <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                    )}
                    {rating === 0 && (
                      <span className="text-xs text-gray-400 ml-2">(Chọn số sao)</span>
                    )}
                  </div>
                </div>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="min-h-[80px] resize-none border-gray-300 bg-gray-50"
                  rows="3"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/500 ký tự
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      disabled={!newComment.trim() || isSubmitting || rating === 0}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-blue-500 mb-3" />
            <p className="text-gray-700 mb-3">
              Vui lòng <a href="/login" className="text-blue-600 font-semibold hover:underline">đăng nhập</a> để bình luận và đánh giá phim
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage
                src={comment.avatarUrl || comment.userAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.fullName || comment.userName || 'User')}&background=random&size=80`}
                alt={comment.fullName || comment.userName}
              />
              <AvatarFallback className="bg-gray-200">
                <User className="h-5 w-5 text-gray-500" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-semibold text-gray-900">{comment.fullName || comment.userName}</h4>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {renderStars(comment.rating || 0)}
                </div>
              </div>

              {editingComment === comment.id ? (
                <Card className="mt-3 p-4 bg-blue-50 border-blue-200">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">Chỉnh sửa bình luận</span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Xếp hạng:</label>
                      <div className="flex items-center gap-2">
                        {renderStars(editRating, true, setEditRating)}
                        {editRating > 0 ? (
                          <span className="text-sm text-gray-600 ml-2">{editRating}/5</span>
                        ) : (
                          <span className="text-xs text-gray-400 ml-2">(Chọn số sao)</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Nội dung:</label>
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[100px] resize-none border-gray-300"
                        rows="4"
                        maxLength={500}
                        placeholder="Nhập nội dung bình luận..."
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {editText.length}/500 ký tự
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={!editText.trim() || editRating === 0 || isSubmitting}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Lưu thay đổi
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  <p className="text-gray-800 leading-relaxed mb-3">{comment.comment}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(comment.createdAt)}
                    </span>
                    {isAuthenticated && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-1 text-xs font-normal text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      >
                        <Reply className="h-3.5 w-3.5 mr-1" />
                        Trả lời
                      </Button>
                    )}
                    {user && comment.userId && String(user.id) === String(comment.userId) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs font-normal text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                          onClick={() => handleEditComment(comment)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
                              handleDeleteComment(comment.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Xóa
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}

              {replyingTo === comment.id && isAuthenticated && (
                <Card className="mt-4 p-4 bg-gray-50 border-gray-200">
                  <div className="space-y-3">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Viết phản hồi của bạn..."
                      className="min-h-[80px]"
                      rows="3"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyText.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Gửi
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-6 pl-4 border-l-2 border-gray-300 space-y-4">
                  {(expandedReplies[comment.id] ? comment.replies : comment.replies.slice(0, 2)).map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={reply.avatarUrl || reply.userAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.fullName || reply.userName || 'User')}&background=random&size=80`}
                          alt={reply.fullName || reply.userName}
                        />
                        <AvatarFallback className="bg-gray-200">
                          <User className="h-4 w-4 text-gray-500" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {editingComment === reply.id ? (
                          <Card className="mt-2 p-3 bg-blue-50 border-blue-200">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Edit className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-xs font-semibold text-gray-700">Chỉnh sửa phản hồi</span>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Xếp hạng:</label>
                                <div className="flex items-center gap-2">
                                  {renderStars(editRating, true, setEditRating)}
                                  {editRating > 0 ? (
                                    <span className="text-xs text-gray-600 ml-1">{editRating}/5</span>
                                  ) : (
                                    <span className="text-xs text-gray-400 ml-1">(Chọn số sao)</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Nội dung:</label>
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="min-h-[60px] resize-none border-gray-300 text-sm"
                                  rows="2"
                                  maxLength={500}
                                  placeholder="Nhập nội dung phản hồi..."
                                />
                                <span className="text-xs text-gray-500">{editText.length}/500 ký tự</span>
                              </div>
                              <div className="flex justify-end gap-2 pt-1 border-t border-gray-200">
                                <Button
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  size="sm"
                                  className="text-xs h-7 text-gray-600 hover:text-gray-900"
                                >
                                  Hủy
                                </Button>
                                <Button
                                  onClick={() => handleUpdateComment(reply.id)}
                                  disabled={!editText.trim() || editRating === 0 || isSubmitting}
                                  size="sm"
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 text-xs h-7"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Đang lưu...
                                    </>
                                  ) : (
                                    <>
                                      <Edit className="h-3 w-3 mr-1" />
                                      Lưu
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <>
                            <div className="mb-1">
                              <h5 className="font-semibold text-sm text-gray-900">{reply.fullName || reply.userName}</h5>
                            </div>
                            <p className="text-gray-800 text-sm leading-relaxed mb-2">{reply.comment}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(reply.createdAt)}
                              </span>
                              {isAuthenticated && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto px-2 py-0.5 text-xs font-normal text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                  onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                                >
                                  <Reply className="h-3 w-3 mr-1" />
                                  Trả lời
                                </Button>
                              )}
                              {user && reply.userId && String(user.id) === String(reply.userId) && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-2 py-0.5 text-xs font-normal text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                                    onClick={() => handleEditComment(reply)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Sửa
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-2 py-0.5 text-xs font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      if (window.confirm('Bạn có chắc chắn muốn xóa phản hồi này?')) {
                                        handleDeleteComment(reply.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Xóa
                                  </Button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {comment.replies.length > 2 && !expandedReplies[comment.id] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-11 text-gray-600 hover:text-gray-900 text-xs"
                      onClick={() => setExpandedReplies({ ...expandedReplies, [comment.id]: true })}
                    >
                      Xem thêm {comment.replies.length - 2} phản hồi
                    </Button>
                  )}
                  {expandedReplies[comment.id] && comment.replies.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-11 text-gray-600 hover:text-gray-900 text-xs"
                      onClick={() => setExpandedReplies({ ...expandedReplies, [comment.id]: false })}
                    >
                      Ẩn bớt
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {pagination.page < pagination.totalPages - 1 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => loadComments(pagination.page + 1)}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tải...
                </>
              ) : (
                'Xem thêm bình luận'
              )}
            </Button>
          </div>
        )}
      </div>

      {comments.length === 0 && (
        <Card className="p-12 text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg mb-2">Chưa có bình luận nào</p>
          <p className="text-gray-500 text-sm">Hãy là người đầu tiên chia sẻ suy nghĩ của bạn về bộ phim này!</p>
        </Card>
      )}
    </div>
  );
};

export default CommentsSection; 