'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Note: Alert component not available, using Card instead
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Calendar,
  MapPin,
  User,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Conflict, ConflictResolutionOption, TimingConflict, VendorConflict, CulturalConflict } from '@/lib/ai/ritual-types';
import { resolveConflict, dismissConflict } from '@/lib/api/ritual-conflicts';
import { formatDateForDisplay, formatTimeForDisplay } from '@/lib/ai/utils';

interface ConflictCardProps {
  conflict: Conflict;
  weddingId: string;
  onConflictResolved?: (conflictId: string) => void;
  onConflictDismissed?: (conflictId: string) => void;
  className?: string;
}

export function ConflictCard({ 
  conflict, 
  weddingId, 
  onConflictResolved, 
  onConflictDismissed,
  className 
}: ConflictCardProps) {
  const [selectedResolution, setSelectedResolution] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [dismissReason, setDismissReason] = useState('');

  const handleResolveConflict = async (resolutionId: string) => {
    setIsResolving(true);
    try {
      const result = await resolveConflict(weddingId, conflict.id, resolutionId);
      if (result.success) {
        onConflictResolved?.(conflict.id);
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(false);
      setSelectedResolution(null);
    }
  };

  const handleDismissConflict = async () => {
    if (!dismissReason.trim()) return;
    
    setIsDismissing(true);
    try {
      const result = await dismissConflict(weddingId, conflict.id, dismissReason);
      if (result.success) {
        onConflictDismissed?.(conflict.id);
      }
    } catch (error) {
      console.error('Failed to dismiss conflict:', error);
    } finally {
      setIsDismissing(false);
      setDismissReason('');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'timing':
        return <Clock className="h-4 w-4" />;
      case 'vendor':
        return <Users className="h-4 w-4" />;
      case 'cultural':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const renderTimingConflictDetails = (timingConflict: TimingConflict) => (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        Conflicting events on the same day:
      </div>
      <div className="space-y-2">
        {timingConflict.conflictingEvents.map((event, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-medium">{event.eventName}</div>
              <div className="text-sm text-muted-foreground">
                {formatTimeForDisplay(event.startTime)} - {formatTimeForDisplay(event.endTime)}
              </div>
              {event.overlapDuration > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {event.overlapDuration} min overlap
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {timingConflict.recommendedSlots && timingConflict.recommendedSlots.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Recommended time slots:</div>
          <div className="space-y-2">
            {timingConflict.recommendedSlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {formatDateForDisplay(slot.date)}: {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                <span className="text-xs">({slot.reason})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVendorConflictDetails = (vendorConflict: VendorConflict) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>{vendorConflict.vendorName}</span>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Conflicting bookings:
      </div>
      <div className="space-y-2">
        {vendorConflict.conflictingBookings.map((booking, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 space-y-1">
              <div className="font-medium">{booking.eventName}</div>
              <div className="text-sm text-muted-foreground">
                {formatDateForDisplay(booking.date)} at {booking.time}
              </div>
              <Badge variant="outline" className="text-xs">
                {booking.serviceType}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      
      {vendorConflict.alternativeVendors && vendorConflict.alternativeVendors.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Alternative vendors:</div>
          <div className="space-y-2">
            {vendorConflict.alternativeVendors.map((altVendor, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{altVendor.vendorName}</div>
                  <div className="text-xs text-muted-foreground">
                    Match score: {Math.round(altVendor.matchScore * 100)}%
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Available
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCulturalConflictDetails = (culturalConflict: CulturalConflict) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
        <div className="text-amber-800 text-sm">
          {culturalConflict.culturalContext}
        </div>
      </div>
      
      <div className="text-sm">
        <div className="font-medium mb-1">Tradition:</div>
        <div className="text-muted-foreground">{culturalConflict.tradition}</div>
      </div>
      
      <div className="text-sm">
        <div className="font-medium mb-1">Issue:</div>
        <div className="text-muted-foreground">{culturalConflict.violation}</div>
      </div>
      
      {culturalConflict.alternativeSuggestions.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Alternative suggestions:</div>
          <div className="space-y-2">
            {culturalConflict.alternativeSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className={`${className || ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getSeverityIcon(conflict.severity)}
            <div className="space-y-1">
              <CardTitle className="text-base">{conflict.title}</CardTitle>
              <CardDescription>{conflict.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSeverityColor(conflict.severity)}>
              {getConflictTypeIcon(conflict.type)}
              <span className="ml-1 capitalize">{conflict.severity}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Conflict-specific details */}
        {conflict.type === 'timing' && renderTimingConflictDetails(conflict as TimingConflict)}
        {conflict.type === 'vendor' && renderVendorConflictDetails(conflict as VendorConflict)}
        {conflict.type === 'cultural' && renderCulturalConflictDetails(conflict as CulturalConflict)}
        
        {/* Affected items */}
        <div className="flex flex-wrap gap-2 text-sm">
          {conflict.affectedEvents.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{conflict.affectedEvents.length} event(s)</span>
            </div>
          )}
          {conflict.affectedVendors.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{conflict.affectedVendors.length} vendor(s)</span>
            </div>
          )}
        </div>
        
        {/* Resolution options */}
        {conflict.resolutionOptions.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Resolution options:</div>
            <div className="space-y-2">
              {conflict.resolutionOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedResolution === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedResolution(option.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm">{option.title}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                      {option.actionRequired && (
                        <div className="text-xs text-blue-600 mt-1">
                          Action required: {option.actionRequired}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {option.estimatedEffort} effort
                      </Badge>
                      {option.autoResolvable && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-resolve
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedResolution && (
              <Button
                onClick={() => handleResolveConflict(selectedResolution)}
                disabled={isResolving}
                className="w-full"
              >
                {isResolving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Apply Resolution
                  </>
                )}
              </Button>
            )}
          </div>
        )}
        
        {/* Dismiss option */}
        <div className="pt-4 border-t">
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Dismiss this conflict
            </summary>
            <div className="mt-3 space-y-3">
              <textarea
                placeholder="Reason for dismissing this conflict..."
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                className="w-full p-2 text-sm border rounded-md resize-none"
                rows={3}
              />
              <Button
                onClick={handleDismissConflict}
                disabled={isDismissing || !dismissReason.trim()}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isDismissing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Dismissing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Dismiss Conflict
                  </>
                )}
              </Button>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConflictListProps {
  conflicts: Conflict[];
  weddingId: string;
  onConflictResolved?: (conflictId: string) => void;
  onConflictDismissed?: (conflictId: string) => void;
  className?: string;
}

export function ConflictList({ 
  conflicts, 
  weddingId, 
  onConflictResolved, 
  onConflictDismissed,
  className 
}: ConflictListProps) {
  if (conflicts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-medium mb-2">No conflicts detected</h3>
          <p className="text-muted-foreground">
            Your wedding planning looks great! No timing, vendor, or cultural conflicts were found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
  const warningConflicts = conflicts.filter(c => c.severity === 'warning');

  return (
    <div className={className}>
      {criticalConflicts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-600">Critical Issues</h3>
            <Badge variant="destructive">{criticalConflicts.length}</Badge>
          </div>
          <div className="space-y-4">
            {criticalConflicts.map((conflict) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                weddingId={weddingId}
                onConflictResolved={onConflictResolved}
                onConflictDismissed={onConflictDismissed}
              />
            ))}
          </div>
        </div>
      )}
      
      {warningConflicts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-600">Warnings</h3>
            <Badge variant="secondary">{warningConflicts.length}</Badge>
          </div>
          <div className="space-y-4">
            {warningConflicts.map((conflict) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                weddingId={weddingId}
                onConflictResolved={onConflictResolved}
                onConflictDismissed={onConflictDismissed}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}