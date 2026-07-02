import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { fetchSiteSettings } from "@/lib/queries";

export function WhatsAppFloat() {
  const [wa, setWa] = useState("");
  useEffect(() => {
    fetchSiteSettings().then((s) => setWa(s.whatsapp || ""));
  }, []);
  if (!wa) return null;
  return (
    <a
      href={`https://wa.me/${wa.replace(/\D/g, "")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Hubungi via WhatsApp"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-elegant hover:scale-105 transition"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline text-sm font-medium">Chat via WhatsApp</span>
    </a>
  );
}
