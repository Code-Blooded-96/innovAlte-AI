import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are InnovAIte Assistant, an expert startup/hackathon idea generator and AI Co-Founder. 

For each user request, return ONLY valid JSON (no explanatory text before or after). Your JSON must have this exact structure:

{
  "ideas": [
    {
      "title": "string - compelling project title",
      "tagline": "string - short catchy tagline under 15 words",
      "problem": "string - clear problem statement (2-3 sentences)",
      "solution": "string - proposed solution (2-3 sentences)",
      "features": ["array of 5-7 key feature descriptions"],
      "tech_stack": ["array of 6-10 technologies to use"],
      "architecture": "string - ASCII diagram showing system architecture with components and data flow",
      "roadmap": [
        {
          "phase": "Day 1" or "Week 1" etc,
          "tasks": ["array of 3-5 specific tasks for this phase"]
        }
      ],
      "feasibility": {
        "technical": number 1-10,
        "time_days": number of days needed,
        "market_fit": number 1-10
      },
      "persona": "string - detailed target user persona (2-3 sentences)",
      "monetization": "string - monetization strategy (2-3 sentences)",
      "task_breakdown": [
        {
          "area": "frontend" | "backend" | "AI/ML" | "DevOps" | "UI/UX",
          "tasks": ["array of 4-6 specific tasks"],
          "estimated_hours": number
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the JSON structure above - no other text
2. Ensure all ideas are unique and distinct from each other
3. Make ideas practical and buildable with the given constraints
4. Architecture should be a simple ASCII diagram (use |, -, +, [ ], etc.)
5. Total estimated hours across all task_breakdown areas should match time_days * 8
6. Be specific and actionable in all descriptions
7. If you cannot produce valid JSON, return {"error": "could not produce json"}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      domain, 
      audience, 
      difficulty, 
      time_available_days, 
      skills, 
      mode, 
      constraints,
      multi_idea_count = 3 
    } = await req.json();

    console.log('Generating ideas with params:', { 
      domain, 
      audience, 
      difficulty, 
      time_available_days, 
      mode 
    });

    // Validate required fields
    if (!domain || !audience || !difficulty || !time_available_days || !mode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: domain, audience, difficulty, time_available_days, mode' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build user prompt
    const userPrompt = `Generate ${multi_idea_count} unique, buildable project ideas with these parameters:

Domain: ${domain}
Target Audience: ${audience}
Difficulty Level: ${difficulty}
Time Available: ${time_available_days} days
Project Mode: ${mode}
Skills: ${skills || 'Not specified'}
Constraints: ${constraints || 'None specified'}

Requirements:
- Each idea must be completely different from the others
- Ideas should be feasible within the time constraint
- Match the difficulty level appropriately
- Consider the target audience's needs
- Respect all constraints mentioned
- Provide complete details for each idea following the JSON structure`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI Gateway error: ${response.status}` }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Raw AI response:', generatedContent.substring(0, 200));

    // Parse the JSON response
    let parsedData;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedData = JSON.parse(cleanContent);
      
      // Validate structure
      if (!parsedData.ideas || !Array.isArray(parsedData.ideas)) {
        throw new Error('Invalid response structure: missing ideas array');
      }
      
      console.log(`Successfully generated ${parsedData.ideas.length} ideas`);
      
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Content that failed to parse:', generatedContent);
      
      // Attempt regex extraction as fallback
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch {
          return new Response(
            JSON.stringify({ error: 'Failed to parse AI response. Please try again.' }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'AI did not return valid JSON. Please try again.' }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    return new Response(
      JSON.stringify(parsedData), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in generate-idea function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
