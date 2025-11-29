import { RitualTaskGenerator } from '@/lib/ai/ritual-task-generator';
import { COMMON_RITUALS } from '@/lib/ai/ritual-types';

describe('RitualTaskGenerator', () => {
  const mockWeddingDate = '2024-06-15';
  const mockWeddingId = 'test-wedding-1';

  describe('generateTasks', () => {
    it('should generate tasks for Poruwa ceremony', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [COMMON_RITUALS.PORUWA],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      expect(response.tasks).toHaveLength(6); // Poruwa has 6 tasks
      expect(response.tasks[0].title).toBe('Book Poruwa ceremony venue');
      expect(response.tasks[0].category).toBe('logistics');
      expect(response.tasks[0].priority).toBe('high');
      expect(response.recommendations).toContain('Consider consulting with an experienced astrologer for auspicious timing');
      expect(response.culturalNotes).toContain('The Poruwa ceremony is a sacred tradition that symbolizes the union of two families');
    });

    it('should generate tasks for multiple rituals', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [COMMON_RITUALS.PORUWA, COMMON_RITUALS.RECEPTION],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      expect(response.tasks.length).toBeGreaterThan(6); // More than just Poruwa tasks
      expect(response.tasks.some(task => task.ritualType === 'reception')).toBe(true);
      expect(response.recommendations.length).toBeGreaterThan(0);
      expect(response.culturalNotes.length).toBeGreaterThan(0);
    });

    it('should sort tasks by priority and timing', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [COMMON_RITUALS.PORUWA],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      // High priority tasks should come first
      const highPriorityTasks = response.tasks.filter(task => task.priority === 'high');
      const mediumPriorityTasks = response.tasks.filter(task => task.priority === 'medium');
      
      const firstHighPriorityIndex = response.tasks.findIndex(task => task.priority === 'high');
      const firstMediumPriorityIndex = response.tasks.findIndex(task => task.priority === 'medium');
      
      if (highPriorityTasks.length > 0 && mediumPriorityTasks.length > 0) {
        expect(firstHighPriorityIndex).toBeLessThan(firstMediumPriorityIndex);
      }
    });

    it('should handle empty rituals array', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      expect(response.tasks).toHaveLength(0);
      expect(response.recommendations).toHaveLength(3); // General recommendations
      expect(response.culturalNotes).toHaveLength(3); // General notes
    });

    it('should handle unknown ritual types', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: ['unknown_ritual'],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      expect(response.tasks).toHaveLength(0);
      expect(response.recommendations).toHaveLength(3); // General recommendations
      expect(response.culturalNotes).toHaveLength(3); // General notes
    });
  });

  describe('generateTasksForRitual', () => {
    it('should generate tasks for a specific ritual', () => {
      const tasks = RitualTaskGenerator.generateTasksForRitual(COMMON_RITUALS.PORUWA, mockWeddingDate);

      expect(tasks).toHaveLength(6);
      expect(tasks[0].ritualType).toBe(COMMON_RITUALS.PORUWA);
      expect(tasks.every(task => task.id.startsWith('ritual-task-'))).toBe(true);
    });

    it('should return empty array for unknown ritual', () => {
      const tasks = RitualTaskGenerator.generateTasksForRitual('unknown_ritual', mockWeddingDate);

      expect(tasks).toHaveLength(0);
    });
  });

  describe('getRitualTimeline', () => {
    it('should generate timeline with status indicators', () => {
      const timeline = RitualTaskGenerator.getRitualTimeline(
        [COMMON_RITUALS.PORUWA],
        mockWeddingDate
      );

      expect(timeline).toHaveLength(1);
      expect(timeline[0].ritual).toBe(COMMON_RITUALS.PORUWA);
      expect(timeline[0].tasks).toHaveLength(6);
      expect(timeline[0].tasks[0].status).toBeDefined();
      expect(['upcoming', 'due_soon', 'overdue']).toContain(timeline[0].tasks[0].status);
    });

    it('should handle multiple rituals in timeline', () => {
      const timeline = RitualTaskGenerator.getRitualTimeline(
        [COMMON_RITUALS.PORUWA, COMMON_RITUALS.RECEPTION],
        mockWeddingDate
      );

      expect(timeline).toHaveLength(2);
      expect(timeline.map(item => item.ritual)).toContain(COMMON_RITUALS.PORUWA);
      expect(timeline.map(item => item.ritual)).toContain(COMMON_RITUALS.RECEPTION);
    });
  });

  describe('validateRitualConfiguration', () => {
    it('should validate valid configuration', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const validation = RitualTaskGenerator.validateRitualConfiguration(
        [COMMON_RITUALS.PORUWA],
        futureDate.toISOString()
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect past wedding date', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      
      const validation = RitualTaskGenerator.validateRitualConfiguration(
        [COMMON_RITUALS.PORUWA],
        pastDate.toISOString()
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Wedding date cannot be in the past');
    });

    it('should detect conflicting rituals', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const validation = RitualTaskGenerator.validateRitualConfiguration(
        [COMMON_RITUALS.PORUWA, 'religious_ceremony'],
        futureDate.toISOString()
      );

      expect(validation.warnings).toContain('Consider scheduling Poruwa and religious ceremonies on different days or with adequate time between them');
    });

    it('should check timing constraints', () => {
      const nearDate = new Date();
      nearDate.setDate(nearDate.getDate() + 1); // Very close date
      
      const validation = RitualTaskGenerator.validateRitualConfiguration(
        [COMMON_RITUALS.ENGAGEMENT],
        nearDate.toISOString()
      );

      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(error => error.includes('Engagement'))).toBe(true);
    });
  });

  describe('cultural recommendations', () => {
    it('should generate appropriate recommendations for Poruwa', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [COMMON_RITUALS.PORUWA],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      expect(response.recommendations).toContain('Consider consulting with an experienced astrologer for auspicious timing');
      expect(response.recommendations).toContain('Ensure the Poruwa structure faces the correct direction according to tradition');
      expect(response.recommendations).toContain('Prepare traditional gifts for the officiant and participants');
    });

    it('should generate appropriate recommendations for Reception', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [COMMON_RITUALS.RECEPTION],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      expect(response.recommendations).toContain('Plan the reception menu to include traditional Sri Lankan wedding sweets');
      expect(response.recommendations).toContain('Consider traditional entertainment like drummers or dancers');
    });

    it('should include general recommendations', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [COMMON_RITUALS.PORUWA],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      expect(response.recommendations).toContain('Consult with family elders about specific cultural requirements');
      expect(response.recommendations).toContain('Consider hiring vendors experienced in traditional Sri Lankan weddings');
      expect(response.recommendations).toContain('Allow extra time for cultural preparations and ceremonies');
    });
  });

  describe('cultural notes', () => {
    it('should generate appropriate cultural notes', () => {
      const request = {
        weddingId: mockWeddingId,
        rituals: [COMMON_RITUALS.PORUWA, COMMON_RITUALS.HOME_COMING],
        weddingDate: mockWeddingDate,
        currentEvents: [],
        currentVendors: []
      };

      const response = RitualTaskGenerator.generateTasks(request);

      // Poruwa notes
      expect(response.culturalNotes).toContain('The Poruwa ceremony is a sacred tradition that symbolizes the union of two families');
      
      // Home coming notes
      expect(response.culturalNotes).toContain('The home coming ceremony represents the bride\'s welcome into her new family');
      
      // General notes should not be duplicated
      const poruwaNotes = response.culturalNotes.filter(note => note.includes('Poruwa'));
      const homecomingNotes = response.culturalNotes.filter(note => note.includes('home coming'));
      expect(poruwaNotes.length).toBeGreaterThan(0);
      expect(homecomingNotes.length).toBeGreaterThan(0);
    });
  });
});