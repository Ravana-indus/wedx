'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EventBudgetSnippetProps {
  weddingId: string;
  eventId: string;
  eventName: string;
}

interface EventBudgetSummary {
  planned: number;
  actual: number;
  difference: number;
  currency: string;
}

export default function EventBudgetSnippet({ weddingId, eventId, eventName }: EventBudgetSnippetProps) {
  const [budgetSummary, setBudgetSummary] = useState<EventBudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventBudget();
  }, [weddingId, eventId]);

  const fetchEventBudget = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/budget-summary`);
      const data = await res.json();
      if (data.data) {
        setBudgetSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching event budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDifferenceColor = (planned: number, actual: number) => {
    const difference = actual - planned;
    if (Math.abs(difference) < planned * 0.05) return 'text-gray-600';
    if (difference > 0) return 'text-red-600';
    return 'text-green-600';
  };

  const getDifferenceIcon = (planned: number, actual: number) => {
    const difference = actual - planned;
    if (Math.abs(difference) < planned * 0.05) return <Minus className="h-3 w-3" />;
    if (difference > 0) return <TrendingUp className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const getBudgetStatus = (planned: number, actual: number) => {
    const percentage = planned > 0 ? (actual / planned) * 100 : 0;
    if (percentage > 100) return { text: 'Over Budget', color: 'destructive' };
    if (percentage > 90) return { text: 'Almost There', color: 'secondary' };
    if (percentage > 50) return { text: 'On Track', color: 'default' };
    return { text: 'Just Started', color: 'outline' };
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            {eventName} Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading budget summary...</div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetSummary) {
    return (
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            {eventName} Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No budget items for this event</div>
        </CardContent>
      </Card>
    );
  }

  const status = getBudgetStatus(budgetSummary.planned, budgetSummary.actual);
  const percentage = budgetSummary.planned > 0 ? (budgetSummary.actual / budgetSummary.planned) * 100 : 0;

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center">
            <Calculator className="h-4 w-4 mr-2" />
            {eventName} Budget
          </span>
          <Badge variant={status.color as any}>{status.text}</Badge>
        </CardTitle>
        <CardDescription className="text-xs">Event budget summary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Planned</span>
            <span className="font-medium">
              {formatCurrency(budgetSummary.planned, budgetSummary.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Actual</span>
            <span className="font-medium">
              {formatCurrency(budgetSummary.actual, budgetSummary.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Remaining</span>
            <span className={`font-medium ${getDifferenceColor(budgetSummary.planned, budgetSummary.actual)}`}>
              {formatCurrency(budgetSummary.difference, budgetSummary.currency)}
            </span>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  percentage > 100 ? 'bg-red-500' : percentage > 90 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}