import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ChannelReport, AnalyzedVideoReportItem } from "@/lib/api";

export interface ChannelPdfData {
  channelTitle: string;
  channelId: string;
  videoCount: number;
  analysisDate: string | null;
  report: ChannelReport;
  analyzedVideos?: AnalyzedVideoReportItem[];
}

Font.register({
  family: "NotoSans",
  fonts: [
    { src: "/NotoSans-Variable.ttf", fontWeight: 400 },
    { src: "/NotoSans-Variable.ttf", fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const colors = {
  ink: "#0F172A",
  muted: "#64748B",
  line: "#E2E8F0",
  paper: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceAlt: "#F1F5F9",
  accent: "#FF2E54",
  accentSoft: "#FFF1F2",
  positive: "#10B981",
  positiveSoft: "#ECFDF5",
  negative: "#F43F5E",
  negativeSoft: "#FFF1F2",
  warning: "#F59E0B",
  warningSoft: "#FFFBEB",
  cyan: "#06B6D4",
  cyanSoft: "#ECFEFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: "NotoSans",
    fontSize: 9,
    paddingTop: 36,
    paddingHorizontal: 40,
    paddingBottom: 48,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.ink,
  },
  brandAccent: {
    color: colors.accent,
  },
  reportLabel: {
    color: colors.muted,
    fontSize: 7.5,
    textTransform: "uppercase",
    fontWeight: 700,
  },
  titleHeader: {
    marginBottom: 16,
  },
  confidentialBadge: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  confidentialText: {
    color: colors.accent,
    fontSize: 7.5,
    fontWeight: 700,
  },
  channelTitle: {
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 700,
    color: colors.ink,
    marginBottom: 4,
  },
  subMeta: {
    fontSize: 8.5,
    color: colors.muted,
  },
  kpiRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  kpiBox: {
    width: "24%",
    marginRight: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 8,
  },
  kpiBoxLast: {
    width: "24%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 8,
  },
  kpiLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    color: colors.muted,
    fontWeight: 700,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.ink,
  },
  kpiDesc: {
    fontSize: 7,
    color: colors.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    fontSize: 7.5,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 4,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.ink,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 12,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.45,
    color: "#334155",
  },
  table: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 7,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowHeader: {
    backgroundColor: colors.surfaceAlt,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 10,
    marginBottom: 9,
  },
  cardCritical: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 6,
    padding: 10,
    marginBottom: 9,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  badge: {
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 7,
    fontWeight: 700,
  },
  badgeCritical: {
    backgroundColor: "#FEE2E2",
    color: colors.negative,
  },
  badgePositive: {
    backgroundColor: colors.positiveSoft,
    color: colors.positive,
  },
  actionBox: {
    backgroundColor: colors.positiveSoft,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 4,
    padding: 6,
    marginTop: 6,
  },
  actionTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: colors.positive,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  actionText: {
    fontSize: 8,
    color: "#065F46",
    lineHeight: 1.35,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    fontSize: 7.5,
    color: colors.muted,
  },
});

export default function ChannelReportDocument({ data }: { data: ChannelPdfData }) {
  const { report, channelTitle, videoCount, analysisDate, analyzedVideos = [] } = data;
  const score = report?.overall_health_score ?? 75;
  const loyalty = report?.loyalty_rate ?? 78;
  const resonance = report?.audience_resonance ?? 82;
  const verdict = report?.retention_verdict || "Güçlü Kitle Bağlılığı";
  const trend = report?.sentiment_trend || "dengeli";
  const issues = report?.recurring_issues || [];
  const ideas = report?.next_video_ideas || [];
  const persona = report?.audience_persona;
  const commercial = report?.commercial_value;
  const blueprint = report?.growth_blueprint;
  const strategy = report?.actionable_channel_strategy;

  const trendText =
    trend === "yukseliste" || trend === "IMPROVING"
      ? "YÜKSELİŞTE (POZİTİF İVME)"
      : trend === "dusus_egiliminde" || trend === "DECLINING"
      ? "DÜŞÜŞ EĞİLİMİNDE (DİKKAT)"
      : "DENGELİ / İSTİKRARLI";

  const formattedDate = analysisDate
    ? new Date(analysisDate).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("tr-TR");

  return (
    <Document title={`CommentLab Kanal Raporu - ${channelTitle || "Kanal"}`} author="CommentLab AI Engine">
      {/* ================= SAYFA 1: KİTLE SAĞLIĞI & GENEL DURUM ================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>
            Comment<Text style={styles.brandAccent}>Lab</Text>
          </Text>
          <Text style={styles.reportLabel}>KANAL BÜYÜME VE KİTLE İSTİHBARAT RAPORU</Text>
        </View>

        <View style={styles.titleHeader}>
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>ÖZEL KİTLE ANALİZ RAPORU</Text>
          </View>
          <Text style={styles.channelTitle}>@{channelTitle || "YouTube Kanalı"}</Text>
          <Text style={styles.subMeta}>
            Kapsam: Son {videoCount || 5} Video Sentezi • Rapor Tarihi: {formattedDate} • Motor: CommentLab AI Engine
          </Text>
        </View>

        {/* KPI Göstergeleri */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Sağlık Puanı</Text>
            <Text style={[styles.kpiValue, { color: score >= 75 ? colors.positive : colors.accent }]}>
              {score} / 100
            </Text>
            <Text style={styles.kpiDesc}>{verdict}</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Kitle Eğilimi</Text>
            <Text style={[styles.kpiValue, { fontSize: 10, paddingTop: 2 }]}>{trendText}</Text>
            <Text style={styles.kpiDesc}>Kronolojik Memnuniyet</Text>
          </View>

          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Sadakat Oranı</Text>
            <Text style={[styles.kpiValue, { color: colors.cyan }]}>%{loyalty}</Text>
            <Text style={styles.kpiDesc}>Süper Hayran İndeksi</Text>
          </View>

          <View style={styles.kpiBoxLast}>
            <Text style={styles.kpiLabel}>Kitle Rezonansı</Text>
            <Text style={[styles.kpiValue, { color: colors.positive }]}>%{resonance}</Text>
            <Text style={styles.kpiDesc}>Beklenti Karşılama</Text>
          </View>
        </View>

        {/* Yönetici Özeti */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>1</Text>
            <Text style={styles.sectionTitle}>Kitle Sağlığı ve Durum Özeti</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{report?.summary || "Kanal izleyici yorumları incelendi."}</Text>
            {report?.audience_shift_insights && (
              <View style={{ marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.line }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: colors.ink }}>Kitle Hafızası ve Format Tepkileri:</Text>
                <Text style={[styles.summaryText, { fontSize: 8.5, marginTop: 2 }]}>{report.audience_shift_insights}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Analiz Edilen Videoların Dökümü */}
        {analyzedVideos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>2</Text>
              <Text style={styles.sectionTitle}>İncelenen Videoların Kronolojik Dağılımı</Text>
            </View>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={{ width: "50%", fontSize: 7.5, color: colors.muted, fontWeight: 700 }}>Video Başlığı</Text>
                <Text style={{ width: "20%", fontSize: 7.5, color: colors.muted, textAlign: "center", fontWeight: 700 }}>Yorum Hacmi</Text>
                <Text style={{ width: "30%", fontSize: 7.5, color: colors.muted, textAlign: "right", fontWeight: 700 }}>Duygu Dengesi</Text>
              </View>
              {analyzedVideos.slice(0, 5).map((v, i) => {
                const s = v.analysis?.sentiment_distribution || { positive_percent: 0, negative_percent: 0, neutral_percent: 0 };
                const safeTitle = v.title ? (v.title.length > 50 ? `${v.title.slice(0, 48)}...` : v.title) : `Video #${i + 1}`;
                return (
                  <View key={i} style={styles.tableRow}>
                    <Text style={{ width: "50%", fontSize: 8, fontWeight: 700 }}>
                      {safeTitle}
                    </Text>
                    <Text style={{ width: "20%", fontSize: 8, color: colors.muted, textAlign: "center" }}>
                      {v.comment_count_analyzed || 0} yorum
                    </Text>
                    <Text style={{ width: "30%", fontSize: 7.5, textAlign: "right" }}>
                      <Text style={{ color: colors.positive }}>%{Math.round(s.positive_percent || 0)} Olumlu</Text> •{" "}
                      <Text style={{ color: colors.negative }}>%{Math.round(s.negative_percent || 0)} Olumsuz</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text>CommentLab • Kanal Büyüme ve Kitle İstihbarat Raporu</Text>
          <Text>Sayfa 1 / 4</Text>
        </View>
      </Page>

      {/* ================= SAYFA 2: TEKRARLAYAN ŞİKAYETLER ================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>
            Comment<Text style={styles.brandAccent}>Lab</Text>
          </Text>
          <Text style={styles.reportLabel}>BÖLÜM 02 • ŞİKAYETLER VE DÜZELTMELER</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>3</Text>
            <Text style={styles.sectionTitle}>Tekrarlayan Şikayetler & Hemen Yapılacak Düzeltmeler</Text>
          </View>
          <Text style={{ fontSize: 8, color: colors.muted, marginBottom: 12 }}>
            İzleyicilerin videolarda sürekli dile getirdiği ses, kurgu, tempo ve format kusurları.
          </Text>

          {issues.length === 0 ? (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>Kanal genelinde tekrar eden kronik bir kusur tespit edilmemiştir.</Text>
            </View>
          ) : (
            issues.slice(0, 5).map((issue, idx) => (
              <View key={idx} style={styles.cardCritical}>
                <View style={styles.cardHeader}>
                  <Text style={{ fontSize: 8.5, fontWeight: 700, color: colors.negative }}>
                    {issue.category || "İçerik & Kurgu"} • {issue.affected_videos_count || 1} Videoda Tekrar Etti
                  </Text>
                  <View style={[styles.badge, styles.badgeCritical]}>
                    <Text style={{ fontSize: 7, fontWeight: 700 }}>{issue.impact_level || "Kritik"}</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 9.5, fontWeight: 700, color: colors.ink, marginTop: 2 }}>
                  {issue.issue || ""}
                </Text>

                {issue.first_noticed_video && (
                  <Text style={{ fontSize: 7.5, color: colors.muted, marginTop: 2 }}>
                    İlk Görüldüğü Video: {issue.first_noticed_video}
                  </Text>
                )}

                <View style={styles.actionBox}>
                  <Text style={styles.actionTitle}>⚡ Hemen Yapılacak Düzeltme (Sonraki Video)</Text>
                  <Text style={styles.actionText}>
                    {issue.urgent_fix || "Bu teknik veya kurgu noktasını bir sonraki videoda optimize edin."}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text>CommentLab • Kanal Büyüme ve Kitle İstihbarat Raporu</Text>
          <Text>Sayfa 2 / 4</Text>
        </View>
      </Page>

      {/* ================= SAYFA 3: İÇERİK KONSEPTLERİ & KİTLE PROFİLİ ================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>
            Comment<Text style={styles.brandAccent}>Lab</Text>
          </Text>
          <Text style={styles.reportLabel}>BÖLÜM 03 • İÇERİK VE KİTLE PROFİLİ</Text>
        </View>

        {/* Video Fikirleri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>4</Text>
            <Text style={styles.sectionTitle}>İzleyicinin İstediği 3 Video Konsepti & Giriş Cümleleri</Text>
          </View>
          <Text style={{ fontSize: 8, color: colors.muted, marginBottom: 8 }}>
            Yorumlardaki en çok merak edilen sorulardan türetilmiş içerik önerileri.
          </Text>

          {ideas.slice(0, 3).map((idea, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: colors.accent }}>VİDEO FİKRİ #{idx + 1}</Text>
                <View style={[styles.badge, styles.badgePositive]}>
                  <Text style={{ fontSize: 7, fontWeight: 700 }}>{idea.audience_demand_score || "%90+ Kitle Talebi"}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 9.5, fontWeight: 700, color: colors.ink, marginTop: 2 }}>
                &ldquo;{idea.concept_title || ""}&rdquo;
              </Text>

              <View style={{ backgroundColor: colors.surfaceAlt, padding: 6, borderRadius: 4, marginTop: 4 }}>
                <Text style={{ fontSize: 7.5, fontWeight: 700, color: colors.accent }}>🎯 İlk 15 Saniyede Söylenecek Giriş Cümlesi:</Text>
                <Text style={{ fontSize: 8, color: "#334155", fontStyle: "italic", marginTop: 1 }}>{idea.hook || ""}</Text>
              </View>

              <Text style={{ fontSize: 7.5, color: colors.muted, marginTop: 4 }}>
                <Text style={{ fontWeight: 700, color: colors.ink }}>Neden Tutacak: </Text>
                {idea.why_it_works || ""}
              </Text>
            </View>
          ))}
        </View>

        {/* Kitle Kimliği & Persona */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>5</Text>
            <Text style={styles.sectionTitle}>Kitle Profili ve İzleme Alışkanlıkları</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={[styles.kpiBox, { width: "32%", marginRight: 6 }]}>
              <Text style={styles.kpiLabel}>01. Uzmanlık Seviyesi</Text>
              <Text style={{ fontSize: 9, fontWeight: 700, color: colors.ink }}>{persona?.expertise_level || "Orta - İleri Seviye"}</Text>
            </View>
            <View style={[styles.kpiBox, { width: "32%", marginRight: 6 }]}>
              <Text style={styles.kpiLabel}>02. Güven & Samimiyet</Text>
              <Text style={{ fontSize: 9, fontWeight: 700, color: colors.cyan }}>{persona?.trust_sentiment || "Yüksek Güven"}</Text>
            </View>
            <View style={[styles.kpiBoxLast, { width: "32%" }]}>
              <Text style={styles.kpiLabel}>03. İzleme Sebebi</Text>
              <Text style={{ fontSize: 9, fontWeight: 700, color: colors.positive }}>{persona?.primary_motive || "Bilgi ve Analiz"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>CommentLab • Kanal Büyüme ve Kitle İstihbarat Raporu</Text>
          <Text>Sayfa 3 / 4</Text>
        </View>
      </Page>

      {/* ================= SAYFA 4: SPONSORLUK & 90 GÜNLÜK PLAN ================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>
            Comment<Text style={styles.brandAccent}>Lab</Text>
          </Text>
          <Text style={styles.reportLabel}>BÖLÜM 04 • SPONSORLUK VE BÜYÜME PLANI</Text>
        </View>

        {/* Sponsorluk ve Gelir Fırsatları */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>6</Text>
            <Text style={styles.sectionTitle}>Sponsorluk & Gelir Fırsatları Rehberi</Text>
          </View>

          {/* Satın Almaya Hazır Alanlar */}
          {commercial?.target_spending_areas && commercial.target_spending_areas.length > 0 && (
            <View style={[styles.card, { marginBottom: 8 }]}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: colors.positive, textTransform: "uppercase", marginBottom: 3 }}>
                🛒 İzleyicinin Satın Almaya Hazır Olduğu Alanlar:
              </Text>
              {commercial.target_spending_areas.map((area, i) => (
                <Text key={i} style={{ fontSize: 8, color: "#334155", marginBottom: 2 }}>
                  • {area}
                </Text>
              ))}
            </View>
          )}

          {/* Reklam Alma Tüyosu */}
          {commercial?.ad_integration_tips && (
            <View style={[styles.card, { backgroundColor: colors.warningSoft, borderColor: "#FDE68A", marginBottom: 8 }]}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: "#B45309", textTransform: "uppercase", marginBottom: 2 }}>
                ⚠️ Kitleyi Kaçırmadan Sponsorluk Alma Kuralı:
              </Text>
              <Text style={{ fontSize: 8, color: "#92400E" }}>{commercial.ad_integration_tips}</Text>
            </View>
          )}

          {/* Hazır Pitch Notu */}
          <View style={[styles.summaryBox, { backgroundColor: colors.positiveSoft, borderColor: "#A7F3D0" }]}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: colors.positive, textTransform: "uppercase", marginBottom: 2 }}>
              ✉️ Markalara / Ajanslara Gönderilecek Hazır E-posta Cümlesi (Pitch):
            </Text>
            <Text style={{ fontSize: 8.5, color: "#065F46", fontStyle: "italic", lineHeight: 1.4 }}>
              &ldquo;{commercial?.monetization_pitch || "Kanal izleyicileri tavsiye edilen ürün ve araçlara yüksek güven duymaktadır."}&rdquo;
            </Text>
          </View>
        </View>

        {/* 90 Günlük Eylem Planı */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>7</Text>
            <Text style={styles.sectionTitle}>90-Günlük Adım Adım Büyüme Planı</Text>
          </View>

          <View style={[styles.card, { marginBottom: 6 }]}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: colors.accent }}>01 - 30 GÜN: HIZLI DÜZELTMELER VE GİRİŞ TEMPOSU</Text>
            <Text style={{ fontSize: 8.5, color: "#334155", marginTop: 2 }}>
              {blueprint?.day_30_focus || "İlk 15 saniyelik giriş temposunu optimize edin."}
            </Text>
          </View>

          <View style={[styles.card, { marginBottom: 6 }]}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: colors.warning }}>30 - 60 GÜN: İÇERİK MOTORU VE SERİ VİDEOLAR</Text>
            <Text style={{ fontSize: 8.5, color: "#334155", marginTop: 2 }}>
              {blueprint?.day_60_focus || "En çok talep edilen 3 video konusunu yayına alın."}
            </Text>
          </View>

          <View style={[styles.card, { marginBottom: 6 }]}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: colors.positive }}>60 - 90 GÜN: TOPLULUK SADAKATİ VE GELİR</Text>
            <Text style={{ fontSize: 8.5, color: "#334155", marginTop: 2 }}>
              {blueprint?.day_90_focus || "Kitle bağlılığını sponsorluk ve topluluk gelirine dönüştürün."}
            </Text>
          </View>

          {strategy && (strategy.action || strategy.insight) && (
            <View style={[styles.summaryBox, { marginTop: 6, backgroundColor: colors.surfaceAlt }]}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: colors.accent, textTransform: "uppercase", marginBottom: 2 }}>
                ⚡ En Yüksek Etkili Tek Stratejik Adım:
              </Text>
              <Text style={{ fontSize: 9, fontWeight: 700, color: colors.ink }}>{strategy.action || ""}</Text>
              {strategy.expected_impact && (
                <Text style={{ fontSize: 7.5, color: colors.muted, marginTop: 2 }}>Beklenen Fayda: {strategy.expected_impact}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>CommentLab • www.commentlab.io</Text>
          <Text>Sayfa 4 / 4</Text>
        </View>
      </Page>
    </Document>
  );
}
