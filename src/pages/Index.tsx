import { useState } from "react";
import { IdeaGeneratorForm } from "@/components/IdeaGeneratorForm";
import { IdeaCard } from "@/components/IdeaCard";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import heroBg from "@/assets/hero-bg.jpg";

interface Idea {
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  features: string[];
  tech_stack: string[];
  architecture: string;
  roadmap: Array<{ phase: string; tasks: string[] }>;
  feasibility: {
    technical: number;
    time_days: number;
    market_fit: number;
  };
  persona: string;
  monetization: string;
  task_breakdown: Array<{
    area: string;
    tasks: string[];
    estimated_hours: number;
  }>;
}

const Index = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (formData: any) => {
    setIsLoading(true);
    setIdeas([]);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-idea`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ ...formData, multi_idea_count: 3 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ideas');
      }

      const data = await response.json();
      
      if (data.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
        toast.success("3 amazing ideas generated!");
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary text-white">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Lightbulb className="h-10 w-10" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              InnovAIte
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              From idea spark to execution plan — in seconds
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Your AI Co-Founder that generates buildable project ideas with complete architecture, 
              roadmaps, and feasibility scores. Perfect for hackathons, startups, and learning.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12 animate-slide-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Generate Your Next Big Idea
            </h2>
            <p className="text-muted-foreground">
              Tell us about your project, and we'll generate 3 unique, buildable ideas
            </p>
          </div>
          <IdeaGeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        {/* Results Section */}
        {ideas.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Your Generated Ideas
              </h2>
              <p className="text-muted-foreground">
                Here are 3 unique project ideas tailored to your requirements
              </p>
            </div>
            {ideas.map((idea, index) => (
              <IdeaCard key={index} idea={idea} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && ideas.length === 0 && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Ready to innovate?
            </h3>
            <p className="text-muted-foreground">
              Fill out the form above to generate your first set of AI-powered project ideas
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              <strong>InnovAIte</strong> — The AI Innovation Engine
            </p>
            <p className="text-sm mb-3">
              Powered by AI • Built with React & Lovable Cloud
            </p>
            <p className="text-base font-semibold text-foreground">
              Built by team <span className="text-primary">Code-Blooded</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
