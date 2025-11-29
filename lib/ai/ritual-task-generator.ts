import {
  RitualTask,
  RitualTaskGenerationRequest,
  RitualTaskGenerationResponse,
  Conflict,
  RitualTemplate
} from './ritual-types';
import { RITUAL_TEMPLATES, getTasksForRituals } from './ritual-templates';
import { generateId } from './utils';

export class RitualTaskGenerator {
  /**
   * Generate tasks based on configured rituals and wedding details
   */
  static generateTasks(request: RitualTaskGenerationRequest): RitualTaskGenerationResponse {
    const { rituals, weddingDate, currentEvents, currentVendors } = request;
    
    // Get ritual templates for the selected rituals
    const ritualTemplates = getTasksForRituals(rituals);
    
    // Generate tasks from templates
    const tasks = this.generateTasksFromTemplates(ritualTemplates, weddingDate);
    
    // Sort tasks by priority and estimated completion date
    const sortedTasks = this.sortTasksByPriorityAndTiming(tasks);
    
    // Generate cultural recommendations
    const recommendations = this.generateCulturalRecommendations(rituals);
    
    // Generate cultural notes
    const culturalNotes = this.generateCulturalNotes(rituals);
    
    return {
      tasks: sortedTasks,
      conflicts: [], // Will be populated by conflict detector
      recommendations,
      culturalNotes
    };
  }

  /**
   * Generate tasks from ritual templates
   */
  private static generateTasksFromTemplates(
    templates: RitualTemplate[], 
    weddingDate: string
  ): RitualTask[] {
    const tasks: RitualTask[] = [];
    const weddingDateObj = new Date(weddingDate);
    
    templates.forEach(template => {
      template.tasks.forEach(templateTask => {
        // Calculate the actual due date based on wedding date
        const dueDate = new Date(weddingDateObj);
        dueDate.setDate(dueDate.getDate() - templateTask.estimatedDaysBeforeEvent);
        
        // Create task with generated ID and calculated due date
        const task: RitualTask = {
          ...templateTask,
          id: generateId('ritual-task'),
          // Add any template-specific customizations here
        };
        
        tasks.push(task);
      });
    });
    
    return tasks;
  }

  /**
   * Sort tasks by priority and estimated completion timing
   */
  private static sortTasksByPriorityAndTiming(tasks: RitualTask[]): RitualTask[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    
    return tasks.sort((a, b) => {
      // First sort by priority (high to low)
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then sort by estimated days before event (earlier first)
      return a.estimatedDaysBeforeEvent - b.estimatedDaysBeforeEvent;
    });
  }

  /**
   * Generate cultural recommendations based on selected rituals
   */
  private static generateCulturalRecommendations(rituals: string[]): string[] {
    const recommendations: string[] = [];
    
    if (rituals.includes('poruwa')) {
      recommendations.push(
        'Consider consulting with an experienced astrologer for auspicious timing',
        'Ensure the Poruwa structure faces the correct direction according to tradition',
        'Prepare traditional gifts for the officiant and participants'
      );
    }
    
    if (rituals.includes('home_coming')) {
      recommendations.push(
        'Coordinate with both families for the welcoming ceremony timing',
        'Prepare traditional sweets and refreshments for guests'
      );
    }
    
    if (rituals.includes('reception')) {
      recommendations.push(
        'Plan the reception menu to include traditional Sri Lankan wedding sweets',
        'Consider traditional entertainment like drummers or dancers'
      );
    }
    
    if (rituals.includes('engagement')) {
      recommendations.push(
        'Ensure both families are comfortable with the engagement ceremony format',
        'Prepare traditional engagement gifts and blessings'
      );
    }
    
    if (rituals.includes('nalangu')) {
      recommendations.push(
        'Schedule the Nalangu ceremony with sufficient time before the wedding',
        'Ensure privacy and comfort for the traditional beautification process'
      );
    }
    
    // Add general recommendations
    recommendations.push(
      'Consult with family elders about specific cultural requirements',
      'Consider hiring vendors experienced in traditional Sri Lankan weddings',
      'Allow extra time for cultural preparations and ceremonies'
    );
    
    return recommendations;
  }

  /**
   * Generate cultural notes for the couple
   */
  private static generateCulturalNotes(rituals: string[]): string[] {
    const notes: string[] = [];
    
    if (rituals.includes('poruwa')) {
      notes.push(
        'The Poruwa ceremony is a sacred tradition that symbolizes the union of two families',
        'Traditional attire adds authenticity and respect to the ceremony',
        'The Jayamangala Gatha chanting creates a spiritually uplifting atmosphere'
      );
    }
    
    if (rituals.includes('home_coming')) {
      notes.push(
        'The home coming ceremony represents the bride\'s welcome into her new family',
        'This is often an intimate ceremony with close family members',
        'Traditional welcoming items symbolize prosperity and happiness'
      );
    }
    
    if (rituals.includes('reception')) {
      notes.push(
        'The reception is a celebration of your union with extended family and friends',
        'Traditional entertainment adds cultural richness to the celebration',
        'Consider dietary restrictions and preferences when planning the menu'
      );
    }
    
    if (rituals.includes('engagement')) {
      notes.push(
        'The engagement ceremony formalizes your commitment to each other',
        'This is an opportunity for both families to bond and celebrate',
        'Traditional rings and blessings symbolize your future together'
      );
    }
    
    if (rituals.includes('nalangu')) {
      notes.push(
        'The Nalangu ceremony is a traditional beautification process',
        'This ceremony is meant to prepare you physically and spiritually for marriage',
        'The natural ingredients used have symbolic and practical benefits'
      );
    }
    
    return notes;
  }

  /**
   * Generate tasks for a specific ritual type
   */
  static generateTasksForRitual(
    ritualType: string, 
    weddingDate: string
  ): RitualTask[] {
    const template = RITUAL_TEMPLATES[ritualType];
    if (!template) {
      return [];
    }
    
    const weddingDateObj = new Date(weddingDate);
    const tasks: RitualTask[] = [];
    
    template.tasks.forEach(templateTask => {
      const task: RitualTask = {
        ...templateTask,
        id: generateId('ritual-task'),
      };
      tasks.push(task);
    });
    
    return tasks;
  }

  /**
   * Get recommended timeline for ritual preparations
   */
  static getRitualTimeline(rituals: string[], weddingDate: string): {
    ritual: string;
    tasks: Array<{
      task: RitualTask;
      dueDate: string;
      status: 'upcoming' | 'due_soon' | 'overdue';
    }>;
  }[] {
    const weddingDateObj = new Date(weddingDate);
    const today = new Date();
    const timeline: any[] = [];
    
    rituals.forEach(ritualType => {
      const tasks = this.generateTasksForRitual(ritualType, weddingDate);
      const taskTimeline = tasks.map(task => {
        const dueDate = new Date(weddingDateObj);
        dueDate.setDate(dueDate.getDate() - task.estimatedDaysBeforeEvent);
        
        let status: 'upcoming' | 'due_soon' | 'overdue' = 'upcoming';
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue < 0) {
          status = 'overdue';
        } else if (daysUntilDue <= 7) {
          status = 'due_soon';
        }
        
        return {
          task,
          dueDate: dueDate.toISOString(),
          status
        };
      });
      
      timeline.push({
        ritual: ritualType,
        tasks: taskTimeline
      });
    });
    
    return timeline;
  }

  /**
   * Validate ritual configuration
   */
  static validateRitualConfiguration(rituals: string[], weddingDate: string): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const weddingDateObj = new Date(weddingDate);
    const today = new Date();
    
    // Check if wedding date is in the past
    if (weddingDateObj < today) {
      errors.push('Wedding date cannot be in the past');
    }
    
    // Check for conflicting rituals
    if (rituals.includes('poruwa') && rituals.includes('religious_ceremony')) {
      warnings.push('Consider scheduling Poruwa and religious ceremonies on different days or with adequate time between them');
    }
    
    // Check timing constraints for specific rituals
    rituals.forEach(ritualType => {
      const template = RITUAL_TEMPLATES[ritualType];
      if (template?.timingConstraints) {
        const { minDaysBeforeWedding, maxDaysBeforeWedding } = template.timingConstraints;
        
        if (minDaysBeforeWedding !== undefined) {
          const minDate = new Date(weddingDateObj);
          minDate.setDate(minDate.getDate() - minDaysBeforeWedding);
          if (minDate < today) {
            warnings.push(`${template.displayName} should be scheduled at least ${minDaysBeforeWedding} days before the wedding`);
          }
        }
        
        if (maxDaysBeforeWedding !== undefined) {
          const maxDate = new Date(weddingDateObj);
          maxDate.setDate(maxDate.getDate() - maxDaysBeforeWedding);
          if (maxDate < today) {
            errors.push(`${template.displayName} cannot be scheduled more than ${maxDaysBeforeWedding} days before the wedding`);
          }
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}

// Export a singleton instance for convenience
export const ritualTaskGenerator = RitualTaskGenerator;