# **Dokumentasi API E-Commerce NUKE**

Selamat datang di dokumentasi API E-Commerce NUKE.

## **Informasi Umum**

API E-Commerce pada umumnya, dengan fitur spesial "Virtual Try-On" yang dapat membuat Anda mencoba baju secara online.

*   **Base URL:** `http://localhost:3000`

## **Otentikasi**

Sebagian besar endpoint di API ini memerlukan otentikasi menggunakan **JWT (JSON Web Token)**.

Untuk mengakses endpoint yang dilindungi, Anda harus menyertakan token di dalam *header* `Authorization`.

*   **Header:** `Authorization`
*   **Format:** `Bearer <YOUR_ACCESS_TOKEN>`

### **Bagaimana Cara Mendapatkan Token?**
Anda bisa mendapatkan `access_token` dengan melakukan panggilan ke endpoint `POST /login` menggunakan email dan password yang sudah terdaftar.

---

## **1. Pengguna (Users)**

Endpoint yang berkaitan dengan registrasi dan login pengguna.

### **1.1 Registrasi Pengguna Baru**

Membuat akun pengguna baru di dalam sistem.

*   **Method:** `POST`
*   **Endpoint:** `/register`
*   **Otentikasi:** Tidak diperlukan.

#### **Request Body**

| Field      | Tipe Data | Keterangan                          | Wajib? |
| :--------- | :-------- | :---------------------------------- | :----- |
| `fullName` | `string`  | Nama lengkap pengguna.              | Ya     |
| `email`    | `string`  | Alamat email unik pengguna.         | Ya     |
| `password` | `string`  | Kata sandi pengguna.                | Ya     |

#### **Responses**
*   **`201 Created`** - Sukses membuat pengguna baru.
    ```json
    {
        "id": 1,
        "email": "john.doe@example.com"
    }
    ```
*   **`400 Bad Request`** - Jika ada data yang tidak valid atau email sudah terdaftar.
    ```json
    {
        "message": "Email already exists"
    }
    ```

### **1.2 Login Pengguna**

Mengautentikasi pengguna dan mendapatkan `access_token` untuk mengakses endpoint lain.

*   **Method:** `POST`
*   **Endpoint:** `/login`
*   **Otentikasi:** Tidak diperlukan.

#### **Request Body**
| Field      | Tipe Data | Keterangan                  | Wajib? |
| :--------- | :-------- | :-------------------------- | :----- |
| `email`    | `string`  | Alamat email pengguna.      | Ya     |
| `password` | `string`  | Kata sandi pengguna.        | Ya     |

#### **Responses**
*   **`200 OK`** - Login berhasil.
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **`401 Unauthorized`** - Jika email atau password salah.
    ```json
    {
        "message": "Invalid email or password"
    }
    ```

### **1.3 Login dengan Google**

Mengautentikasi atau mendaftarkan pengguna menggunakan kredensial Google dan mendapatkan `access_token`.

*   **Method:** `POST`
*   **Endpoint:** `/google-login`
*   **Otentikasi:** Tidak diperlukan.

#### **Request Body**
| Field         | Tipe Data | Keterangan                               | Wajib? |
| :------------ | :-------- | :--------------------------------------- | :----- |
| `google_token`| `string`  | Token ID yang didapatkan dari Google Sign-In. | Ya     |

#### **Responses**
*   **`200 OK`** - Login berhasil.
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **`401 Unauthorized`** - Jika token Google tidak valid.
    ```json
    {
        "message": "Invalid google token"
    }
    ```

---

## **2. Produk (Products)**

Endpoint untuk melihat dan mengelola produk.

### **2.1 Lihat Semua Produk**

Mengambil daftar semua produk yang tersedia.

*   **Method:** `GET`
*   **Endpoint:** `/products`
*   **Otentikasi:** Tidak diperlukan.

#### **Responses**
*   **`200 OK`** - Sukses mengambil data produk.
    ```json
    [
        {
            "id": 1,
            "name": "Kemeja Lengan Panjang",
            "price": 250000,
            "stock": 50,
            "imageUrl": "http://example.com/image.png",
            "categoryId": 1
        },
        {
            "id": 2,
            "name": "Celana Jeans",
            "price": 450000,
            "stock": 30,
            "imageUrl": "http://example.com/image2.png",
            "categoryId": 2
        }
    ]
    ```

### **2.2 Lihat Detail Produk**

Mengambil informasi detail dari satu produk berdasarkan ID-nya.

*   **Method:** `GET`
*   **Endpoint:** `/products/:id`
*   **Otentikasi:** Tidak diperlukan.

#### **URL Parameters**
| Parameter | Tipe Data | Keterangan      |
| :-------- | :-------- | :-------------- |
| `id`      | `integer` | ID unik produk. |

#### **Responses**
*   **`200 OK`** - Sukses mengambil data produk.
    ```json
    {
        "id": 1,
        "name": "Kemeja Lengan Panjang",
        "description": "Kemeja formal dengan bahan katun premium.",
        "price": 250000,
        "stock": 50,
        "imageUrl": "http://example.com/image.png",
        "Category": {
            "id": 1,
            "name": "Pakaian Pria"
        }
    }
    ```
*   **`404 Not Found`** - Jika produk dengan ID tersebut tidak ditemukan.
    ```json
    {
        "message": "Product not found"
    }
    ```

### **2.3 Tambah Produk Baru (Admin)**

Menambahkan produk baru ke dalam database.

*   **Method:** `POST`
*   **Endpoint:** `/products`
*   **Otentikasi:** Diperlukan (`Bearer Token`).
*   **Hak Akses:** **Admin**.

#### **Request Body**
| Field         | Tipe Data | Keterangan                               | Wajib? |
| :------------ | :-------- | :--------------------------------------- | :----- |
| `name`        | `string`  | Nama produk.                             | Ya     |
| `description` | `string`  | Deskripsi lengkap produk.                | Ya     |
| `price`       | `integer` | Harga produk.                            | Ya     |
| `stock`       | `integer` | Jumlah stok yang tersedia.               | Ya     |
| `imageUrl`    | `string`  | URL gambar produk.                       | Ya     |
| `categoryId`  | `integer` | ID kategori yang sesuai.                 | Ya     |

#### **Responses**
*   **`201 Created`** - Sukses membuat produk baru.
    ```json
    {
        "id": 3,
        "name": "Produk Baru",
        "price": 100000,
        "stock": 10,
        "imageUrl": "http://example.com/new.png",
        "categoryId": 1
    }
    ```
*   **`403 Forbidden`** - Jika pengguna bukan admin.
    ```json
    {
        "message": "You're unauthorized"
    }
    ```

### **2.4 Ubah Detail Produk (Admin)**

Memperbarui informasi produk yang sudah ada berdasarkan ID-nya.

*   **Method:** `PUT`
*   **Endpoint:** `/products/:id`
*   **Otentikasi:** Diperlukan (`Bearer Token`).
*   **Hak Akses:** **Admin**.

#### **URL Parameters**
| Parameter | Tipe Data | Keterangan      |
| :-------- | :-------- | :-------------- |
| `id`      | `integer` | ID unik produk. |

#### **Request Body**
Semua *field* dari "Tambah Produk Baru" bersifat opsional.

#### **Responses**
*   **`200 OK`** - Sukses memperbarui produk.
    ```json
    {
        "id": 1,
        "name": "Nama Produk Diubah",
        "price": 275000,
        "stock": 45,
        "imageUrl": "http://example.com/image.png",
        "categoryId": 1
    }
    ```*   **`404 Not Found`** - Jika produk dengan ID tersebut tidak ditemukan.
    ```json
    {
        "message": "Product not found"
    }
    ```

### **2.5 Hapus Produk (Admin)**

Menghapus produk dari database berdasarkan ID-nya.

*   **Method:** `DELETE`
*   **Endpoint:** `/products/:id`
*   **Otentikasi:** Diperlukan (`Bearer Token`).
*   **Hak Akses:** **Admin**.

#### **URL Parameters**
| Parameter | Tipe Data | Keterangan      |
| :-------- | :-------- | :-------------- |
| `id`      | `integer` | ID unik produk. |

#### **Responses**
*   **`200 OK`** - Sukses menghapus produk.
    ```json
    {
        "message": "Product with id: 1 deleted successfully"
    }
    ```
*   **`404 Not Found`** - Jika produk dengan ID tersebut tidak ditemukan.
    ```json
    {
        "message": "Product not found"
    }
    ```

### **2.6 Virtual Try-On**

Menggunakan AI untuk menghasilkan gambar pengguna yang seolah-olah sedang memakai produk pakaian.

*   **Method:** `POST`
*   **Endpoint:** `/products/:id/virtual-try-on`
*   **Otentikasi:** Diperlukan (`Bearer Token`).
*   **Content-Type:** `multipart/form-data`

#### **URL Parameters**
| Parameter | Tipe Data | Keterangan                          |
| :-------- | :-------- | :---------------------------------- |
| `id`      | `integer` | ID unik produk pakaian yang akan dicoba. |

#### **Request Body (form-data)**
| Field         | Tipe Data | Keterangan                               | Wajib? |
| :------------ | :-------- | :--------------------------------------- | :----- |
| `userImage`   | `file`    | Gambar pengguna (menghadap depan, seluruh tubuh). | Ya     |
| `height`      | `integer` | Tinggi badan pengguna dalam cm.          | Ya     |
| `weight`      | `integer` | Berat badan pengguna dalam kg.           | Ya     |
| `product_size`| `string`  | Ukuran produk yang ingin dicoba (S, M, L, XL). | Ya     |

#### **Responses**
*   **`200 OK`** - Sukses menghasilkan gambar.
    ```json
    {
        "message": "Virtual try-on successful",
        "resultUrl": "http://cloudinary.com/path/to/generated-image.jpg"
    }
    ```
*   **`400 Bad Request`** - Jika file tidak dilampirkan atau parameter tidak lengkap.
    ```json
    {
        "message": "Height, weight, and product size are required"
    }
    ```
*   **`404 Not Found`** - Jika produk tidak ditemukan.
    ```json
    {
        "message": "Product not found"
    }
    ```
*   **`500 Internal Server Error`** - Jika terjadi kegagalan pada AI.
    ```json
    {
        "message": "Failed to generate virtual try-on image"
    }
    ```

---

## **3. Keranjang (Carts)**

### **3.1 Tambah Item ke Keranjang**

Menambahkan item ke keranjang pengguna.

*   **Method:** `POST`
*   **Endpoint:** `/carts/items`
*   **Otentikasi:** Diperlukan (`Bearer Token`).

#### **Request Body**
| Field       | Tipe Data | Keterangan                          | Wajib? |
| :---------- | :-------- | :---------------------------------- | :----- |
| `productId` | `integer` | ID produk yang ingin ditambahkan.  | Ya     |
| `quantity`  | `integer` | Jumlah item yang ingin ditambahkan. | Ya     |

#### **Responses**
*   **`201 Created`** - Item berhasil ditambahkan ke keranjang.
    ```json
    {
        "message": "Item added to cart successfully",
        "item": {
            "id": 1,
            "cartId": 1,
            "productId": 2,
            "quantity": 3
        }
    }
    ```
*   **`400 Bad Request`** - Jika data tidak valid.
    ```json
    {
        "message": "Invalid request data"
    }
    ```

### **3.2 Lihat Isi Keranjang**

Mengambil daftar item di keranjang pengguna.

*   **Method:** `GET`
*   **Endpoint:** `/carts`
*   **Otentikasi:** Diperlukan (`Bearer Token`).

#### **Responses**
*   **`200 OK`** - Sukses mengambil data keranjang.
    ```json
    {
        "id": 1,
        "userId": 1,
        "items": [
            {
                "id": 1,
                "cartId": 1,
                "productId": 2,
                "quantity": 3,
                "product": {
                    "id": 2,
                    "name": "Celana Jeans",
                    "price": 450000,
                    "stock": 30
                }
            }
        ]
    }
    ```
*   **`404 Not Found`** - Jika keranjang tidak ditemukan.
    ```json
    {
        "message": "Cart not found"
    }
    ```

## **4. Pesanan (Orders)**

### **4.1 Checkout Pesanan**

Melakukan checkout untuk semua item di keranjang.

*   **Method:** `POST`
*   **Endpoint:** `/orders/checkout`
*   **Otentikasi:** Diperlukan (`Bearer Token`).

#### **Request Body**
| Field             | Tipe Data | Keterangan                          | Wajib? |
| :---------------- | :-------- | :---------------------------------- | :----- |
| `shippingAddress` | `string`  | Alamat pengiriman.                  | Ya     |

#### **Responses**
*   **`200 OK`** - Sukses melakukan checkout.
    ```json
    {
        "message": "Checkout successful",
        "order": {
            "id": 1,
            "userId": 1,
            "totalPrice": 1000000,
            "shippingAddress": "Jl. Contoh No. 123",
            "status": "pending"
        }
    }
    ```
*   **`400 Bad Request`** - Jika keranjang kosong atau data tidak valid.
    ```json
    {
        "message": "Your cart is empty"
    }
    ```

---

## **Model dan Relasi**

### **1. User**
- **Fields**:
  - `fullName` (string, required)
  - `email` (string, unique, required)
  - `password` (string, required)
  - `role` (enum: `customer`, `admin`, default: `customer`)
- **Relasi**:
  - Memiliki satu `Cart`.
  - Memiliki banyak `Order`.

### **2. Cart**
- **Fields**:
  - `userId` (integer, unique, required)
- **Relasi**:
  - Milik satu `User`.
  - Memiliki banyak `CartItem`.

### **3. CartItem**
- **Fields**:
  - `cartId` (integer, required)
  - `productId` (integer, required)
  - `quantity` (integer, default: 1, required)
- **Relasi**:
  - Milik satu `Cart`.
  - Milik satu `Product`.

### **4. Category**
- **Fields**:
  - `name` (string, unique, required)
  - `slug` (string, unique, required)
  - `description` (text, optional)
- **Relasi**:
  - Memiliki banyak `Product`.

### **5. Product**
- **Fields**:
  - `name` (string, required)
  - `description` (text, optional)
  - `price` (decimal, required)
  - `stock` (integer, default: 0, required)
  - `categoryId` (integer, required)
- **Relasi**:
  - Milik satu `Category`.

### **6. Order**
- **Fields**:
  - `userId` (integer, optional)
  - `totalPrice` (decimal, required)
  - `shippingAddress` (text, required)
  - `status` (enum: `pending`, `paid`, `shipped`, `delivered`, `cancelled`, default: `pending`)
- **Relasi**:
  - Milik satu `User`.
  - Memiliki banyak `OrderItem`.

### **7. OrderItem**
- **Fields**:
  - `orderId` (integer, required)
  - `productId` (integer, optional)
  - `quantity` (integer, required)
  - `priceAtPurchase` (decimal, required)
- **Relasi**:
  - Milik satu `Order`.
  - Milik satu `Product`.