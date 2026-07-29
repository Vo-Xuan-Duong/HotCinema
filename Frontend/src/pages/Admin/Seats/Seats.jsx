import React, { useMemo, useState } from 'react';
import { Armchair, Ban, CheckCircle2, Plus, Search, TicketCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useNotification from '@/hooks/useNotification';

const initialRooms = [
  { id: 'room-1', name: 'PhÃ²ng 01', cinema: 'HotCinemas Quáº­n 1', rows: 8, seatsPerRow: 12, booked: 23, blocked: 2 },
  { id: 'room-2', name: 'PhÃ²ng IMAX', cinema: 'HotCinemas Landmark', rows: 10, seatsPerRow: 14, booked: 61, blocked: 4 },
  { id: 'room-3', name: 'PhÃ²ng 03', cinema: 'HotCinemas Thá»§ Äá»©c', rows: 7, seatsPerRow: 10, booked: 18, blocked: 0 },
];

const Seats = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', cinema: '', rows: '8', seatsPerRow: '12' });
  const notification = useNotification();

  const filteredRooms = useMemo(
    () => rooms.filter((room) => `${room.name} ${room.cinema}`.toLowerCase().includes(query.toLowerCase())),
    [query, rooms]
  );

  const totals = useMemo(() => rooms.reduce((acc, room) => {
    const total = room.rows * room.seatsPerRow;
    acc.total += total;
    acc.booked += room.booked;
    acc.blocked += room.blocked;
    return acc;
  }, { total: 0, booked: 0, blocked: 0 }), [rooms]);

  const handleCreate = () => {
    if (!form.name.trim() || !form.cinema) {
      notification.error('Vui lÃ²ng nháº­p tÃªn phÃ²ng vÃ  chá»n ráº¡p.');
      return;
    }
    setRooms((current) => [...current, {
      id: `room-${Date.now()}`,
      name: form.name.trim(),
      cinema: form.cinema,
      rows: Number(form.rows),
      seatsPerRow: Number(form.seatsPerRow),
      booked: 0,
      blocked: 0,
    }]);
    setOpen(false);
    setForm({ name: '', cinema: '', rows: '8', seatsPerRow: '12' });
    notification.success('ÄÃ£ táº¡o phÃ²ng chiáº¿u.');
  };

  const stats = [
    { label: 'Tá»•ng sá»‘ gháº¿', value: totals.total, icon: Armchair },
    { label: 'Gháº¿ Ä‘Ã£ Ä‘áº·t', value: totals.booked, icon: TicketCheck },
    { label: 'Gháº¿ Ä‘ang khÃ³a', value: totals.blocked, icon: Ban },
    { label: 'Gháº¿ kháº£ dá»¥ng', value: totals.total - totals.booked - totals.blocked, icon: CheckCircle2 },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Quáº£n lÃ½ gháº¿</h1>
          <p className="mt-1 text-sm text-muted-foreground">Thiáº¿t láº­p sá»©c chá»©a vÃ  theo dÃµi tráº¡ng thÃ¡i gháº¿ theo phÃ²ng.</p>
        </div>
        <Button className="w-full gap-2 sm:w-auto" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> ThÃªm phÃ²ng
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Danh sÃ¡ch phÃ²ng</CardTitle><CardDescription>{filteredRooms.length} phÃ²ng phÃ¹ há»£p</CardDescription></div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TÃ¬m phÃ²ng hoáº·c ráº¡p..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {filteredRooms.map((room) => {
            const total = room.rows * room.seatsPerRow;
            return (
              <article key={room.id} className="rounded-xl border p-4 transition-colors hover:bg-muted/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h2 className="font-semibold">{room.name}</h2><p className="text-sm text-muted-foreground">{room.cinema}</p></div>
                  <Badge variant="secondary">{room.rows} Ã— {room.seatsPerRow}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-muted p-2"><p className="font-semibold">{total}</p><p className="text-xs text-muted-foreground">Tá»•ng</p></div>
                  <div className="rounded-lg bg-muted p-2"><p className="font-semibold">{room.booked}</p><p className="text-xs text-muted-foreground">ÄÃ£ Ä‘áº·t</p></div>
                  <div className="rounded-lg bg-muted p-2"><p className="font-semibold">{room.blocked}</p><p className="text-xs text-muted-foreground">KhÃ³a</p></div>
                </div>
              </article>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>ThÃªm phÃ²ng chiáº¿u</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label htmlFor="room-name">TÃªn phÃ²ng</Label><Input id="room-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ráº¡p chiáº¿u</Label><Select value={form.cinema} onValueChange={(cinema) => setForm({ ...form, cinema })}><SelectTrigger><SelectValue placeholder="Chá»n ráº¡p" /></SelectTrigger><SelectContent><SelectItem value="HotCinemas Quáº­n 1">HotCinemas Quáº­n 1</SelectItem><SelectItem value="HotCinemas Landmark">HotCinemas Landmark</SelectItem><SelectItem value="HotCinemas Thá»§ Äá»©c">HotCinemas Thá»§ Äá»©c</SelectItem></SelectContent></Select></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="rows">Sá»‘ hÃ ng</Label><Input id="rows" type="number" min="1" max="26" value={form.rows} onChange={(e) => setForm({ ...form, rows: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="seats">Gháº¿ má»—i hÃ ng</Label><Input id="seats" type="number" min="1" max="30" value={form.seatsPerRow} onChange={(e) => setForm({ ...form, seatsPerRow: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Há»§y</Button><Button onClick={handleCreate}>Táº¡o phÃ²ng</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Seats;
