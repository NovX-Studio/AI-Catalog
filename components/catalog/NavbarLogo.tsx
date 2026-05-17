import Link from "next/link";

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #6C47FF 0%, #7C3AED 100%)",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-white"
        >
          <path
            d="M2 3h12v2H2V3zm0 4h8v2H2V7zm0 4h10v2H2v-2z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="13" cy="11" r="2.5" fill="currentColor" />
        </svg>
      </div>
      <span
        className="font-bold text-[#111827] text-lg"
        style={{ letterSpacing: "-0.02em" }}
      >
        AI Catalog
      </span>
    </Link>
  );
}
