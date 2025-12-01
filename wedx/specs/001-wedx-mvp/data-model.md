# Data Model: Wedx MVP

## Core Entities

### User (Managed by Auth Provider + Profile)
- `id`: UUID (PK)
- `email`: String
- `full_name`: String
- `role`: Enum(COUPLE, PARENT, VENDOR, PLANNER)
- `avatar_url`: String

### Wedding
- `id`: UUID (PK)
- `owner_id`: UUID (FK -> User)
- `name`: String (e.g., "Kavindu & Nethmi")
- `type`: Enum(HINDU, CHRISTIAN, BUDDHIST, MUSLIM, CIVIL, MIXED)
- `vibe`: Enum(TRADITIONAL, MODERN, LUXURY, etc.)
- `budget_range`: String
- `is_diaspora`: Boolean
- `created_at`: Timestamp

### Event
- `id`: UUID (PK)
- `wedding_id`: UUID (FK -> Wedding)
- `name`: String (e.g., "Poruwa Ceremony")
- `type`: String
- `date`: Date
- `time_start`: Time
- `time_end`: Time
- `location`: String
- `guest_count_est`: Integer

### Ritual
- `id`: UUID (PK)
- `event_id`: UUID (FK -> Event)
- `name`: String (e.g., "Jayamangala Gatha")
- `description`: Text
- `order_index`: Integer
- `required_items`: JSONB (List of items)

### Checklist
- `checklist_categories`:
  - `id`: UUID (PK)
  - `wedding_id`: UUID (FK -> Wedding)
  - `name`: String (e.g., "Photography")
- `checklist_items`:
  - `id`: UUID (PK)
  - `category_id`: UUID (FK -> ChecklistCategory)
  - `title`: String
  - `status`: Enum(PENDING, IN_PROGRESS, COMPLETED)
  - `due_date`: Date
  - `cost_est`: Decimal
  - `cost_actual`: Decimal

### Vendor Marketplace
- `vendors`:
  - `id`: UUID (PK)
  - `name`: String
  - `category`: String
  - `is_partner`: Boolean
  - `contact_info`: JSONB
  - `whatsapp_number`: String (Nullable, E.164 format)
- `vendor_leads`:
  - `id`: UUID (PK)
  - `wedding_id`: UUID (FK -> Wedding)
  - `vendor_id`: UUID (FK -> Vendor, nullable for manual)
  - `status`: Enum(NEW, CONTACTED, BOOKED, REJECTED)
  - `notes`: Text
- `vendor_communications`:
  - `id`: UUID (PK)
  - `wedding_id`: UUID (FK -> Wedding)
  - `vendor_id`: UUID (FK -> Vendor)
  - `event_id`: UUID (FK -> Event, Nullable)
  - `participant_id`: UUID (FK -> User)
  - `channel`: Enum(WHATSAPP)
  - `direction`: Enum(OUTBOUND)
  - `created_at`: Timestamp
- `vendor_whatsapp_entries`:
  - `id`: UUID (PK)
  - `lead_id`: UUID (FK -> VendorLead)
  - `screenshot_url`: String
  - `extracted_text`: Text
  - `created_at`: Timestamp

### Guests & Tables
- `guests`:
  - `id`: UUID (PK)
  - `wedding_id`: UUID (FK -> Wedding)
  - `name`: String
  - `side`: Enum(BRIDE, GROOM)
  - `rsvp_status`: Enum(PENDING, ACCEPTED, DECLINED)
  - `dietary_reqs`: String
  - `table_id`: UUID (FK -> Table, nullable)
- `tables`:
  - `id`: UUID (PK)
  - `wedding_id`: UUID (FK -> Wedding)
  - `name`: String
  - `capacity`: Integer