import React from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

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
          className="card-rounded bg-white border border-text-primary/10 p-8 shadow-sm max-w-4xl mx-auto min-h-[600px] flex items-center justify-center"
        >
          <div className="text-center text-text-secondary">
            <div className="w-12 h-12 bg-bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Clock className="w-6 h-6 text-text-primary" />
            </div>
            <p className="font-medium text-lg text-text-primary mb-2">
              [ Bokahem Widget Integration ]
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
