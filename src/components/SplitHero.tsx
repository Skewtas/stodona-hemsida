import { Link } from "react-router-dom";
import { motion } from "motion/react";

export interface SplitHeroProps {
  src: string;
  alt: string;
  /** object-position, t.ex. "center 42%". Default "center". */
  position?: string;
  /** Byter färg på textrutan. Default terrakottan ur logotypen. */
  panelClass?: string;
  /** Visar "Hem / X" överst i rutan. Utelämna för ingen brödsmula. */
  breadcrumb?: string;
  title: React.ReactNode;
  intro: React.ReactNode;
}

/**
 * Två kvadrater kant i kant över hela skärmbredden: foto till vänster,
 * text i en färgad ruta till höger. Headern är sticky och tar sin plats i
 * flödet, så heron behöver ingen toppmarginal. Rutnätet har gap-0 och
 * sektionen samma botten som rutan, så ingen ljus söm kan glida fram.
 */
export default function SplitHero({ src, alt, position, panelClass, breadcrumb, title, intro }: SplitHeroProps) {
  return (
    <section className="grid gap-0 md:grid-cols-2 bg-accent">
      <div className="aspect-square overflow-hidden leading-[0]">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ objectPosition: position ?? "center" }}
          width="1536"
          height="1024"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
        className={`flex flex-col justify-center px-8 py-12 md:px-14 lg:px-20 min-h-[100vw] md:min-h-0 md:aspect-square ${panelClass ?? "bg-accent text-text-primary"}`}>
        {breadcrumb && (
          <nav className="text-sm text-text-primary/70 mb-5" aria-label="Brödsmulor">
            <Link to="/" className="hover:text-text-primary">Hem</Link> <span className="mx-1.5">/</span>
            <span className="text-text-primary">{breadcrumb}</span>
          </nav>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5">{title}</h1>
        <p className="text-lg md:text-xl leading-relaxed">{intro}</p>
      </motion.div>
    </section>
  );
}
