/**
 * Integration test for the complete wedding planning flow
 * Tests AI Planner, Ritual Task Generation, and Conflict Detection working together
 */

import { ritualTaskGenerator } from '@/lib/ai/ritual-task-generator';
import { conflictDetector } from '@/lib/ai/conflict-detector';
import { generateRitualTasks, detectConflicts } from '@/lib/api/ritual-conflicts';
import { COMMON_RITUALS } from '@/lib/ai/ritual-types';

// Mock the API functions to use our actual implementations
jest.mock('@/lib/api/ritual-conflicts', () => ({
  generateRitualTasks: jest.fn(async (weddingId, request) => {
    return ritualTaskGenerator.generateTasks({
      weddingId,
      ...request
    });
  }),
  detectConflicts: jest.fn(async (weddingId, request) => {
    return conflictDetector.detectConflicts({
      weddingId,
      ...request
    });
  })
}));

describe('Wedding Planning Integration Flow', () => {
  const mockWeddingId = 'test-wedding-integration';
  const mockWeddingDate = '2024-06-15';
  
  describe('Complete Wedding Planning Workflow', () => {
    it('should generate ritual tasks and detect conflicts for a typical Sri Lankan wedding', async () => {
      // Step 1: Define wedding with multiple rituals
      const rituals = [
        COMMON_RITUALS.PORUWA,
        COMMON_RITUALS.RECEPTION,
        COMMON_RITUALS.HOME_COMING
      ];
      
      // Step 2: Generate ritual tasks
      const ritualResponse = await generateRitualTasks(mockWeddingId, {
        rituals,
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      });
      
      expect(ritualResponse.tasks).toHaveLength(13); // 6 Poruwa + 4 Reception + 3 Home Coming
      expect(ritualResponse.recommendations.length).toBeGreaterThan(0);
      expect(ritualResponse.culturalNotes.length).toBeGreaterThan(0);
      
      // Step 3: Create events based on rituals (with intentional conflicts)
      const events = [
        {
          id: 'event-1',
          name: 'Poruwa Ceremony',
          date: '2024-06-15',
          startTime: '10:00',
          endTime: '12:00',
          vendorIds: ['vendor-1', 'vendor-2']
        },
        {
          id: 'event-2',
          name: 'Reception',
          date: '2024-06-15',
          startTime: '11:30', // Intentional overlap with Poruwa
          endTime: '16:00',
          vendorIds: ['vendor-2', 'vendor-3'] // vendor-2 double-booked
        },
        {
          id: 'event-3',
          name: 'Home Coming',
          date: '2024-06-16',
          startTime: '09:00',
          endTime: '11:00',
          vendorIds: ['vendor-4']
        }
      ];
      
      const vendors = [
        {
          id: 'vendor-1',
          name: 'Poruwa Officiant',
          serviceTypes: ['officiant'],
          availability: ['2024-06-15'],
          culturalSpecialties: ['poruwa_ceremony']
        },
        {
          id: 'vendor-2',
          name: 'Event Venue',
          serviceTypes: ['venue'],
          availability: ['2024-06-15'],
          culturalSpecialties: []
        },
        {
          id: 'vendor-3',
          name: 'Catering Service',
          serviceTypes: ['catering'],
          availability: ['2024-06-15'],
          culturalSpecialties: ['traditional_food']
        },
        {
          id: 'vendor-4',
          name: 'Home Venue',
          serviceTypes: ['venue'],
          availability: ['2024-06-16'],
          culturalSpecialties: []
        }
      ];
      
      // Step 4: Detect conflicts
      const conflictResponse = await detectConflicts(mockWeddingId, {
        events,
        vendors,
        weddingType: 'traditional_sinhalese',
        culturalPreferences: ['auspicious_timing', 'traditional_ceremonies']
      });
      
      expect(conflictResponse.conflicts.length).toBeGreaterThan(0);
      expect(conflictResponse.warnings.length).toBeGreaterThan(0);
      expect(conflictResponse.suggestions.length).toBeGreaterThan(0);
      
      // Should detect timing conflict
      const timingConflicts = conflictResponse.conflicts.filter(c => c.type === 'timing');
      expect(timingConflicts.length).toBeGreaterThan(0);
      
      // Should detect vendor conflict (double-booking)
      const vendorConflicts = conflictResponse.conflicts.filter(c => c.type === 'vendor');
      expect(vendorConflicts.length).toBeGreaterThan(0);
      
      // Should provide resolution options
      conflictResponse.conflicts.forEach(conflict => {
        expect(conflict.resolutionOptions.length).toBeGreaterThan(0);
      });
      
      // Should have risk assessment
      expect(conflictResponse.riskAssessment.overallRisk).toBeDefined();
      expect(conflictResponse.riskAssessment.criticalIssues).toBeGreaterThan(0);
    });
    
    it('should handle cultural considerations appropriately', async () => {
      const events = [
        {
          id: 'event-1',
          name: 'Poruwa Ceremony',
          date: '2024-06-15',
          startTime: '10:00',
          endTime: '12:00',
          vendorIds: ['vendor-1']
        }
      ];
      
      const vendors = [
        {
          id: 'vendor-1',
          name: 'Modern DJ Service',
          serviceTypes: ['entertainment'],
          availability: ['2024-06-15'],
          culturalSpecialties: ['modern_music'] // Not appropriate for traditional ceremony
        }
      ];
      
      const conflictResponse = await detectConflicts(mockWeddingId, {
        events,
        vendors,
        weddingType: 'traditional_sinhalese',
        culturalPreferences: ['traditional_ceremonies', 'auspicious_timing']
      });
      
      // Should provide cultural recommendations
      expect(conflictResponse.suggestions.some(s => s.includes('cultural'))).toBe(true);
      expect(conflictResponse.suggestions.some(s => s.includes('traditional'))).toBe(true);
    });
    
    it('should validate ritual configuration properly', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const validation = ritualTaskGenerator.validateRitualConfiguration(
        [COMMON_RITUALS.PORUWA, COMMON_RITUALS.ENGAGEMENT],
        futureDate.toISOString()
      );
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThanOrEqual(0);
      expect(validation.errors).toHaveLength(0);
    });
    
    it('should generate appropriate timeline with status tracking', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const timeline = ritualTaskGenerator.getRitualTimeline(
        [COMMON_RITUALS.PORUWA],
        futureDate.toISOString()
      );
      
      expect(timeline).toHaveLength(1);
      expect(timeline[0].ritual).toBe(COMMON_RITUALS.PORUWA);
      expect(timeline[0].tasks.length).toBeGreaterThan(0);
      
      // All tasks should have status
      timeline[0].tasks.forEach(taskItem => {
        expect(['upcoming', 'due_soon', 'overdue']).toContain(taskItem.status);
        expect(taskItem.dueDate).toBeDefined();
      });
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    it('should handle empty input gracefully', async () => {
      const ritualResponse = await generateRitualTasks(mockWeddingId, {
        rituals: [],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      });
      
      expect(ritualResponse.tasks).toHaveLength(0);
      expect(ritualResponse.conflicts).toHaveLength(0);
      expect(ritualResponse.recommendations.length).toBeGreaterThan(0);
    });
    
    it('should handle invalid dates', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      
      const validation = ritualTaskGenerator.validateRitualConfiguration(
        [COMMON_RITUALS.PORUWA],
        pastDate.toISOString()
      );
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Wedding date cannot be in the past');
    });
    
    it('should handle conflicting vendor requirements', async () => {
      const events = [
        {
          id: 'event-1',
          name: 'Event A',
          date: '2024-06-15',
          startTime: '10:00',
          endTime: '12:00',
          vendorIds: ['vendor-1']
        },
        {
          id: 'event-2',
          name: 'Event B',
          date: '2024-06-15',
          startTime: '11:00',
          endTime: '13:00',
          vendorIds: ['vendor-1'] // Same vendor, overlapping times
        }
      ];
      
      const vendors = [
        {
          id: 'vendor-1',
          name: 'Exclusive Vendor',
          serviceTypes: ['exclusive_service'],
          availability: ['2024-06-15'],
          culturalSpecialties: []
        }
      ];
      
      const conflictResponse = await detectConflicts(mockWeddingId, {
        events,
        vendors,
        weddingType: 'traditional',
        culturalPreferences: []
      });
      
      expect(conflictResponse.conflicts.length).toBeGreaterThan(0);
      const vendorConflicts = conflictResponse.conflicts.filter(c => c.type === 'vendor');
      expect(vendorConflicts.length).toBeGreaterThan(0);
    });
  });
  
  describe('Cultural Integration', () => {
    it('should provide culturally appropriate recommendations', async () => {
      const rituals = [COMMON_RITUALS.PORUWA, COMMON_RITUALS.RECEPTION];
      
      const response = await generateRitualTasks(mockWeddingId, {
        rituals,
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      });
      
      // Should include cultural recommendations
      expect(response.recommendations.some(r => r.includes('astrologer'))).toBe(true);
      expect(response.recommendations.some(r => r.includes('traditional'))).toBe(true);
      expect(response.recommendations.some(r => r.includes('family elders'))).toBe(true);
      
      // Should include cultural notes
      expect(response.culturalNotes.some(n => n.includes('sacred'))).toBe(true);
      expect(response.culturalNotes.some(n => n.includes('tradition'))).toBe(true);
    });
    
    it('should handle mixed wedding types appropriately', async () => {
      const events = [
        {
          id: 'event-1',
          name: 'Traditional Ceremony',
          date: '2024-06-15',
          startTime: '10:00',
          endTime: '12:00',
          vendorIds: ['vendor-1']
        },
        {
          id: 'event-2',
          name: 'Modern Reception',
          date: '2024-06-15',
          startTime: '14:00',
          endTime: '18:00',
          vendorIds: ['vendor-2']
        }
      ];
      
      const vendors = [
        {
          id: 'vendor-1',
          name: 'Traditional Officiant',
          serviceTypes: ['officiant'],
          availability: ['2024-06-15'],
          culturalSpecialties: ['traditional_ceremonies']
        },
        {
          id: 'vendor-2',
          name: 'Modern DJ',
          serviceTypes: ['entertainment'],
          availability: ['2024-06-15'],
          culturalSpecialties: ['modern_entertainment']
        }
      ];
      
      const conflictResponse = await detectConflicts(mockWeddingId, {
        events,
        vendors,
        weddingType: 'mixed_traditional_modern',
        culturalPreferences: ['blend_traditions', 'respect_customs']
      });
      
      // Should provide balanced recommendations
      expect(conflictResponse.suggestions.length).toBeGreaterThan(0);
    });
  });
});