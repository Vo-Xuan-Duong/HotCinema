# Phân Tích Kiến Trúc Location (City, District, Cinema)

## 📊 Hiện Trạng

### 1. Cấu Trúc Entities

#### **City** (Thành phố)
- **Fields**: id, name, code, country, isActive, createdAt, updatedAt
- **Relationships**: 
  - OneToMany → Cinema
  - OneToMany → District
- **Controller**: CityController (10 endpoints - chủ yếu read-only)
- **Sử dụng**: 
  - ✅ Được dùng trong CinemaResponse (trả về city name)
  - ✅ Được dùng trong CinemaRequest (yêu cầu cityId)
  - ✅ Có caching (@Cacheable)
  - ✅ Được dùng trong ShowtimeService để filter cinemas theo city

#### **District** (Quận/Huyện)
- **Fields**: id, name, prefix, cityId (FK), isActive, createdAt, updatedAt
- **Relationships**:
  - ManyToOne → City
  - OneToMany → Cinema
- **Controller**: DistrictController (16 endpoints - CRUD đầy đủ)
- **Sử dụng**:
  - ❌ **KHÔNG** được dùng trong CinemaResponse
  - ❌ **KHÔNG** được yêu cầu trong CinemaRequest
  - ❌ **KHÔNG** có business logic nào liên quan đến Cinema service
  - ⚠️ Cinema model có field `districtId` nhưng **KHÔNG được sử dụng**

#### **Cinema** (Rạp chiếu phim)
- **Fields**: id, name, address, phone, email, **cityId (FK)**, **districtId (FK)**, latitude, longitude, isActive
- **Relationships**:
  - ManyToOne → City
  - ManyToOne → District (⚠️ **KHÔNG sử dụng**)
  - OneToMany → Room
- **Controller**: CinemaController (9 endpoints - CRUD đầy đủ)

### 2. Dependency Graph
```
City (được sử dụng)
  ↓
Cinema ← ShowtimeService (filter by cityId)
  ↓
CinemaResponse (chỉ trả về city name)

District (KHÔNG được sử dụng trong Cinema logic)
  ↓
Cinema.districtId (field tồn tại nhưng KHÔNG dùng)
```

---

## 🔍 Phân Tích Chi Tiết

### **Vấn Đề Phát Hiện**

1. **Redundancy**: Cinema có cả `cityId` VÀ `districtId`, trong khi District đã có `cityId` → Dư thừa dữ liệu
2. **Unused Field**: `Cinema.districtId` không được sử dụng trong:
   - CinemaRequest (không yêu cầu)
   - CinemaResponse (không trả về)
   - CinemaService (không xử lý)
   - CinemaMapper (không map)
3. **Inconsistency**: Dữ liệu có thể không nhất quán nếu `cinema.cityId != cinema.district.cityId`

### **Ưu Điểm Của Cấu Trúc Hiện Tại**

✅ **Separation of Concerns**: Mỗi entity có mục đích rõ ràng
- City: Quản lý thành phố (dùng cho filter, display)
- District: Quản lý quận/huyện (có thể mở rộng sau)
- Cinema: Quản lý rạp chiếu phim

✅ **Flexibility**: Có thể query độc lập
- `GET /api/v1/cities` - Lấy danh sách cities
- `GET /api/v1/districts/city/{cityId}` - Lấy districts theo city
- `GET /api/v1/cinemas/city/{city}` - Lấy cinemas theo city

✅ **Extensibility**: Dễ mở rộng
- Thêm thông tin về city (timezone, province, region)
- Thêm thông tin về district (population, area)
- Caching riêng cho cities

✅ **Frontend Friendly**: 
- Có thể có UI riêng để quản lý cities/districts
- Cascading dropdown: City → District → Cinema

### **Nhược Điểm Của Cấu Trúc Hiện Tại**

❌ **Data Redundancy**: Cinema lưu cả cityId và districtId
❌ **Unused Code**: District relationship không được sử dụng
❌ **Over-Engineering**: Quá nhiều endpoints cho chức năng đơn giản (30+ endpoints cho location)
❌ **Maintenance Overhead**: Phải maintain 3 controllers, 3 services, 3 repositories

---

## 💡 Các Phương Án Tối Ưu

### **Phương Án 1: Loại Bỏ `cityId` Từ Cinema (GIỮ LẠI `districtId`)** ⭐ **RECOMMENDED**

#### Ưu điểm:
- ✅ Giảm redundancy - City luôn được lấy từ `district.city`
- ✅ Data consistency - Không thể có trường hợp `cityId != district.cityId`
- ✅ Chuẩn hóa database (3NF)
- ✅ Vẫn giữ được separation of concerns

#### Nhược điểm:
- ⚠️ Query phức tạp hơn một chút (phải join thêm 1 bảng)
- ⚠️ Phải update tất cả queries, services, mappers

#### Thay đổi cần thiết:
```java
// Cinema.java - XÓA cityId, CHỈ GIỮ districtId
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "district_id", nullable = false) // required
private District district;

// CinemaMapper.java
.city(cinema.getDistrict().getCity().getName())  // Thay vì cinema.getCity().getName()

// CinemaRepository.java
Page<Cinema> findByDistrict_City_IdAndIsActiveTrue(Long cityId, Pageable pageable);
```

---

### **Phương Án 2: Loại Bỏ `districtId` Từ Cinema (GIỮ LẠI `cityId`)** ✅ **HIỆN TẠI**

#### Ưu điểm:
- ✅ Đơn giản nhất - chỉ cần xóa field không dùng
- ✅ Query nhanh - không cần join
- ✅ Thay đổi ít nhất

#### Nhược điểm:
- ⚠️ Mất thông tin chi tiết về district (nếu cần sau này)
- ⚠️ District entity trở nên ít ý nghĩa hơn

#### Thay đổi cần thiết:
```java
// Cinema.java - XÓA districtId
// Xóa:
// @ManyToOne(fetch = FetchType.LAZY)
// @JoinColumn(name = "district_id")
// private District district;
```

---

### **Phương Án 3: Gộp City và District vào LocationService** ❌ **KHÔNG NÊN**

#### Lý do KHÔNG nên:
- ❌ Mất flexibility - không thể manage riêng city/district
- ❌ Violates Single Responsibility Principle
- ❌ Khó test và maintain
- ❌ Frontend phải xử lý phức tạp hơn

---

### **Phương Án 4: Tạo LocationController chung (GIỮ NGUYÊN entities)** 🔧 **API OPTIMIZATION**

Nếu muốn đơn giản hóa API mà không thay đổi cấu trúc database:

```java
@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {
    
    @GetMapping("/cities")
    public ResponseEntity<List<CityResponse>> getCities() { ... }
    
    @GetMapping("/cities/{cityId}/districts")
    public ResponseEntity<List<DistrictResponse>> getDistricts(@PathVariable Long cityId) { ... }
    
    @GetMapping("/cities/{cityId}/cinemas")
    public ResponseEntity<List<CinemaResponse>> getCinemas(@PathVariable Long cityId) { ... }
}
```

#### Ưu điểm:
- ✅ API gọn gàng, logic hơn
- ✅ Frontend dễ tích hợp
- ✅ Giữ nguyên database structure
- ✅ Có thể deprecate dần các endpoints cũ

#### Nhược điểm:
- ⚠️ Duplicate code (nếu giữ cả 2 controllers)

---

## 🎯 Khuyến Nghị Cuối Cùng

### **Cho Dự Án Hiện Tại** (Ngắn hạn):

1. ✅ **LOẠI BỎ `districtId`** từ Cinema model (Phương án 2)
   - Lý do: Field này không được sử dụng, gây nhầm lẫn
   - Impact: Thấp, chỉ cần migration đơn giản

2. ✅ **CẬP NHẬT CinemaRequest** để không yêu cầu districtId
   - Đã đúng rồi, giữ nguyên

3. ⚠️ **OPTIONAL**: Thêm validation để ensure cityId là hợp lệ
   ```java
   @NotNull(message = "City ID is required")
   @Positive
   private Long cityId;
   ```

### **Cho Tương Lai** (Dài hạn):

1. 🔧 **Nếu cần thông tin District**:
   - Implement lại Phương án 1 (dùng districtId thay vì cityId)
   - Cập nhật tất cả queries và mappers

2. 🎨 **API Optimization**:
   - Tạo LocationController để gom nhóm endpoints liên quan
   - Deprecate các endpoints ít dùng

3. 📊 **Performance**:
   - Thêm indexes: `CREATE INDEX idx_cinema_city_active ON cinemas(city_id, is_active)`
   - Monitoring slow queries

---

## 📝 Kết Luận

**KHÔNG NÊN** gộp City và District vào Cinema entity vì:
- Chúng có ý nghĩa độc lập
- Separation of concerns tốt hơn
- Dễ mở rộng và maintain

**NÊN** làm gì:
1. **Loại bỏ `districtId`** từ Cinema (vì không dùng)
2. **Giữ nguyên** City, District, Cinema là các entities riêng biệt
3. **Optional**: Tạo LocationController để đơn giản hóa API

**Tóm lại**: Kiến trúc hiện tại về cơ bản là tốt, chỉ cần **dọn dẹp code không dùng** (districtId) là được!









