import { ShieldCheck, Star, Sparkles, Heart } from "lucide-react";

export default function WhyStodona() {
  return (
    <div className="card-rounded bg-bg-primary p-8 border border-text-primary/10 relative overflow-hidden group">
      {/* Subtle techy background element */}
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-cta-hover/10 rounded-full blur-3xl group-hover:bg-cta-hover/20 transition-colors duration-500"></div>
      
      <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-cta-hover" />
        Varför välja Stodona?
      </h3>
      
      <ul className="space-y-6 relative z-10">
        <li className="flex gap-4 group/item">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-text-primary/5 flex items-center justify-center shrink-0 group-hover/item:border-cta-hover/30 group-hover/item:shadow-md transition-all">
            <ShieldCheck className="w-5 h-5 text-cta-hover" />
          </div>
          <div>
            <p className="font-bold text-sm mb-0.5 group-hover/item:text-cta-hover transition-colors">Nöjd kund-garanti</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Vi åtgärdar eventuella brister inom 24h. Din trygghet är vårt fokus.
            </p>
          </div>
        </li>
        <li className="flex gap-4 group/item">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-text-primary/5 flex items-center justify-center shrink-0 group-hover/item:border-cta-hover/30 group-hover/item:shadow-md transition-all">
            <Star className="w-5 h-5 text-cta-hover" />
          </div>
          <div>
            <p className="font-bold text-sm mb-0.5 group-hover/item:text-cta-hover transition-colors">Utbildad personal</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Kollektivavtalsliknande villkor och kontinuerlig vidareutbildning.
            </p>
          </div>
        </li>
        <li className="flex gap-4 group/item">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-text-primary/5 flex items-center justify-center shrink-0 group-hover/item:border-cta-hover/30 group-hover/item:shadow-md transition-all">
            <Heart className="w-5 h-5 text-cta-hover" />
          </div>
          <div>
            <p className="font-bold text-sm mb-0.5 group-hover/item:text-cta-hover transition-colors">Vi bryr oss</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ett städbolag med hjärta. Vi tar hand om både personal och kunder.
            </p>
          </div>
        </li>
      </ul>
      
      <div className="mt-8 pt-6 border-t border-text-primary/10 relative z-10">
        <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Tillgängliga för bokning i Stockholm
        </div>
      </div>
    </div>
  );
}
