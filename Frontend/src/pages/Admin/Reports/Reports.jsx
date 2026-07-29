import React, { useMemo } from 'react';
import { Download, Home, RefreshCw, Ticket, Users, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useNotification from '@/hooks/useNotification';

const bookings = [
  { id: 1, customer: 'Nguyá»…n VÄƒn A', movie: 'Avengers: Endgame', cinema: 'CGV Vincom', total: 200000, date: '10/02/2026' },
  { id: 2, customer: 'Tráº§n Thá»‹ B', movie: 'Spider-Man: No Way Home', cinema: 'Lotte Cinema', total: 315000, date: '11/02/2026' },
  { id: 3, customer: 'Pháº¡m VÄƒn C', movie: 'Top Gun: Maverick', cinema: 'Galaxy Cinema', total: 280000, date: '12/02/2026' },
];

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const Reports = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const stats = useMemo(() => {
    const revenue = bookings.reduce((sum, booking) => sum + booking.total, 0);
    return [
      { label: 'Tá»•ng doanh thu', value: currency.format(revenue), icon: WalletCards },
      { label: 'VÃ© Ä‘Ã£ bÃ¡n', value: bookings.length, icon: Ticket },
      { label: 'KhÃ¡ch hÃ ng', value: new Set(bookings.map((item) => item.customer)).size, icon: Users },
    ];
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" className="-ml-3 mb-1 gap-2" onClick={() => navigate('/admin/dashboard')}>
            <Home className="h-4 w-4" /> Dashboard
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">BÃ¡o cÃ¡o doanh thu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tá»•ng quan nhanh tá»« dá»¯ liá»‡u Ä‘áº·t vÃ© hiá»‡n cÃ³.</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button variant="outline" className="flex-1 gap-2 sm:flex-none" onClick={() => notification.success('ÄÃ£ lÃ m má»›i bÃ¡o cÃ¡o')}>
            <RefreshCw className="h-4 w-4" /> LÃ m má»›i
          </Button>
          <Button className="flex-1 gap-2 sm:flex-none" onClick={() => notification.success('ÄÃ£ chuáº©n bá»‹ bÃ¡o cÃ¡o Ä‘á»ƒ xuáº¥t')}>
            <Download className="h-4 w-4" /> Xuáº¥t bÃ¡o cÃ¡o
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Äáº·t vÃ© gáº§n Ä‘Ã¢y</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {bookings.map((booking) => (
            <article key={booking.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{booking.customer}</p><Badge variant="secondary">ÄÃ£ xÃ¡c nháº­n</Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">{booking.movie} Â· {booking.cinema}</p>
              </div>
              <div className="flex items-center justify-between gap-6 sm:block sm:text-right">
                <p className="font-semibold">{currency.format(booking.total)}</p>
                <p className="text-xs text-muted-foreground">{booking.date}</p>
              </div>
            </article>
          ))}
        </CardContent>
      </Card>
    </section>
  );
};

export default Reports;
