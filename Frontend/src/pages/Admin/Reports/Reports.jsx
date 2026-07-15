import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Statistic } from '@/components/ui/statistic';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
    DollarSign,
    ShoppingCart,
    User,
    Home
} from 'lucide-react';
import dayjs from 'dayjs';
import useNotification from '@/hooks/useNotification';

const Reports = () => {
    const [bookings, setBookings] = useState([]);
    const [revenueStats, setRevenueStats] = useState({
        totalRevenue: 0,
        totalTickets: 0,
        totalCustomers: 0,
        avgTicketPrice: 0
    });

    // Sample data
    const sampleBookings = [
        {
            id: 1,
            userName: "Nguyễn Văn A",
            movieTitle: "Avengers: Endgame",
            cinemaName: "CGV Vincom",
            totalPrice: 200000,
            status: "confirmed",
            bookingDate: "2024-02-10T10:30:00Z"
        },
        {
            id: 2,
            userName: "Trần Thị B",
            movieTitle: "Spider-Man: No Way Home",
            cinemaName: "Lotte Cinema",
            totalPrice: 315000,
            status: "confirmed",
            bookingDate: "2024-02-11T14:15:00Z"
        },
        {
            id: 3,
            userName: "Phạm Văn C",
            movieTitle: "Top Gun: Maverick",
            cinemaName: "Galaxy Cinema",
            totalPrice: 280000,
            status: "confirmed",
            bookingDate: "2024-02-12T09:20:00Z"
        }
    ];

    useEffect(() => {
        // Load sample data on mount
        setBookings(sampleBookings);
        calculateRevenueStats(sampleBookings);
        message.success('Đã tải dữ liệu mẫu thành công!');
    }, []);

    const calculateRevenueStats = (bookingData) => {
        const totalRevenue = bookingData.reduce((sum, booking) => sum + booking.totalPrice, 0);
        const totalTickets = bookingData.length;
        const uniqueCustomers = new Set(bookingData.map(b => b.userName)).size;
        const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

        setRevenueStats({
            totalRevenue,
            totalTickets,
            totalCustomers: uniqueCustomers,
            avgTicketPrice
        });
    };

    const handleExportReport = () => {
        message.success('Đã xuất báo cáo thành công');
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Breadcrumb */}
            <Breadcrumb
                className="mb-4"
                items={[
                    {
                        title: (
                            <span
                                onClick={() => navigate('/admin/dashboard')}
                                className="cursor-pointer hover:text-primary transition-colors"
                            >
                                <HomeOutlined /> Dashboard
                            </span>
                        ),
                    },
                    {
                        title: 'Báo cáo',
                    },
                ]}
            />

            <Card className="mb-6 rounded-lg shadow-md">
                <Alert
                    message={`Debug: ${bookings.length} bookings loaded`}
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            <DollarCircleOutlined /> Báo cáo Doanh thu
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                icon={<DollarCircleOutlined />}
                                onClick={handleExportReport}
                            >
                                Xuất báo cáo
                            </Button>
                            <Button
                                onClick={() => {
                                    setBookings(sampleBookings);
                                    calculateRevenueStats(sampleBookings);
                                    message.success('Đã tải lại dữ liệu mẫu!');
                                }}
                            >
                                Tải lại dữ liệu
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={revenueStats.totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="đ"
                            formatter={(value) => value.toLocaleString('vi-VN')}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Số vé bán"
                            value={revenueStats.totalTickets}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Khách hàng"
                            value={revenueStats.totalCustomers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Giá vé trung bình"
                            value={revenueStats.avgTicketPrice}
                            precision={0}
                            prefix={<DollarCircleOutlined />}
                            suffix="đ"
                            valueStyle={{ color: '#fa8c16' }}
                            formatter={(value) => value.toLocaleString('vi-VN')}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bookings List */}
            <Card title="Danh sách đặt vé">
                {bookings.map(booking => (
                    <Card key={booking.id} size="small" style={{ marginBottom: 8 }}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text strong>{booking.userName}</Text>
                                <br />
                                <Text type="secondary">{booking.movieTitle} - {booking.cinemaName}</Text>
                            </Col>
                            <Col>
                                <Text strong style={{ color: '#52c41a' }}>
                                    {booking.totalPrice.toLocaleString('vi-VN')}đ
                                </Text>
                                <br />
                                <Text type="secondary">
                                    {dayjs(booking.bookingDate).format('DD/MM/YYYY HH:mm')}
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                ))}
            </Card>
        </div>
    );
};

export default Reports; 