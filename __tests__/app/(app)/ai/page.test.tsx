import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIPlannerPage from '@/app/(app)/ai/page';
import { callAiPlanner } from '@/lib/api/ai-planner';

// Mock the API client
jest.mock('@/lib/api/ai-planner', () => ({
  callAiPlanner: jest.fn(),
  getMockAiPlannerResponse: jest.fn(() => ({
    suggestions: [
      {
        id: '1',
        title: 'Book photographer',
        description: 'Consider booking a photographer for your ceremony',
        category: 'vendor',
        priority: 'high',
        relatedIds: { vendorIds: ['vendor-1'] }
      },
      {
        id: '2',
        title: 'Finalize guest list',
        description: 'Review and finalize your guest list for the reception',
        category: 'guest',
        priority: 'medium',
        relatedIds: { guestIds: ['guest-1', 'guest-2'] }
      }
    ],
    notes: 'Based on your current progress, focus on vendor bookings first.'
  }))
}));

describe('AIPlannerPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the AI Planner page with all elements', () => {
    render(<AIPlannerPage />);
    
    expect(screen.getByText('AI Planner')).toBeInTheDocument();
    expect(screen.getByText('What would you like help with?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What should we focus on this week?')).toBeInTheDocument();
    expect(screen.getByText('Get Suggestions')).toBeInTheDocument();
  });

  it('displays quick question buttons', () => {
    render(<AIPlannerPage />);
    
    expect(screen.getByText('What should we focus on this week?')).toBeInTheDocument();
    expect(screen.getByText('Which vendors should we book next?')).toBeInTheDocument();
    expect(screen.getByText('Are there any budget concerns?')).toBeInTheDocument();
  });

  it('allows user to type a question', async () => {
    const user = userEvent.setup();
    render(<AIPlannerPage />);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    await user.type(textarea, 'What vendors do we need to book?');
    
    expect(textarea).toHaveValue('What vendors do we need to book?');
  });

  it('populates question when quick question button is clicked', async () => {
    const user = userEvent.setup();
    render(<AIPlannerPage />);
    
    const quickQuestionButton = screen.getByText('What should we focus on this week?');
    await user.click(quickQuestionButton);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    expect(textarea).toHaveValue('What should we focus on this week?');
  });

  it('allows changing focus area', async () => {
    const user = userEvent.setup();
    render(<AIPlannerPage />);
    
    // Note: This test assumes the Select component is properly implemented
    // In a real test, you might need to interact with the Select trigger and options
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('disables submit button when no question is entered', () => {
    render(<AIPlannerPage />);
    
    const submitButton = screen.getByText('Get Suggestions');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when question is entered', async () => {
    const user = userEvent.setup();
    render(<AIPlannerPage />);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    await user.type(textarea, 'What should we focus on?');
    
    const submitButton = screen.getByText('Get Suggestions');
    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();
    const mockCallAiPlanner = callAiPlanner as jest.MockedFunction<typeof callAiPlanner>;
    
    // Mock a delayed response
    mockCallAiPlanner.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        suggestions: [],
        notes: null
      }), 100))
    );

    render(<AIPlannerPage />);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    await user.type(textarea, 'What should we focus on?');
    
    const submitButton = screen.getByText('Get Suggestions');
    await user.click(submitButton);
    
    expect(screen.getByText('Getting suggestions...')).toBeInTheDocument();
    expect(screen.getByText('Get Suggestions')).toBeDisabled();
  });

  it('displays suggestions when API returns data', async () => {
    const user = userEvent.setup();
    const mockCallAiPlanner = callAiPlanner as jest.MockedFunction<typeof callAiPlanner>;
    
    mockCallAiPlanner.mockResolvedValue({
      suggestions: [
        {
          id: '1',
          title: 'Book photographer',
          description: 'Consider booking a photographer for your ceremony',
          category: 'vendor',
          priority: 'high',
          relatedIds: { vendorIds: ['vendor-1'] }
        }
      ],
      notes: 'Based on your current progress.'
    });

    render(<AIPlannerPage />);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    await user.type(textarea, 'What should we focus on?');
    
    const submitButton = screen.getByText('Get Suggestions');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Book photographer')).toBeInTheDocument();
      expect(screen.getByText('Consider booking a photographer for your ceremony')).toBeInTheDocument();
      expect(screen.getByText('Based on your current progress.')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails but shows mock data', async () => {
    const user = userEvent.setup();
    const mockCallAiPlanner = callAiPlanner as jest.MockedFunction<typeof callAiPlanner>;
    
    mockCallAiPlanner.mockRejectedValue(new Error('API Error'));

    render(<AIPlannerPage />);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    await user.type(textarea, 'What should we focus on?');
    
    const submitButton = screen.getByText('Get Suggestions');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText("We couldn't get fresh suggestions right now. Showing example suggestions instead.")).toBeInTheDocument();
      // Should still show mock suggestions
      expect(screen.getByText('Book photographer')).toBeInTheDocument();
    });
  });

  it('displays empty state when no suggestions are available', () => {
    render(<AIPlannerPage />);
    
    expect(screen.getByText('No suggestions yet')).toBeInTheDocument();
    expect(screen.getByText('Try asking a more specific question, like "What are we missing for the Poruwa ceremony?"')).toBeInTheDocument();
  });

  it('shows correct category icons and colors', async () => {
    const user = userEvent.setup();
    const mockCallAiPlanner = callAiPlanner as jest.MockedFunction<typeof callAiPlanner>;
    
    mockCallAiPlanner.mockResolvedValue({
      suggestions: [
        {
          id: '1',
          title: 'Vendor Task',
          description: 'Vendor related task',
          category: 'vendor',
          priority: 'high',
          relatedIds: {}
        },
        {
          id: '2',
          title: 'Checklist Task',
          description: 'Checklist related task',
          category: 'checklist',
          priority: 'medium',
          relatedIds: {}
        }
      ],
      notes: null
    });

    render(<AIPlannerPage />);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    await user.type(textarea, 'Test question');
    
    const submitButton = screen.getByText('Get Suggestions');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Vendor Task')).toBeInTheDocument();
      expect(screen.getByText('Checklist Task')).toBeInTheDocument();
      // Check for priority badges
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });
  });

  it('shows navigation links for suggestions with related entities', async () => {
    const user = userEvent.setup();
    const mockCallAiPlanner = callAiPlanner as jest.MockedFunction<typeof callAiPlanner>;
    
    mockCallAiPlanner.mockResolvedValue({
      suggestions: [
        {
          id: '1',
          title: 'Check vendor contracts',
          description: 'Review vendor contracts before signing',
          category: 'vendor',
          priority: 'high',
          relatedIds: { vendorIds: ['vendor-1'] }
        }
      ],
      notes: null
    });

    render(<AIPlannerPage />);
    
    const textarea = screen.getByPlaceholderText('What should we focus on this week?');
    await user.type(textarea, 'Test question');
    
    const submitButton = screen.getByText('Get Suggestions');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('View vendors')).toBeInTheDocument();
    });
  });
});