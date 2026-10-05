import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { lessonById, lessons } from "@/lib/content";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lesson = lessonById(id);
  return { title: lesson ? `${lesson.title} · Learn Amharic` : "Lesson · Learn Amharic" };
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  if (!lessonById(id)) notFound();
  return <LessonPlayer lessonId={id} />;
}
