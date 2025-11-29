import { RitualTemplate, COMMON_RITUALS } from './ritual-types';

// Comprehensive ritual templates for Sri Lankan weddings
export const RITUAL_TEMPLATES: Record<string, RitualTemplate> = {
  [COMMON_RITUALS.PORUWA]: {
    ritualType: COMMON_RITUALS.PORUWA,
    displayName: 'Poruwa Ceremony',
    description: 'Traditional Sinhalese wedding ceremony on a beautifully decorated platform',
    tasks: [
      {
        id: 'poruwa-1',
        title: 'Book Poruwa ceremony venue',
        description: 'Reserve a venue that can accommodate the traditional Poruwa setup with adequate space for guests',
        category: 'logistics',
        priority: 'high',
        ritualType: COMMON_RITUALS.PORUWA,
        estimatedDaysBeforeEvent: 90,
        recommendedVendorTypes: ['venue', 'event_planner'],
        culturalNotes: 'The venue should have space for the traditional Poruwa structure and guest seating'
      },
      {
        id: 'poruwa-2',
        title: 'Hire Poruwa ceremony officiant (Nekath Nilame)',
        description: 'Book an experienced officiant who can conduct the traditional Poruwa ceremony',
        category: 'ritual',
        priority: 'high',
        ritualType: COMMON_RITUALS.PORUWA,
        estimatedDaysBeforeEvent: 60,
        recommendedVendorTypes: ['officiant', 'religious_services'],
        culturalNotes: 'The Nekath Nilame should be well-versed in traditional Sinhalese customs'
      },
      {
        id: 'poruwa-3',
        title: 'Order traditional Poruwa attire',
        description: 'Arrange for traditional Kandyan or low-country wedding attire for the ceremony',
        category: 'attire',
        priority: 'high',
        ritualType: COMMON_RITUALS.PORUWA,
        estimatedDaysBeforeEvent: 45,
        recommendedVendorTypes: ['bridal_wear', 'groom_wear', 'traditional_attire'],
        dependencies: ['poruwa-1'],
        culturalNotes: 'Traditional attire is essential for the authenticity of the Poruwa ceremony'
      },
      {
        id: 'poruwa-4',
        title: 'Book Jayamangala Gatha chanters',
        description: 'Hire experienced chanters for the traditional Jayamangala Gatha (blessing chants)',
        category: 'ritual',
        priority: 'medium',
        ritualType: COMMON_RITUALS.PORUWA,
        estimatedDaysBeforeEvent: 30,
        recommendedVendorTypes: ['musicians', 'religious_services'],
        culturalNotes: 'The Jayamangala Gatha creates the sacred atmosphere for the ceremony'
      },
      {
        id: 'poruwa-5',
        title: 'Arrange Poruwa ceremonial items',
        description: 'Prepare traditional items: betel leaves, coconut oil lamp, white cloth, etc.',
        category: 'ritual',
        priority: 'medium',
        ritualType: COMMON_RITUALS.PORUWA,
        estimatedDaysBeforeEvent: 14,
        recommendedVendorTypes: ['religious_supplies', 'event_supplies'],
        culturalNotes: 'These items are essential for the traditional ceremony'
      },
      {
        id: 'poruwa-6',
        title: 'Finalize Poruva ceremony timing with astrologer',
        description: 'Confirm the auspicious timing (Nekath) for the ceremony with your family astrologer',
        category: 'ritual',
        priority: 'high',
        ritualType: COMMON_RITUALS.PORUWA,
        estimatedDaysBeforeEvent: 7,
        dependencies: ['poruwa-2'],
        culturalNotes: 'The timing must be astrologically auspicious for the couple'
      }
    ],
    timingConstraints: {
      minDaysBeforeWedding: 1,
      auspiciousDates: [] // To be filled based on astrological calculations
    },
    vendorRequirements: {
      requiredTypes: ['officiant', 'venue'],
      optionalTypes: ['musicians', 'florist', 'photographer', 'videographer'],
      culturalPreferences: ['experienced_in_poruwa', 'sinhala_speaking']
    }
  },

  [COMMON_RITUALS.HOME_COMING]: {
    ritualType: COMMON_RITUALS.HOME_COMING,
    displayName: 'Home Coming Ceremony',
    description: 'Traditional ceremony welcoming the bride to the groom\'s home',
    tasks: [
      {
        id: 'homecoming-1',
        title: 'Prepare groom\'s home for welcoming ceremony',
        description: 'Clean and decorate the entrance of the groom\'s home for the traditional welcoming',
        category: 'logistics',
        priority: 'medium',
        ritualType: COMMON_RITUALS.HOME_COMING,
        estimatedDaysBeforeEvent: 3,
        recommendedVendorTypes: ['florist', 'decorator'],
        culturalNotes: 'The entrance should be beautifully decorated with traditional items'
      },
      {
        id: 'homecoming-2',
        title: 'Arrange traditional welcoming items',
        description: 'Prepare milk rice, coconut oil lamp, and other traditional welcoming items',
        category: 'ritual',
        priority: 'medium',
        ritualType: COMMON_RITUALS.HOME_COMING,
        estimatedDaysBeforeEvent: 1,
        recommendedVendorTypes: ['catering', 'religious_supplies'],
        culturalNotes: 'These items symbolize prosperity and welcome for the bride'
      },
      {
        id: 'homecoming-3',
        title: 'Coordinate with family elders',
        description: 'Ensure all family members are informed about the traditional welcoming ceremony',
        category: 'logistics',
        priority: 'low',
        ritualType: COMMON_RITUALS.HOME_COMING,
        estimatedDaysBeforeEvent: 7,
        culturalNotes: 'Family participation is important for this intimate ceremony'
      }
    ],
    timingConstraints: {
      minDaysBeforeWedding: 0,
      maxDaysBeforeWedding: 7
    },
    vendorRequirements: {
      requiredTypes: [],
      optionalTypes: ['florist', 'catering'],
      culturalPreferences: ['understands_traditions']
    }
  },

  [COMMON_RITUALS.RECEPTION]: {
    ritualType: COMMON_RITUALS.RECEPTION,
    displayName: 'Wedding Reception',
    description: 'Celebration feast with family and friends',
    tasks: [
      {
        id: 'reception-1',
        title: 'Book reception venue',
        description: 'Reserve a venue that can accommodate your guest list and preferred reception style',
        category: 'logistics',
        priority: 'high',
        ritualType: COMMON_RITUALS.RECEPTION,
        estimatedDaysBeforeEvent: 120,
        recommendedVendorTypes: ['venue', 'event_planner'],
        culturalNotes: 'Consider venues that can accommodate traditional reception customs'
      },
      {
        id: 'reception-2',
        title: 'Hire reception catering service',
        description: 'Book a caterer who can provide traditional Sri Lankan wedding cuisine',
        category: 'food',
        priority: 'high',
        ritualType: COMMON_RITUALS.RECEPTION,
        estimatedDaysBeforeEvent: 90,
        recommendedVendorTypes: ['catering', 'traditional_catering'],
        dependencies: ['reception-1'],
        culturalNotes: 'Traditional menu should include milk rice, sweets, and ceremonial foods'
      },
      {
        id: 'reception-3',
        title: 'Arrange reception entertainment',
        description: 'Book traditional drummers, dancers, or other cultural entertainment',
        category: 'logistics',
        priority: 'medium',
        ritualType: COMMON_RITUALS.RECEPTION,
        estimatedDaysBeforeEvent: 60,
        recommendedVendorTypes: ['entertainment', 'traditional_music', 'dancers'],
        culturalNotes: 'Traditional entertainment adds cultural authenticity to the celebration'
      },
      {
        id: 'reception-4',
        title: 'Plan reception seating arrangement',
        description: 'Organize seating considering family hierarchy and cultural customs',
        category: 'logistics',
        priority: 'medium',
        ritualType: COMMON_RITUALS.RECEPTION,
        estimatedDaysBeforeEvent: 30,
        dependencies: ['reception-1'],
        culturalNotes: 'Seating arrangements should respect family traditions and social customs'
      }
    ],
    timingConstraints: {
      minDaysBeforeWedding: 0,
      maxDaysBeforeWedding: 3
    },
    vendorRequirements: {
      requiredTypes: ['venue', 'catering'],
      optionalTypes: ['entertainment', 'florist', 'photographer'],
      culturalPreferences: ['experienced_in_traditional_receptions']
    }
  },

  [COMMON_RITUALS.ENGAGEMENT]: {
    ritualType: COMMON_RITUALS.ENGAGEMENT,
    displayName: 'Engagement Ceremony',
    description: 'Formal engagement ceremony with exchange of rings',
    tasks: [
      {
        id: 'engagement-1',
        title: 'Plan engagement ceremony',
        description: 'Organize the formal engagement ceremony with family',
        category: 'logistics',
        priority: 'high',
        ritualType: COMMON_RITUALS.ENGAGEMENT,
        estimatedDaysBeforeEvent: 180,
        recommendedVendorTypes: ['event_planner', 'venue'],
        culturalNotes: 'The engagement is often a smaller, intimate family ceremony'
      },
      {
        id: 'engagement-2',
        title: 'Order engagement rings',
        description: 'Select and purchase traditional engagement rings',
        category: 'attire',
        priority: 'high',
        ritualType: COMMON_RITUALS.ENGAGEMENT,
        estimatedDaysBeforeEvent: 90,
        recommendedVendorTypes: ['jewelry', 'traditional_jewelry'],
        culturalNotes: 'Rings should be selected according to family preferences and budget'
      },
      {
        id: 'engagement-3',
        title: 'Arrange engagement attire',
        description: 'Prepare appropriate attire for the engagement ceremony',
        category: 'attire',
        priority: 'medium',
        ritualType: COMMON_RITUALS.ENGAGEMENT,
        estimatedDaysBeforeEvent: 45,
        recommendedVendorTypes: ['formal_wear', 'traditional_attire'],
        culturalNotes: 'Attire should be respectful and appropriate for a family ceremony'
      }
    ],
    timingConstraints: {
      minDaysBeforeWedding: 90,
      maxDaysBeforeWedding: 365
    },
    vendorRequirements: {
      requiredTypes: [],
      optionalTypes: ['venue', 'catering', 'photographer'],
      culturalPreferences: ['family_friendly']
    }
  },

  [COMMON_RITUALS.NALANGU]: {
    ritualType: COMMON_RITUALS.NALANGU,
    displayName: 'Nalangu Ceremony',
    description: 'Traditional beautification ceremony with turmeric and sandalwood',
    tasks: [
      {
        id: 'nalangu-1',
        title: 'Arrange Nalangu ceremony venue',
        description: 'Book a venue for the traditional beautification ceremony',
        category: 'logistics',
        priority: 'medium',
        ritualType: COMMON_RITUALS.NALANGU,
        estimatedDaysBeforeEvent: 30,
        recommendedVendorTypes: ['venue', 'home_venue'],
        culturalNotes: 'This ceremony is often held at home or in an intimate setting'
      },
      {
        id: 'nalangu-2',
        title: 'Prepare Nalangu ceremonial items',
        description: 'Arrange turmeric, sandalwood, traditional oils, and other beautification items',
        category: 'ritual',
        priority: 'medium',
        ritualType: COMMON_RITUALS.NALANGU,
        estimatedDaysBeforeEvent: 7,
        recommendedVendorTypes: ['religious_supplies', 'traditional_items'],
        culturalNotes: 'These items are essential for the traditional beautification process'
      },
      {
        id: 'nalangu-3',
        title: 'Coordinate with family women',
        description: 'Organize female family members to participate in the traditional ceremony',
        category: 'logistics',
        priority: 'low',
        ritualType: COMMON_RITUALS.NALANGU,
        estimatedDaysBeforeEvent: 14,
        culturalNotes: 'This is traditionally a women-only ceremony in many families'
      }
    ],
    timingConstraints: {
      minDaysBeforeWedding: 1,
      maxDaysBeforeWedding: 7
    },
    vendorRequirements: {
      requiredTypes: [],
      optionalTypes: ['beautician', 'traditional_items'],
      culturalPreferences: ['understands_traditions']
    }
  }
};

// Helper function to get tasks for specific rituals
export function getTasksForRituals(ritualTypes: string[]): RitualTemplate[] {
  return ritualTypes
    .filter(type => RITUAL_TEMPLATES[type])
    .map(type => RITUAL_TEMPLATES[type]);
}

// Helper function to get all available ritual types
export function getAvailableRitualTypes(): string[] {
  return Object.keys(RITUAL_TEMPLATES);
}

// Helper function to get ritual display name
export function getRitualDisplayName(ritualType: string): string {
  return RITUAL_TEMPLATES[ritualType]?.displayName || ritualType;
}