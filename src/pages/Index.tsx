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
      <footer className="border-t border-border mt-16 bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">InnovAIte</h3>
              <p className="text-muted-foreground text-sm">
                The AI Innovation Engine — From idea spark to execution plan in seconds.
              </p>
              <p className="text-base font-semibold text-foreground mt-4">
                Built by team <span className="text-primary">Code-Blooded</span>
              </p>
            </div>

            {/* Contact Section */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-foreground mb-4">Contact Us</h4>
              <div className="flex flex-col gap-2">
                <a 
                  href="mailto:ccodeblooded@gmail.com" 
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  ccodeblooded@gmail.com
                </a>
                <div className="flex justify-center gap-4 mt-2">
                  <a 
                    href="https://www.instagram.com/codeblooded96/?utm_source=ig_web_button_share_sheet" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://x.com/Code_Blooded_96" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Team Section */}
            <div className="text-center md:text-right">
              <h4 className="text-lg font-semibold text-foreground mb-4">Our Team</h4>
              <div className="flex flex-col gap-2">
                <a 
                  href="https://linkedin.com/in/shashank-bhavihalli" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Shashank
                </a>
                <a 
                  href="https://linkedin.com/in/c-hemadri" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Hemadri
                </a>
                <a 
                  href="https://linkedin.com/in/aditya-b-p" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Aditya
                </a>
                <a 
                  href="https://linkedin.com/in/mallikarjun-patil-bb5634340" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Mallikarjun
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-6 text-center text-muted-foreground text-sm">
            <p>Powered by AI • Built with React & Lovable Cloud</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
