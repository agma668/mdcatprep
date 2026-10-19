import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-lg">
              <span className="text-white font-jakarta font-bold text-lg">E</span>
            </div>
            <div>
              <div className="font-jakarta font-bold text-white tracking-tight text-lg leading-tight">
                Cadet Prep
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gold font-bold">
                Premier Test Academy
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mt-2">
            Pakistan&apos;s leading conceptual test preparation portal for elite cadet and military colleges. Guided directly by HassanAbdal alumni.
          </p>
        </div>

        {/* Target Colleges */}
        <div>
          <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider text-gold mb-6">
            Colleges Covered
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-300">
            <li>Cadet College Hasan Abdal (CCH)</li>
            <li>Military College Jhelum (MCJ)</li>
            <li>PAF College Sargodha</li>
            <li>Cadet College Kohat</li>
            <li>Cadet College Petaro</li>
          </ul>
        </div>

        {/* Subjects */}
        <div>
          <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider text-gold mb-6">
            Subjects Covered
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-300">
            <li>Advanced Mathematics</li>
            <li>Conceptual Science</li>
            <li>English Logic & Grammar</li>
            <li>Urdu Qawaid & Essay</li>
            <li>Intelligence (Verbal & Non-Verbal)</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-jakarta font-semibold text-sm uppercase tracking-wider text-gold mb-6">
            Get In Touch
          </h4>
          <ul className="flex flex-col gap-4 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold flex-shrink-0" />
              <span>WhatsApp chat — button on any page</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold flex-shrink-0" />
              <span>support@cadetcollegeprep.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
              <span>Online Academy serving students nationwide</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Cadet Prep. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
