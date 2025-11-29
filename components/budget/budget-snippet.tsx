import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, Minus, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EventBreakdown {
  eventId: string;
  eventName: string;
  planned: number;
  actual: number;
}

interface BudgetSnippetProps {
  eventId: string;
  eventName: string;
  budgetData: EventBreakdown;
  currency: string;
}

export function BudgetSnippet({ eventId, eventName, budgetData, currency }: BudgetSnippetProps) {
  const router = useRouter();
  
  const difference = budgetData.actual - budgetData.planned;
  const isOverBudget = difference > 0;
  const isUnderBudget = difference < 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDifferenceColor = () => {
    if (isOverBudget) return 'text-red-600';
    if (isUnderBudget) return 'text-green-600';
    return 'text-gray-600';
  };

  const getDifferenceIcon = () => {
    if (isOverBudget) return <TrendingUp className="h-4 w-4" />;
    if (isUnderBudget) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getDifferenceText = () => {
    if (isOverBudget) return 'Over budget';
    if (isUnderBudget) return 'Under budget';
    return 'On budget';
  };

  const handleViewFullBudget = () => {
    router.push(`/budget?eventId=${eventId}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Budget Summary</CardTitle>
            <CardDescription>{eventName}</CardDescription>
          </div>
          <Button onClick={handleViewFullBudget} variant="outline" size="sm">
            View Full Budget
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Planned</div>
            <div className="text-lg font-semibold">
              {formatCurrency(budgetData.planned)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Actual</div>
            <div className="text-lg font-semibold">
              {formatCurrency(budgetData.actual)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Difference</div>
            <div className={`text-lg font-semibold flex items-center gap-1 ${getDifferenceColor()}`}>
              {getDifferenceIcon()}
              {formatCurrency(Math.abs(difference))}
            </div>
            <div className={`text-xs ${getDifferenceColor()}`}>
              {getDifferenceText()}
            </div>
          </div>
        </div>
        
        {/* Progress bar showing actual vs planned */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Utilization</span>
            <span className={getDifferenceColor()}>
              {budgetData.planned > 0 
                ? `${Math.round((budgetData.actual / budgetData.planned) * 100)}%`
                : '0%'
              }
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isOverBudget ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min((budgetData.actual / budgetData.planned) * 100, 100)}%`
              }}
            />
            {isOverBudget && (
              <div
                className="h-2 rounded-full bg-red-500 opacity-60"
                style={{
                  width: `${Math.min(((budgetData.actual - budgetData.planned) / budgetData.planned) * 100, 50)}%`,
                  marginTop: '-8px'
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}