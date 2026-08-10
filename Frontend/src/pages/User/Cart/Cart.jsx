import { useMemo, useState } from "react"
import { Film, ShoppingCart, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/ui/status-badge"
import cartService from "@/services/cartService"
import useNotification from "@/hooks/useNotification"

const money = (value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0))

function Cart() {
  const navigate = useNavigate()
  const notification = useNotification()
  const [items, setItems] = useState(() => cartService.list())
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.totalAmount ?? item.price ?? 0), 0), [items])

  const remove = (id) => {
    setItems(cartService.remove(id))
    notification.success("Đã xóa khỏi giỏ hàng.")
  }

  const checkout = () => {
    if (!items.length) return
    localStorage.setItem("checkoutItems", JSON.stringify(items))
    navigate("/booking/payment", { state: { cartItems: items, totalAmount: total } })
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:py-10">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl"><ShoppingCart className="h-7 w-7" />Giỏ hàng</h1>
        <p className="mt-1 text-sm text-muted-foreground">Kiểm tra vé và dịch vụ trước khi thanh toán.</p>
      </div>
      {!items.length ? (
        <Card><CardContent className="py-12"><Empty description="Giỏ hàng đang trống" /><div className="mt-5 flex justify-center"><Button onClick={() => navigate("/movies")}><Film className="mr-2 h-4 w-4" />Chọn phim</Button></div></CardContent></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                  {item.posterUrl && <img src={item.posterUrl} alt="" className="h-28 w-20 rounded-md object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div><h2 className="font-semibold">{item.movieTitle || item.name || "Vé xem phim"}</h2><p className="text-sm text-muted-foreground">{item.cinemaName} {item.showtime ? `· ${item.showtime}` : ""}</p></div>
                      <StatusBadge tone="blue">{item.seats?.join(", ") || "Chưa chọn ghế"}</StatusBadge>
                    </div>
                    <p className="mt-4 font-semibold text-primary">{money(item.totalAmount ?? item.price)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /><span className="sr-only">Xóa</span></Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader><CardTitle>Tóm tắt đơn hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm"><span>Số sản phẩm</span><span>{items.length}</span></div>
              <Separator />
              <div className="flex justify-between font-semibold"><span>Tổng cộng</span><span className="text-primary">{money(total)}</span></div>
              <Button className="w-full" onClick={checkout}>Tiến hành thanh toán</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}

export default Cart
