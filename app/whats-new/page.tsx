import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "מה חדש — Tribes",
  description: "כל מה שנוסף ל-Tribes: בוטים מתחרים, ניחוש טבלאות בית, דשבורד חי ועוד.",
};

const SECTIONS: { emoji: string; title: string; body: string; items: string[] }[] = [
  {
    emoji: "🤖",
    title: "יריבים אוטומטיים (בוטים)",
    body: "תמיד יש את מי לנצח — שני שחקני בית מתחרים בכל ליגה ובטבלה הגלובלית.",
    items: [
      "Coco the Monkey 🐵 — מנחש לגמרי אקראית",
      "The Analyst 🤖 — מנחש לפי מודל דירוג חוזק קבוצות",
      "הבוטים מנחשים הכול: משחקים, נוקאאוט, טבלאות בית וניחושי-על",
    ],
  },
  {
    emoji: "🏅",
    title: "ניחוש טבלאות הבית",
    body: "דרגו את הקבוצות בכל בית מהמקום הראשון לאחרון.",
    items: ["5 נקודות על כל קבוצה שתמקמו במקום הנכון", "נכנס בעמוד Groups לצד הטבלאות החיות"],
  },
  {
    emoji: "🎲",
    title: "LazyOz — מילוי בלחיצה אחת",
    body: "אין זמן לנחש כל משחק? LazyOz עושה את זה בשבילך בלחיצה אחת.",
    items: [
      "ממלא ניחושים אקראיים לכל המשחקים הפתוחים שעוד לא ניחשת (כולל בחירות נוקאאוט)",
      "לא דורס ניחושים שכבר עשית — ממלא רק את החסרים",
      "נמצא במסך הבית ובעמוד Predict; אפשר לחדד כל ניחוש אחר כך",
    ],
  },
  {
    emoji: "🏟️",
    title: "דשבורד חי יותר",
    body: "מסך הבית קם לחיים.",
    items: [
      "המשחק הבא עם ספירה לאחור (או LIVE עם התוצאה בזמן אמת)",
      "סטטיסטיקות מהירות: נקודות, דירוג גלובלי, תוצאות מדויקות",
      "תוצאות אחרונות עם הניחוש שלך והנקודות שצברת",
    ],
  },
  {
    emoji: "📖",
    title: 'עמוד "איך זה עובד"',
    body: "הסבר מלא על כל שיטות הניקוד והאפשרויות, נגיש מהתפריט העליון.",
    items: [
      "תוצאה מדויקת 10 · הפרש שערים 6 · תוצאה נכונה 4 · נוקאאוט ×1.5",
      "ג'וקר, טבלאות, נעילה ועוד",
      "גרסה ידידותית ל-LLM בכתובת /llms.txt",
    ],
  },
  {
    emoji: "🧪",
    title: "סימולטור (לבדיקות)",
    body: "כלי אדמין לוודא שרגע האמת עובד לפני הטורניר.",
    items: [
      "זירוז פתיחת משחקים שנועלים ניחושים מיד",
      "הזנת תוצאות והרצת ניקוד אוטומטי",
      "מוודא שכשמשחק מתחיל אי אפשר לשנות ניחושים (גם בצד השרת)",
    ],
  },
  {
    emoji: "⚙️",
    title: "מאחורי הקלעים",
    body: "יציבות ואמינות.",
    items: [
      "מנגנון סנכרון מהיר ואמין יותר",
      "21 בדיקות E2E + ~95 בדיקות יחידה — הכול ירוק",
    ],
  },
];

export default function WhatsNewPage() {
  return (
    <div dir="rtl" className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-[var(--radius)] border border-accent/30 p-8 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(700px 240px at 50% -20%, rgba(198,255,58,0.16), transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-3">
          <Badge variant="accent">מה חדש · 10 ביוני 2026</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            ⚽ Tribes — עדכון חדש
          </h1>
          <p className="max-w-xl text-muted">
            המונדיאל מתקרב, והאפליקציה קיבלה שדרוג רציני. הנה כל מה שנכנס.
          </p>
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            למשחק ←
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="flex flex-col gap-3">
            <div>
              <CardTitle>
                {s.emoji} {s.title}
              </CardTitle>
              <CardDescription>{s.body}</CardDescription>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {s.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>

      <p className="text-center text-sm text-muted">
        🏆 הליגה שלך: ״Yamin&apos;s Tribe״ — קוד הזמנה{" "}
        <span className="score-display text-foreground">GRP7Y6</span>
      </p>
    </div>
  );
}
