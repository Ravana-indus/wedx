import { 
  Conflict, 
  TimingConflict, 
  VendorConflict, 
  CulturalConflict,
  ConflictDetectionRequest,
  ConflictDetectionResponse,
  ConflictResolutionOption
} from './ritual-types';
import { 
  timeRangesOverlap, 
  calculateOverlapDuration, 
  daysBetween,
  generateId,
  formatDateForDisplay,
  formatTimeForDisplay
} from './utils';

export class ConflictDetector {
  /**
   * Detect conflicts in wedding planning based on events, vendors, and cultural considerations
   */
  static detectConflicts(request: ConflictDetectionRequest): ConflictDetectionResponse {
    const { events, vendors, weddingType, culturalPreferences } = request;
    
    const conflicts: Conflict[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Detect timing conflicts
    const timingConflicts = this.detectTimingConflicts(events);
    conflicts.push(...timingConflicts);
    
    // Detect vendor conflicts
    const vendorConflicts = this.detectVendorConflicts(events, vendors);
    conflicts.push(...vendorConflicts);
    
    // Detect cultural conflicts
    const culturalConflicts = this.detectCulturalConflicts(events, weddingType, culturalPreferences);
    conflicts.push(...culturalConflicts);
    
    // Generate warnings and suggestions
    warnings.push(...this.generateWarnings(conflicts));
    suggestions.push(...this.generateSuggestions(conflicts, events, vendors));
    
    // Calculate risk assessment
    const riskAssessment = this.calculateRiskAssessment(conflicts);
    
    return {
      conflicts,
      warnings,
      suggestions,
      riskAssessment
    };
  }

  /**
   * Detect timing conflicts between events
   */
  private static detectTimingConflicts(events: Array<{
    id: string;
    name: string;
    date: string;
    startTime?: string;
    endTime?: string;
    vendorIds: string[];
  }>): TimingConflict[] {
    const timingConflicts: TimingConflict[] = [];
    
    // Group events by date
    const eventsByDate = this.groupEventsByDate(events);
    
    // Check for conflicts within each date
    Object.entries(eventsByDate).forEach(([date, dayEvents]) => {
      if (dayEvents.length < 2) return;
      
      // Check each pair of events for timing conflicts
      for (let i = 0; i < dayEvents.length; i++) {
        for (let j = i + 1; j < dayEvents.length; j++) {
          const event1 = dayEvents[i];
          const event2 = dayEvents[j];
          
          // Skip if either event doesn't have timing information
          if (!event1.startTime || !event1.endTime || !event2.startTime || !event2.endTime) {
            continue;
          }
          
          // Check for overlap
          if (timeRangesOverlap(event1.startTime, event1.endTime, event2.startTime, event2.endTime)) {
            const overlapDuration = calculateOverlapDuration(
              event1.startTime, event1.endTime, 
              event2.startTime, event2.endTime
            );
            
            const conflict: TimingConflict = {
              id: generateId('timing-conflict'),
              type: 'timing',
              severity: overlapDuration > 60 ? 'critical' : 'warning', // Critical if overlap > 1 hour
              title: 'Event Timing Conflict',
              description: `${event1.name} and ${event2.name} have overlapping schedules on ${formatDateForDisplay(date)}`,
              affectedEvents: [event1.id, event2.id],
              affectedVendors: [...event1.vendorIds, ...event2.vendorIds],
              conflictingEvents: [
                {
                  eventId: event1.id,
                  eventName: event1.name,
                  startTime: event1.startTime,
                  endTime: event1.endTime,
                  overlapDuration
                },
                {
                  eventId: event2.id,
                  eventName: event2.name,
                  startTime: event2.startTime,
                  endTime: event2.endTime,
                  overlapDuration
                }
              ],
              resolutionOptions: this.generateTimingConflictResolutions(event1, event2, overlapDuration),
              createdAt: new Date().toISOString(),
              status: 'active'
            };
            
            timingConflicts.push(conflict);
          }
          
          // Check for insufficient buffer time between events
          const bufferTime = this.calculateBufferTime(event1, event2);
          if (bufferTime < 30) { // Less than 30 minutes buffer
            const bufferConflict: TimingConflict = {
              id: generateId('timing-conflict'),
              type: 'timing',
              severity: 'warning',
              title: 'Insufficient Buffer Time',
              description: `Only ${bufferTime} minutes between ${event1.name} and ${event2.name}`,
              affectedEvents: [event1.id, event2.id],
              affectedVendors: [...event1.vendorIds, ...event2.vendorIds],
              conflictingEvents: [
                {
                  eventId: event1.id,
                  eventName: event1.name,
                  startTime: event1.startTime,
                  endTime: event1.endTime,
                  overlapDuration: 0
                },
                {
                  eventId: event2.id,
                  eventName: event2.name,
                  startTime: event2.startTime,
                  endTime: event2.endTime,
                  overlapDuration: 0
                }
              ],
              resolutionOptions: this.generateBufferTimeResolutions(event1, event2, bufferTime),
              createdAt: new Date().toISOString(),
              status: 'active'
            };
            
            timingConflicts.push(bufferConflict);
          }
        }
      }
    });
    
    return timingConflicts;
  }

  /**
   * Detect vendor conflicts (double-booking, availability issues)
   */
  private static detectVendorConflicts(
    events: Array<{
      id: string;
      name: string;
      date: string;
      startTime?: string;
      endTime?: string;
      vendorIds: string[];
    }>,
    vendors: Array<{
      id: string;
      name: string;
      serviceTypes: string[];
      availability: string[];
      culturalSpecialties?: string[];
    }>
  ): VendorConflict[] {
    const vendorConflicts: VendorConflict[] = [];
    
    // Create a map of vendor bookings
    const vendorBookings = this.createVendorBookingsMap(events, vendors);
    
    // Check each vendor for conflicts
    Object.entries(vendorBookings).forEach(([vendorId, bookings]) => {
      if (bookings.length < 2) return;
      
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;
      
      // Check for double-booking on the same date
      const bookingsByDate = this.groupBookingsByDate(bookings);
      
      Object.entries(bookingsByDate).forEach(([date, dayBookings]) => {
        if (dayBookings.length > 1) {
          const conflict: VendorConflict = {
            id: generateId('vendor-conflict'),
            type: 'vendor',
            severity: 'critical',
            title: 'Vendor Double-Booking',
            description: `${vendor.name} is booked for multiple events on ${formatDateForDisplay(date)}`,
            affectedEvents: dayBookings.map(b => b.eventId),
            affectedVendors: [vendorId],
            vendorId: vendor.id,
            vendorName: vendor.name,
            conflictingBookings: dayBookings.map(b => ({
              eventId: b.eventId,
              eventName: b.eventName,
              serviceType: b.serviceType,
              date: b.date,
              time: b.startTime || 'All day'
            })),
            resolutionOptions: this.generateVendorConflictResolutions(vendor, dayBookings),
            createdAt: new Date().toISOString(),
            status: 'active'
          };
          
          vendorConflicts.push(conflict);
        }
      });
      
      // Check for service type conflicts
      const serviceTypeConflicts = this.detectServiceTypeConflicts(vendor, bookings);
      vendorConflicts.push(...serviceTypeConflicts);
    });
    
    return vendorConflicts;
  }

  /**
   * Detect cultural conflicts and inappropriate timing
   */
  private static detectCulturalConflicts(
    events: Array<{
      id: string;
      name: string;
      date: string;
      startTime?: string;
      endTime?: string;
      vendorIds: string[];
    }>,
    weddingType: string,
    culturalPreferences?: string[]
  ): CulturalConflict[] {
    const culturalConflicts: CulturalConflict[] = [];
    
    // Check for inappropriate ritual sequencing
    const ritualSequenceConflicts = this.detectRitualSequenceConflicts(events);
    culturalConflicts.push(...ritualSequenceConflicts);
    
    // Check for culturally inappropriate timing
    const timingCulturalConflicts = this.detectCulturalTimingConflicts(events);
    culturalConflicts.push(...timingCulturalConflicts);
    
    // Check for vendor cultural compatibility
    const vendorCulturalConflicts = this.detectVendorCulturalConflicts(events, culturalPreferences);
    culturalConflicts.push(...vendorCulturalConflicts);
    
    return culturalConflicts;
  }

  /**
   * Helper methods for conflict detection
   */
  private static groupEventsByDate(events: Array<{ date: string; [key: string]: any }>) {
    return events.reduce((groups, event) => {
      const date = event.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
      return groups;
    }, {} as Record<string, typeof events>);
  }

  private static createVendorBookingsMap(
    events: Array<{ id: string; name: string; date: string; startTime?: string; endTime?: string; vendorIds: string[] }>,
    vendors: Array<{ id: string; name: string; serviceTypes: string[] }>
  ) {
    const bookings: Record<string, Array<{
      eventId: string;
      eventName: string;
      date: string;
      startTime?: string;
      endTime?: string;
      serviceType: string;
    }>> = {};
    
    events.forEach(event => {
      event.vendorIds.forEach(vendorId => {
        const vendor = vendors.find(v => v.id === vendorId);
        if (!vendor) return;
        
        if (!bookings[vendorId]) {
          bookings[vendorId] = [];
        }
        
        // Add booking for each service type the vendor provides
        vendor.serviceTypes.forEach(serviceType => {
          bookings[vendorId].push({
            eventId: event.id,
            eventName: event.name,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            serviceType
          });
        });
      });
    });
    
    return bookings;
  }

  private static groupBookingsByDate(bookings: Array<{ date: string; [key: string]: any }>) {
    return bookings.reduce((groups, booking) => {
      const date = booking.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(booking);
      return groups;
    }, {} as Record<string, typeof bookings>);
  }

  private static calculateBufferTime(event1: any, event2: any): number {
    if (!event1.endTime || !event2.startTime) return 60; // Assume 60 minutes if no timing
    
    const end1 = new Date(`1970-01-01T${event1.endTime}`).getTime();
    const start2 = new Date(`1970-01-01T${event2.startTime}`).getTime();
    
    return Math.round((start2 - end1) / (1000 * 60)); // minutes
  }

  private static generateTimingConflictResolutions(event1: any, event2: any, overlapDuration: number): ConflictResolutionOption[] {
    return [
      {
        id: generateId('resolution'),
        type: 'reschedule',
        title: 'Reschedule Events',
        description: `Move ${event2.name} to avoid overlap with ${event1.name}`,
        estimatedEffort: 'medium',
        actionRequired: 'Contact venues and vendors to check availability for new timing',
        autoResolvable: false
      },
      {
        id: generateId('resolution'),
        type: 'change_vendor',
        title: 'Use Different Vendors',
        description: 'Assign different vendors to each event to reduce coordination complexity',
        estimatedEffort: 'high',
        actionRequired: 'Find and book alternative vendors for one of the events',
        autoResolvable: false
      },
      {
        id: generateId('resolution'),
        type: 'dismiss',
        title: 'Accept Overlap',
        description: 'Proceed with overlapping schedule if culturally acceptable',
        estimatedEffort: 'low',
        actionRequired: 'Ensure both families are comfortable with the overlap',
        autoResolvable: true
      }
    ];
  }

  private static generateBufferTimeResolutions(event1: any, event2: any, bufferTime: number): ConflictResolutionOption[] {
    return [
      {
        id: generateId('resolution'),
        type: 'reschedule',
        title: 'Increase Buffer Time',
        description: `Add more time between ${event1.name} and ${event2.name}`,
        estimatedEffort: 'low',
        actionRequired: 'Adjust timing to allow at least 30 minutes between events',
        autoResolvable: false
      },
      {
        id: generateId('resolution'),
        type: 'dismiss',
        title: 'Accept Short Buffer',
        description: 'Proceed with tight scheduling if logistics allow',
        estimatedEffort: 'low',
        actionRequired: 'Ensure smooth transition between events',
        autoResolvable: true
      }
    ];
  }

  private static generateVendorConflictResolutions(vendor: any, conflictingBookings: any[]): ConflictResolutionOption[] {
    return [
      {
        id: generateId('resolution'),
        type: 'change_vendor',
        title: 'Find Alternative Vendor',
        description: `Find another vendor for ${conflictingBookings[1]?.eventName || 'one event'}`,
        estimatedEffort: 'high',
        actionRequired: 'Search for and book an alternative vendor with similar services',
        autoResolvable: false
      },
      {
        id: generateId('resolution'),
        type: 'reschedule',
        title: 'Reschedule One Event',
        description: 'Move one event to a different date',
        estimatedEffort: 'medium',
        actionRequired: 'Check venue and guest availability for new date',
        autoResolvable: false
      },
      {
        id: generateId('resolution'),
        type: 'add_resource',
        title: 'Add Vendor Resources',
        description: `Ask ${vendor.name} to provide additional staff or resources`,
        estimatedEffort: 'medium',
        actionRequired: 'Discuss with vendor about handling multiple events',
        autoResolvable: false
      }
    ];
  }

  private static detectServiceTypeConflicts(vendor: any, bookings: any[]): VendorConflict[] {
    // Implementation for detecting conflicts between different service types
    // This would check if a vendor is booked for competing services
    return [];
  }

  private static detectRitualSequenceConflicts(events: any[]): CulturalConflict[] {
    // Implementation for detecting inappropriate ritual sequencing
    return [];
  }

  private static detectCulturalTimingConflicts(events: any[]): CulturalConflict[] {
    // Implementation for detecting culturally inappropriate timing
    return [];
  }

  private static detectVendorCulturalConflicts(events: any[], culturalPreferences?: string[]): CulturalConflict[] {
    // Implementation for detecting vendor cultural compatibility issues
    return [];
  }

  private static generateWarnings(conflicts: Conflict[]): string[] {
    const warnings: string[] = [];
    
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    if (criticalConflicts.length > 0) {
      warnings.push(`${criticalConflicts.length} critical conflicts require immediate attention`);
    }
    
    const warningConflicts = conflicts.filter(c => c.severity === 'warning');
    if (warningConflicts.length > 0) {
      warnings.push(`${warningConflicts.length} warnings should be reviewed`);
    }
    
    return warnings;
  }

  private static generateSuggestions(conflicts: Conflict[], events: any[], vendors: any[]): string[] {
    const suggestions: string[] = [];
    
    // Add general suggestions based on conflict types
    if (conflicts.some(c => c.type === 'timing')) {
      suggestions.push('Consider spreading events across multiple days to avoid timing conflicts');
    }
    
    if (conflicts.some(c => c.type === 'vendor')) {
      suggestions.push('Book vendors well in advance and confirm availability for all events');
    }
    
    if (conflicts.some(c => c.type === 'cultural')) {
      suggestions.push('Consult with family elders about cultural requirements and traditions');
    }
    
    suggestions.push('Regularly review and update your wedding timeline');
    suggestions.push('Maintain open communication with all vendors and family members');
    
    return suggestions;
  }

  private static calculateRiskAssessment(conflicts: Conflict[]): {
    overallRisk: 'low' | 'medium' | 'high';
    criticalIssues: number;
    warnings: number;
    recommendations: number;
  } {
    const criticalIssues = conflicts.filter(c => c.severity === 'critical').length;
    const warnings = conflicts.filter(c => c.severity === 'warning').length;
    
    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (criticalIssues > 2) overallRisk = 'high';
    else if (criticalIssues > 0 || warnings > 3) overallRisk = 'medium';
    
    return {
      overallRisk,
      criticalIssues,
      warnings,
      recommendations: Math.max(0, conflicts.length - criticalIssues - warnings)
    };
  }
}

// Export singleton instance
export const conflictDetector = ConflictDetector;