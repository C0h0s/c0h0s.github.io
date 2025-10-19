import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { games } from '@/data/games';

interface Recommendation {
  title: string;
  score: number;
  reason: string;
  features: string[];
}

export const AIGameRecommender = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecommendations = async () => {
    if (!preferences.trim()) {
      toast({
        title: "Please enter your preferences",
        description: "Tell us what kind of games you're looking for!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-game-recommender', {
        body: {
          preferences: preferences.trim(),
          games: games.map(game => ({
            title: game.title,
            category: game.category,
          })),
        },
      });

      if (error) {
        throw error;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "Recommendations ready!",
          description: `Found ${data.recommendations.length} games for you`,
        });
      }
    } catch (error: any) {
      console.error('Error getting recommendations:', error);
      toast({
        title: "Oops!",
        description: error.message || "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gaming-card border-gaming-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">AI Game Recommender</CardTitle>
                <CardDescription className="text-gaming-text">
                  Tell us what you're looking for and we'll find the perfect games for you
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                What kind of games are you in the mood for?
              </label>
              <Textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="E.g., I want fast-paced action games with great graphics, or I'm looking for relaxing puzzle games to unwind..."
                className="min-h-[120px] bg-gaming-bg border-gaming-border text-white placeholder:text-gaming-text/50 resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-gaming-text">
                Be specific! Mention genres, mood, difficulty, or any special features you want
              </p>
            </div>

            <Button
              onClick={handleGetRecommendations}
              disabled={isLoading || !preferences.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding perfect games...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>

            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 mt-8"
              >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Personalized Recommendations
                </h3>
                
                <div className="space-y-3">
                  {recommendations.map((rec, index) => {
                    const game = games.find(g => g.title === rec.title);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-gaming-bg/50 border-gaming-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-lg font-semibold text-white">
                                    {rec.title}
                                  </h4>
                                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                                    {rec.score}% Match
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gaming-text">
                                  {rec.reason}
                                </p>
                                
                                {rec.features && rec.features.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {rec.features.map((feature, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs border-gaming-border text-gaming-text"
                                      >
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {game && (
                                  <Button
                                    variant="link"
                                    className="p-0 h-auto text-primary hover:text-primary/80"
                                    onClick={() => window.location.href = `/game/${game.id}`}
                                  >
                                    Play Now →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
