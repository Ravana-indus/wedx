import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface SummaryCardsProps {
  totals: {
    planned: number;
    actual: number;
  };
  currency: string;
}

export function SummaryCards({ totals, currency }: SummaryCardsProps) {
  const difference = totals.actual - totals.planned;
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Planned</CardTitle>
          <CardDescription className="text-xs">Your budget plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totals.planned)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Actual</CardTitle>
          <CardDescription className="text-xs">What you've spent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totals.actual)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Difference</CardTitle>
          <CardDescription className="text-xs">
            {getDifferenceText()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold flex items-center gap-2 ${getDifferenceColor()}`}>
            {getDifferenceIcon()}
            {formatCurrency(Math.abs(difference))}
          </div>
          <div className={`text-sm mt-1 ${getDifferenceColor()}`}>
            {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}