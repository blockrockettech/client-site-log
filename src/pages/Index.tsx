import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

const Index = () => {
  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
        <Building2 className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl font-bold text-foreground mb-4">FacilityPro</h1>
      <p className="text-xl text-muted-foreground mb-8">Professional facility management system</p>
      <Button asChild size="lg">
        <Link to="/auth">Get Started</Link>
      </Button>
    </div>
  </div>
  );
};

export default Index;
