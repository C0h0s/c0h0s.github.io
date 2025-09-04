import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { ExternalLink, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

const UnblockPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUnblock = () => {
    setIsLoading(true);
    
    try {
      window.open('https://nebulaservices.org/en_US/', '_blank', 'noopener,noreferrer');
      toast.success('Opening unblock service in new window');
    } catch (error) {
      toast.error('Failed to open unblock service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Shield className="h-10 w-10 text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Website Unblock Tool
              </h1>
              <p className="text-gaming-text text-lg">
                Access blocked websites through our secure proxy service
              </p>
            </div>

            <Card className="bg-gaming-card border-gaming-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Unblock Websites
                </CardTitle>
                <CardDescription className="text-gaming-text">
                  Access blocked websites through our service
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button 
                  onClick={handleUnblock}
                  disabled={isLoading}
                  className="px-8 py-4 text-lg"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Open Unblock Service
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default UnblockPage;