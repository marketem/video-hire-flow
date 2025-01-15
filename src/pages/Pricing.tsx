import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_popular: boolean;
}

const Pricing = () => {
  const navigate = useNavigate();
  const { data: plans, isLoading } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('price_monthly');

      if (error) throw error;
      return data as PricingPlan[];
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-24">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Loading pricing plans...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Simple, Transparent Pricing</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col ${plan.is_popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary px-3 py-1 text-sm font-medium text-primary-foreground rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
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
                  variant={plan.is_popular ? "default" : "outline"}
                  onClick={() => navigate('/signup')}
                >
                  Start {plan.name} Trial
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;