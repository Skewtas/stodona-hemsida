import React, { useState, useMemo } from 'react';
import { ArrowRight, MapPin, Maximize, Sparkles, Star, ShieldCheck, Home, Box, Wind } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const servicesList = [
  { id: 'hemstadning', sv: 'Hemstädning', en: 'Home Cleaning', icon: Home, base: 22, min: 600 },
  { id: 'storstadning', sv: 'Storstädning', en: 'Deep Cleaning', icon: Sparkles, base: 35, min: 1200 },
  { id: 'flyttstadning', sv: 'Flyttstädning', en: 'Move-Out', icon: Box, base: 40, min: 1500 },
  { id: 'fonsterputsning', sv: 'Fönsterputs', en: 'Windows', icon: Wind, base: 15, min: 500 },
];

export const QuickBookingWidget: React.FC = () => {
  const { lang } = useLanguage();

  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');
  const [sqm, setSqm] = useState('');
  const [service, setService] = useState('hemstadning');

  // Prisuppskattning
  const estimatedPrice = useMemo(() => {
    const sqmNum = parseInt(sqm);
    if (!sqmNum || isNaN(sqmNum) || sqmNum < 10) return null;
    
    const activeService = servicesList.find(s => s.id === service);
    if (!activeService) return null;

    return Math.max(sqmNum * activeService.base, activeService.min);
  }, [sqm, service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length > 0 && !zipCode.startsWith('1')) {
      setZipError(lang === 'EN' ? 'Sorry, we only cover Stockholm manually yet' : 'Tyvärr täcker vi bara Stockholm just nu');
      return;
    }
    const params = new URLSearchParams({
      service: service,
      zip: zipCode,
      sqm: sqm
    });
    window.location.href = `https://boka.stodona.se?${params.toString()}`;
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-2xl shadow-text-primary/10 border border-text-primary/5 max-w-xl mx-auto w-full relative overflow-hidden">
      
      {/* Subtle background flair */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cta-hover/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mx-auto mb-6 bg-yellow-50 text-yellow-900 px-4 py-1.5 rounded-full w-max text-xs font-bold border border-yellow-200/50">
          <div className="flex text-yellow-500">
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span>{lang === 'EN' ? '4.9/5 Average Rating' : '4.9/5 i snittbetyg'}</span>
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-bold mb-8 text-text-primary text-center tracking-tight">
          {lang === 'EN' ? 'Book cleaning in 60s' : 'Boka städning på 60s'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Service Väljare (Cards istället för Dropdown) */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              1. {lang === 'EN' ? 'What do you need help with?' : 'Vad behöver du hjälp med?'}
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {servicesList.map(s => {
                const isSelected = service === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setService(s.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected 
                      ? 'border-cta-hover bg-cta-hover/5 text-cta-hover shadow-md scale-[1.02]' 
                      : 'border-text-primary/5 bg-bg-primary hover:border-cta-hover/30 hover:bg-white text-text-secondary'
                    }`}
                  >
                    <Icon className={`w-7 h-7 mb-2 transition-colors ${isSelected ? 'text-cta-hover' : 'text-text-primary/40'}`} />
                    <span className={`text-sm sm:text-base font-bold ${isSelected ? 'text-cta-hover' : 'text-text-primary'}`}>
                      {lang === 'EN' ? s.en : s.sv}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Square Meters */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                2. {lang === 'EN' ? 'Area (sqm)' : 'Boyta (kvm)'}
              </label>
              <div className="relative">
                <Maximize className="w-5 h-5 text-text-primary/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="10"
                  max="1000"
                  placeholder="Ex: 75"
                  value={sqm}
                  onChange={(e) => setSqm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-bg-primary border-2 border-transparent focus:border-cta-hover focus:bg-white focus:ring-4 focus:ring-cta-hover/10 outline-none transition-all text-text-primary text-lg font-medium shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                3. {lang === 'EN' ? 'Postal Code' : 'Postnummer'}
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-text-primary/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: 112 34"
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value.replace(/\D/g, '').substring(0, 5));
                    setZipError('');
                  }}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-bg-primary border-2 focus:bg-white focus:ring-4 outline-none transition-all text-text-primary text-lg font-medium shadow-inner ${zipError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent focus:border-cta-hover focus:ring-cta-hover/10'}`}
                />
              </div>
              {zipError && (
                <p className="text-red-500 text-xs mt-2 font-medium">{zipError}</p>
              )}
            </div>
          </div>

          {/* Prisuppskattning (Live box) */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${estimatedPrice ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-cta-hover/10 rounded-2xl p-4 flex items-center justify-between border border-cta-hover/20">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cta-hover mb-1">
                  {lang === 'EN' ? 'Estimated Price' : 'Uppskattat pris'}
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-extrabold text-text-primary">
                    ~ {estimatedPrice} kr
                  </span>
                  <span className="text-sm font-medium text-text-secondary mb-1">
                    {lang === 'EN' ? '(after RUT)' : '(efter RUT)'}
                  </span>
                </div>
              </div>
              <Sparkles className="w-8 h-8 text-cta-hover/40" />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full btn-primary bg-text-primary text-bg-primary hover:bg-cta-hover hover:text-white py-5 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
            >
              {lang === 'EN' ? 'See exact price & book' : 'Få exakt pris & boka'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-text-secondary">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>{lang === 'EN' ? '100% Satisfaction Guarantee. No commitment.' : '100% Nöjd-Kund Garanti. Ingen bindningstid.'}</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
