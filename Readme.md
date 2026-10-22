# EvliyaMap

Evliya Çelebi’nin Seyahatname’sindeki yerleri ve anlatıları etkileşimli bir harita üzerinden keşfetmek için geliştirilmiş React uygulaması. On cilde ait konum verilerini harita işaretçileri, açıklamalar, görseller ve varsa video bağlantılarıyla bir araya getirir.

## Özellikler

- Tek bir cildi veya tüm ciltleri birlikte görüntüleme
- Yer adı ve açıklama metninde arama
- Şehir, doğa, tarihi yapı gibi konum türlerine göre filtreleme
- Harita üzerinde konum seçimi ve işaretçi kümeleri
- Seçilen yerin seyahat notları, görselleri ve varsa videosu
- Mobil ekranlara uyarlanan yan panel ve ayrıntı görünümü

## Teknolojiler

React 18, Vite 5 ve Lucide React kullanılır. Harita Leaflet ve Leaflet.markercluster ile çizilir; harita katmanları CARTO/OpenStreetMap kaynaklarından alınır.

## Yerel çalıştırma

Node.js 22 veya üzeri ve npm gerekir:

```bash
git clone https://github.com/aToom13/EvliyaMap.git
cd EvliyaMap
npm ci
npm run dev -- --host 127.0.0.1
```

Terminalde yazan yerel adresi açın; varsayılan adres <http://127.0.0.1:5173> olur. Uygulamanın ayrı bir backend veya API anahtarı gereksinimi yoktur.

Leaflet, harita katmanları, yazı tipleri ve harici medya ağ üzerinden yüklenir; bunlar için internet bağlantısı gerekir. Veri dosyalarını yükleyebilmek için uygulamayı bir HTTP sunucusuyla açın; `index.html` dosyasını doğrudan açmayın.

## Build ve önizleme

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Build çıktısı `dist/` klasörüne yazılır. Önizleme adresi varsayılan olarak <http://127.0.0.1:4173> olur; kullanılan port için terminal çıktısını kontrol edin.

## Proje yapısı

| Yol | İçerik |
|---|---|
| [src/main.jsx](src/main.jsx) | Uygulama giriş noktası |
| [src/pages/Home.jsx](src/pages/Home.jsx) | Ana sayfa ve görünüm durumu |
| [src/components/](src/components/) | Harita, yan panel ve yer ayrıntısı bileşenleri |
| [src/hooks/useLocations.js](src/hooks/useLocations.js) | Cilt verilerinin yüklenmesi |
| [public/](public/) | `cilt1.json` ile `cilt10.json` arasındaki konum dosyaları |
| [scripts/](scripts/) | Veri toplama, temizleme ve zenginleştirme araçları |
| [wiki.md](wiki.md) | Wikipedia verilerinin hazırlanmasına ilişkin notlar |
| [souc.md](souc.md) | Kaynak ve veri işleme notları |

## Konum verileri

Uygulama `public/ciltN.json` dosyalarını kullanır. Her dosya konum nesnelerinden oluşan bir JSON dizisidir. Temel alanlar:

| Alan | Açıklama |
|---|---|
| `id` | Konum kimliği |
| `title` | Gösterilen yer adı |
| `coords` | `[enlem, boylam]` sırasıyla koordinatlar |
| `type`, `iconType` | Filtreleme kategorisi ve simge türü |
| `excerpt`, `description`, `detail` | Kısa açıklama ve seyahat notları |
| `images` | Varsa görsel URL’leri |
| `video` | Varsa video URL’si |

Veriler Wikipedia ve proje içindeki derleme/araştırma notlarından hazırlanmıştır. Tarihi yer adları, koordinatlar ve anlatılar yaklaşık veya yorumlanmış olabilir; akademik kullanımda asıl metin ve kaynaklarla karşılaştırılmalıdır.

## Bilinen sınırlar

Cilt verisi yüklenemezse uygulama hata mesajıyla birlikte küçük bir yedek veri kümesi gösterir. Bu durumda görünen birkaç konumun tüm veri seti olduğu varsayılmamalıdır. Harici görsel ve video bağlantılarının kullanılabilirliği ilgili hizmetlere bağlıdır.
