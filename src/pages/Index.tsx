import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Logo } from "@/assets";

const Index = () => {
  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 via-background to-sage-100/50">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
        <Logo className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-4">Proclean 1987</h1>
      <p className="text-xl text-muted-foreground mb-8">Professional facility management system</p>
      <Button asChild size="lg">
        <Link to="/auth">Get Started</Link>
      </Button>
    </div>
  </div>
  );
};

export default Index;
