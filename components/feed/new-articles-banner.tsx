"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Optional — banner subscribes to global INSERTs regardless of auth state */
  userId?: string;
};

export function NewArticlesBanner({ userId }: Props) {
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
        // Notify FeedList to re-fetch from the top via a browser custom event
        window.dispatchEvent(new Event("feed:refresh"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[var(--color-blue)] text-white text-sm font-medium shadow-lg hover:opacity-90 transition-opacity animate-bounce"
    >
      ↑{" "}
      {t("new_articles", { count })}
    </button>
  );
}
