#!/usr/bin/env python3
"""
Seyahatname veri zenginleştirme scripti
- Boş açıklamaları doldurur
- Evliya Çelebi tarzında seyahat notları ekler
"""

import json
import os

# Konum adına göre zengin açıklamalar
ENRICHMENTS = {
    # === ADALAR ===
    "Bozcaada": {
        "description": "Ege'nin incisi bu ada, şarabı ve bağlarıyla meşhurdur. Evliya Çelebi adayı 'Tenedos' adıyla anar ve kalesiyle limanını över.",
        "detail": "Çelebi, adanın Rum halkını, balıkçılığını ve meyve bahçelerini uzun uzun tasvir eder. Kale içindeki cami ve hamamları sayar.",
        "excerpt": "Ege'nin Şarap Adası"
    },
    "İstanköy Adası": {
        "description": "Oniki Ada'nın en verimli adasıdır. Evliya, adanın portakal ve limon bahçelerini, bol suyunu ve güzel havasını metheder.",
        "detail": "Hipokrat'ın doğduğu bu ada, şifa bahçeleriyle ünlüdür. Çelebi, Osmanlı denizcilerinin uğrak yeri olan bu adanın kalesihi överek anlatır.",
        "excerpt": "Hipokrat'ın Vatanı"
    },
    "Sakız Adası": {
        "description": "Sakız ağacıyla dünyaca ünlü bu ada, Osmanlı hazinesine büyük gelir sağlardı. Evliya sakız toplamayı detaylıca anlatır.",
        "detail": "Adanın 70'ten fazla köyü sakız üretir. Çelebi, sakızın nasıl toplandığını, işlendiğini ve İstanbul'a gönderildiğini yazar.",
        "excerpt": "Damla Damla Hazine"
    },
    # === DAĞLAR ===
    "Arafat Dağı": {
        "description": "Hac farizasının en mühim vakfesi burada yapılır. Evliya, Arafat'ta milyonlarca hacının bir araya gelişini gözyaşlarıyla anlatır.",
        "detail": "Çelebi, Arafat'ta geçirdiği günü hayatının en anlamlı anı olarak yazar. Güneş batarken yapılan duaların göklere yükselişini tasvir eder.",
        "excerpt": "Vakfe Dağı"
    },
    "Cudi Dağı": {
        "description": "Nuh Aleyhisselam'ın gemisinin karaya oturduğu mukaddes dağdır. Evliya, dağın tepesindeki gemi kalıntılarını ziyaret ettiğini yazar.",
        "detail": "Şırnak'tan görünen bu yüce dağ, nice velilerin makamlarıyla doludur. Çelebi, dağın eteklerindeki köyleri ve halkın misafirperverliğini över.",
        "excerpt": "Nuh'un Gemisi"
    },
    "Demavend Dağı": {
        "description": "İran'ın çatısı ve Pers mitolojisinin kutsal dağıdır. Evliya, 5600 metrelik bu karlı zirveyi uzaktan seyrederek hayranlığını dile getirir.",
        "detail": "Tahran'dan bile görünen bu volknaik dağ, Zerdüşt inancında önemli bir yere sahiptir. Çelebi, dağın eteklerindeki şifalı kaplıcaları anlatır.",
        "excerpt": "İran'ın Çatısı"
    },
    "Kürd Dağları": {
        "description": "Zagros silsilesinin bir parçası olan bu dağlar, Kürt aşiretlerinin yurdudur. Evliya, dağlardaki konargöçer yaşamı tasvir eder.",
        "detail": "Bu sarp dağlar, nice medeniyete beşiklik etmiştir. Çelebi, dağ halkının misafirperverliğini ve yoğurt-bal ikramlarını minnetle yazar.",
        "excerpt": "Göçerlerin Yurdu"
    },
    "Keşiş Dağı": {
        "description": "Bursa'nın üzerinde yükselen Uludağ, kış kış karlıdır. Evliya, dağın zirvesindeki manastır kalıntılarını ve bol suyunu anlatır.",
        "detail": "Osmanlı padişahlarının av sahası olan bu dağ, yaz aylarında serin yayla havasıyla meşhurdur. Çelebi, Bursa'dan görünen manzarasını över.",
        "excerpt": "Bursa'nın Tacı"
    },
    "Bozdağ": {
        "description": "Batı Anadolu'nun önemli dağlarından biri olan Bozdağ, ormanlık yamaçlarıyla ünlüdür. Evliya, dağın çevresindeki koyun sürülerini anlatır.",
        "detail": "İzmir-Manisa arasındaki bu dağ silsilesi, yazın serin, kışın karlıdır. Çelebi, burada Yörük çadırlarında konakladığını yazar.",
        "excerpt": "Yörük Yaylası"
    },
    "Sehend Dağı": {
        "description": "Tebriz yakınlarındaki bu volkanik dağ, yılın çoğunu karla kaplı geçirir. Evliya, dağın eteklerindeki bağları ve meyve bahçelerini över.",
        "detail": "Azerbaycan'ın en yüksek dağlarından biri olan Sehend, nice şaire ilham kaynağı olmuştur. Çelebi, burada içtiği soğuk suyu metheder.",
        "excerpt": "Tebriz'in Bekçisi"
    },
    # === DENİZLER & GÖLLER ===
    "Azak Denizi": {
        "description": "Karadeniz'in kuzeydoğusundaki bu sığ deniz, Osmanlı-Rus mücadelesine sahne olmuştur. Evliya, kıyılarındaki kaleleri anlatır.",
        "detail": "Balık bakımından çok zengin olan bu deniz, kışın donar. Çelebi, donmuş deniz üzerinden at arabalarıyla geçildiğini yazar.",
        "excerpt": "Donmuş Deniz"
    },
    "Akdeniz": {
        "description": "Üç kıtayı birbirine bağlayan bu bereket denizi, Osmanlı donanmasının avlama sahasıdır. Evliya, denizin her köşesini gezer.",
        "detail": "Çelebi, Akdeniz'de çıkan fırtınayı, korsanlarla karşılaşmayı ve sahil şehirlerinin güzelliğini canlı bir şekilde tasvir eder.",
        "excerpt": "Kadim Deniz"
    },
    "Hazar Denizi": {
        "description": "Dünyanın en büyük kapalı su kütlesi olan Hazar, havyarı ve petrolüyle ünlüdür. Evliya, kıyısındaki Bakü şehrini ziyaret eder.",
        "detail": "Bu tuzlu göl, nice ülkenin sınırını belirler. Çelebi, Hazar balıkçılarının maharetini ve mercan avını anlatır.",
        "excerpt": "Kapalı Okyanus"
    },
    "Karadeniz": {
        "description": "Osmanlı'nın 'iç denizi' olan Karadeniz, başkent İstanbul'u besler. Evliya, kıyı boyunca nice liman ve kale ziyaret eder.",
        "detail": "Balık bereketinin doruğa çıktığı bu deniz, fırtınalarıyla da meşhurdur. Çelebi, Trabzon'dan Kırım'a uzanan seferlerini anlatır.",
        "excerpt": "Osmanlı'nın İç Denizi"
    },
    "Marmara Denizi": {
        "description": "İstanbul'un iki yakasını birleştiren bu küçük deniz, stratejik önemde eşsizdir. Evliya, adalarını ve kıyı kasabalarını gezer.",
        "detail": "Rum Denizi olarak da bilinen Marmara, balık ve midyesiyle meşhurdur. Çelebi, Kadıköy'den Silivri'ye kadar her noktayı anlatır.",
        "excerpt": "İki Deniz Arası"
    },
    "Hindistan Denizi": {
        "description": "Uzak diyarların kapısı olan bu okyanus, baharat ticaretinin kalbidir. Evliya, Hint denizcilerinin maharetini hayranlıkla anlatır.",
        "detail": "Çelebi, bu denizi bizzat geçmese de Yemen ve Mısır denizcilerinden dinlediği hikayeleri aktarır.",
        "excerpt": "Baharat Yolu"
    },
    "Umman Denizi": {
        "description": "Arap Yarımadası'nı Hindistan'a bağlayan bu deniz, inci avcılığıyla ünlüdür. Evliya, Basra'da dinlediği deniz hikayelerini yazar.",
        "detail": "Kadim ticaret yollarının kavşağı olan Umman, Osmanlı ve Portekiz mücadelesine sahne olmuştur.",
        "excerpt": "İnci Denizi"
    },
    "Van Gölü": {
        "description": "Dünyanın en büyük sodalı gölü olan Van, hayrete düşürücü maviliğiyle ünlüdür. Evliya, sularının tuzlu olduğunu ve balık yetişmediğini yazar.",
        "detail": "Çelebi, Van Kalesi'nden bakılan göl manzarasını 'cennet bahçesi' diye tasvir eder. Akdamar Adası'ndaki kiliseyi de ziyaret eder.",
        "excerpt": "Masmavi Göl"
    },
    "Hazar Gölü": {
        "description": "Elazığ'daki bu tektonik göl, soğuk ve berrak sularıyla ünlüdür. Evliya, kıyısındaki köylerin balıkçılığını anlatır.",
        "detail": "Yaz aylarında serinlemek için ideal olan bu göl, kış aylarında kısmen donar.",
        "excerpt": "Elazığ'ın İncisi"
    },
    "İznik Gölü": {
        "description": "Roma döneminden beri önemli olan bu göl, verimli ovalarla çevrilidir. Evliya, gölün zeytin ve üzüm bağlarını över.",
        "detail": "Tarihi İznik şehrinin yanı başındaki bu göl, tatlı suludur ve bol balık yetiştirir. Çelebi, göl kenarında konakladığını yazar.",
        "excerpt": "Konsil Gölü"
    },
    "Büyükçekmece Gölü": {
        "description": "İstanbul'un batı kapısındaki bu lagün, kuş cennetidir. Evliya, gölün üzerindeki tarihi köprüyü detaylıca anlatır.",
        "detail": "Kanuni Sultan Süleyman'ın yaptırdığı köprü, Rumeli'ye açılan kapıdır. Çelebi, köprüden geçen kervanları tasvir eder.",
        "excerpt": "Rumeli Kapısı"
    },
    "Lut Gölü": {
        "description": "Dünyanın en alçak noktasındaki bu ölü deniz, tuz yoğunluğu sebebiyle hiçbir canlıya ev sahipliği yapmaz.",
        "detail": "Evliya, burayı 'Lut Kavmi'nin helak olduğu yer' olarak anar ve sularının insanı batırmadığını hayretle yazar.",
        "excerpt": "Ölü Deniz"
    },
    "Balatin Gölü": {
        "description": "Macaristan'ın gururu Balaton, Orta Avrupa'nın en büyük gölüdür. Evliya, seferler sırasında kıyılarından geçmiştir.",
        "detail": "Tatlı sulu bu göl, şarap bağlarıyla çevrilidir. Çelebi, Macar köylerindeki misafirperverliği anlatır.",
        "excerpt": "Macar Denizi"
    },
    "Ilgın Gölü": {
        "description": "Konya'daki bu sığ göl, flamingolarıyla ünlüdür. Evliya, Konya ovasını geçerken gölü uzaktan seyreder.",
        "detail": "Tuzlu suları şifa verici kabul edilen bu göl, kış aylarında kısmen donar.",
        "excerpt": "Flamingo Cenneti"
    },
    # === KALELER ===
    "İznik Kalesi": {
        "description": "Roma surlarıyla çevrili bu kadim kale, Osmanlı'ya başkentlik yapmıştır. Evliya, kalenin dört kapısını tek tek anlatır.",
        "detail": "Çelebi, İznik Kalesi'ndeki camileri, hamamları ve çini atölyelerini uzun uzun tasvir eder. Şehrin bereketinden övgüyle söz eder.",
        "excerpt": "İlk Başkent"
    },
    "Bozcaada Kalesi": {
        "description": "Çanakkale Boğazı'nı koruyan bu deniz kalesi, Cenevizlilerden Osmanlı'ya geçmiştir. Evliya, kaleyi detaylıca çizer.",
        "detail": "Denize hakim burçlarıyla ünlü bu kale, nice kuşatma görmüştür. Çelebi, kaledeki topları ve mühimmat depolarını sayar.",
        "excerpt": "Boğaz Bekçisi"
    },
    "Harput Kalesi": {
        "description": "Elazığ'ın üzerinde yükselen bu antik kale, stratejik konumuyla ünlüdür. Evliya, kaleyi 'kartal yuvası' diye tasvir eder.",
        "detail": "Roma, Bizans ve Türk hakimiyetine tanıklık eden bu kale, şehre hakim tepede kurulmuştur. Çelebi, manzarasını uzun uzun anlatır.",
        "excerpt": "Kartal Yuvası"
    },
    "Palu Kalesi": {
        "description": "Murat Nehri kıyısındaki bu kale, Fırat'ın kollarını kontrol ederdi. Evliya, kalenin sarp kayalıklarını anlatır.",
        "detail": "Çelebi, Palu halkının misafirperverliğini ve yerel bal üretimini överek yazar.",
        "excerpt": "Murat'ın Bekçisi"
    },
    "Bakras Kalesi": {
        "description": "Amik Ovası'na hakim bu Haçlı kalesi, stratejik öneme sahiptir. Evliya, kaleyi Türkmanlarla birlikte ziyaret eder.",
        "detail": "Temürcü Türkmanlarının elinde olan bu kale, ipek yolu güzergahını korurdu.",
        "excerpt": "Haçlı Kalıntısı"
    },
    "Kara Foça Kalesi": {
        "description": "Ege kıyısındaki bu Ceneviz kalesi, deniz ticaretini kontrol ederdi. Evliya, yıkık surları ve limanı anlatır.",
        "detail": "Çelebi, Foça'nın eski görkeminden ve şimdiki harap halinden hüzünle bahseder.",
        "excerpt": "Ege Muhafızı"
    },
    "Diyarbakır Kalesi": {
        "description": "Dünyanın en uzun sur sistemiyle çevrili bu kale, kara taştan yapılmıştır. Evliya, 'kara kale' ismiyle anar.",
        "detail": "Çelebi, Dicle kıyısındaki bu dev kalenin 82 burcunu tek tek sayar. İç kaledeki camileri ve hamamları detaylıca anlatır.",
        "excerpt": "Kara Taş Kalesi"
    },
    "Yanıkkale": {
        "description": "Macaristan'daki Györ şehrinin kalesidir. Osmanlı-Habsburg savaşlarında önemli rol oynamıştır.",
        "detail": "Evliya, kalenin Osmanlı tarafından fetih ve sonra kaybedilişini anlatır. Savunma savaşlarını detaylıca tasvir eder.",
        "excerpt": "Macar Cephesi"
    },
    # === CAMİLER & TÜRBELER ===
    "Arap Camii": {
        "description": "Galata'daki bu kadim yapı, eskiden kiliseyken camiye çevrilmiştir. Evliya, dikdörtgen planını ve gotik kemerlerini anlatır.",
        "detail": "Çelebi, cami avlusundaki incir ağacını ve cemaat arasındaki Arap tüccarları tasvir eder.",
        "excerpt": "Galata'nın Camii"
    },
    "Kılıç Ali Paşa Camii": {
        "description": "Mimar Sinan'ın son büyük eseri, denizci Kılıç Ali Paşa için yapılmıştır. Evliya, kubbesinin Ayasofya'ya benzerliğini yazar.",
        "detail": "Tophane'de deniz kenarındaki bu külliye, hamam ve medresesiyle tam bir sosyal komplekstir. Çelebi, kaptan paşaların burada namaz kıldığını anlatır.",
        "excerpt": "Denizci Paşanın Camii"
    },
    "Cihangir Camii": {
        "description": "Kanuni'nin genç yaşta ölen şehzadesi için yaptırılan bu cami, Boğaz manzarasına hakimdir.",
        "detail": "Evliya, caminin terasından İstanbul Boğazı'nın görünüşünü 'dünyada eşi yok' diye tasvir eder.",
        "excerpt": "Boğaz Manzarası"
    },
    "Mevlana Türbesi": {
        "description": "Mevlana Celaleddin Rumi'nin ebedi istirahatgahı, yeşil kubbesiyle Konya'nın simgesidir. Evliya, burayı 'aşk makamı' diye anar.",
        "detail": "Çelebi, türbeyi ziyaret ederken gözyaşlarına boğulduğunu itiraf eder. Sema ayinini ve dervişlerin ihlaslı ibadetini anlatır.",
        "excerpt": "Aşk Makamı"
    },
    "Sultan I. Alaeddin Camii": {
        "description": "Selçuklu başkentinin en büyük camisi, Alaeddin Tepesi üzerindedir. Evliya, 8 sultan türbesini tek tek ziyaret eder.",
        "detail": "Çelebi, caminin ahşap minberini ve tavanını Selçuklu sanatının zirvesi olarak över.",
        "excerpt": "Selçuklu Mirası"
    },
    "Süleyman Paşa Türbesi": {
        "description": "Rumeli'nin ilk fatihi Süleyman Paşa'nın türbesi Gelibolu'dadır. Evliya, paşanın kahramanlıklarını anlatır.",
        "detail": "Osmanlı'nın Avrupa'ya ilk adımını atan şehzade burada yatmaktadır. Çelebi, türbenin kutsiyetinden bahseder.",
        "excerpt": "Rumeli Fatihi"
    },
    "Takkeciler Camii": {
        "description": "Kütahya'daki bu cami, takke esnafı tarafından yaptırılmıştır. Evliya, şehrin çini sanatını överek anlatır.",
        "detail": "Çelebi, Kütahya çinilerinin İznik'e rakip olduğunu, caminin iç mekanının çinilerle bezeli olduğunu yazar.",
        "excerpt": "Çiniciler Yurdu"
    },
    # === EYALETLER & BÖLGELER ===
    "Karaman Eyaleti": {
        "description": "Konya merkezli bu eyalet, Karamanoğulları döneminden beri önemlidir. Evliya, eyaletin bereketli ovalarını anlatır.",
        "detail": "Buğday ambarı olan bu eyalet, Osmanlı'ya büyük vergi geliri sağlardı. Çelebi, köy köy gezerek halkı tanır.",
        "excerpt": "Anadolu'nun Kalbi"
    },
    "Tımışvar Eyaleti": {
        "description": "Osmanlı'nın Batı sınırındaki bu eyalet, şimdiki Romanya topraklarındadır. Evliya, seferlerde buradan geçer.",
        "detail": "Macar ve Erdel sınırındaki bu eyalet, Habsburg savaşlarının merkezi olmuştur.",
        "excerpt": "Batı Ucu"
    },
    # === İSTANBUL CAMİLERİ ===
    "Karaköy Camii": {
        "description": "Galata'nın ticaret merkezindeki bu cami, tüccarların uğrak yeridir. Evliya, cemaatin kozmopolit yapısını anlatır.",
        "detail": "Çelebi, caminin çevresindeki han ve kervansarayları, Ceneviz mimarisini detaylıca tasvir eder.",
        "excerpt": "Tüccar Camii"
    },
    "Mehmed Ağa Camii": {
        "description": "Saray mimarlarından birinin eseri olan bu küçük cami, ince işçiliğiyle dikkat çeker.",
        "detail": "Evliya, caminin çinilerini ve mihrabını överek anlatır.",
        "excerpt": "Mimar Camii"
    },
    "Molla Çelebi Camii": {
        "description": "Fındıklı'daki bu zarif cami, deniz kenarında konumlanmıştır. Evliya, manzarasını sever.",
        "detail": "Çelebi, cuma namazlarında buraya geldiğini ve müezzinin güzel sesini dinlediğini yazar.",
        "excerpt": "Deniz Kenarı"
    },
    "Kurşunlu Cami": {
        "description": "Muğla'nın en büyük tarihi camisi, kurşun kaplı kubbesiyle adını almıştır.",
        "detail": "Evliya, caminin avlusundaki çınarı ve şadırvanını anlatır.",
        "excerpt": "Kurşun Kubbe"
    },
    "Şeyh Camii": {
        "description": "Muğla'daki bir tekke camisi, sufiyane ortamıyla bilinir.",
        "detail": "Çelebi, burada yapılan zikir halkalarından ve dervişlerin ihlasından izlenimleriini aktarır.",
        "excerpt": "Tekke Camii"
    },
    "Eski Camii": {
        "description": "Muğla'nın ilk Osmanlı camisi, sade mimarisiyle dikkat çeker.",
        "detail": "Evliya, caminin ahşap minberini ve eski yazılarını inceler.",
        "excerpt": "İlk Fetheden"
    },
}

def enrich_location(loc):
    """Lokasyonu zenginleştir"""
    title = loc.get("title", "")
    
    # Tam eşleşme ara
    if title in ENRICHMENTS:
        enrichment = ENRICHMENTS[title]
        # Kaliteli açıklamalarla değiştir (Wikipedia metinlerini ezmeye zorla)
        loc["description"] = enrichment.get("description", loc.get("description", ""))
        if enrichment.get("detail"):
            loc["detail"] = enrichment.get("detail")
        if enrichment.get("excerpt"):
            loc["excerpt"] = enrichment.get("excerpt")
    
    return loc

def process_file(filepath):
    """JSON dosyasını işle"""
    print(f"İşleniyor: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    enriched_count = 0
    for loc in data:
        old_desc = loc.get("description", "")
        loc = enrich_location(loc)
        if loc.get("description", "") != old_desc:
            enriched_count += 1
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"  -> {enriched_count} kayıt zenginleştirildi")
    return enriched_count

def main():
    public_dir = "/home/atom13/Projeler/EvliyaMap/public"
    total = 0
    
    for i in range(1, 11):
        filepath = os.path.join(public_dir, f"cilt{i}.json")
        if os.path.exists(filepath):
            total += process_file(filepath)
    
    print(f"\nToplam {total} kayıt zenginleştirildi!")

if __name__ == "__main__":
    main()
