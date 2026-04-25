# TODO-0107: Class CRUD Full Implementation

## Overview
Add complete CRUD (Create, Read, Update, Delete) for classes across all interfaces.

### Interfaces
- **FE**: React dashboard for class management
- **Server**: SQLite database layer
- **Bot**: Telegram admin commands
- **API**: RESTful endpoints

### Status
- [ ] Phase 1: Database schema + Server queries
- [ ] Phase 2: REST API endpoints
- [ ] Phase 3: Bot commands
- [ ] Phase 4: Frontend (optional, if React)

---

## Phase 1: Database Schema & Queries

### 1.1 Enhanced Classes Table

```sql
ALTER TABLE classes ADD COLUMN day_of_week TEXT;      -- "monday", "tuesday", etc.
ALTER TABLE classes ADD COLUMN start_time TEXT;     -- "20:00"
ALTER TABLE courses ADD COLUMN end_time TEXT;      -- "21:30"
ALTER TABLE classes ADD COLUMN description_en TEXT; -- English description
ALTER TABLE classes ADD COLUMN description_de TEXT;
-- etc for all 8 languages
```

### 1.2 New Database Functions (server.js)

```javascript
// Required queries
const createClass = (classData) => { /* ... */ }
const updateClass = (id, classData) => { /* ... */ }
const deleteClass = (id) => { /* ... */ }
const getClass = (id) => { /* ... */ }
const listClasses = (filters) => { /* ... */ }
const getClassesByDay = (day) => { /* ... */ }
```

---

## Phase 2: REST API Endpoints

### 2.1 Existing (to enhance)

| Method | Endpoint | Current | Enhanced |
|--------|----------|---------|----------|
| GET | `/api/classes` | ✓ | Add filters, pagination |
| GET | `/api/classes/:id` | ✓ | Add translations |
| POST | `/api/admin/classes` | ✓ | Full field support |
| DELETE | `/api/admin/classes/:id` | ✓ | Soft delete |

### 2.2 New Endpoints to Add

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/admin/classes/:id` | Update class |
| PATCH | `/api/admin/classes/:id` | Partial update |
| GET | `/api/admin/classes` | List all (admin view) |
| GET | `/api/classes/days` | Classes grouped by day |

### 2.3 Request/Response Examples

```javascript
// POST /api/admin/classes
{
  id: "mon-2000-salsa",
  title: "Salsa Beginners",
  title_de: "Salsa Anfänger",
  title_ru: "Сальса для начинающих",
  instructor: "Tony",
  day_of_week: "monday",
  start_time: "20:00",
  end_time: "21:30",
  max_capacity: 20,
  status: "open",           // "open" | "blocked" | "completed"
  external_url: "https://...",
  description: "...",
  description_de: "...",
  description_ru: "..."
}

// PUT /api/admin/classes/:id
{
  title: "Salsa Intermediate",  // All fields optional on PATCH
  max_capacity: 25,
  status: "blocked"
}

// GET /api/classes/days
{
  "monday": [class, class],
  "tuesday": [],
  "wednesday": [class],
  // ...
}
```

---

## Phase 3: Bot Commands (Telegram)

### 3.1 New Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/add_class` | Create new class | `/add_class mon-2000-salsa\|Salsa\|Tony\|Mon 20:00\|20` |
| `/set_class` | Update class | `/set_class mon-2000-salsa capacity=25` |
| `/del_class` | Delete class | `/del_class mon-2000-salsa` |
| `/list_classes` | List all classes | `/list_classes` |
| `/class mon-2000-salsa` | View class details | `/class mon-2000-salsa` |
| `/block mon-2000-salsa` | Close class | `/block mon-2000-salsa` |
| `/open mon-2000-salsa` | Open class | `/open mon-2000-salsa` |

### 3.2 Command Syntax

```
/add_class <id> <title> [instructor] [schedule] [capacity]

Examples:
/add_class mon-2000-salsa|Salsa Beginner|Tony|Mon 20:00|20
/add_class wed-2100-tango|Tango|Tue|Wed 21:00
/add_class sat-1800-bachata|Bachata|So 18:00

/set_class <id> field=value[|field=value...]

Examples:
/set_class mon-2000-salsa title=Salsa Advanced|capacity=15
/set_class mon-2000-salsa status=blocked

/class <id>

/list_classes [day|status|open]

Examples:
/list_classes
/list_classes monday
/list_classes open
```

### 3.3 Inline Keyboards

```javascript
// Class selection for /class command
{
  inline_keyboard: [
    [{ text: "Mon 20:00 Salsa", callback_data: "class:mon-2000-salsa" }],
    [{ text: "Wed 21:00 Tango", callback_data: "class:wed-2100-tango" }],
    [{ text: "Sat 18:00 Bachata", callback_data: "class:sat-1800-bachata" }],
  ]
}

// Class management (admin only)
{
  inline_keyboard: [
    [{ text: "✏️ Edit", callback_data: "admin:edit_class:{id}" }],
    [{ text: "🔒 Block", callback_data: "admin:block_class:{id}" }],
    [{ text: "🗑️ Delete", callback_data: "admin:delete_class:{id}" }],
  ]
}
```

### 3.4 i18n Keys for Class Management

```javascript
// New i18n keys (add to DEFAULTS)
class_add_success: "✅ Class {title} created (ID: {id})",
class_add_error: "❌ Failed to create class: {error}",
class_update_success: "✅ Class updated: {changes}",
class_delete_success: "✅ Class {id} deleted.",
class_not_found: "❌ Class {id} not found.",
class_list_header: "📋 Classes ({count}):",
class_details: "*{title}*\nID: {id}\n👤 {instructor}\n🕐 {schedule}\n👥 {enrolled}/{capacity}\n🔖 {status}",
class_confirm_delete: "❓ Delete class {title}? This will also delete {enrolled} enrollments.",
class_delete_confirmed: "🗑️ Class deleted.",

// Days of week
day_monday: "Monday",
day_tuesday: "Tuesday",
// ... all 7 days in 8 languages
```

---

## Phase 4: Frontend (React)

### 4.1 Class List View

```jsx
// /classes page
<ClassesList
  filters={{ day: "monday", status: "open" }}
  onSelect={class => setSelected(class)}
  onEdit={class => navigate(`/admin/classes/${class.id}/edit`)}
/>

// Components needed:
// - ClassesList
// - ClassCard
// - ClassFilters (day, status, search)
// - ClassSchedule (week view grid)
```

### 4.2 Class Edit Form

```jsx
// /admin/classes/[id] page
<ClassForm
  class={selectedClass}
  onSave={saveClass}
  onDelete={deleteClass}
  translations={{ en, de, ru, uk, fr, tr, it, es }}
/>

// Fields:
// - id (readonly if has enrollments)
// - title (per language tab)
// - instructor
// - day_of_week (dropdown)
// - start_time, end_time (time pickers)
// - max_capacity (number)
// - status (radio: open/blocked/completed)
// - external_url
// - description (per language tab, markdown)
```

### 4.3 Week Schedule Grid

```jsx
<ScheduleGrid
  days={["monday", "tuesday", "wednesday", ...]}
  classes={classes}
  timeSlots={["18:00", "19:00", "20:00", "21:00", "22:00"]}
/>
```

---

## Test Suite (TDD)

### Unit Tests (server/database)

```javascript
describe("createClass", () => {
  it("creates class with all fields", () => {
    const c = createClass({ id: "test-1", title: "Test" });
    expect(c.id).toBe("test-1");
  });
  it("rejects duplicate id", () => {
    expect(() => createClass({ id: "dup" })).toThrow("UNIQUE constraint");
  });
  it("validates required fields", () => {
    expect(() => createClass({})).toThrow("id, title required");
  });
  it("generates id if not provided", () => {
    const c = createClass({ title: "Test" });
    expect(c.id).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("updateClass", () => {
  it("updates single field", () => {
    const c = updateClass("test-1", { title: "Updated" });
    expect(c.title).toBe("Updated");
  });
  it("preserves other fields", () => {
    updateClass("test-1", { title: "New" });
    const c = getClass("test-1");
    expect(c.instructor).toBe("Tony"); // preserved
  });
});

describe("deleteClass", () => {
  it("deletes class and enrollments", () => {
    deleteClass("test-1");
    expect(getClass("test-1")).toBeNull();
  });
});
```

### Integration Tests (API)

```javascript
describe("POST /api/admin/classes", () => {
  it("creates class", () => {
    const res = await request.post("/api/admin/classes", classData);
    expect(res.status).toBe(201);
  });
  it("returns created class", () => {
    const res = await request.post("/api/admin/classes", classData);
    expect(res.body.id).toBeDefined();
  });
});

describe("PUT /api/admin/classes/:id", () => {
  it("updates class", () => {
    const res = await request.put("/api/admin/classes/test-1", { title: "New" });
    expect(res.body.title).toBe("New");
  });
  it("returns 404 for missing", () => {
    const res = await request.put("/api/admin/classes/missing", {});
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/admin/classes/:id", () => {
  it("deletes class", () => {
    const res = await request.delete("/api/admin/classes/test-1");
    expect(res.status).toBe(200);
  });
});
```

### Bot Command Tests

```javascript
describe("/add_class command", () => {
  it("creates class with all params", () => {
    const msg = parse("/add_class test-class|Test|Tue|20:00|15");
    expect(add_class(msg)).toMatch(/created/i);
  });
  it("uses defaults for missing params", () => {
    const msg = parse("/add_class test-class2|Test");
    expect(add_class(msg)).toContain("Tony"); // default instructor
  });
  it("rejects duplicate id", () => {
    const msg = parse("/add_class existing-class|Test");
    expect(add_class(msg)).toContain("already exists");
  });
});

describe("/set_class command", () => {
  it("updates single field", () => {
    const msg = parse("/set_class test-1 capacity=25");
    expect(set_class(msg)).toContain("25");
  });
  it("updates multiple fields", () => {
    const msg = parse("/set_class test-1 title=New|capacity=30");
    expect(set_class(msg)).toMatch(/updated/i);
  });
});

describe("/class command", () => {
  it("shows class details", () => {
    const msg = parse("/class test-1");
    expect(class_details(msg)).toContain("test-1");
  });
  it("shows inline keyboard with actions", () => {
    const msg = parse("/class test-1");
    expect(class_details(msg)).toContain("Edit");
  });
});

describe("/list_classes command", () => {
  it("lists all classes", () => {
    const msg = parse("/list_classes");
    expect(list_classes(msg)).toContain("test-");
  });
  it("filters by day", () => {
    const msg = parse("/list_classes monday");
    expect(list_classes(msg)).toMatch(/monday/i);
  });
  it("filters by status", () => {
    const msg = parse("/list_classes open");
    expect(list_classes(msg)).toMatch(/open/i);
  });
});
```

### Frontend Tests (if React)

```javascript
describe("ClassesList", () => {
  it("renders classes", () => {
    render(<ClassesList classes={[...]} />);
    expect(screen.getByText("Salsa")).toBeInTheDocument();
  });
  it("filters by day", () => {
    render(<ClassesList day="monday" />);
    expect(screen.queryByText("Tuesday")).not.toBeInTheDocument();
  });
});

describe("ClassForm", () => {
  it("validates required fields", () => {
    render(<ClassForm />);
    expect(validate()).toContain("ID required");
  });
  it("saves translations", () => {
    render(<ClassForm />);
    fireEvent.click(screen.getByText("DE"));
    fireEvent.change(screen.getByLabelText("Title"), " Salsa");
    expect(save).toContain("title_de");
  });
});
```

---

## Implementation Order

1. **Database**: Add queries to server.js
2. **API**: Enhance existing + add new endpoints
3. **Bot**: Add commands + i18n keys
4. **Tests**: Write first, then implement

---

## Files to Modify

- `bot/src/server.js` - Add queries + API endpoints
- `bot/src/i18n.js` - Add class-related keys
- `tests/unit/` - Add unit tests
- `tests/integration/` - Add API tests
- `tests/unit/bot-commands.test.ts` - Add bot tests
- `frontend/` - Add React components (optional)

---

## Acceptance Criteria

- [ ] Can create class via bot with: ID, title, instructor, schedule, capacity
- [ ] Can update any class field via bot
- [ ] Can delete class (cascades to enrollments)
- [ ] Can list all classes, filter by day/status
- [ ] Can view class details in bot
- [ ] All 8 languages work for class messages
- [ ] All CRUD works via REST API
- [ ] 100% test coverage for class operations