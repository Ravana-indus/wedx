

# Product Requirements Document: Wedding & Events OS (Sri Lanka)

**Author:** Client & BMAD PM
**Date:** November 25, 2025
**Version:** 1.1 (Detailed Specification)
**Status:** Approved for Planning

---

## 1. Executive Summary

**Wedding & Events OS** is a unified, AI-driven planning platform engineered for the Sri Lankan market. It bridges the gap between high-stress cultural expectations (auspicious times, complex rituals) and modern digital convenience.

Unlike generic planners, this platform natively handles multi-event flows (Engagement → Poruwa → Homecoming) and "Critical Windows." It serves as a centralized "Operating System" for Couples (Local & Diaspora), Parents, and Vendors, mediating interactions through a "Hybrid Bridge" that connects high-tech users with low-tech vendors.

---

## 2. User Personas

| Persona | Description | Key Needs |
| :--- | :--- | :--- |
| **Bride/Groom** | Primary planner (Local or Diaspora). | Structure, stress reduction, budget control, and aesthetic visualization. |
| **Parents** | Heavy influencers / Payers. | Visibility into guest lists, adherence to tradition/rituals, and reputation management. |
| **Diaspora Couple** | Sri Lankans living abroad. | **Trust** remote coordination, and clarity on local execution. |
| **Vendors** | Service providers (High & Low tech). | Qualified leads, clear bookings, and payment security. |
| **Planners** | Professional organizers. | Backend management tool to handle multiple client timelines. |

---

## 3. Product Scope & Phasing

### Phase 1: MVP (Core "Operating System")
* **Wizard & Timeline:** Cultural logic engine (Hindu, Buddhist, Muslim, Christian, Mixed).
* **Smart Planning:** Master Checklists, **Jewelry Module** (Inventory/Rentals), Guest Lists (Partitioned Quotas).
* **Marketplace:** Partner Chat + **WhatsApp Bridge** (for non-partners) + Subscription Gates.
* **Day-Of:** Offline-first timeline & contact sync.
* **AI:** "Nano Banana" (Image Gen) + Conflict Detection.

### Phase 2: Growth (Visuals & Finance)
* **Visual Table Management:** Drag-and-drop seating charts.
* **FinTech:** Escrow payments & Split commissions.
* **Advanced AI:** Full Honeymoon Itinerary generation & Vendor Brief auto-creation.

---

## 4. Functional Requirements

### 4.1. The Cultural Wizard (Onboarding)
* **FR-001 (Wedding Types):** System must support selection of: Hindu, Christian, Buddhist, Muslim, Civil, Mixed, and Custom.
* **FR-002 (Event Logic):** Based on type, auto-suggest events:
    * *Common:* Engagement, Reception, Pre-shoot, Welcome Dinner, After-party.
    * *Cultural:* Poruwa (Buddhist), Nikah (Muslim), Mehendi/Haldi/Sangeet (Hindu/North Indian influence), Homecoming (Sri Lankan specific).
    * *Metadata:* Each event captures Location, Date, Time (Start-End), and Guest Count.
* **FR-003 (Vibe Selection):** User selects visual theme (Traditional, Minimal, Modern Glam, Luxury, Pastel, Bold, Western, Destination) to tune AI recommendations.
* **FR-004 (Ritual Injection):** AI must auto-load specific rituals into the timeline:
    * *Hindu:* Thali ceremony, Homam, Koorai saree prep, Nadaswaram.
    * *Buddhist:* Poruwa rituals, Jayamangala Gatha, Oil lamp, Drummers.
    * *Christian:* Unity candle, Vows, Readings.
    * *Muslim:* Mahr, Wali, Dua.
* **FR-005 (Constraints):** Wizard captures "Diaspora Mode" (toggles remote features) and Budget Constraints.

### 4.2. Smart Checklist & Modules
* **FR-006 (Master Categories):** System generates tasks under: Venue, Catering, Décor, Photography, Attire, Rituals, Legal, Transport, and Logistics.
* **FR-007 (Jewelry Module - Critical):** Dedicated module to manage:
    * *Rings:* Sizing, Engraving, Insurance.
    * *Thali/Thirumangalyam:* Design selection, **Gold purchase tracking**, Delivery to Priest, Backup chain logic.
    * *Sets:* Allocation for Main Ceremony vs. Homecoming vs. Reception.
    * *Rentals:* Pickup dates, Return deadlines, and Deposit refund tracking.
* **FR-008 (Sub-Checklist Logic):**
    * *Catering:* Corkage, Alcohol, Dietary counts.
    * *Décor:* Mandap/Poruwa setup, Lighting, Table centerpieces.
    * *Photography:* Shot list, Drone approvals, Raw file delivery terms.

### 4.3. Vendor Marketplace (Hybrid Model)
* **FR-009 (Partner Vendors):** Full profile viewing, in-app messaging, file sharing, and live availability.
* **FR-010 (Non-Partner Vendors - WhatsApp Bridge):**
    * Users click "Inquire"; System generates a culturally appropriate WhatsApp message template (e.g., in Sinhala/Tamil/English).
    * User sends via their own WhatsApp; System prompts user to upload "Screenshot" of reply to track status.
* **FR-011 (Lead Unmasking):** Vendors see anonymized lead details (e.g., "Kandy, 200 Pax"). Must have active **Subscription** to view Client Name/Contact.

### 4.4. Guest & Table Management
* **FR-012 (Guest Lists):** Support for Import (CSV/Contacts), Headcount tracking, Dietary needs, and Accommodation tagging.
* **FR-013 (Collaboration Quotas):** Admin (Couple) assigns "Seat Quotas" to Parents. Parents can add guests only up to their limit.
* **FR-014 (Table Management - MVP):** List-based assignment of guests to Table Numbers.
* **FR-015 (Table Management - Phase 2):** Drag-and-drop UI for Round/Rectangular tables and VIP seat grouping.

### 4.5. Invitations & RSVP
* **FR-016:** Module to manage Physical print orders (Timeline/Delivery) and Digital Links.
* **FR-017:** Digital Invitation includes: Multi-event schedule, RSVP collection form, and Dietary preference capture.

### 4.6. Post-Wedding & Honeymoon
* **FR-018 (Asset Recovery):** Checklist for Return of Hired Items, Rental Jewelry, and Décor.
* **FR-019 (Financial Wrap):** Tracking of "Pending Balances" and "Deposit Refunds."
* **FR-020 (Honeymoon AI):** System generates itinerary based on destination shortlist, visa checks, and packing lists.

### 4.7. AI Engine Capabilities
* **FR-021 (Nano Banana):** Generative AI for "Dress Try-on" (User Photo + Style Prompt = Visualization).
* **FR-022 (Conflict Detection):** Alert if a booked vendor service overlaps with a separate event location or auspicious window.
* **FR-023 (Dynamic Updates):** If a ritual time changes, auto-shift dependent tasks (e.g., Makeup artist start time).

---

## 5. Data Model (High-Level Entities)

To support the Engineering team, the following core entities are defined:

* **User:** (Role: Bride, Groom, Parent, Vendor, Planner)
* **Wedding:** (Attributes: Type, Vibe, Budget, Diaspora_Flag)
* **Event:** (Linked to Wedding. Attributes: Location, Date, Time_Window)
* **Ritual:** (Linked to Event. Attributes: Duration, Required_Items)
* **ChecklistCategory:** (Parent container)
* **ChecklistItem:** (Status, Due_Date, Assignee, Cost_Est, Cost_Actual)
* **JewelryItem:** (Type: Gold/Rental, Weight, Custody_Status)
* **Vendor:** (Type: Partner/Non-Partner, Subscription_Status)
* **Conversation:** (Internal Chat or WhatsApp_Log)
* **Guest:** (Group: Bride/Groom/Parent, RSVP_Status, Table_ID)
* **BudgetLine:** (Linked to ChecklistItem, Visibility_Scope)

---

## 6. UI Structure (App Architecture)

**Bottom Navigation:**
1.  **Plan:** (The Dashboard)
    * Countdown.
    * "Next Up" Tasks.
    * Critical Alerts (Conflict/Payment).
2.  **Checklist:** (The Work)
    * Tabbed view: Master / Rituals / Jewelry.
3.  **Events:** (The Timeline)
    * Calendar view of all events.
    * Itinerary view.
4.  **Vendors:** (The Marketplace)
    * Search / Saved / Booked.
    * Chat Inbox.
5.  **More:**
    * Guests (List/Tables).
    * Budget (Tracker).
    * Collaboration (Team).
    * Settings (Profile/Subscription).

---

## 7. Next Steps

The PRD is now fully detailed with the specific data from your plan.

