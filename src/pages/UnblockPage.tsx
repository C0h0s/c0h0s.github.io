import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { ExternalLink, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';

const UnblockPage = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUnblock = () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Add protocol if missing
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setIsLoading(true);
    
    try {
      // Open the unblock service with the URL
      const unblockUrl = `https://nebulaservices.org/en_US/${encodeURIComponent(formattedUrl)}`;
      window.open(unblockUrl, '_blank', 'noopener,noreferrer');
      toast.success('Opening unblocked link in new window');
    } catch (error) {
      toast.error('Failed to open unblock service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnblock();
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
                  <Globe className="h-5 w-5" />
                  Enter Website URL
                </CardTitle>
                <CardDescription className="text-gaming-text">
                  Enter the URL of the website you want to access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-gaming-dark border-gaming-border text-white placeholder:text-gaming-text"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleUnblock}
                    disabled={isLoading || !url.trim()}
                    className="px-6"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Unblock
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-sm text-gaming-text">
                  <p className="mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>youtube.com</li>
                    <li>twitter.com</li>
                    <li>instagram.com</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-gaming-card border border-gaming-border rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">How it works</h2>
              <div className="space-y-3 text-gaming-text">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <p>Enter the website URL you want to access</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <p>Click "Unblock" to open the site through our proxy service</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <p>Access the website in a new tab, bypassing restrictions</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default UnblockPage;