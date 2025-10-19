import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences, games } = await req.json();
    
    if (!preferences || !games) {
      return new Response(
        JSON.stringify({ error: 'Missing preferences or games data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating game recommendations for preferences:', preferences);

    // Create a detailed prompt for the AI
    const systemPrompt = `You are an expert gaming advisor. Analyze the available games and recommend the best matches based on user preferences.

Available games:
${JSON.stringify(games, null, 2)}

User preferences: ${preferences}

Please recommend 3-5 games that best match the user's preferences. For each recommendation, provide:
1. The game title (must match exactly from the available games)
2. A match score (0-100)
3. A brief explanation of why it's a good match
4. Key features that align with preferences

Format your response as a JSON array with this structure:
[
  {
    "title": "exact game title from list",
    "score": 95,
    "reason": "explanation",
    "features": ["feature1", "feature2"]
  }
]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Recommend games based on these preferences: ${preferences}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response:', aiResponse);

    // Parse the AI response
    let recommendations;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, return a formatted error
        recommendations = [{
          title: "Unable to parse recommendations",
          score: 0,
          reason: "The AI response couldn't be processed. Please try again.",
          features: []
        }];
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      recommendations = [{
        title: "Error",
        score: 0,
        reason: "Failed to parse recommendations. Please try again.",
        features: []
      }];
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-game-recommender:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
