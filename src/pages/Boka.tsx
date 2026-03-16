import React from 'react';
import { motion } from 'motion/react';
import { QuickBookingWidget } from '../components/QuickBookingWidget';

export default function Boka() {
  return (
    <div className="flex flex-col pt-32 pb-20 min-h-screen bg-bg-primary">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Boka din städning
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg"
          >
            Fyll i dina uppgifter nedan för att se pris och boka direkt.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <QuickBookingWidget />
        </motion.div>
      </div>
    </div>
  );
}
