import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { lessonById, lessons } from "@/lib/content";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const lesson = lessonById(params.id);
  return { title: lesson ? `${lesson.title} · Learn Amharic` : "Lesson · Learn Amharic" };
}

export default function LessonPage({ params }: { params: { id: string } }) {
  if (!lessonById(params.id)) notFound();
  return <LessonPlayer lessonId={params.id} />;
}
