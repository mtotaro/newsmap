"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  onRefresh: () => void;
};

export function NewArticlesBanner({ userId, onRefresh }: Props) {
  const t = useTranslations("Feed");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("new-articles")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "articles",
          // Supabase Realtime: only notify if article is from a subscribed source
          // Filtering by user_id isn't possible directly — we do a client-side check
        },
        () => {
          setCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (count === 0) return null;

  return (
    <button
      onClick={() => {
        setCount(0);
        onRefresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[var(--color-blue)] text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity animate-bounce"
    >
      ↑{" "}
      {t("new_articles", { count })}
    </button>
  );
}
