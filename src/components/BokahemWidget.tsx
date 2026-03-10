import React, { useEffect } from 'react';

interface BokahemWidgetProps {
  className?: string;
}

export const BokahemWidget: React.FC<BokahemWidgetProps> = ({ className = '' }) => {
  useEffect(() => {
    // Add CSS
    if (!document.querySelector('link[href="https://plugin.bokahem.se/css/app.css"]')) {
      const link = document.createElement('link');
      link.href = 'https://plugin.bokahem.se/css/app.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Add JS
    if (!document.querySelector('script[src="https://plugin.bokahem.se/js/app.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://plugin.bokahem.se/js/app.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full max-w-2xl mx-auto flex flex-col gap-2 ${className}`}>
      {/* Visual Guide / Stepper */}
      <div className="grid grid-cols-3 gap-2 px-4 md:px-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cta-hover text-text-primary flex items-center justify-center text-sm font-bold shadow-sm">1</div>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-secondary">Boka</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bg-primary text-text-secondary border border-text-primary/10 flex items-center justify-center text-sm font-bold">2</div>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-secondary">Städningen utförs</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bg-primary text-text-secondary border border-text-primary/10 flex items-center justify-center text-sm font-bold">3</div>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-text-secondary">Rate:a din städning</span>
        </div>
      </div>

      <div className="w-full bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-black/5 border border-text-primary/5 overflow-hidden pb-0">
        <style dangerouslySetInnerHTML={{ __html: `
          bokahem-plugin button, 
          bokahem-plugin .btn,
          bokahem-plugin .primary-button {
            background-color: #c8b6a6 !important;
            color: #151515 !important;
            border-radius: 9999px !important;
            font-weight: 600 !important;
            transition: all 0.3s ease !important;
          }
          bokahem-plugin button:hover,
          bokahem-plugin .btn:hover {
            background-color: #151515 !important;
            color: #f4f1eb !important;
          }
        `}} />
        {/* @ts-ignore */}
        <bokahem-plugin></bokahem-plugin>
      </div>
    </div>
  );
};
