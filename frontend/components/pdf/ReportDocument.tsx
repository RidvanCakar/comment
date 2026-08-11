import {
  Document,
  Font,
  Page,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";

export type PdfSentiment = "positive" | "negative" | "neutral";

export interface PdfTopic {
  topic: string;
  percent: number;
  sentiment: PdfSentiment | "mixed" | string;
  insight: string;
  example_comments?: string[];
}

export interface PdfEngagedComment {
  author: string;
  text: string;
  like_count: number;
  reply_count: number;
  engagement_score: number;
  sentiment: string;
  topic: string;
}

export interface PdfHighlightMoment {
  timestamp_label: string;
  timestamp_seconds: number;
  total_engagement: number;
  comment_count: number;
  sample_comment: string;
  sentiment: string;
}

export interface PdfReportData {
  videoTitle: string;
  channelTitle: string;
  videoId?: string;
  analyzedCommentCount: number;
  analysisDate: string | null;
  summary: string;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topics: PdfTopic[];
  topEngagedComments?: PdfEngagedComment[];
  highlightMoments?: PdfHighlightMoment[];
  recommendation: {
    insight: string;
    action: string;
    expectedImpact: string;
  };
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
  ink: "#17202A",
  muted: "#657080",
  line: "#E4E7EB",
  paper: "#FFFFFF",
  surface: "#F6F7F8",
  amber: "#D98A13",
  amberSoft: "#FFF5E2",
  positive: "#4D8B61",
  positiveSoft: "#EDF6F0",
  negative: "#C55454",
  negativeSoft: "#FBEFEF",
  neutral: "#65758B",
  neutralSoft: "#F0F3F7",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    color: colors.ink,
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
    borderBottomColor: colors.line,
    paddingBottom: 14,
    marginBottom: 22,
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.ink,
  },
  brandAccent: {
    color: colors.amber,
  },
  reportLabel: {
    color: colors.muted,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 23,
    lineHeight: 1.2,
    fontWeight: 700,
    marginBottom: 7,
  },
  channel: {
    color: colors.muted,
    fontSize: 10,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 25,
  },
  metaBox: {
    width: "32%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 5,
    padding: 10,
    marginRight: 7,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 700,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.amberSoft,
    color: colors.amber,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 6,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    padding: 14,
  },
  summaryText: {
    fontSize: 9.5,
    lineHeight: 1.65,
  },
  sentimentLegend: {
    flexDirection: "row",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  legendText: {
    color: colors.muted,
    fontSize: 8,
  },
  sentimentSection: {
    marginBottom: 14,
  },
  sentimentHeading: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 7,
    marginBottom: 8,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },
  sentimentTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  sentimentCount: {
    color: colors.muted,
    fontSize: 8,
    marginLeft: "auto",
  },
  topicCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 5,
    padding: 10,
    marginBottom: 7,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  topicTitle: {
    width: "82%",
    fontSize: 9.5,
    fontWeight: 700,
    lineHeight: 1.35,
  },
  topicPercent: {
    fontSize: 10,
    fontWeight: 700,
  },
  topicDescription: {
    color: colors.muted,
    fontSize: 8.2,
    lineHeight: 1.5,
  },
  recommendation: {
    backgroundColor: colors.amberSoft,
    borderWidth: 1.5,
    borderColor: colors.amber,
    borderRadius: 7,
    padding: 15,
  },
  recommendationTitle: {
    color: colors.amber,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 11,
  },
  recommendationPart: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: "#F1D9AE",
    borderRadius: 5,
    padding: 10,
    marginBottom: 7,
  },
  recommendationLabel: {
    color: colors.amber,
    fontSize: 7.5,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 8.5,
    lineHeight: 1.55,
  },
  insightCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 5,
    padding: 10,
    marginBottom: 7,
    backgroundColor: colors.surface,
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  insightAuthor: {
    fontSize: 9,
    fontWeight: 700,
  },
  insightRank: {
    color: colors.muted,
    fontSize: 8,
  },
  insightMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  insightMetaTag: {
    color: colors.muted,
    fontSize: 7.5,
    marginRight: 10,
  },
  momentTime: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.amber,
    marginBottom: 4,
  },
  footer: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    color: colors.muted,
    fontSize: 7,
  },
});

const sentimentConfig: Record<
  PdfSentiment,
  { label: string; color: string; soft: string }
> = {
  positive: {
    label: "Olumlu",
    color: colors.positive,
    soft: colors.positiveSoft,
  },
  negative: {
    label: "Olumsuz",
    color: colors.negative,
    soft: colors.negativeSoft,
  },
  neutral: {
    label: "Nötr",
    color: colors.neutral,
    soft: colors.neutralSoft,
  },
};

function normalizeSentiment(value: string): PdfSentiment {
  if (value === "positive") return "positive";
  if (value === "negative") return "negative";
  return "neutral";
}

export default function ReportDocument({ data }: { data: PdfReportData }) {
  const groups: Record<PdfSentiment, PdfTopic[]> = {
    positive: [],
    negative: [],
    neutral: [],
  };

  for (const topic of data.topics) {
    groups[normalizeSentiment(topic.sentiment)].push(topic);
  }

  for (const key of Object.keys(groups) as PdfSentiment[]) {
    groups[key].sort((a, b) => b.percent - a.percent);
  }

  const analysisDate = data.analysisDate
    ? new Date(data.analysisDate).toLocaleDateString("tr-TR")
    : new Date().toLocaleDateString("tr-TR");

  let sectionCounter = 3;
  const engagedSectionNumber = data.topEngagedComments?.length
    ? String(sectionCounter++).padStart(2, "0")
    : null;
  const momentsSectionNumber = data.highlightMoments?.length
    ? String(sectionCounter++).padStart(2, "0")
    : null;
  const recommendationSectionNumber = String(sectionCounter).padStart(2, "0");

  return (
    <Document
      title={`${data.videoTitle} — YorumAI Analiz Raporu`}
      author="YorumAI"
      subject="YouTube yorum analiz raporu"
      language="tr-TR"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.brandRow}>
          <Text style={styles.brand}>
            Yorum<Text style={styles.brandAccent}>AI</Text>
          </Text>
          <Text style={styles.reportLabel}>YouTube Yorum Analiz Raporu</Text>
        </View>

        <Text style={styles.title}>{data.videoTitle}</Text>
        <Text style={styles.channel}>{data.channelTitle}</Text>

        <View style={styles.metaRow}>
          <MetaBox
            label="Analiz edilen yorum"
            value={data.analyzedCommentCount.toLocaleString("tr-TR")}
          />
          <MetaBox label="Analiz tarihi" value={analysisDate} />
          <MetaBox label="Toplam kategori" value={String(data.topics.length)} />
        </View>

        <View style={styles.section}>
          <SectionHeader number="01" title="Genel Özet" />
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{data.summary}</Text>
            <View style={{ marginTop: 13 }}>
              <SentimentDistributionBar sentiment={data.sentiment} />
            </View>
            <View style={styles.sentimentLegend}>
              <LegendItem
                label={`Olumlu %${formatPercent(data.sentiment.positive)}`}
                color={colors.positive}
              />
              <LegendItem
                label={`Olumsuz %${formatPercent(data.sentiment.negative)}`}
                color={colors.negative}
              />
              <LegendItem
                label={`Nötr %${formatPercent(data.sentiment.neutral)}`}
                color={colors.neutral}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader number="02" title="Kategori Detayları" />
          {(["positive", "negative", "neutral"] as PdfSentiment[]).map(
            (sentiment) => (
              <SentimentGroup
                key={sentiment}
                sentiment={sentiment}
                topics={groups[sentiment]}
              />
            )
          )}
        </View>

        {engagedSectionNumber && (
          <View style={styles.section}>
            <SectionHeader number={engagedSectionNumber} title="En Beğenilen Yorumlar" />
            {data.topEngagedComments!.map((comment, index) => (
              <EngagedCommentCard
                key={`${index}-${comment.text.slice(0, 20)}`}
                comment={comment}
                rank={index + 1}
              />
            ))}
          </View>
        )}

        {momentsSectionNumber && (
          <View style={styles.section}>
            <SectionHeader number={momentsSectionNumber} title="Öne Çıkan Anlar" />
            {data.highlightMoments!.map((moment) => (
              <HighlightMomentCard
                key={`${moment.timestamp_seconds}-${moment.timestamp_label}`}
                moment={moment}
                videoId={data.videoId}
              />
            ))}
          </View>
        )}

        <View style={styles.section} wrap={false}>
          <SectionHeader
            number={recommendationSectionNumber}
            title="Bir Sonraki Video İçin Kritik Tavsiye"
          />
          <View style={styles.recommendation}>
            <Text style={styles.recommendationTitle}>Öncelikli Aksiyon Planı</Text>
            <RecommendationPart
              label="Tespit"
              text={data.recommendation.insight}
            />
            <RecommendationPart
              label="Aksiyon"
              text={data.recommendation.action}
            />
            <RecommendationPart
              label="Beklenen Etki"
              text={data.recommendation.expectedImpact}
              last
            />
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>YorumAI ile oluşturulmuştur</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Sayfa ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaBox}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionNumber}>{number}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SentimentDistributionBar({
  sentiment,
}: {
  sentiment: PdfReportData["sentiment"];
}) {
  const total =
    sentiment.positive + sentiment.negative + sentiment.neutral || 1;
  const positiveWidth = (sentiment.positive / total) * 100;
  const negativeWidth = (sentiment.negative / total) * 100;
  const neutralWidth = (sentiment.neutral / total) * 100;

  return (
    <Svg width="100%" height={12} viewBox="0 0 100 12">
      <Rect x={0} y={0} width={100} height={12} rx={3} fill={colors.line} />
      <Rect
        x={0}
        y={0}
        width={positiveWidth}
        height={12}
        fill={colors.positive}
      />
      <Rect
        x={positiveWidth}
        y={0}
        width={negativeWidth}
        height={12}
        fill={colors.negative}
      />
      <Rect
        x={positiveWidth + negativeWidth}
        y={0}
        width={neutralWidth}
        height={12}
        fill={colors.neutral}
      />
    </Svg>
  );
}

function LegendItem({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function SentimentGroup({
  sentiment,
  topics,
}: {
  sentiment: PdfSentiment;
  topics: PdfTopic[];
}) {
  const config = sentimentConfig[sentiment];

  return (
    <View style={styles.sentimentSection}>
      <View
        style={[
          styles.sentimentHeading,
          { borderBottomColor: config.color },
        ]}
      >
        <View
          style={[styles.sentimentDot, { backgroundColor: config.color }]}
        />
        <Text style={[styles.sentimentTitle, { color: config.color }]}>
          {config.label}
        </Text>
        <Text style={styles.sentimentCount}>
          {topics.length} kategori
        </Text>
      </View>

      {topics.length === 0 ? (
        <View
          style={[
            styles.topicCard,
            { backgroundColor: config.soft, borderColor: config.color },
          ]}
        >
          <Text style={styles.topicDescription}>
            Bu duygu grubunda belirgin bir kategori bulunamadı.
          </Text>
        </View>
      ) : (
        topics.map((topic) => (
          <View
            key={`${sentiment}-${topic.topic}`}
            style={[
              styles.topicCard,
              { backgroundColor: config.soft },
            ]}
            wrap={false}
          >
            <View style={styles.topicHeader}>
              <Text style={styles.topicTitle}>{topic.topic}</Text>
              <Text style={[styles.topicPercent, { color: config.color }]}>
                %{formatPercent(topic.percent)}
              </Text>
            </View>
            <Text style={styles.topicDescription}>{topic.insight}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function RecommendationPart({
  label,
  text,
  last = false,
}: {
  label: string;
  text: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.recommendationPart,
        last ? { marginBottom: 0 } : {},
      ]}
    >
      <Text style={styles.recommendationLabel}>{label}</Text>
      <Text style={styles.recommendationText}>{text || "—"}</Text>
    </View>
  );
}

function formatPercent(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function sentimentLabelPdf(sentiment: string) {
  if (sentiment === "positive") return "Pozitif";
  if (sentiment === "negative") return "Olumsuz";
  return "Nötr";
}

function formatHandlePdf(author: string) {
  const cleaned = author.trim();
  if (!cleaned || cleaned.toLowerCase() === "anonim") return "Anonim";
  return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
}

function EngagedCommentCard({
  comment,
  rank,
}: {
  comment: PdfEngagedComment;
  rank: number;
}) {
  return (
    <View style={styles.insightCard} wrap={false}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightAuthor}>{formatHandlePdf(comment.author)}</Text>
        <Text style={styles.insightRank}>#{rank}</Text>
      </View>
      <Text style={styles.topicDescription}>{comment.text}</Text>
      <View style={styles.insightMeta}>
        <Text style={styles.insightMetaTag}>
          {comment.like_count.toLocaleString("tr-TR")} beğeni
        </Text>
        <Text style={styles.insightMetaTag}>
          {comment.reply_count.toLocaleString("tr-TR")} yanıt
        </Text>
        <Text style={styles.insightMetaTag}>
          {comment.engagement_score.toLocaleString("tr-TR")} etkileşim
        </Text>
        <Text style={styles.insightMetaTag}>
          {sentimentLabelPdf(comment.sentiment)}
        </Text>
        <Text style={styles.insightMetaTag}>{comment.topic}</Text>
      </View>
    </View>
  );
}

function HighlightMomentCard({
  moment,
  videoId,
}: {
  moment: PdfHighlightMoment;
  videoId?: string;
}) {
  const watchLabel = videoId
    ? `youtube.com/watch?v=${videoId}&t=${moment.timestamp_seconds}s`
    : null;

  return (
    <View style={styles.insightCard} wrap={false}>
      <Text style={styles.momentTime}>{moment.timestamp_label}</Text>
      <Text style={styles.topicDescription}>{moment.sample_comment}</Text>
      <View style={styles.insightMeta}>
        <Text style={styles.insightMetaTag}>
          {moment.total_engagement.toLocaleString("tr-TR")} etkileşim
        </Text>
        <Text style={styles.insightMetaTag}>
          {moment.comment_count.toLocaleString("tr-TR")} yorum
        </Text>
        <Text style={styles.insightMetaTag}>
          {sentimentLabelPdf(moment.sentiment)}
        </Text>
        {watchLabel ? (
          <Text style={styles.insightMetaTag}>{watchLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}
