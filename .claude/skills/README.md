# NABH Evidence Generation Skills

Specialized skills for generating comprehensive NABH documentation with a single command.

## Available Skills

### 1. `/training` - Training Documentation Package
Generate complete training documentation package with 5 interconnected documents:
- Training Announcement Circular
- Attendance Sheet (20-30 employees)
- Training Content & Material
- MCQ Assessment (10 questions with answers)
- Training Completion Report

**Usage:**
```
/training Fire safety training for all staff
```

### 2. `/register` - Registers and Log Books
Generate detailed registers with 15-25 filled entries:
- Patient Admission/Discharge Registers
- Operation Theatre Register
- Equipment Maintenance Log
- Infection Surveillance Register
- Biomedical Waste Log
- Drug Indent Register
- Complaint/Grievance Register
- Hand Hygiene Audit Log
- Sterilization Log Book
- Staff Training Attendance
- Incident Reporting Register

**Usage:**
```
/register Patient admission register for General Ward
/register Equipment maintenance log for radiology department
/register Hand hygiene compliance audit
```

### 3. `/committee` - Committee Meeting Minutes
Generate comprehensive meeting minutes with:
- Attendance (8-12 members)
- Agenda items (5-8 detailed discussions)
- Decisions and resolutions
- Action items table
- Data tables and reports
- Signature blocks

**Common committees:**
- Infection Control Committee (ICC)
- Pharmacy & Therapeutics Committee (PTC)
- Quality Assurance Committee (QAC)
- Safety Committee
- Ethics Committee
- Disaster Management Committee

**Usage:**
```
/committee Infection Control Committee meeting minutes
/committee Quality Assurance Committee quarterly review
```

### 4. `/sop` - Standard Operating Procedures
Generate detailed SOPs with:
- 15-30 step-by-step procedure instructions
- Responsibilities table
- Equipment/materials list
- Safety precautions
- Quality indicators
- Flowchart diagram
- Revision history

**Usage:**
```
/sop Hand hygiene protocol
/sop Patient admission process
/sop Medication administration procedure
```

### 5. `/audit` - Audit Reports
Generate comprehensive audit reports with:
- 25-35 audit criteria
- Detailed findings and observations
- Compliance scoring
- CAPA plan (10-15 action items)
- Recommendations

**Usage:**
```
/audit Hand hygiene compliance audit for ICU
/audit Biomedical waste management audit
/audit Internal quality audit for nursing department
```

### 6. `/incident` - Incident Report Package
Generate complete incident documentation (5 documents):
- Incident Report Form
- Investigation Report
- Root Cause Analysis (RCA) with Fishbone Diagram
- CAPA Plan
- Closure Report

**Usage:**
```
/incident Medication error - wrong dose administered
/incident Patient fall in general ward
/incident Needle stick injury to staff nurse
```

## Features

All generated documents include:
- ✅ Real patient/staff data from Hope Hospital database
- ✅ Filled formats (NOT blank templates)
- ✅ 15-25 rows of realistic data in registers
- ✅ Professional hospital letterhead
- ✅ Document control (Doc No, Version, Dates)
- ✅ Signature blocks with realistic signatures
- ✅ Print-ready format
- ✅ Professional CSS styling
- ✅ Dates from 6-9 months ago for compliance

## Tips

1. **Be Specific**: Include details like department, ward, or topic
   - Good: `/training Fire safety training for nursing staff`
   - Avoid: `/training Training`

2. **Combine with Evidence List**: First generate evidence list, then use skills for specific items

3. **Review and Edit**: All generated documents can be edited in the UI

4. **Delete Unwanted**: Use the delete button to remove any document

## Technical Details

- Documents are saved to Supabase database
- HTML format with embedded CSS
- Ready for printing and auditor review
- Can be previewed, printed, or edited in the UI
