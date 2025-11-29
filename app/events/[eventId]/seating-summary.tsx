'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SeatingSummary {
  tables: number;
  totalCapacity: number;
  assignedGuests: number;
  attendingGuests: number;
}

export default function SeatingSummary({ eventId }: { eventId: string }) {
  const [summary, setSummary] = useState<SeatingSummary>({
    tables: 0,
    totalCapacity: 0,
    assignedGuests: 0,
    attendingGuests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeatingSummary();
  }, [eventId]);

  const fetchSeatingSummary = async () => {
    try {
      // Fetch tables
      const tablesRes = await fetch(`/api/events/${eventId}/seating-tables`);
      const tablesData = await tablesRes.json();
      
      // Fetch assignments
      const assignmentsRes = await fetch(`/api/events/${eventId}/seating-assignments`);
      const assignmentsData = await assignmentsRes.json();
      
      // Fetch attending guests
      const guestsRes = await fetch(`/api/events/${eventId}/attending-guests`);
      const guestsData = await guestsRes.json();
      
      if (tablesData.data && assignmentsData.data && guestsData.data) {
        const tables = tablesData.data.tables || [];
        const assignments = assignmentsData.data.assignments || [];
        const attendingGuests = guestsData.data.guests || [];
        
        const totalCapacity = tables.reduce((sum: number, table: any) => sum + (table.capacity || 0), 0);
        
        setSummary({
          tables: tables.length,
          totalCapacity,
          assignedGuests: assignments.length,
          attendingGuests: attendingGuests.length
        });
      }
    } catch (error) {
      console.error('Error fetching seating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-muted-foreground">Loading seating data...</div>;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">Tables</div>
          <div className="font-medium">{summary.tables}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Capacity</div>
          <div className="font-medium">{summary.totalCapacity || 'N/A'}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Assigned</div>
          <div className="font-medium">{summary.assignedGuests}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Attending</div>
          <div className="font-medium">{summary.attendingGuests}</div>
        </div>
      </div>
      
      {summary.attendingGuests > 0 && (
        <div className="text-xs">
          <div className="text-muted-foreground">Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ 
                width: `${Math.min(100, (summary.assignedGuests / summary.attendingGuests) * 100)}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {summary.assignedGuests} of {summary.attendingGuests} guests seated
          </div>
        </div>
      )}
      
      <Link
        href={`/events/${eventId}/seating`}
        className="text-xs font-medium text-wedx-primary-700 underline-offset-2 hover:underline inline-block mt-2"
      >
        Manage seating
      </Link>
    </div>
  );
}