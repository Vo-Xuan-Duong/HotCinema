import React, { useMemo, useState } from 'react';
import { CheckCircle2, CircleDot, FlaskConical, Plus, Search, TimerReset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import useNotification from '@/hooks/useNotification';

const seedTests = [
  { id: 1, name: 'ÄÄƒng nháº­p báº±ng email', type: 'E2E', priority: 'Cao', status: 'Äáº¡t' },
  { id: 2, name: 'Giá»¯ gháº¿ Ä‘á»“ng thá»i', type: 'Integration', priority: 'Cao', status: 'Äang cháº¡y' },
  { id: 3, name: 'Hiá»ƒn thá»‹ danh sÃ¡ch phim', type: 'UI', priority: 'Trung bÃ¬nh', status: 'Chá» cháº¡y' },
];

const statusVariant = { 'Äáº¡t': 'secondary', 'Äang cháº¡y': 'default', 'Chá» cháº¡y': 'outline' };

const Testing = () => {
  const [tests, setTests] = useState(seedTests);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'UI', priority: 'Trung bÃ¬nh', description: '' });
  const notification = useNotification();

  const filtered = useMemo(
    () => tests.filter((test) => `${test.name} ${test.type} ${test.status}`.toLowerCase().includes(query.toLowerCase())),
    [query, tests]
  );

  const createTest = () => {
    if (!form.name.trim()) {
      notification.error('Vui lÃ²ng nháº­p tÃªn ká»‹ch báº£n kiá»ƒm thá»­.');
      return;
    }
    setTests((current) => [...current, { id: Date.now(), ...form, name: form.name.trim(), status: 'Chá» cháº¡y' }]);
    setForm({ name: '', type: 'UI', priority: 'Trung bÃ¬nh', description: '' });
    setOpen(false);
    notification.success('ÄÃ£ thÃªm ká»‹ch báº£n kiá»ƒm thá»­.');
  };

  const stats = [
    { label: 'Tá»•ng ká»‹ch báº£n', value: tests.length, icon: FlaskConical },
    { label: 'ÄÃ£ Ä‘áº¡t', value: tests.filter((test) => test.status === 'Äáº¡t').length, icon: CheckCircle2 },
    { label: 'Äang cháº¡y', value: tests.filter((test) => test.status === 'Äang cháº¡y').length, icon: TimerReset },
    { label: 'Chá» cháº¡y', value: tests.filter((test) => test.status === 'Chá» cháº¡y').length, icon: CircleDot },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Kiá»ƒm thá»­ há»‡ thá»‘ng</h1><p className="mt-1 text-sm text-muted-foreground">Quáº£n lÃ½ cÃ¡c ká»‹ch báº£n kiá»ƒm thá»­ nghiá»‡p vá»¥ quan trá»ng.</p></div>
        <Button className="w-full gap-2 sm:w-auto" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> ThÃªm ká»‹ch báº£n</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div><div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Ká»‹ch báº£n kiá»ƒm thá»­</CardTitle><CardDescription>{filtered.length} káº¿t quáº£</CardDescription></div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TÃ¬m ká»‹ch báº£n..." className="pl-9" /></div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((test) => (
            <article key={test.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><p className="truncate font-medium">{test.name}</p><p className="text-sm text-muted-foreground">{test.type} Â· Æ¯u tiÃªn {test.priority.toLowerCase()}</p></div>
              <Badge variant={statusVariant[test.status]}>{test.status}</Badge>
            </article>
          ))}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>ThÃªm ká»‹ch báº£n kiá»ƒm thá»­</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label htmlFor="test-name">TÃªn ká»‹ch báº£n</Label><Input id="test-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Loáº¡i kiá»ƒm thá»­</Label><Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UI">UI</SelectItem><SelectItem value="E2E">E2E</SelectItem><SelectItem value="Integration">Integration</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Äá»™ Æ°u tiÃªn</Label><Select value={form.priority} onValueChange={(priority) => setForm({ ...form, priority })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Tháº¥p">Tháº¥p</SelectItem><SelectItem value="Trung bÃ¬nh">Trung bÃ¬nh</SelectItem><SelectItem value="Cao">Cao</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">MÃ´ táº£</Label><Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Há»§y</Button><Button onClick={createTest}>ThÃªm ká»‹ch báº£n</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Testing;
