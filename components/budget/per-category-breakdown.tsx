import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  planned: number;
  actual: number;
}

interface PerCategoryBreakdownProps {
  byCategory: CategoryBreakdown[];
  onCategoryClick?: (categoryId: string) => void;
  currency: string;
  activeCategoryId?: string;
}

export function PerCategoryBreakdown({ 
  byCategory, 
  onCategoryClick, 
  currency,
  activeCategoryId 
}: PerCategoryBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDifference = (planned: number, actual: number) => actual - planned;
  
  const getDifferenceColor = (planned: number, actual: number) => {
    const difference = getDifference(planned, actual);
    if (Math.abs(difference) < planned * 0.05) return 'text-gray-600';
    if (difference > 0) return 'text-red-600';
    return 'text-green-600';
  };

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryClick) {
      onCategoryClick(categoryId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget by Category</CardTitle>
        <CardDescription>
          Click a category to filter the line items table below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Category</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byCategory.map((category) => {
              const difference = getDifference(category.planned, category.actual);
              const isActive = activeCategoryId === category.categoryId;
              
              return (
                <TableRow 
                  key={category.categoryId}
                  className={`cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-wedx-primary-50 border-wedx-primary-200' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleCategoryClick(category.categoryId)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.categoryName}</span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active Filter
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(category.planned)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(category.actual)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getDifferenceColor(category.planned, category.actual)}`}>
                    {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {byCategory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories with budget items
          </div>
        )}
      </CardContent>
    </Card>
  );
}