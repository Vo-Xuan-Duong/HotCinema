import React, { useEffect, useMemo, useState } from "react"
import { BellRing, Plus, Search, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import useNotification from "@/hooks/useNotification"
import notificationService from "@/services/notificationService"

function AdminNotifications() {
  const notification = useNotification()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: "", content: "", type: "SYSTEM" })

  useEffect(() => {
    notificationService.list({ page: 0, size: 100 })
      .then((response) => {
        const data = response?.data ?? response
        setItems(Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [])
      })
      .catch((error) => notification.error(error.message || "Không thể tải thông báo."))
      .finally(() => setLoading(false))
  }, [notification])

  const filtered = useMemo(
    () => items.filter((item) => `${item.title} ${item.content} ${item.type}`.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      notification.error("Vui lòng nhập tiêu đề và nội dung.")
      return
    }
    try {
      setSending(true)
      const response = await notificationService.broadcast(form)
      const created = response?.data ?? response
      setItems((current) => [created, ...current])
      setForm({ title: "", content: "", type: "SYSTEM" })
      setOpen(false)
      notification.success("Đã gửi thông báo.")
    } catch (error) {
      notification.error(error.message || "Không thể gửi thông báo.")
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold sm:text-3xl">Thông báo</h1><p className="mt-1 text-sm text-muted-foreground">Soạn và gửi thông báo đến người dùng.</p></div>
        <Button className="w-full gap-2 sm:w-auto" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Tạo thông báo</Button>
      </div>
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Trung tâm thông báo</CardTitle><CardDescription>{items.length} thông báo</CardDescription></div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm thông báo..." className="pl-9" /></div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Đang tải thông báo...</p>}
          {!loading && filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Chưa có thông báo.</p>}
          {filtered.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3"><div className="rounded-lg bg-primary/10 p-2 text-primary"><BellRing className="h-4 w-4" /></div><div><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.content}</p></div></div>
              <Badge variant="outline">{item.type || "SYSTEM"}</Badge>
            </article>
          ))}
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>Tạo thông báo</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label htmlFor="notification-title">Tiêu đề</Label><Input id="notification-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
            <div className="space-y-2"><Label>Loại thông báo</Label><Select value={form.type} onValueChange={(type) => setForm({ ...form, type })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SYSTEM">Hệ thống</SelectItem><SelectItem value="PROMOTION">Khuyến mãi</SelectItem><SelectItem value="BOOKING">Đặt vé</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="notification-content">Nội dung</Label><Textarea id="notification-content" rows={5} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button className="gap-2" disabled={sending} onClick={submit}><Send className="h-4 w-4" />{sending ? "Đang gửi..." : "Gửi thông báo"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default AdminNotifications
