import { contactConfig } from "@/lib/contact";
import { MessageCircle, Mail } from "lucide-react";

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const contacts = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Chat with us directly on WhatsApp",
    icon: <MessageCircle className="h-6 w-6" />,
    color: "bg-emerald-500 hover:bg-emerald-600",
    iconBg: "bg-emerald-100 text-emerald-600",
    getHref: () =>
      `https://wa.me/${contactConfig.whatsapp.number}?text=${encodeURIComponent(contactConfig.whatsapp.message)}`,
  },
  {
    key: "instagram",
    label: "Instagram",
    description: "Follow us and send a DM",
    icon: <InstagramIcon />,
    color:
      "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500",
    iconBg: "bg-pink-100 text-pink-600",
    getHref: () => contactConfig.instagram.url,
  },
  {
    key: "email",
    label: "Email",
    description: "Send us an email anytime",
    icon: <Mail className="h-6 w-6" />,
    color: "bg-emerald-500 hover:bg-emerald-600",
    iconBg: "bg-emerald-50 text-emerald-600",
    getHref: () =>
      `mailto:${contactConfig.email.address}?subject=${encodeURIComponent(contactConfig.email.subject)}`,
  },
];

export function ContactSection() {
  return (
    <section id="contact" className="bg-white border-t border-zinc-200 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-2 tracking-tight">
            Get in Touch
          </h2>
          <p className="text-zinc-500">
            Have a question about a product? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {contacts.map(({ key, label, description, icon, iconBg, color, getHref }) => (
            <div
              key={key}
              className="bg-zinc-50 rounded-2xl p-6 border border-zinc-200 flex flex-col items-center text-center gap-3 transition-colors hover:border-zinc-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                {icon}
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-sm">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
              </div>
              <a
                href={getHref()}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-1 inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium text-white transition-all active:scale-95 ${color}`}
              >
                Contact us
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
