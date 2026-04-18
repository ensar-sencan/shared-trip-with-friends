# 🎭 SplitFlow Demo Modu

## Özellik

Demo modu, yarışma sunumları ve gösterimler için **zengin görsel içerik** sağlar. Gerçek blockchain ödemelerini test ederken, aynı zamanda profesyonel bir kullanıcı deneyimi sunar.

## Nasıl Çalışır?

### 1. Demo Modunu Aktifleştirme

Ana sayfada (**SplitHome**) "🎮 Demo Modu" butonuna tıklayın:

```
🎮 Demo Modu
5 kullanıcı, 14 harcama, zengin borç grafiği → Gerçek ödeme sadece sana
[Demoyu Yükle →]
```

### 2. Ne Oluşturulur?

Demo modu aktifleştirildiğinde:

- ✅ **5 Kullanıcı**: Sen + 4 mock kullanıcı (Alice, Bob, Charlie, Diana)
- ✅ **14 Harcama**: Gerçekçi bir 5 günlük trip senaryosu
  - 🏨 Otel rezervasyonları
  - 🍽️ Yemekler (kahvaltı, öğle, akşam)
  - 🚗 Ulaşım (taksi, Uber, havaalanı transferi)
  - 🎯 Aktiviteler (müze, tekne turu)
- ✅ **Zengin Borç Grafiği**: Karmaşık borç ilişkileri
- ✅ **Karma Liderlik Tablosu**: Kullanıcı skorları ve rozetler

### 3. Mock Kullanıcılar

```typescript
MOCK_ADDRESSES = {
  alice: "GALICE7XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
  bob: "GBOBBBB7XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
  charlie: "GCHARLI7XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
  diana: "GDIANA77XKQWXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQXVZQ",
}
```

Bu adresler **sadece görsel amaçlıdır** - gerçek blockchain adresleri değildir.

### 4. Ödeme Davranışı

#### Senin Borçların (Gerçek)
- ✅ **Freighter ile ödenebilir**
- ✅ Stellar blockchain'e kaydedilir
- ✅ Transaction hash alırsın
- ✅ Horizon Explorer'da görülebilir

#### Mock Kullanıcı Borçları (Görsel)
- 🎭 Sadece grafikte görünür
- 🎭 "Demo kullanıcı - Sadece görsel amaçlı" etiketi
- 🎭 Ödeme butonu yok
- 🎭 Opacity: 0.6 (soluk görünüm)

## Görsel Özellikler

### Grup Paneli
```
┌─────────────────────────────────────┐
│ 🎭 Demo Modu Aktif                  │
│ 4 demo kullanıcı ile zengin görünüm │
│ Gerçek ödeme sadece senin borçlarında│
└─────────────────────────────────────┘

📊 Üyeler: 5 (4 demo)
🧾 Harcama: 14
💰 Toplam: 999.00 XLM
⚠️ Bekleyen: 4
```

### Borç Grafiği
- Renkli node'lar (her kullanıcı farklı renk)
- Animasyonlu edge'ler (borç akışı)
- Hover efektleri
- Responsive tasarım

### Ödemeler Sayfası
```
⚡ Senin Ödemelerin — Freighter ile İmzala
[Gerçek ödeme kartları - tıklanabilir]

👥 Demo Kullanıcı Borçları (Sadece Görsel)
[Soluk kartlar - tıklanamaz]
```

## Teknik Detaylar

### Dosya Yapısı
```
src/
├── lib/
│   ├── mockData.ts          # Mock kullanıcılar ve harcamalar
│   └── algorithm.ts         # shortAddr() mock desteği
├── pages/
│   ├── SplitHome.tsx        # Demo butonu
│   ├── Group.tsx            # Demo banner
│   └── SettleUp.tsx         # Mock borç filtreleme
└── components/
    └── SettleCard.tsx       # isDemo prop desteği
```

### Fonksiyonlar

#### `createDemoGroup(realUserAddress: string)`
Tam özellikli bir demo grup oluşturur.

#### `generateMockExpenses(realUserAddress: string)`
14 gerçekçi harcama oluşturur (5 günlük trip).

#### `isMockAddress(address: string)`
Bir adresin mock olup olmadığını kontrol eder.

#### `getDisplayName(address: string, realUserAddress?: string)`
Mock kullanıcılar için friendly isimler döner (Alice, Bob, vb.)

## Yarışma Sunumu İçin

### Avantajlar
1. ✅ **Zengin Görsel**: Boş ekranlar yerine dolu grafikler
2. ✅ **Gerçek Demo**: Freighter ile gerçek ödeme yapabilirsin
3. ✅ **Profesyonel**: Çok kullanıcılı senaryo gösterimi
4. ✅ **Hızlı Setup**: Tek tıkla hazır
5. ✅ **Güvenli**: Gerçek ödeme sadece kendi adresine

### Sunum Akışı
1. "Demo Modu" butonuna tıkla
2. Grup panelinde zengin içeriği göster
3. Borç grafiğini göster (animasyonlar)
4. Karma liderlik tablosunu göster
5. Ödemeler sayfasına git
6. Kendi borcunu Freighter ile öde
7. Transaction hash'i göster
8. Horizon Explorer'da doğrula

## Örnek Harcamalar

### Gün 1 - Varış
- 🏨 Hotel Reservation: 150 XLM (Alice ödedi, 5 kişiye bölündü)
- 🚗 Airport Taxi: 30 XLM (Bob ödedi, 3 kişiye bölündü)
- 🍽️ Welcome Dinner: 80 XLM (Sen ödedin, 5 kişiye bölündü)

### Gün 2 - Aktiviteler
- 🍽️ Breakfast Buffet: 50 XLM (Charlie ödedi)
- 🎯 Museum Tickets: 120 XLM (Diana ödedi)
- 🍽️ Lunch at Cafe: 60 XLM (Alice ödedi)

### Gün 3-5
- Daha fazla yemek, aktivite, ulaşım...
- Toplam 14 harcama
- Karmaşık borç ilişkileri

## Geliştirme Notları

### Mock Data Güncelleme
`src/lib/mockData.ts` dosyasını düzenleyerek:
- Yeni mock kullanıcılar ekleyebilirsin
- Harcama senaryolarını değiştirebilirsin
- Miktarları ayarlayabilirsin

### Yeni Özellikler
- [ ] Mock kullanıcılar için avatar'lar
- [ ] Daha fazla harcama kategorisi
- [ ] Özelleştirilebilir demo senaryoları
- [ ] Export/import demo data

## Sorun Giderme

### "Demo kullanıcılar görünmüyor"
- `localStorage.clear()` yap
- Sayfayı yenile
- Demo butonuna tekrar tıkla

### "Gerçek ödeme çalışmıyor"
- Freighter'ın bağlı olduğundan emin ol
- Test Network seçili olmalı
- Bakiyende XLM olmalı

### "Grafikler yavaş"
- Normal - 14 harcama ve 5 kullanıcı için hesaplama yapılıyor
- Production'da optimize edilebilir

## Lisans

Bu özellik SplitFlow projesinin bir parçasıdır.
Stellar Meridian Hackathon 2025 için geliştirilmiştir.
