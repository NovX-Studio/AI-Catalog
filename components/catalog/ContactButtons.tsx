import { contactConfig } from "@/lib/contact";
import { buttonVariants } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function ContactButtons() {
  const waUrl = `https://wa.me/${contactConfig.whatsapp.number}?text=${encodeURIComponent(
    contactConfig.whatsapp.message
  )}`;

  const mailUrl = `mailto:${contactConfig.email.address}?subject=${encodeURIComponent(
    contactConfig.email.subject
  )}`;

  return (
    <section className="bg-slate-900 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
        <p className="text-slate-400 mb-8">
          Questions about a product? We&apos;d love to help!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-green-500 hover:bg-green-600 text-white inline-flex items-center gap-2 border-0"
            )}
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </a>

          <a
            href={contactConfig.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white inline-flex items-center gap-2 border-0"
            )}
          >
            <InstagramIcon className="h-5 w-5" />
            Instagram
          </a>

          <a
            href={mailUrl}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/30 text-white hover:bg-white/10 inline-flex items-center gap-2"
            )}
          >
            <Mail className="h-5 w-5" />
            Email Us
          </a>
        </div>
      </div>
    </section>
  );
}
