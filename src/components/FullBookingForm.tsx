import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Send, MapPin, Maximize, Sparkles, User, Mail, Phone, Loader2, CheckCircle2 } from 'lucide-react';

export const FullBookingForm: React.FC = () => {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    service: searchParams.get('service') || 'hemstadning',
    zipCode: searchParams.get('zip') || '',
    sqm: searchParams.get('sqm') || '',
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [zipError, setZipError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.zipCode.length > 0 && !formData.zipCode.startsWith('1')) {
      setZipError(lang === 'EN' ? 'Sorry, we are not available here yet' : 'Tyvärr finns vi inte här ännu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("email", formData.email);
      formPayload.append("phone", formData.phone);
      formPayload.append("Tjänst", formData.service);
      formPayload.append("Postnummer", formData.zipCode);
      formPayload.append("Boarea (kvm)", formData.sqm);
      formPayload.append("Meddelande", formData.message);
      formPayload.append("subject", "Ny Bokningsförfrågan från Stodona Hemsida");

      // Skickar till Formspree
      const response = await fetch('https://formspree.io/f/xojkdewo', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formPayload
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        throw new Error('Något gick fel vid skickandet.');
      }
    } catch (err) {
      alert("Ett fel uppstod. Vänligen försök igen senare.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-text-primary/5 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-bold mb-4 text-text-primary">
          {lang === 'EN' ? 'Thank you for your booking!' : 'Tack för din bokning!'}
        </h3>
        <p className="text-lg text-text-secondary max-w-md mx-auto">
          {lang === 'EN' 
            ? 'We have received your details and will contact you shortly with a price proposal and confirmation.' 
            : 'Vi har tagit emot dina uppgifter och återkommer till dig inom kort med prisförslag och bekräftelse.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-text-primary/5">
      <h3 className="text-2xl font-bold mb-2 text-text-primary">
        {lang === 'EN' ? 'Booking Details' : 'Bokningsuppgifter'}
      </h3>
      <p className="text-text-secondary mb-8">
        {lang === 'EN' ? 'Fill out the form below and we will get back to you.' : 'Fyll i formuläret nedan så återkommer vi till dig.'}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Service Type */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cta-hover" />
              {lang === 'EN' ? 'Cleaning Type' : 'Typ av städning'}
            </label>
            <select
              name="service"
              required
              value={formData.service}
              onChange={handleChange}
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

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cta-hover" />
              {lang === 'EN' ? 'Postal Code' : 'Postnummer'}
            </label>
            <input
              type="text"
              name="zipCode"
              required
              value={formData.zipCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').substring(0, 5);
                setFormData(prev => ({ ...prev, zipCode: val }));
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
              {lang === 'EN' ? 'Living Area (sqm)' : 'Boyta (kvm)'}
            </label>
            <input
              type="number"
              name="sqm"
              required
              min="10"
              max="1000"
              value={formData.sqm}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover outline-none transition-all text-text-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <hr className="border-text-primary/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-cta-hover" />
              {lang === 'EN' ? 'Name' : 'Namn'}
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover outline-none transition-all text-text-primary"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cta-hover" />
              {lang === 'EN' ? 'Email' : 'E-post'}
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover outline-none transition-all text-text-primary"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-cta-hover" />
              {lang === 'EN' ? 'Phone Number' : 'Telefonnummer'}
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover outline-none transition-all text-text-primary"
            />
          </div>

          {/* Message */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              {lang === 'EN' ? 'Additional Information (optional)' : 'Övrig information (frivilligt)'}
            </label>
            <textarea
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-text-primary/10 focus:border-cta-hover focus:ring-1 focus:ring-cta-hover outline-none transition-all text-text-primary resize-none"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary bg-cta-hover text-text-primary hover:bg-text-primary hover:text-bg-primary py-4 mt-8 flex items-center justify-center gap-2 shadow-md transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              {lang === 'EN' ? 'Send Booking Request' : 'Skicka Bokningsförfrågan'}
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
        <p className="text-xs text-center text-text-secondary mt-4">
          {lang === 'EN' 
            ? 'By submitting this form, you agree to our privacy policy.' 
            : 'Genom att skicka in formuläret godkänner du vår integritetspolicy.'}
        </p>
      </form>
    </div>
  );
};
