import { motion } from "motion/react";

/**
 * "Svar först"-block (GEO): ett kort, direkt och citerbart svar högst upp på
 * varje tjänstesida + en scanbar faktarad. Text-först så AI enkelt kan citera.
 */
export default function AnswerFirst({
  heading,
  answer,
  facts,
}: {
  heading: string;
  answer: React.ReactNode;
  facts: { label: string; value: string }[];
}) {
  return (
    <section className="bg-bg-primary py-12 md:py-16 border-b border-text-primary/5">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{heading}</h2>
          <p className="text-lg md:text-xl leading-relaxed text-text-secondary">{answer}</p>
          <dl className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl bg-white p-4 border border-text-primary/5">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-cta-hover">{f.label}</dt>
                <dd className="text-sm font-medium text-text-primary mt-1.5 leading-snug">{f.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
