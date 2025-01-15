import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { Database } from "@/integrations/supabase/types";

type PricingPlan = Database['public']['Tables']['pricing_plans']['Row'];

const Pricing = () => {
  const navigate = useNavigate();
  const { data: plans, isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*');

      if (error) {
        console.error('Error fetching pricing plans:', error);
        return [];
      }
      
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container mx-auto py-24 flex-grow">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Loading pricing plan...</h1>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const plan = plans?.[0];

  if (!plan) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto py-24">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold">Simple, Transparent Pricing</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to streamline your hiring process
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="flex items-baseline text-3xl font-bold">
                    <DollarSign className="w-5 h-5" />
                    {plan.price_monthly}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-primary mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/signup')}
                  >
                    Start Free Trial
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">
                14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
