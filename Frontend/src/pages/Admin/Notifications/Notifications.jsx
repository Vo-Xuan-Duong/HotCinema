import React, { useMemo, useState } from 'react';
import { BellRing, Plus, Search, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import useNotification from '@/hooks/useNotification';

const seedNotifications = [
  { id: 1, title: 'Khuyáº¿n mÃ£i cuá»‘i tuáº§n', content: 'Giáº£m 20% cho suáº¥t chiáº¿u trÆ°á»›c 17:00.', type: 'Khuyáº¿n mÃ£i', status: 'ÄÃ£ gá»­i' },
  { id: 2, title: 'Báº£o trÃ¬ há»‡ thá»‘ng', content: 'Há»‡ thá»‘ng táº¡m ngÆ°ng lÃºc 02:00.', type: 'Há»‡ thá»‘ng', status: 'ÄÃ£ lÃªn lá»‹ch' },
];

const Notifications = () => {
  const [items, setItems] = useState(seedNotifications);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'ThÃ´ng bÃ¡o' });
  const notification = useNotification();
  const filtered = useMemo(
    () => items.filter((item) => `${item.title} ${item.content} ${item.type}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  const submit = () => {
    if (!form.title.trim() || !form.content.trim()) {
      notification.error('Vui lÃ²ng nháº­p tiÃªu Ä‘á» vÃ  ná»™i dung.');
      return;
    }
    setItems((current) => [{ id: Date.now(), ...form, status: 'ÄÃ£ gá»­i' }, ...current]);
    setForm({ title: '', content: '', type: 'ThÃ´ng bÃ¡o' });
    setOpen(false);
    notification.success('ÄÃ£ gá»­i thÃ´ng bÃ¡o.');
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">ThÃ´ng bÃ¡o</h1><p className="mt-1 text-sm text-muted-foreground">Soáº¡n, gá»­i vÃ  theo dÃµi thÃ´ng bÃ¡o cá»§a há»‡ thá»‘ng.</p></div>
        <Button className="w-full gap-2 sm:w-auto" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Táº¡o thÃ´ng bÃ¡o</Button>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Trung tÃ¢m thÃ´ng bÃ¡o</CardTitle><CardDescription>{items.length} thÃ´ng bÃ¡o</CardDescription></div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TÃ¬m thÃ´ng bÃ¡o..." className="pl-9" /></div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList><TabsTrigger value="all">Táº¥t cáº£</TabsTrigger><TabsTrigger value="scheduled">ÄÃ£ lÃªn lá»‹ch</TabsTrigger></TabsList>
            <TabsContent value="all" className="space-y-3">
              {filtered.map((item) => (
                <article key={item.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><BellRing className="h-4 w-4" /></div><div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.content}</p></div></div>
                  <div className="flex shrink-0 gap-2"><Badge variant="outline">{item.type}</Badge><Badge variant="secondary">{item.status}</Badge></div>
                </article>
              ))}
            </TabsContent>
            <TabsContent value="scheduled" className="space-y-3">
              {filtered.filter((item) => item.status === 'ÄÃ£ lÃªn lá»‹ch').map((item) => <Card key={item.id}><CardContent className="p-4"><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.content}</p></CardContent></Card>)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>Táº¡o thÃ´ng bÃ¡o</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label htmlFor="notification-title">TiÃªu Ä‘á»</Label><Input id="notification-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
            <div className="space-y-2"><Label>Loáº¡i thÃ´ng bÃ¡o</Label><Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ThÃ´ng bÃ¡o">ThÃ´ng bÃ¡o</SelectItem><SelectItem value="Khuyáº¿n mÃ£i">Khuyáº¿n mÃ£i</SelectItem><SelectItem value="Há»‡ thá»‘ng">Há»‡ thá»‘ng</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="notification-content">Ná»™i dung</Label><Textarea id="notification-content" rows={5} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Há»§y</Button><Button className="gap-2" onClick={submit}><Send className="h-4 w-4" /> Gá»­i thÃ´ng bÃ¡o</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Notifications;
