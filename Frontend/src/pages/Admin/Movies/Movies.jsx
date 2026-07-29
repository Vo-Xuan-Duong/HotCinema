import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { StarRating } from '@/components/ui/star-rating';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Clock,
  Home,
  Film
} from 'lucide-react';
import useNotification from '@/hooks/useNotification';
import dayjs from 'dayjs';
import movieService from '@/services/movieService';
import genreService from '@/services/genreService';

const Movies = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const tableRef = React.useRef(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    status: null,
    genreId: null, // Store genre ID instead of name
    releaseYear: null, // Extract from dateRange or separate filter
    rating: null
  });
  const [genres, setGenres] = useState([]); // Store genres with IDs
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Load genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresList = await genreService.getAllGenres();
        setGenres(genresList);
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    loadMovies();
  }, [pagination.current, pagination.pageSize, filters, searchText]);

  const loadMovies = async () => {
    try {
      setLoading(true);

      // Build search request according to MovieSearchRequest
      const searchParams = {
        page: pagination.current - 1, // Backend uses 0-based index
        size: pagination.pageSize,
        sort: 'releaseDate,desc' // Sáº¯p xáº¿p theo ngÃ y phÃ¡t hÃ nh tá»« má»›i Ä‘áº¿n cÅ©
      };

      // Add keyword if searchText exists
      if (searchText) {
        searchParams.keyword = searchText;
      }

      // Add status filter (MovieStatus enum)
      if (filters.status) {
        searchParams.status = filters.status;
      }

      // Add genre filter (List<Long> - array of genre IDs)
      if (filters.genreId) {
        searchParams.genre = [filters.genreId]; // Convert to array as backend expects List<Long>
      }

      // Add releaseYear filter (extract from dateRange or use direct year filter)
      if (filters.releaseYear) {
        searchParams.releaseYear = filters.releaseYear;
      }

      // Use search API when there's any filter or searchText
      // Otherwise use getAllMovies for simple listing
      const hasFilters = searchText || filters.status || filters.genreId || filters.releaseYear;

      let response;
      if (hasFilters) {
        // Use search endpoint with MovieSearchRequest format
        response = await movieService.searchPage(searchParams);
      } else {
        // Use regular list endpoint for simple listing
        const listParams = {
          page: pagination.current - 1,
          size: pagination.pageSize,
          sort: 'releaseDate,desc'
        };
        // Add rating filter for list endpoint (if not using search)
        if (filters.rating) {
          listParams.minRating = filters.rating;
        }
        response = await movieService.getAllMovies(listParams);
      }

      // Xá»­ lÃ½ response vá»›i nhiá»u cáº¥u trÃºc cÃ³ thá»ƒ cÃ³
      console.log('Full response:', response);

      let moviesData = [];
      let totalCount = 0;

      // Case 1: Response cÃ³ cáº¥u trÃºc Page object: { content: [...], totalElements, ... }
      if (response && Array.isArray(response.content)) {
        moviesData = response.content;
        totalCount = response.totalElements || response.content.length;
      }
      // Case 2: Response cÃ³ data.content (nested trong data)
      else if (response?.data && Array.isArray(response.data.content)) {
        moviesData = response.data.content;
        totalCount = response.data.totalElements || response.data.content.length;
      }
      // Case 3: Response lÃ  array trá»±c tiáº¿p
      else if (Array.isArray(response)) {
        moviesData = response;
        totalCount = response.length;
      }
      // Case 4: Response cÃ³ data lÃ  array
      else if (response?.data && Array.isArray(response.data)) {
        moviesData = response.data;
        totalCount = response.data.length;
      }
      // Case 5: Response cÃ³ items thay vÃ¬ content
      else if (response && Array.isArray(response.items)) {
        moviesData = response.items;
        totalCount = response.totalElements || response.items.length;
      }
      // Case 6: Response cÃ³ results thay vÃ¬ content
      else if (response && Array.isArray(response.results)) {
        moviesData = response.results;
        totalCount = response.totalElements || response.results.length;
      }
      // Default: khÃ´ng cÃ³ dá»¯ liá»‡u
      else {
        console.warn('Unexpected response structure:', response);
        moviesData = [];
        totalCount = 0;
      }

      console.log('Extracted movies:', moviesData);
      console.log('Total count:', totalCount);

      setMovies(moviesData);
      setPagination(prev => ({
        ...prev,
        total: totalCount
      }));
    } catch (error) {
      console.error('Error loading movies:', error);
      notification.error('Lá»—i khi táº£i danh sÃ¡ch phim');
      setMovies([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = () => {
    navigate('/admin/movies/create');
  };

  const handleEditMovie = (movie) => {
    navigate(`/admin/movies/${movie.id}/edit`);
  };

  const handleDeleteMovie = async (movieId) => {
    try {
      await movieService.deleteMovie(movieId);
      notification.success('XÃ³a phim thÃ nh cÃ´ng!');
      loadMovies(); // Reload danh sÃ¡ch
    } catch (error) {
      console.error('Error deleting movie:', error);
      notification.error(error.response?.data?.message || 'Lá»—i khi xÃ³a phim');
    }
  };

  const handleViewDetail = (movie) => {
    navigate(`/admin/movies/${movie.id}`);
  };


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setFilters({
      status: null,
      genreId: null,
      releaseYear: null,
      rating: null
    });
    setSearchText('');
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const hasActiveFilters = filters.status || filters.genreId || filters.releaseYear || filters.rating || searchText;

  const handleTableChange = (page, size) => {
    setPagination(prev => ({
      current: page,
      pageSize: size || prev.pageSize,
      total: prev.total
    }));

    // Scroll to table when page changes
    if (page !== pagination.current && tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handlePageSizeChange = (current, size) => {
    setPagination(prev => ({
      ...prev,
      current: 1, // Reset to first page when changing page size
      pageSize: size
    }));
  };

  const columns = [
    {
      title: 'Poster',
      dataIndex: 'posterUrl',
      key: 'posterUrl',
      width: 100,
      render: (posterUrl, record) => (
        <img
          src={posterUrl || record.posterUrl || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+b3YjNhwhFN9+JKMfBzosgQuAIu4FLRsQm3E7RZrNLRIsNFNkuWqB3sJJWlHfIeXPnzM3MO2z/5u77jdU6M8V9//e9n6GkqbLU4sOHDx/m5/Xr1w/+/bBpL4H/l5PO9vR3O78dT81Qp92b5pPz0+8T6/N+8/9/+fVn7t7bf/63/0/n9m4/vd34+u+XB9zd3d3/df7vf/+7/z8xEACBgwkgBLAHBBoJIAQwCAReCCAEL7b1sgkBhAB2gEAjAYTgxbYWVe+lhQBCsKW+dHIDEALaDjk/fH749PLs2bNHj958nz579uz5pz5+/Pihn3/y5Mn8+vXrB9/3v41d2Q4QcCaAEJxJbj9g/7b/5cuX8z1wNr59l9aVBBCCKx0/7hG5dv+e+9qd/xJACOD3IABgT1qVpwkT+wf47bdvBMrr1cPq5v+Q1nTNTgj9ybt373bffE9P98/rN2+O+5YNNfLt27f7gX969VfO/zGGlzdu3Pjdvnr4nP7mHz9/+VLe7Xl9yvPl+ZNHj/7Y7dt9fu+lXQg9JP0N+cvzH95/9dXvvsE/CeE/Dz99+qn92vO6Pc/zF7c+/a5p++n3ypK3tSz+5z9fhKCFm9HpkuJuDQIIwRrmXpVGggihka3ndAgBIYBAgABCAANAoJEAQmiE6zmdR8UcwBVDQAhXGNqxRxAC2AECCCEAS0CgkQBCaITrOd3D/vYTt74Y4+P/fu9hU89rEoLnfau1QggNO6B+1eKr18+afpVCQ9meTh8++7LbcBfqt9m76+3Lhgts9CbY7a47Rqnq+SHYzKqcGEK7LBEC7ZRLFACBWQK6iboMhKALr38hQlBPBysWQNDFkkYI/kLCZ4S2D6/1v33byNczOkLA5oIAQgApQaBNACE0cvWcziNhq8dCCNvbYP73fH8h3/v43kft7UmEsL3d3J6JELa3ATeiwdAQQrcFCKEbBydYSQAhrOyGq+tOACF0I7n6CbZU8J7S9l5KCGF7O3AjGgwNIXQbgxC6kXAiBBSCQAAgBBAKAggBDAKBRgIIoRGu53R8wD5rj0K4JOz9CKE7SYTQjeTeAp4/4LY+e/HZ9tCvP9V/K6VDFW+/5cC/cCUWWe8hBGe6COGGw+m7s3BfdQihuOOFvEMIFyJvOwwhtPPtPRshdCe6/wCE0M/2ZmdCCDdj33w1CECAED6gAFQhQGYJhHCaH+/enWazPgQRwvrOvjKE4Kx2YGP1hxDO/kAIF8Jd0+EIwfnDqlv9IYR6xkMqHUKofDjVvwtF9xMdICFsF0UQJ1CCELaTw57kCOGGP0KofsDs/hBCPeO1lY5XtWvj1k5HCP1sERrO/xMhhMwFEELmZnp+9gWEcK6YZfmgK8tgYhFCrDgShJCo3IUfFSEgBBA4JYAQEAIINBJACNp+VWMH8n9Ur/PvZFkuWYAQlnOjJSCAEMAAEGgkgBAa4XpOR0heDhrvr6Jnb7J8BNQNEaKWKzpKz94gBMdlgxAccc47FCE4kzx3OERB3VoQQh1X50qEgBAQAggECCAEMAAEGgkghEa4ntMREtuq4e+H2FYdGzn1jfCyFpbEhPjACyGw6QhCIDOEsB9yFcKa/5H89PXl/wQX3fzjRxC8x9fRV++LmVz9lUPyW14wJMrWrVdVCL+n2PY1+x9I6RfCtauNnr81jw6f6a8iHJ+b8W9I6f8OFfNdMO1mfRhCx+sKHy+MsFcdl8lMEoIzOYQAhH42G9+8P37E29c37x56/rqx7s1K9OhXkLzHJyT8z1bLOjV93nXPn78jhPnRFxBP0vv8Bs5Bb8/3tz8/2H5+WNqWrdf9ZzO9dZAQfN3qUv1dEU7vYH3rjRbqQxGtfr0H1g7LdxC7KXz79L3e1L78M6OXuM7tq1W9dhP3z0PdgE3qd3yDzxfdz4hR7t7fd4+CMP9O+9fPPtlqRQ8HrPP39hBCGPOJDTrL8PCCqrdvPR6gZPqKwWZ5x5mAm2NvjKkBhFCDtVRdxm8hfZ6KEPrZbncmQtju9vY9GiG087VeQBsACGAQCCCmr8n6vvsG98GcQAIhJFJZFsElFQJJ1JZlNhACywgREAqE4KYBJyH4fhP1H1vOz1vOJwYlm7qH8JJJ3gohX7O1J+/aeqe99/FWCNX6JvyKQNJQFJkN2AhCyCy/05+dEJxBru1whKCNj+t0hOAKc2WHIwQ3jI57EiF45GfVkwRACAAEAmoIXKr5w8pPEgghzPJ6e2Mxm2C3HXJKAiGk5J72syNEhAACpwQQAkJAoJEAQmiE6zmdR8K2YzxHbdxoY4w2pxJACJgEAo0EEEIjXM/pPCKmjOT+KlrKz6m/yYfF5LlNMwP9BbSsOT9XeWe6e9iXiEFfQ6c7CkI4PVEK6nOTfbKe17e1PelCfgf0rAAhOK+AMzqE4Izz3OEQgqJFBYv60IQQiw9CAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFA/AkJQyFeQcqSMUDdm/LlP/TcfRBN3FhgAAAAAElFTkSuQmCC"}
          alt={record.title}
          className="w-[60px] h-[80px] rounded object-cover"
        />
      ),
    },
    {
      title: 'TÃªn Phim',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (title, record) => {
        const durationMinutes = record.durationMinutes || record.durationFormatted || record.runtime || record.duration || 0;
        const durationFormatted = record.durationFormatted || `${durationMinutes} phÃºt`;

        return (
          <div>
            <Button
              variant="link"
              onClick={() => handleViewDetail(record)}
              className="p-0 h-auto text-left mb-1 hover:no-underline"
            >
              <span className="font-semibold text-blue-600 hover:text-blue-800 text-[15px] transition-colors">{title}</span>
            </Button>
            {record.originalTitle && record.originalTitle !== title && (
              <div className="mb-1">
                <span className="text-gray-500 text-xs">{record.originalTitle}</span>
              </div>
            )}
            <div className="mb-1">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {durationFormatted}
              </span>
            </div>
            {record.rating && (
              <div>
                <StatusBadge tone="purple" style={{ fontSize: '11px', margin: 0 }}>
                  {record.rating}
                </StatusBadge>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thá»ƒ Loáº¡i',
      dataIndex: 'genres',
      key: 'genres',
      render: (genres, record) => {
        const genreList = Array.isArray(genres)
          ? genres.map(g => g.name || g)
          : (record.genre || '').split(', ');

        return (
          <div>
            {genreList.slice(0, 3).map((g, index) => (
              <StatusBadge key={index} tone="blue" style={{ marginBottom: '4px' }}>
                {g}
              </StatusBadge>
            ))}
            {genreList.length > 3 && <span className="text-gray-500">...</span>}
          </div>
        );
      },
    },
    {
      title: 'NgÃ y PhÃ¡t HÃ nh',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'ÄÃ¡nh GiÃ¡',
      dataIndex: 'averageRating',
      key: 'averageRating',
      width: 140,
      align: 'center',
      sorter: (a, b) => {
        const ratingA = a.averageRating || a.voteAverage || 0;
        const ratingB = b.averageRating || b.voteAverage || 0;
        return ratingA - ratingB;
      },
      render: (averageRating, record) => {
        const rating = averageRating || record.voteAverage || 0;
        const ratingValue = parseFloat(rating) || 0;

        // Determine color based on rating
        let ratingColor = '#999';
        if (ratingValue >= 8) ratingColor = '#52c41a'; // Green for high rating
        else if (ratingValue >= 6) ratingColor = '#faad14'; // Orange for medium rating
        else if (ratingValue > 0) ratingColor = '#ff4d4f'; // Red for low rating

        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '4px' }}>
              <span
                className="font-bold"
                style={{
                  fontSize: '18px',
                  color: ratingColor
                }}
              >
                {ratingValue > 0 ? ratingValue.toFixed(1) : '-'}
              </span>
              {ratingValue > 0 && (
                <span className="text-gray-500 text-xs ml-0.5">
                  /10
                </span>
              )}
            </div>
            {ratingValue > 0 && (
              <StarRating
                readOnly
                value={ratingValue / 2}
                precision={0.5}
                style={{ fontSize: '12px' }}
                count={5}
              />
            )}
            {ratingValue === 0 && (
              <span className="text-gray-500 text-[11px]">ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tráº¡ng thÃ¡i',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        // Map status values to display
        const statusMap = {
          'NOW_SHOWING': { text: 'Äang chiáº¿u', color: 'green' },
          'COMING_SOON': { text: 'Sáº¯p chiáº¿u', color: 'orange' },
          'ENDED': { text: 'ÄÃ£ káº¿t thÃºc', color: 'default' }
        };
        const statusInfo = statusMap[status] || { text: status || 'N/A', color: 'default' };
        return (
          <StatusBadge tone={statusInfo.color}>
            {statusInfo.text}
          </StatusBadge>
        );
      },
    },
    {
      title: 'Thao TÃ¡c',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleEditMovie(record)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Edit className="h-4 w-4 mr-1" />
            Sá»­a
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a phim nÃ y?')) {
                handleDeleteMovie(record.id);
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            XÃ³a
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
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
            title: 'Quáº£n lÃ½ phim',
            icon: <Film className="h-4 w-4" />
          }
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div>
            <h2 className="m-0 mb-2 text-gray-800 text-2xl font-bold">Quáº£n lÃ½ Phim</h2>
            <p className="text-gray-500">Quáº£n lÃ½ vÃ  theo dÃµi táº¥t cáº£ cÃ¡c bá»™ phim trong há»‡ thá»‘ng</p>
          </div>
          <Button
            size="lg"
            onClick={handleAddMovie}
            className="rounded-lg shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700 text-white"
          >
            + ThÃªm Phim Má»›i
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[300px]">
              <label className="block mb-2 font-semibold">TÃ¬m kiáº¿m</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="TÃ¬m kiáº¿m phim theo tÃªn hoáº·c thá»ƒ loáº¡i..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                  className="rounded-lg pl-10"
                />
              </div>
            </div>

            <div className="min-w-[200px]">
              <label className="block mb-2 font-semibold">Tráº¡ng thÃ¡i</label>
              <Select
                value={filters.status ? filters.status : "all"}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Táº¥t cáº£ tráº¡ng thÃ¡i" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
                  <SelectItem value="NOW_SHOWING">Äang chiáº¿u</SelectItem>
                  <SelectItem value="COMING_SOON">Sáº¯p chiáº¿u</SelectItem>
                  <SelectItem value="ENDED">ÄÃ£ káº¿t thÃºc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px]">
              <label className="block mb-2 font-semibold">Thá»ƒ loáº¡i</label>
              <Select
                value={filters.genreId ? filters.genreId.toString() : "all"}
                onValueChange={(value) => handleFilterChange('genreId', value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Táº¥t cáº£ thá»ƒ loáº¡i" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£ thá»ƒ loáº¡i</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre.id} value={genre.id.toString()}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <label className="block mb-2 font-semibold">NÄƒm phÃ¡t hÃ nh</label>
              <Select
                value={filters.releaseYear ? filters.releaseYear.toString() : "all"}
                onValueChange={(value) => handleFilterChange('releaseYear', value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Táº¥t cáº£ nÄƒm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£ nÄƒm</SelectItem>
                  {Array.from({ length: 30 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <label className="block mb-2 font-semibold">ÄÃ¡nh giÃ¡ tá»‘i thiá»ƒu</label>
              <Select
                value={filters.rating ? filters.rating.toString() : "all"}
                onValueChange={(value) => handleFilterChange('rating', value === 'all' ? null : parseFloat(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Táº¥t cáº£" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£</SelectItem>
                  <SelectItem value="7">7.0+ â­</SelectItem>
                  <SelectItem value="8">8.0+ â­â­</SelectItem>
                  <SelectItem value="9">9.0+ â­â­â­</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                variant="outline"
              >
                XÃ³a bá»™ lá»c
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Filter className="h-4 w-4" /> Äang lá»c:
              </span>
              {filters.status && (
                <StatusBadge tone="blue" className="flex items-center gap-1 pr-1">
                  <span>Tráº¡ng thÃ¡i: {filters.status === 'NOW_SHOWING' ? 'Äang chiáº¿u' : filters.status === 'COMING_SOON' ? 'Sáº¯p chiáº¿u' : 'ÄÃ£ káº¿t thÃºc'}</span>
                  <button
                    onClick={() => handleFilterChange('status', null)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                    aria-label="XÃ³a bá»™ lá»c"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </StatusBadge>
              )}
              {filters.genreId && (
                <StatusBadge tone="green" className="flex items-center gap-1 pr-1">
                  <span>Thá»ƒ loáº¡i: {genres.find(g => g.id === filters.genreId)?.name || filters.genreId}</span>
                  <button
                    onClick={() => handleFilterChange('genreId', null)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                    aria-label="XÃ³a bá»™ lá»c"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </StatusBadge>
              )}
              {filters.releaseYear && (
                <StatusBadge tone="orange" className="flex items-center gap-1 pr-1">
                  <span>NÄƒm: {filters.releaseYear}</span>
                  <button
                    onClick={() => handleFilterChange('releaseYear', null)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                    aria-label="XÃ³a bá»™ lá»c"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </StatusBadge>
              )}
              {filters.rating && (
                <StatusBadge tone="purple" className="flex items-center gap-1 pr-1">
                  <span>ÄÃ¡nh giÃ¡: {filters.rating}+</span>
                  <button
                    onClick={() => handleFilterChange('rating', null)}
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
              <span className="text-gray-500 text-sm ml-2">
                ({pagination.total} káº¿t quáº£)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Movies Table */}
      <div ref={tableRef}>
        <Card className="rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="p-5">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            ) : (
              <>
                <DataTable
                  fields={columns}
                  rows={movies}
                  getRowId="id"
                  pageControls={false}
                />
                {pagination.total > 0 && (
                  <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm text-gray-600">
                      Hiá»ƒn thá»‹ {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} cá»§a {pagination.total} phim
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
      </div>
    </div>
  );
};

export default Movies;
