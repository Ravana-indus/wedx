import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventBreakdown {
  eventId: string | null;
  eventName: string;
  planned: number;
  actual: number;
}

interface PerEventBreakdownProps {
  byEvent: EventBreakdown[];
  onEventClick?: (eventId: string | null) => void;
  currency: string;
  activeEventId?: string | null;
}

export function PerEventBreakdown({ 
  byEvent, 
  onEventClick, 
  currency,
  activeEventId 
}: PerEventBreakdownProps) {
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

  const handleEventClick = (eventId: string | null) => {
    if (onEventClick) {
      onEventClick(eventId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget by Event</CardTitle>
        <CardDescription>
          Click an event to filter the line items table below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Event</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {byEvent.map((event) => {
              const difference = getDifference(event.planned, event.actual);
              const isActive = activeEventId === event.eventId;
              
              return (
                <TableRow 
                  key={event.eventId || 'general'}
                  className={`cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-wedx-primary-50 border-wedx-primary-200' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleEventClick(event.eventId)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.eventName}</span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active Filter
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(event.planned)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(event.actual)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${getDifferenceColor(event.planned, event.actual)}`}>
                    {difference >= 0 ? '+' : ''}{formatCurrency(difference)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {byEvent.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No events with budget items
          </div>
        )}
      </CardContent>
    </Card>
  );
}