import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getWhatsAppNumber, getWhatsAppLink } from "@/lib/site";

export const metadata = { title: "Application Rejected" };

const whatsapp = getWhatsAppNumber();

export default function RejectedPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/[0.06] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] border border-[var(--color-border)] p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-[var(--radius-md)] bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl mb-4">
          ✕
        </div>
        <h1 className="text-2xl font-bold text-white">Application Not Approved</h1>
        <p className="text-white/70 mt-3">
          Unfortunately your application was not approved. If you believe this
          is a mistake, please reach out to us.
        </p>
        {whatsapp && (
          <p className="mt-3">
            <a
              href={getWhatsAppLink()}
              className="text-[var(--color-primary)] font-medium hover:underline text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact us on WhatsApp
            </a>
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/">
            <Button variant="primary" fullWidth>Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
