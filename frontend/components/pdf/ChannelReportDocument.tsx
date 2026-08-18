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

Font.registerHyphenationCallback((word: string) => [word]);

const C = {
  ink: "#17202A",
  muted: "#657080",
  line: "#E4E7EB",
  paper: "#FFFFFF",
  surface: "#F6F7F8",
  surfaceAlt: "#EEF0F3",
  accent: "#D93B3B",
  accentSoft: "#FFF0F0",
  positive: "#4D8B61",
  positiveSoft: "#EDF6F0",
  negative: "#C55454",
  negativeSoft: "#FBEFEF",
  warning: "#C48A1A",
  warningSoft: "#FFF8E8",
  cyan: "#2E8B9A",
  cyanSoft: "#E8F6F8",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    color: C.ink,
    fontFamily: "NotoSans",
    fontSize: 9,
    paddingTop: 38,
    paddingHorizontal: 42,
    paddingBottom: 54,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingBottom: 14,
    marginBottom: 22,
  },
  brand: { fontSize: 18, fontWeight: 700, color: C.ink },
  brandAccent: { color: C.accent },
  label: {
    color: C.muted,
    fontSize: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
  },
  h1: { fontSize: 22, lineHeight: 1.2, fontWeight: 700, marginBottom: 5 },
  sub: { color: C.muted, fontSize: 9, marginBottom: 18 },
  row: { flexDirection: "row" as const, marginBottom: 20 },
  kpi: {
    width: "24%",
    marginRight: 6,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 5,
    padding: 9,
  },
  kpiLast: {
    width: "24%",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 5,
    padding: 9,
  },
  kpiLabel: {
    color: C.muted,
    fontSize: 7,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  kpiVal: { fontSize: 14, fontWeight: 700, color: C.ink },
  kpiSub: { fontSize: 7, color: C.muted, marginTop: 2 },
  sec: { marginBottom: 18 },
  secHead: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 10,
  },
  secNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.accentSoft,
    color: C.accent,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center" as const,
    paddingTop: 5,
    marginRight: 7,
  },
  secTitle: { fontSize: 13, fontWeight: 700 },
  box: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 6,
    padding: 12,
  },
  bodyText: { fontSize: 9.5, lineHeight: 1.6, color: "#334155" },
  tRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center" as const,
  },
  tHead: { backgroundColor: C.surfaceAlt },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  cardCrit: {
    backgroundColor: C.negativeSoft,
    borderWidth: 1,
    borderColor: "#F5C6C6",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  cardHead: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  badge: {
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 5,
    fontSize: 7,
    fontWeight: 700,
  },
  fixBox: {
    backgroundColor: C.positiveSoft,
    borderWidth: 1,
    borderColor: "#B5DFC5",
    borderRadius: 4,
    padding: 6,
    marginTop: 6,
  },
  footer: {
    position: "absolute" as const,
    bottom: 24,
    left: 42,
    right: 42,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
    fontSize: 7.5,
    color: C.muted,
  },
});

function safe(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

export default function ChannelReportDocument({
  data,
}: {
  data: ChannelPdfData;
}) {
  const { report, channelTitle, videoCount, analysisDate, analyzedVideos } =
    data || {};
  const rpt = report || ({} as ChannelReport);
  const vids = analyzedVideos || [];

  const score = rpt.overall_health_score ?? 75;
  const loyalty = rpt.loyalty_rate ?? 78;
  const resonance = rpt.audience_resonance ?? 82;
  const verdict = safe(rpt.retention_verdict, "Kitle Durumu");
  const trend = safe(rpt.sentiment_trend, "dengeli");
  const issues = rpt.recurring_issues || [];
  const ideas = rpt.next_video_ideas || [];
  const persona = rpt.audience_persona;
  const commercial = rpt.commercial_value;
  const blueprint = rpt.growth_blueprint;
  const strategy = rpt.actionable_channel_strategy;

  const trendLabel =
    trend.includes("yuksel") || trend === "IMPROVING"
      ? "YUKSELISTE"
      : trend.includes("dusus") || trend === "DECLINING"
      ? "DUSUS EGILIMINDE"
      : "DENGELI / ISTIKRARLI";

  let fmtDate = "";
  try {
    fmtDate = analysisDate
      ? new Date(analysisDate).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("tr-TR");
  } catch {
    fmtDate = "Bugun";
  }

  const spendingAreas: string[] =
    commercial?.target_spending_areas && commercial.target_spending_areas.length > 0
      ? commercial.target_spending_areas
      : [];

  const adTips = safe(
    commercial?.ad_integration_tips,
    "Kitlenizin samimiyet beklentisine uygun dogal entegrasyonlar tercih edin."
  );

  const pitch = safe(
    commercial?.monetization_pitch,
    "Kanal izleyicileri tavsiye edilen urun ve araclara yuksek guven duymaktadir."
  );

  return (
    <Document
      title={"CommentLab Kanal Raporu - " + safe(channelTitle, "Kanal")}
      author="CommentLab"
    >
      {/* ========= SAYFA 1 ========= */}
      <Page size="A4" style={s.page}>
        <View style={s.brandRow}>
          <Text style={s.brand}>
            Comment<Text style={s.brandAccent}>Lab</Text>
          </Text>
          <Text style={s.label}>KANAL BUYUME VE KITLE ISTIHBARAT RAPORU</Text>
        </View>

        <Text style={s.h1}>
          {"@" + safe(channelTitle, "YouTube Kanali")}
        </Text>
        <Text style={s.sub}>
          {"Kapsam: Son " +
            String(videoCount || 5) +
            " Video Sentezi  |  Rapor Tarihi: " +
            fmtDate +
            "  |  Motor: CommentLab AI Engine"}
        </Text>

        {/* KPI */}
        <View style={s.row}>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Saglik Puani</Text>
            <Text
              style={[
                s.kpiVal,
                { color: score >= 75 ? C.positive : C.accent },
              ]}
            >
              {String(score) + " / 100"}
            </Text>
            <Text style={s.kpiSub}>{verdict}</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Kitle Egilimi</Text>
            <Text style={[s.kpiVal, { fontSize: 10 }]}>{trendLabel}</Text>
            <Text style={s.kpiSub}>Kronolojik Memnuniyet</Text>
          </View>
          <View style={s.kpi}>
            <Text style={s.kpiLabel}>Sadakat Orani</Text>
            <Text style={[s.kpiVal, { color: C.cyan }]}>
              {"%" + String(loyalty)}
            </Text>
            <Text style={s.kpiSub}>Super Hayran Indeksi</Text>
          </View>
          <View style={s.kpiLast}>
            <Text style={s.kpiLabel}>Kitle Rezonansi</Text>
            <Text style={[s.kpiVal, { color: C.positive }]}>
              {"%" + String(resonance)}
            </Text>
            <Text style={s.kpiSub}>Beklenti Karsilama</Text>
          </View>
        </View>

        {/* Ozet */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secNum}>1</Text>
            <Text style={s.secTitle}>
              Kitle Sagligi ve Durum Ozeti
            </Text>
          </View>
          <View style={s.box}>
            <Text style={s.bodyText}>
              {safe(rpt.summary, "Kanal izleyici yorumlari incelendi.")}
            </Text>
          </View>
        </View>

        {/* Video Tablosu */}
        {vids.length > 0 && (
          <View style={s.sec}>
            <View style={s.secHead}>
              <Text style={s.secNum}>2</Text>
              <Text style={s.secTitle}>
                Incelenen Videolarin Kronolojik Dagilimi
              </Text>
            </View>
            <View
              style={{
                borderWidth: 1,
                borderColor: C.line,
                borderRadius: 5,
              }}
            >
              <View style={[s.tRow, s.tHead]}>
                <Text
                  style={{
                    width: "50%",
                    fontSize: 7.5,
                    color: C.muted,
                    fontWeight: 700,
                  }}
                >
                  Video Basligi
                </Text>
                <Text
                  style={{
                    width: "25%",
                    fontSize: 7.5,
                    color: C.muted,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  Yorum
                </Text>
                <Text
                  style={{
                    width: "25%",
                    fontSize: 7.5,
                    color: C.muted,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  Olumlu / Olumsuz
                </Text>
              </View>
              {vids.slice(0, 5).map((v, i) => {
                const sd = v.analysis?.sentiment_distribution;
                const posP = Math.round(sd?.positive_percent || 0);
                const negP = Math.round(sd?.negative_percent || 0);
                const tt = v.title
                  ? v.title.length > 45
                    ? v.title.slice(0, 43) + "..."
                    : v.title
                  : "Video #" + String(i + 1);
                return (
                  <View key={String(i)} style={s.tRow}>
                    <Text
                      style={{ width: "50%", fontSize: 8, fontWeight: 700 }}
                    >
                      {tt}
                    </Text>
                    <Text
                      style={{
                        width: "25%",
                        fontSize: 8,
                        color: C.muted,
                        textAlign: "center",
                      }}
                    >
                      {String(v.comment_count_analyzed || 0)}
                    </Text>
                    <Text
                      style={{
                        width: "25%",
                        fontSize: 8,
                        textAlign: "right",
                      }}
                    >
                      {"%" + String(posP) + " / %" + String(negP)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={s.footer}>
          <Text>CommentLab - Kanal Raporu</Text>
          <Text>Sayfa 1 / 4</Text>
        </View>
      </Page>

      {/* ========= SAYFA 2: SIKAYETLER ========= */}
      <Page size="A4" style={s.page}>
        <View style={s.brandRow}>
          <Text style={s.brand}>
            Comment<Text style={s.brandAccent}>Lab</Text>
          </Text>
          <Text style={s.label}>BOLUM 02 - SIKAYETLER VE DUZELTMELER</Text>
        </View>

        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secNum}>3</Text>
            <Text style={s.secTitle}>
              Tekrarlayan Sikayetler ve Hemen Yapilacak Duzeltmeler
            </Text>
          </View>

          {issues.length === 0 ? (
            <View style={s.box}>
              <Text style={s.bodyText}>
                Kanal genelinde tekrar eden kronik bir kusur tespit edilmemistir.
              </Text>
            </View>
          ) : (
            issues.slice(0, 5).map((issue, idx) => (
              <View key={String(idx)} style={s.cardCrit}>
                <View style={s.cardHead}>
                  <Text
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: C.negative,
                    }}
                  >
                    {safe(issue.category, "Icerik ve Kurgu") +
                      " - " +
                      String(issue.affected_videos_count || 1) +
                      " Videoda"}
                  </Text>
                  <View
                    style={[
                      s.badge,
                      {
                        backgroundColor: C.negativeSoft,
                        color: C.negative,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 7, fontWeight: 700 }}>
                      {safe(issue.impact_level, "Yuksek")}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: C.ink,
                    marginTop: 3,
                  }}
                >
                  {safe(issue.issue)}
                </Text>

                {issue.first_noticed_video ? (
                  <Text
                    style={{
                      fontSize: 7.5,
                      color: C.muted,
                      marginTop: 2,
                    }}
                  >
                    {"Ilk Goruldugu Video: " + issue.first_noticed_video}
                  </Text>
                ) : null}

                <View style={s.fixBox}>
                  <Text
                    style={{
                      fontSize: 7.5,
                      fontWeight: 700,
                      color: C.positive,
                      marginBottom: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Hemen Yapilacak Duzeltme
                  </Text>
                  <Text style={{ fontSize: 8, color: "#2D5A3C", lineHeight: 1.35 }}>
                    {safe(
                      issue.urgent_fix,
                      "Bu noktayi bir sonraki videoda optimize edin."
                    )}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={s.footer}>
          <Text>CommentLab - Kanal Raporu</Text>
          <Text>Sayfa 2 / 4</Text>
        </View>
      </Page>

      {/* ========= SAYFA 3: VIDEO FIKIRLERI & KITLE ========= */}
      <Page size="A4" style={s.page}>
        <View style={s.brandRow}>
          <Text style={s.brand}>
            Comment<Text style={s.brandAccent}>Lab</Text>
          </Text>
          <Text style={s.label}>BOLUM 03 - ICERIK VE KITLE PROFILI</Text>
        </View>

        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secNum}>4</Text>
            <Text style={s.secTitle}>
              Izleyicinin Istedigi 3 Video Konsepti
            </Text>
          </View>

          {ideas.slice(0, 3).map((idea, idx) => (
            <View key={String(idx)} style={s.card}>
              <View style={s.cardHead}>
                <Text
                  style={{ fontSize: 8, fontWeight: 700, color: C.accent }}
                >
                  {"VIDEO FIKRI #" + String(idx + 1)}
                </Text>
                <View
                  style={[
                    s.badge,
                    { backgroundColor: C.positiveSoft, color: C.positive },
                  ]}
                >
                  <Text style={{ fontSize: 7, fontWeight: 700 }}>
                    {safe(idea.audience_demand_score, "%90+ Kitle Talebi")}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: C.ink,
                  marginTop: 3,
                }}
              >
                {safe(idea.concept_title)}
              </Text>

              <View
                style={{
                  backgroundColor: C.surfaceAlt,
                  padding: 6,
                  borderRadius: 4,
                  marginTop: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 7.5,
                    fontWeight: 700,
                    color: C.accent,
                    marginBottom: 2,
                  }}
                >
                  Ilk 15 Saniyede Soylenecek Giris Cumlesi:
                </Text>
                <Text style={{ fontSize: 8, color: "#334155" }}>
                  {safe(idea.hook)}
                </Text>
              </View>

              <Text
                style={{ fontSize: 7.5, color: C.muted, marginTop: 4 }}
              >
                {"Neden Tutacak: " + safe(idea.why_it_works)}
              </Text>
            </View>
          ))}
        </View>

        {/* Kitle Profili */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secNum}>5</Text>
            <Text style={s.secTitle}>
              Kitle Profili ve Izleme Aliskanliklari
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={[s.kpi, { width: "32%", marginRight: 6 }]}>
              <Text style={s.kpiLabel}>01. Uzmanlik Seviyesi</Text>
              <Text style={{ fontSize: 9, fontWeight: 700, color: C.ink }}>
                {safe(persona?.expertise_level, "Orta - Ileri Seviye")}
              </Text>
            </View>
            <View style={[s.kpi, { width: "32%", marginRight: 6 }]}>
              <Text style={s.kpiLabel}>02. Guven ve Samimiyet</Text>
              <Text style={{ fontSize: 9, fontWeight: 700, color: C.cyan }}>
                {safe(persona?.trust_sentiment, "Yuksek Guven")}
              </Text>
            </View>
            <View style={[s.kpiLast, { width: "32%" }]}>
              <Text style={s.kpiLabel}>03. Izleme Sebebi</Text>
              <Text
                style={{ fontSize: 9, fontWeight: 700, color: C.positive }}
              >
                {safe(persona?.primary_motive, "Bilgi ve Analiz")}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.footer}>
          <Text>CommentLab - Kanal Raporu</Text>
          <Text>Sayfa 3 / 4</Text>
        </View>
      </Page>

      {/* ========= SAYFA 4: SPONSORLUK & 90 GUN ========= */}
      <Page size="A4" style={s.page}>
        <View style={s.brandRow}>
          <Text style={s.brand}>
            Comment<Text style={s.brandAccent}>Lab</Text>
          </Text>
          <Text style={s.label}>BOLUM 04 - SPONSORLUK VE BUYUME PLANI</Text>
        </View>

        {/* Sponsorluk */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secNum}>6</Text>
            <Text style={s.secTitle}>
              Sponsorluk ve Gelir Firsatlari Rehberi
            </Text>
          </View>

          {spendingAreas.length > 0 && (
            <View style={[s.card, { marginBottom: 7 }]}>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: C.positive,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Izleyicinin Satin Almaya Hazir Oldugu Alanlar:
              </Text>
              {spendingAreas.map((area, i) => (
                <Text
                  key={String(i)}
                  style={{ fontSize: 8, color: "#334155", marginBottom: 2 }}
                >
                  {"- " + safe(area)}
                </Text>
              ))}
            </View>
          )}

          <View
            style={[
              s.card,
              {
                backgroundColor: C.warningSoft,
                borderColor: "#E8D5A0",
                marginBottom: 7,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: C.warning,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Kitleyi Kaybetmeden Sponsorluk Alma Kurali:
            </Text>
            <Text style={{ fontSize: 8, color: "#6B5320" }}>{adTips}</Text>
          </View>

          <View
            style={[
              s.box,
              { backgroundColor: C.positiveSoft, borderColor: "#B5DFC5" },
            ]}
          >
            <Text
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: C.positive,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Markalara Gonderilecek Hazir E-posta Cumlesi (Pitch):
            </Text>
            <Text style={{ fontSize: 8.5, color: "#2D5A3C", lineHeight: 1.4 }}>
              {pitch}
            </Text>
          </View>
        </View>

        {/* 90 Gun */}
        <View style={s.sec}>
          <View style={s.secHead}>
            <Text style={s.secNum}>7</Text>
            <Text style={s.secTitle}>
              90 Gunluk Adim Adim Buyume Plani
            </Text>
          </View>

          <View style={[s.card, { marginBottom: 6 }]}>
            <Text
              style={{ fontSize: 8, fontWeight: 700, color: C.accent }}
            >
              01 - 30 GUN: HIZLI DUZELTMELER
            </Text>
            <Text style={{ fontSize: 8.5, color: "#334155", marginTop: 2 }}>
              {safe(
                blueprint?.day_30_focus,
                "Ilk 15 saniyeyi optimize edin."
              )}
            </Text>
          </View>

          <View style={[s.card, { marginBottom: 6 }]}>
            <Text
              style={{ fontSize: 8, fontWeight: 700, color: C.warning }}
            >
              30 - 60 GUN: ICERIK SERISI
            </Text>
            <Text style={{ fontSize: 8.5, color: "#334155", marginTop: 2 }}>
              {safe(
                blueprint?.day_60_focus,
                "En cok talep edilen 3 konuyu yayinlayin."
              )}
            </Text>
          </View>

          <View style={[s.card, { marginBottom: 6 }]}>
            <Text
              style={{ fontSize: 8, fontWeight: 700, color: C.positive }}
            >
              60 - 90 GUN: TOPLULUK VE GELIR
            </Text>
            <Text style={{ fontSize: 8.5, color: "#334155", marginTop: 2 }}>
              {safe(
                blueprint?.day_90_focus,
                "Kitle sadakatini gelire donusturun."
              )}
            </Text>
          </View>

          {strategy && (strategy.action || strategy.insight) ? (
            <View
              style={[
                s.box,
                { marginTop: 4, backgroundColor: C.surfaceAlt },
              ]}
            >
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: C.accent,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                En Yuksek Etkili Stratejik Adim:
              </Text>
              <Text
                style={{ fontSize: 9, fontWeight: 700, color: C.ink }}
              >
                {safe(strategy.action)}
              </Text>
              {strategy.expected_impact ? (
                <Text
                  style={{
                    fontSize: 7.5,
                    color: C.muted,
                    marginTop: 2,
                  }}
                >
                  {"Beklenen Fayda: " + strategy.expected_impact}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={s.footer}>
          <Text>CommentLab - www.commentlab.io</Text>
          <Text>Sayfa 4 / 4</Text>
        </View>
      </Page>
    </Document>
  );
}
