'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { ritualTaskGenerator } from '@/lib/ai/ritual-task-generator';
import { conflictDetector } from '@/lib/ai/conflict-detector';
import { ConflictList } from '@/components/ai/conflict-card';
import { COMMON_RITUALS, RitualTask, ConflictDetectionResponse, RitualTaskGenerationResponse } from '@/lib/ai/ritual-types';
import { formatDateForDisplay } from '@/lib/ai/utils';

export default function AIFeaturesDemoPage() {
  const [selectedRituals, setSelectedRituals] = useState<string[]>([
    COMMON_RITUALS.PORUWA,
    COMMON_RITUALS.RECEPTION
  ]);
  const [weddingDate, setWeddingDate] = useState('2024-06-15');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ritualTasks, setRitualTasks] = useState<RitualTaskGenerationResponse | null>(null);
  const [conflicts, setConflicts] = useState<ConflictDetectionResponse | null>(null);
  const [demoEvents, setDemoEvents] = useState<any[]>([]);
  const [demoVendors, setDemoVendors] = useState<any[]>([]);

  // Generate demo data
  useEffect(() => {
    const events = [
      {
        id: 'demo-event-1',
        name: 'Poruwa Ceremony',
        date: '2024-06-15',
        startTime: '10:00',
        endTime: '12:00',
        vendorIds: ['demo-vendor-1', 'demo-vendor-2']
      },
      {
        id: 'demo-event-2',
        name: 'Wedding Reception',
        date: '2024-06-15',
        startTime: '11:30', // Intentional overlap
        endTime: '16:00',
        vendorIds: ['demo-vendor-2', 'demo-vendor-3'] // vendor-2 double-booked
      }
    ];

    const vendors = [
      {
        id: 'demo-vendor-1',
        name: 'Traditional Officiant',
        serviceTypes: ['officiant'],
        availability: ['2024-06-15'],
        culturalSpecialties: ['poruwa_ceremony']
      },
      {
        id: 'demo-vendor-2',
        name: 'Grand Ballroom Venue',
        serviceTypes: ['venue'],
        availability: ['2024-06-15'],
        culturalSpecialties: []
      },
      {
        id: 'demo-vendor-3',
        name: 'Premium Catering Service',
        serviceTypes: ['catering'],
        availability: ['2024-06-15'],
        culturalSpecialties: ['traditional_cuisine']
      }
    ];

    setDemoEvents(events);
    setDemoVendors(vendors);
  }, []);

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      // Generate ritual tasks
      const tasksResponse = ritualTaskGenerator.generateTasks({
        weddingId: 'demo-wedding',
        rituals: selectedRituals,
        weddingDate,
        currentEvents: demoEvents,
        currentVendors: demoVendors
      });
      setRitualTasks(tasksResponse);

      // Detect conflicts
      const conflictsResponse = conflictDetector.detectConflicts({
        weddingId: 'demo-wedding',
        events: demoEvents,
        vendors: demoVendors,
        weddingType: 'traditional_sinhalese',
        culturalPreferences: ['traditional_ceremonies', 'auspicious_timing']
      });
      setConflicts(conflictsResponse);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRitualToggle = (ritual: string) => {
    setSelectedRituals(prev => 
      prev.includes(ritual) 
        ? prev.filter(r => r !== ritual)
        : [...prev, ritual]
    );
  };

  const getRitualDisplayName = (ritual: string) => {
    const names: Record<string, string> = {
      [COMMON_RITUALS.PORUWA]: 'Poruwa Ceremony',
      [COMMON_RITUALS.RECEPTION]: 'Wedding Reception',
      [COMMON_RITUALS.HOME_COMING]: 'Home Coming',
      [COMMON_RITUALS.ENGAGEMENT]: 'Engagement',
      [COMMON_RITUALS.NALANGU]: 'Nalangu Ceremony'
    };
    return names[ritual] || ritual;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold">AI Wedding Planning Assistant</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience how wedX AI helps you plan your traditional Sri Lankan wedding with intelligent task generation and conflict detection.
        </p>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Configuration</CardTitle>
          <CardDescription>
            Select your wedding rituals and date to see AI-powered planning assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Wedding Rituals:</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(COMMON_RITUALS).map((ritual) => (
                <Button
                  key={ritual}
                  variant={selectedRituals.includes(ritual) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleRitualToggle(ritual)}
                  className="justify-start"
                >
                  {getRitualDisplayName(ritual)}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Wedding Date:</label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <Button 
            onClick={handleGenerateTasks}
            disabled={isGenerating || selectedRituals.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Your Wedding...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      {ritualTasks && conflicts && (
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">
              <CheckCircle className="mr-2 h-4 w-4" />
              Tasks ({ritualTasks.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="conflicts">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Conflicts ({conflicts.conflicts.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generated Ritual Tasks</CardTitle>
                <CardDescription>
                  Tasks automatically generated based on your selected rituals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ritualTasks.tasks.map((task: RitualTask, index: number) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">{task.description}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{task.category}</Badge>
                          <Badge className={
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            {task.estimatedDaysBeforeEvent} days before
                          </Badge>
                        </div>
                        {task.culturalNotes && (
                          <div className="text-xs text-muted-foreground mt-2">
                            🕉️ {task.culturalNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            <ConflictList
              conflicts={conflicts.conflicts}
              weddingId="demo-wedding"
              onConflictResolved={(conflictId) => {
                console.log('Conflict resolved:', conflictId);
              }}
              onConflictDismissed={(conflictId) => {
                console.log('Conflict dismissed:', conflictId);
              }}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cultural Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ritualTasks.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Planning Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conflicts.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Overall Risk</div>
                    <div className={`text-lg font-semibold ${
                      conflicts.riskAssessment.overallRisk === 'high' ? 'text-red-600' :
                      conflicts.riskAssessment.overallRisk === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {conflicts.riskAssessment.overallRisk.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {conflicts.riskAssessment.criticalIssues}
                      </div>
                      <div className="text-xs text-muted-foreground">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {conflicts.riskAssessment.warnings}
                      </div>
                      <div className="text-xs text-muted-foreground">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {conflicts.riskAssessment.recommendations}
                      </div>
                      <div className="text-xs text-muted-foreground">Suggestions</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Cultural Notes */}
      {ritualTasks && ritualTasks.culturalNotes.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Cultural Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ritualTasks.culturalNotes.map((note: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-2"></div>
                  <span className="text-sm text-amber-800">{note}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Events and Vendors (for transparency) */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Scenario</CardTitle>
          <CardDescription>
            This demo uses sample events and vendors to simulate real wedding planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-2">
              {demoEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateForDisplay(event.date)} • {event.startTime} - {event.endTime}
                    </div>
                  </div>
                  <Badge variant="outline">{event.vendorIds.length} vendors</Badge>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="vendors" className="space-y-2">
              {demoVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {vendor.serviceTypes.join(', ')}
                    </div>
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}