import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import paymentService from '@/services/paymentService';

const PaymentCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [processing, setProcessing] = useState(true);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        handlePaymentCallback();
    }, []);

    const handlePaymentCallback = async () => {
        try {
            const params = {};
            searchParams.forEach((value, key) => {
                params[key] = value;
            });

            console.log('Payment callback params:', params);

            const paymentGateway = getPaymentGateway(params);
            console.log('Payment gateway:', paymentGateway);

            const isSuccess = checkPaymentSuccess(params, paymentGateway);
            console.log('Payment success:', isSuccess);

            if (isSuccess) {
                let callbackResult;

                if (paymentGateway === 'vnpay') {
                    callbackResult = { success: true };
                } else if (paymentGateway === 'zalopay') {
                    callbackResult = { success: true };
                }

                const pendingPayment = localStorage.getItem('pendingPayment');
                const bookingInfo = pendingPayment ? JSON.parse(pendingPayment) : {};

                bookingInfo.bookingCode = params.orderId || params.vnp_TransactionNo || params.bookingCode;
                bookingInfo.paymentStatus = 'success';

                localStorage.setItem('lastBooking', JSON.stringify(bookingInfo));
                localStorage.removeItem('pendingPayment');

                setStatus('success');

                setTimeout(() => {
                    navigate(`/booking/success?bookingCode=${bookingInfo.bookingCode}`, {
                        replace: true
                    });
                }, 1000);

            } else {
                const pendingPayment = localStorage.getItem('pendingPayment');
                const bookingInfo = pendingPayment ? JSON.parse(pendingPayment) : {};

                const errorData = {
                    errorMessage: getErrorMessage(params, paymentGateway),
                    movieTitle: bookingInfo.movieTitle,
                    cinemaName: bookingInfo.cinemaName,
                    showTime: bookingInfo.showTime,
                    showDate: bookingInfo.showDate,
                    seatNumbers: bookingInfo.seatNumbers,
                    totalAmount: bookingInfo.totalAmount,
                    reason: getErrorReason(params, paymentGateway),
                    bookingCode: params.orderId || params.vnp_TransactionNo || params.bookingCode || ''
                };

                setStatus('failed');

                setTimeout(() => {
                    const bookingCode = params.orderId || params.vnp_TransactionNo || params.bookingCode || '';
                    navigate(`/booking/failed?bookingCode=${bookingCode}&error=${encodeURIComponent(errorData.errorMessage)}&reason=${encodeURIComponent(errorData.reason)}`, {
                        replace: true
                    });
                }, 1000);
            }

        } catch (error) {
            console.error('Error processing payment callback:', error);
            setStatus('error');

            setTimeout(() => {
                navigate('/booking/failed', {
                    state: {
                        errorData: {
                            errorMessage: 'Có lỗi xảy ra khi xử lý kết quả thanh toán.',
                            reason: 'Không thể xác nhận trạng thái thanh toán từ cổng thanh toán.'
                        }
                    },
                    replace: true
                });
            }, 1000);
        } finally {
            setProcessing(false);
        }
    };

    const getPaymentGateway = (params) => {
        if (params.partnerCode === 'MOMO' || params.partnerCode?.includes('MOMO')) {
            return 'momo';
        } else if (params.vnp_TmnCode || params.vnp_TransactionNo) {
            return 'vnpay';
        } else if (params.apptransid || params.app_trans_id) {
            return 'zalopay';
        }
        return 'unknown';
    };

    const checkPaymentSuccess = (params, gateway) => {
        switch (gateway) {
            case 'momo':
                return params.resultCode === '0' || params.resultCode === 0;
            case 'vnpay':
                return params.vnp_ResponseCode === '00';
            case 'zalopay':
                return params.status === '1' || params.status === 1;
            default:
                return false;
        }
    };

    const getErrorMessage = (params, gateway) => {
        switch (gateway) {
            case 'momo':
                return params.message || 'Thanh toán MoMo không thành công';
            case 'vnpay':
                return params.vnp_Message || 'Thanh toán VNPay không thành công';
            case 'zalopay':
                return params.description || 'Thanh toán ZaloPay không thành công';
            default:
                return 'Thanh toán không thành công';
        }
    };

    const getErrorReason = (params, gateway) => {
        switch (gateway) {
            case 'momo':
                if (params.resultCode === '1006') return 'Người dùng đã hủy giao dịch';
                if (params.resultCode === '1001') return 'Giao dịch thất bại';
                return params.localMessage || 'Lỗi không xác định';
            case 'vnpay':
                if (params.vnp_ResponseCode === '24') return 'Người dùng đã hủy giao dịch';
                if (params.vnp_ResponseCode === '07') return 'Trừ tiền thành công nhưng giao dịch nghi vấn';
                return params.vnp_Message || 'Lỗi không xác định';
            case 'zalopay':
                return params.description || 'Lỗi không xác định';
            default:
                return 'Lỗi không xác định';
        }
    };

    const getStatusMessage = () => {
        if (processing) {
            return {
                title: 'Đang xử lý kết quả thanh toán...',
                subtitle: 'Vui lòng đợi trong giây lát'
            };
        }
        if (status === 'success') {
            return {
                title: 'Thanh toán thành công!',
                subtitle: 'Đang chuyển đến trang xác nhận...'
            };
        }
        if (status === 'failed') {
            return {
                title: 'Thanh toán thất bại',
                subtitle: 'Đang chuyển đến trang thông tin...'
            };
        }
        return {
            title: 'Đang xử lý...',
            subtitle: ''
        };
    };

    const { title, subtitle } = getStatusMessage();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-5">
            <div className="max-w-[1200px] mx-auto w-full">
                <div className="text-center">
                    <div className="mb-8">
                        <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    {subtitle && <p className="text-gray-600">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};

export default PaymentCallback;
