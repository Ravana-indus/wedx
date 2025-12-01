---
date: Monday, December 1, 2025
agent_role: Facilitator
agent_name: BMad
user_name: Patu
session_start_plan: >
  We will begin with a **Progressive Technique Flow** to systematically explore and refine the checklist features.
  
  1. **What If Scenarios (Creative)**: To break conventional thinking about what a checklist is and imagine "magic" solutions.
  2. **Role Playing (Collaborative)**: To deeply understand the checklist needs from the perspective of different personas (Bride, Parent, Vendor).
  3. **SCAMPER (Structured)**: To methodically improve the existing checklist functions (Substitute, Combine, Adapt, etc.).
  4. **Mind Mapping (Structured)**: To organize the generated ideas into a coherent structure for the final UI/UX design.
---

# Brainstorming Session: Improving /checklist UX, UI, and Functions

## Context

We are improving the `/checklist` feature for "Wedx", a Wedding & Events OS for the Sri Lankan market. The goal is to enhance UX, UI, and functionality, moving beyond a simple list to a smart, culturally aware, and stress-reducing tool.

**Current State:** A basic checklist exists.
**Desired State:** A "Smart Checklist" that handles cultural nuances (rituals, jewelry), collaboration (parents/couples), and vendor integration.

## Technique 1: What If Scenarios

**Objective:** Break free from standard "to-do list" mental models.

**Facilitator:** Let's start by challenging constraints. What if the checklist wasn't just a list of text?

**Prompt 1:** What if the checklist could "see" and "hear" what was happening in the real world?
**User:** Then it could auto-check items. e.g., "Scanning" a contract marks "Book Photographer" as done. Or hearing the user say "I bought the rings" updates the status.

**Prompt 2:** What if the checklist had emotions?
**User:** It could detect stress. If too many tasks are overdue, it changes UI to be calming (pastel colors, hiding non-urgent tasks). If ahead of schedule, it celebrates with confetti or unlocking "rewards".

**Prompt 3:** What if the checklist was a multiplayer game?
**User:** Tasks could be "Quests". Completing them gives XP. The Couple vs. Parents could be "Teams" unlocking achievements together. "Jewelry Heist" mission for buying the Thali.

**Prompt 4:** What if the checklist was physical?
**User:** Maybe an AR view? You point your camera at the venue, and it overlays "Table Setup" tasks on the empty floor.

## Technique 2: Role Playing

**Objective:** Empathize with specific user needs defined in the PRD.

**Facilitator:** Let's step into the shoes of our key personas.

**Role: The Anxious Mother (Parent Persona)**
* **Prompt:** You are the mother. You are worried about the auspicious times and the jewelry. What does the checklist look like to you?
* **User:** I don't care about the DJ. I care about the *Thali*. I need a big, red, flashing alert for "Gold Purchase Date". I want to see "Who has the rings?" prominently. I need to be able to "Push" a task to my son's phone and nag him until it's done.
* **Insight:** Need "High Priority / Ritual" tags that bubble to the top. Need "Nudge" feature for collaborators.

**Role: The Diaspora Groom (Remote Persona)**
* **Prompt:** You are in London. The wedding is in Colombo. You can't see anything in person.
* **User:** I need *proof*. Checking a box isn't enough. I want to require a "Photo Upload" or "File Attachment" to mark specific tasks as done (e.g., "Venue Booked" requires uploaded receipt). I want a timeline view to see how local time tasks align with my travel dates.
* **Insight:** "Evidence-based" completion (require attachment). Timezone awareness.

**Role: The Vendor (Photographer)**
* **Prompt:** You have 20 weddings. How do you interact with this couple's checklist?
* **User:** I don't want to see their whole list. I just want a "Shared Space". They have a task "Submit Shot List". I want to receive that notification, upload the file, and have it auto-complete on their side.
* **Insight:** Vendor-specific "Sub-checklists" or "Shared Tasks" bridging the two users.

## Technique 3: SCAMPER

**Objective:** Refine the specific functional requirements (Jewelry, Rituals).

**Substitute:**
* *Instead of text items...* Use visual cards or icons (Ring icon for jewelry).
* *Instead of manual due dates...* Use "T-Minus" dates (e.g., "Wedding Day - 3 Months") that auto-adjust if the wedding date moves.

**Combine:**
* *Combine Checklist + Budget.* When I check off "Book Venue", pop up a modal: "Final Cost? Paid Deposit?" and auto-update the budget tracker.
* *Combine Checklist + Marketplace.* Next to "Book Florist" task, show "3 Recommended Florists" right in the row.

**Adapt:**
* *Adapt from Trello/Jira.* Kanban board view for "To Do", "In Progress", "Blocked", "Done".
* *Adapt from Spotify.* "Playlists" of tasks. "The 'Last Minute Panic' Playlist" (tasks for the final week).

**Modify:**
* *Magnify:* The "Jewelry Module" needs to be huge. It's not just a task. It's an inventory system. Photo of item, weight, location, insurance status.
* *Minify:* "Focus Mode". Show only the 3 tasks I *must* do today. Hide the mountain of 200 other tasks.

**Put to another use:**
* *Checklist as a memory book.* After the wedding, the completed checklist (with uploaded photos/receipts) becomes a "Scrapbook" of the planning journey.

**Eliminate:**
* *Eliminate "Delete".* Don't let users delete ritual tasks (bad luck/mistake). "Archive" or "Hide" instead.
* *Eliminate manual entry.* Pre-load templates based on the "Wizard" (Hindu, Buddhist, etc.).

**Reverse:**
* *Reverse the flow.* Instead of "User checks box", the "System checks box". e.g., System detects user is at the Jewelry store (GPS), asks "Did you buy the rings?".

## Technique 4: Mind Mapping (Consolidation)

**Objective:** Structure these ideas into the UI/UX Design.

**Central Node: Smart Checklist**

**Branch 1: Views (UI)**
*   **List View:** Standard, collapsible sections (Master Categories).
*   **Kanban Board:** Status-based (To Do, Doing, Done).
*   **Calendar/Timeline:** Date-based visualization.
*   **"Focus" Widget:** Dashboard view of top 3 urgent tasks.

**Branch 2: Item Detail (UX)**
*   **Rich Media:** Photo uploads, file attachments (contracts).
*   **Logic:** Dependencies (Can't "Send Invites" until "Venue Booked").
*   **Collaboration:** Assignee, Comments, "Nudge" button.
*   **Financial Link:** "Add Cost" field linked to Budget.

**Branch 3: Special Modules (Functions)**
*   **Jewelry Vault:** Visual inventory, weight tracking, custody (Who has it?).
*   **Ritual Engine:** Auto-added tasks based on culture (Poruwa, Thali).
*   **Vendor Bridge:** Shared tasks with booked vendors.

**Branch 4: Intelligence (AI)**
*   **Auto-Scheduler:** "T-Minus" relative dates.
*   **Conflict Detector:** "You have a dress fitting same time as venue visit."
*   **Recommender:** "You checked 'Book Photographer' - here are 3 rated partners."

---

# Idea Categorization

### Immediate Opportunities (Quick Wins)
1.  **"T-Minus" Dates:** Implement relative due dates (e.g., `wedding_date - 30 days`) for all template tasks.
2.  **Rich Task Details:** Add fields for "Cost", "Assignee", and "Attachment" to the existing task model.
3.  **"Focus" Mode:** A simple dashboard widget showing only overdue and due-this-week tasks.
4.  **Pre-loaded Templates:** Ensure the "Wizard" correctly seeds the DB with the cultural templates (Hindu, Buddhist, etc.).

### Future Innovations (Phase 2)
1.  **Jewelry Vault UI:** A dedicated graphical interface for jewelry management (not just list items).
2.  **Vendor Bridge:** The "Shared Task" system requiring vendor login and interaction.
3.  **Budget Integration:** Real-time syncing between checking a box and updating the `BudgetLine`.

### Moonshots (Long Term)
1.  **AR Visualization:** "Seeing" tasks in physical space.
2.  **GPS Auto-Complete:** Geo-fenced task completion prompts.
3.  **AI Negotiation:** AI agent that chats with the vendor to complete the "Get Quote" task for you.

---

# Action Planning

## Priority 1: The "Smart Task" Data Model
*   **Rationale:** We need to upgrade the underlying data structure before building UI. A task needs to be more than a string.
*   **Next Steps:**
    *   Update `ChecklistItem` schema in `schema.prisma` (or equivalent).
    *   Add fields: `relativeDueDate` (int days), `isRitual` (bool), `requiresProof` (bool), `costActual` (float), `linkedBudgetID` (string).

## Priority 2: The "Focus" Dashboard & List UI
*   **Rationale:** Users feel overwhelmed. We need a UI that simplifies.
*   **Next Steps:**
    *   Design the "Tabbed" layout: All / Rituals / Jewelry.
    *   Build the "Focus Card" component (Top 3 tasks).
    *   Implement "Swipe to Complete" (mobile-first gesture).

## Priority 3: Jewelry Module (MVP)
*   **Rationale:** High-value differentiator for Sri Lankan market.
*   **Next Steps:**
    *   Create a specific sub-view for "Jewelry".
    *   Allow adding photos to these specific tasks.
    *   Add "Gold Weight" field to these tasks.

---

# Reflection

**What worked well:** Role-playing the "Anxious Mother" and "Diaspora Groom" really clarified the *why* behind specific features (trust, visibility, nagging).
**Areas to explore:** We touched on "Vendor Bridge" but need to define exactly *how* a non-tech vendor interacts (WhatsApp link vs. App login).
