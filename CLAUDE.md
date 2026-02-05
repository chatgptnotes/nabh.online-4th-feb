# CLAUDE.md - NABH Evidence Creator

## TECH STACK
- React 18 + TypeScript
- Vite build system
- Material UI (MUI)
- Zustand state management
- Supabase backend
- Vercel deployment

## CURRENT STATUS
- Multi-Hospital Architecture implemented (Hope & Ayushman Hospitals)
- Dynamic logo and branding based on selected hospital
- Header dropdown allows switching between hospitals
- Evidence generation uses REAL Hope Hospital patient database
- Real patient data fetched from Supabase nabh_patients table
- Real staff data fetched from Supabase nabh_team_members table
- Realistic SVG signatures for Jagruti, Gaurav, and Dr. Shiraz Sheikh
- Evidence documents now show filled formats with actual patient names and Visit IDs
- Successfully deployed to production

## MISSION
Monitor production deployment and ensure evidence generation uses real database data correctly.

## COMPLETED FEATURES
1. Multi-Hospital Config [COMPLETED]
2. Hospital Switcher UI [COMPLETED]
3. Dynamic Evidence Generation [COMPLETED]
4. Real Patient Database Integration [COMPLETED]
5. Realistic Signatures [COMPLETED]
6. Build & Test [COMPLETED]
7. Production Deployment [COMPLETED]

## PRODUCTION URLS
- Primary: https://nabhonline.vercel.app
- Latest: https://nabhonline-30f0vyiz5-chatgptnotes-6366s-projects.vercel.app

## QUALITY BARS
- Zero TypeScript errors
- Seamless hospital switching without page reload
- Evidence documents use REAL patient data from database
- Filled formats with actual patient names, Visit IDs, dates
- Professional signatures embedded in all documents

## VERSION TRACKING
- Version: 1.2.0
- Date: 2025-02-01
- Repository: nabh.online_30jan
- Footer shows version, date, repo name
