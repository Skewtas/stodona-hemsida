import React, { useState } from 'react';
import { ArrowRight, MapPin, Maximize, Sparkles, Star, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

export const QuickBookingWidget: React.FC = () => {
  const { lang } = useLanguage();

  const [zipCode, setZipCode] = useState('');
  const [zipError, setZipError] = useState('');
  const [sqm, setSqm] = useState('');
  const [service, setService] = useState('hemstadning');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length > 0 && !zipCode.startsWith('1')) {
      setZipError(lang === 'EN' ? 'Sorry, we are not available here yet' : 'Tyvärr finns vi inte här ännu');
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-text-primary/5 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-center gap-2 mx-auto mb-4 bg-bg-primary text-text-primary px-4 py-1.5 rounded-full w-max text-xs font-bold border border-text-primary/5">
        <div className="flex text-yellow-500">
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
        </div>
        <span>{lang === 'EN' ? '4.9/5 Average Rating' : '4.9/5 i snittbetyg'}</span>
      </div>
      <h3 className="text-2xl font-bold mb-6 text-text-primary text-center">
        {lang === 'EN' ? 'Book cleaning online' : 'Boka städning online'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-2 gap-4">
          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cta-hover" />
              {lang === 'EN' ? 'Postal Code' : 'Postnummer'}
            </label>
            <input
              type="text"
              required
              value={zipCode}
              onChange={(e) => {
                setZipCode(e.target.value.replace(/\D/g, '').substring(0, 5));
                setZipError('');
              }}
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-text-primary ${zipError ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover'}`}
            />
            {zipError && (
              <p className="text-red-500 text-xs mt-1">{zipError}</p>
            )}
          </div>

          {/* Square Meters */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <Maximize className="w-4 h-4 text-cta-hover" />
              {lang === 'EN' ? 'Area (sqm)' : 'Boyta (kvm)'}
            </label>
            <input
              type="number"
              required
              min="10"
              max="1000"
              value={sqm}
              onChange={(e) => setSqm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover outline-none transition-all text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cta-hover" />
            {lang === 'EN' ? 'Cleaning Type' : 'Typ av städning'}
          </label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover outline-none transition-all bg-white text-text-primary appearance-none cursor-pointer"
          >
            <option value="hemstadning">{lang === 'EN' ? 'Home Cleaning' : 'Hemstädning'}</option>
            <option value="storstadning">{lang === 'EN' ? 'Deep Cleaning' : 'Storstädning'}</option>
            <option value="flyttstadning">{lang === 'EN' ? 'Move-Out Cleaning' : 'Flyttstädning'}</option>
            <option value="byggstadning">{lang === 'EN' ? 'Construction Cleaning' : 'Byggstädning'}</option>
            <option value="foretagsstadning">{lang === 'EN' ? 'Office Cleaning' : 'Företagsstädning'}</option>
            <option value="fonsterputsning">{lang === 'EN' ? 'Window Cleaning' : 'Fönsterputsning'}</option>
          </select>
        </div>

        <div className="mt-2 flex items-start gap-3 bg-green-50 text-green-800 p-4 rounded-xl text-sm border border-green-100">
          <ShieldCheck className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
          <p>
            <strong>{lang === 'EN' ? '100% Satisfaction Guarantee:' : '100% Kundnöjdhetsgaranti:'}</strong> {lang === 'EN' ? 'We guarantee a flawless result. If you are not satisfied with what was ordered, we fix it for free.' : 'Skulle du inte vara nöjd med det som beställts, åtgärdar vi det givetvis kostnadsfritt.'}
          </p>
        </div>

        <button
          type="submit"
          className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 mt-2 flex items-center justify-center gap-2 shadow-md group transition-all"
        >
          {lang === 'EN' ? 'See price & book' : 'Se ditt pris och boka'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};
