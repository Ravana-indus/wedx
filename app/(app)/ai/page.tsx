'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Lightbulb, Users, Calculator, CheckSquare, Calendar, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { callAiPlanner, getMockAiPlannerResponse } from '@/lib/api/ai-planner';
import { AiPlannerSuggestion, FOCUS_AREAS } from '@/lib/ai/types';
import Link from 'next/link';

export default function AIPlannerPage() {
  const [question, setQuestion] = useState('');
  const [focus, setFocus] = useState<'overall' | 'checklists' | 'vendors' | 'budget' | 'guests' | 'rituals'>('overall');
  const [suggestions, setSuggestions] = useState<AiPlannerSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  // For now, use mock wedding ID - in real implementation would get from auth/session
  const weddingId = 'mock-wedding-id';

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // For demo purposes, use mock data if no real API is available
      // In production, this would call the real AI planner API
      const response = await callAiPlanner(weddingId, {
        question: question.trim(),
        focus: focus !== 'overall' ? focus : undefined
      });

      // Fallback to mock data if API returns empty
      const finalResponse = response.suggestions.length === 0 
        ? getMockAiPlannerResponse() 
        : response;

      setSuggestions(finalResponse.suggestions);
      setNotes(finalResponse.notes || null);
    } catch (err) {
      console.error('AI Planner error:', err);
      
      // Fallback to mock data on error for demo purposes
      const mockResponse = getMockAiPlannerResponse();
      setSuggestions(mockResponse.suggestions);
      setNotes(mockResponse.notes || null);
      
      // Still show a friendly error message
      setError("We couldn't get fresh suggestions right now. Showing example suggestions instead.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'checklist':
        return <CheckSquare className="h-4 w-4" />;
      case 'vendor':
        return <Users className="h-4 w-4" />;
      case 'budget':
        return <Calculator className="h-4 w-4" />;
      case 'guest':
        return <Users className="h-4 w-4" />;
      case 'ritual':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'checklist':
        return 'bg-blue-100 text-blue-800';
      case 'vendor':
        return 'bg-green-100 text-green-800';
      case 'budget':
        return 'bg-yellow-100 text-yellow-800';
      case 'guest':
        return 'bg-purple-100 text-purple-800';
      case 'ritual':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNavigationLink = (suggestion: AiPlannerSuggestion) => {
    const relatedIds = suggestion.relatedIds || {};
    
    if (relatedIds.checklistItemIds?.length) {
      return { href: '/checklist', label: 'Open checklist', icon: <CheckSquare className="h-4 w-4" /> };
    }
    if (relatedIds.eventIds?.length) {
      const eventId = relatedIds.eventIds[0];
      return { href: `/events/${eventId}`, label: 'View event', icon: <Calendar className="h-4 w-4" /> };
    }
    if (relatedIds.vendorIds?.length) {
      return { href: '/vendors', label: 'View vendors', icon: <Users className="h-4 w-4" /> };
    }
    if (relatedIds.guestIds?.length) {
      return { href: '/guests', label: 'View guests', icon: <Users className="h-4 w-4" /> };
    }
    if (relatedIds.budgetLineItemIds?.length) {
      return { href: '/budget', label: 'View budget', icon: <Calculator className="h-4 w-4" /> };
    }
    
    return null;
  };

  const handleQuickQuestion = (quickQuestion: string) => {
    setQuestion(quickQuestion);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold">AI Planner</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ask wedX what to focus on next. Suggestions are based on your events, rituals, checklists, vendors, guests, and budget.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>What would you like help with?</CardTitle>
          <CardDescription>Ask a question or choose a focus area to get personalized suggestions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question</label>
            <Textarea
              placeholder="What should we focus on this week?"
              value={question}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestion(e.target.value)}
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Focus Area (Optional)</label>
            <Select value={focus} onValueChange={setFocus} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Overall" />
              </SelectTrigger>
              <SelectContent>
                {FOCUS_AREAS.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    <div className="flex flex-col">
                      <span>{area.label}</span>
                      <span className="text-xs text-muted-foreground">{area.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Quick questions:</span>
            {["What should we focus on this week?", "Which vendors should we book next?", "Are there any budget concerns?"].map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(q)}
                disabled={loading}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !question.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting suggestions...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Suggestions</h2>
            <Badge variant="secondary">{suggestions.length} suggestions</Badge>
          </div>

          <div className="grid gap-4">
            {suggestions.map((suggestion) => {
              const navLink = getNavigationLink(suggestion);
              
              return (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(suggestion.category)}`}>
                          {getCategoryIcon(suggestion.category)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{suggestion.title}</CardTitle>
                          <CardDescription className="mt-1">{suggestion.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getCategoryColor(suggestion.category)}>
                        {suggestion.category}
                      </Badge>
                      {navLink && (
                        <Link href={navLink.href}>
                          <Button variant="ghost" size="sm">
                            {navLink.icon}
                            <span className="ml-1">{navLink.label}</span>
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {notes && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No suggestions yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try asking a more specific question, like "What are we missing for the Poruwa ceremony?" 
              or "Which vendors should we book next?"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
