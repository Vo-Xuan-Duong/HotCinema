import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tag } from '../../../components/ui/tag';
import { Empty } from '../../../components/ui/empty';
import { List } from '../../../components/ui/list';
import { Separator } from '../../../components/ui/separator';
import { InputNumber } from '../../../components/ui/input-number';
import { useNavigate } from 'react-router-dom';
import useNotification from '../../../hooks/useNotification';

const Cart = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const mockCartItems = [
            {
                id: 1,
                movieTitle: 'Transformer: Rise of the Beasts',
                cinema: 'CGV Nguyễn Văn Cừ',
                showtime: '19:30 - 21:45',
                date: '2025-07-29',
                seats: ['A5', 'A6'],
                price: 120000,
                quantity: 2,
                poster: '/images/transformer.jpg'
            },
            {
                id: 2,
                movieTitle: 'Avatar: The Way of Water',
                cinema: 'Galaxy Nguyễn Du',
                showtime: '20:00 - 23:15',
                date: '2025-07-30',
                seats: ['B8', 'B9', 'B10'],
                price: 150000,
                quantity: 3,
                poster: '/images/avatar.jpg'
            }
        ];

        setTimeout(() => {
            setCartItems(mockCartItems);
            setLoading(false);
        }, 1000);
    }, []);

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity <= 0) {
            removeItem(id);
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
        notification.success('Đã xóa khỏi giỏ hàng');
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const proceedToCheckout = () => {
        if (cartItems.length === 0) {
            notification.warning('Giỏ hàng của bạn đang trống');
            return;
        }

        localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
        navigate('/booking/confirm');
    };

    const continueShopping = () => {
        navigate('/movies');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-8 text-center">
                    <h2 className="text-gray-900 mb-2 text-2xl font-bold flex items-center justify-center gap-2">
                        <ShoppingCart className="h-6 w-6" />
                        Giỏ hàng của bạn
                    </h2>
                    <p className="text-gray-600">
                        {cartItems.length > 0 ? `${getTotalItems()} vé phim` : 'Giỏ hàng trống'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                    <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                        {cartItems.length === 0 ? (
                            <Empty
                                description={
                                    <div>
                                        <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
                                        <Button
                                            onClick={continueShopping}
                                            className="rounded-lg"
                                        >
                                            Khám phá phim mới
                                        </Button>
                                    </div>
                                }
                            />
                        ) : (
                            <List
                                loading={loading}
                                items={cartItems.map((item) => ({
                                    key: item.id,
                                    content: (
                                        <Card className="w-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mb-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_150px] gap-4 p-4">
                                                <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
                                                    <img
                                                        src={item.poster}
                                                        alt={item.movieTitle}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/200x300?text=Movie+Poster';
                                                        }}
                                                    />
                                                </div>

                                                <div className="py-2">
                                                    <h4 className="text-gray-900 mb-3 text-lg font-semibold">{item.movieTitle}</h4>
                                                    <div className="flex flex-col gap-2 text-sm">
                                                        <p className="text-gray-600">📍 {item.cinema}</p>
                                                        <p className="text-gray-600">🕐 {item.showtime}</p>
                                                        <p className="text-gray-600">📅 {item.date}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            🪑 {item.seats.map(seat => (
                                                                <Tag key={seat} color="blue">{seat}</Tag>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    <div>
                                                        <p className="text-lg text-red-600 font-semibold mb-1">
                                                            {(item.price * item.quantity).toLocaleString()}đ
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {item.price.toLocaleString()}đ/vé
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <InputNumber
                                                            value={item.quantity}
                                                            onChange={(value) => updateQuantity(item.id, value)}
                                                            min={1}
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                }))}
                            />
                        )}
                    </Card>

                    <Card className="bg-white rounded-xl shadow-md border border-gray-200 h-fit">
                        <h4 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h4>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">Số lượng vé:</p>
                                <p className="text-gray-900 font-semibold">{getTotalItems()} vé</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">Tạm tính:</p>
                                <p className="text-gray-900">{getTotalPrice().toLocaleString()}đ</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">Phí dịch vụ:</p>
                                <p className="text-gray-900">0đ</p>
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center pt-2">
                                <h4 className="text-gray-900 text-lg font-bold">Tổng cộng:</h4>
                                <h4 className="text-red-600 text-lg font-bold">
                                    {getTotalPrice().toLocaleString()}đ
                                </h4>
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <Button
                                    onClick={proceedToCheckout}
                                    disabled={cartItems.length === 0}
                                    className="h-12 rounded-lg font-semibold"
                                >
                                    Tiến hành thanh toán
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={continueShopping}
                                    className="h-12 rounded-lg font-semibold"
                                >
                                    Tiếp tục mua vé
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Cart;
