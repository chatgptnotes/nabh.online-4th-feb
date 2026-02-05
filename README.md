# NABH Evidence Creator

A comprehensive evidence management system for NABH (National Accreditation Board for Hospitals) SHCO 3rd Edition accreditation preparation.

## Features

- **10 NABH Chapters**: AAC, COP, MOM, PRE, HIC, PSQ, ROM, FMS, HRM, IMS
- **Objective Elements Tracking**: View and manage all objective elements per chapter
- **Evidence Management**: Track evidence lists and uploaded files
- **Status Tracking**: Monitor progress with status (Not Started, In Progress, Blocked, Completed)
- **Priority Classification**: CORE, Previous NC, P0-P3 priorities
- **Assignee Management**: Track who is responsible for each element
- **Search and Filter**: Find specific objectives quickly
- **Progress Dashboard**: Visual overview of completion status

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Material UI (MUI)
- Zustand (State Management)
- Google Material Icons

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

The application runs on `http://localhost:5173` by default.

## Project Structure

```
src/
├── components/
│   ├── Header.tsx        # App header with navigation
│   ├── Sidebar.tsx       # Chapter navigation sidebar
│   ├── Dashboard.tsx     # Overview dashboard
│   ├── ObjectiveList.tsx # Objective elements table
│   ├── ObjectiveDetail.tsx # Detail dialog
│   └── Footer.tsx        # Version footer
├── data/
│   └── nabhData.ts       # NABH chapters and objectives data
├── store/
│   └── nabhStore.ts      # Zustand state management
├── types/
│   └── nabh.ts           # TypeScript types
├── App.tsx               # Main application
└── main.tsx              # Entry point
```

## NABH Chapters

1. **AAC** - Access, Assessment and Continuity of Care
2. **COP** - Care of Patients
3. **MOM** - Management of Medication
4. **PRE** - Patient Rights and Education
5. **HIC** - Hospital Infection Control
6. **PSQ** - Patient Safety and Quality Improvement
7. **ROM** - Responsibilities of Management
8. **FMS** - Facility Management and Safety
9. **HRM** - Human Resource Management
10. **IMS** - Information Management System

## Environment Variables

No environment variables required for basic usage.

## License

Private - Internal use only.

---

v1.0 | 2026-01-26 | nabh-evidence-creator
