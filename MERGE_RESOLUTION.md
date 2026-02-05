# Git Merge Conflict Resolution Guide

## Conflict Location
File: `src/components/AIEvidenceGenerator.tsx`

## Conflicting Features

### Evidence Branch Features:
- Save document to database functionality
- `saveStatus`, `saveMessage`, `savedDocuments` state
- Save/View saved document buttons
- Success/Error alerts for save operations

### Main Branch Features:
- Editable preview dialog
- Employee/Signatories dropdowns
- `preparedBy`, `reviewedBy`, `approvedBy` state
- Fetch employees from Supabase
- Apply signatories to all documents

## Resolution Strategy: KEEP BOTH

Both features are complementary and should be merged together.

## Step-by-Step Resolution:

### 1. State Variables Section (around line 540)

**MERGE BOTH** - Keep all state variables from both branches:

```typescript
  // Document view mode state (for each document: 0 = HTML preview, 1 = Edit text)
  const [documentViewModes, setDocumentViewModes] = useState<Record<number, number>>({});

  // Save document state (from evidence branch)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [savedDocuments, setSavedDocuments] = useState<Record<number, string>>({});

  // Editable preview dialog state (from main branch)
  const [editablePreviewOpen, setEditablePreviewOpen] = useState(false);
  const [editablePreviewIndex, setEditablePreviewIndex] = useState<number | null>(null);
  const editableIframeRef = useRef<HTMLIFrameElement>(null);

  // Employee dropdown state for signatories (from main branch)
  const [employees, setEmployees] = useState<{id: string, name: string, designation: string}[]>([]);
  const [preparedBy, setPreparedBy] = useState({ name: '', designation: '', date: '' });
  const [reviewedBy, setReviewedBy] = useState({ name: '', designation: '', date: '' });
  const [approvedBy, setApprovedBy] = useState({ name: '', designation: '', date: '' });

  // Fetch employees from Supabase on mount (from main branch)
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('nabh_team_members')
        .select('id, name, designation')
        .eq('is_active', true)
        .order('name');
      if (data && !error) {
        const employeeData = data as unknown as {id: string, name: string, designation: string}[];
        setEmployees(employeeData);
        const coordinator = employeeData.find(e => e.designation?.toLowerCase().includes('nabh coordinator'));
        if (coordinator) {
          setApprovedBy({ name: coordinator.name, designation: coordinator.designation, date: new Date().toISOString().split('T')[0] });
        }
      }
    };
    fetchEmployees();
  }, []);
```

### 2. Generated Content Section (around line 1620)

**MERGE BOTH** - Show save alerts AND signatories section:

```typescript
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        All documents created with {hospitalConfig.name} branding. Review and customize as needed.
                      </Typography>
                    </Alert>

                    {/* Save status alerts (from evidence branch) */}
                    {saveStatus === 'success' && (
                      <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveStatus('idle')}>
                        <Typography variant="body2">{saveMessage}</Typography>
                      </Alert>
                    )}

                    {saveStatus === 'error' && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveStatus('idle')}>
                        <Typography variant="body2">{saveMessage}</Typography>
                      </Alert>
                    )}

                    {/* Document Signatories Section (from main branch) */}
                    <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon color="primary">badge</Icon>
                        Document Signatories
                      </Typography>
                      <Grid container spacing={2}>
                        {/* PREPARED BY */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>PREPARED BY</Typography>
                          <Autocomplete
                            size="small"
                            options={employees}
                            getOptionLabel={(option) => option.name}
                            value={employees.find(e => e.name === preparedBy.name) || null}
                            onChange={(_, newValue) => {
                              if (newValue) {
                                setPreparedBy({ ...preparedBy, name: newValue.name, designation: newValue.designation });
                              } else {
                                setPreparedBy({ ...preparedBy, name: '', designation: '' });
                              }
                            }}
                            renderInput={(params) => <TextField {...params} label="Select Name" />}
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            size="small"
                            fullWidth
                            label="Designation"
                            value={preparedBy.designation}
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 1, bgcolor: 'white' }}
                          />
                          <TextField
                            size="small"
                            fullWidth
                            label="Date"
                            type="date"
                            value={preparedBy.date}
                            onChange={(e) => setPreparedBy({ ...preparedBy, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: 'white' }}
                          />
                        </Grid>

                        {/* REVIEWED BY */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>REVIEWED BY</Typography>
                          <Autocomplete
                            size="small"
                            options={employees}
                            getOptionLabel={(option) => option.name}
                            value={employees.find(e => e.name === reviewedBy.name) || null}
                            onChange={(_, newValue) => {
                              if (newValue) {
                                setReviewedBy({ ...reviewedBy, name: newValue.name, designation: newValue.designation });
                              } else {
                                setReviewedBy({ ...reviewedBy, name: '', designation: '' });
                              }
                            }}
                            renderInput={(params) => <TextField {...params} label="Select Name" />}
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            size="small"
                            fullWidth
                            label="Designation"
                            value={reviewedBy.designation}
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 1, bgcolor: 'white' }}
                          />
                          <TextField
                            size="small"
                            fullWidth
                            label="Date"
                            type="date"
                            value={reviewedBy.date}
                            onChange={(e) => setReviewedBy({ ...reviewedBy, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: 'white' }}
                          />
                        </Grid>

                        {/* APPROVED BY */}
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>APPROVED BY</Typography>
                          <Autocomplete
                            size="small"
                            options={employees}
                            getOptionLabel={(option) => option.name}
                            value={employees.find(e => e.name === approvedBy.name) || null}
                            onChange={(_, newValue) => {
                              if (newValue) {
                                setApprovedBy({ ...approvedBy, name: newValue.name, designation: newValue.designation });
                              } else {
                                setApprovedBy({ ...approvedBy, name: '', designation: '' });
                              }
                            }}
                            renderInput={(params) => <TextField {...params} label="Select Name" />}
                            sx={{ mb: 1 }}
                          />
                          <TextField
                            size="small"
                            fullWidth
                            label="Designation"
                            value={approvedBy.designation}
                            InputProps={{ readOnly: true }}
                            sx={{ mb: 1, bgcolor: 'white' }}
                          />
                          <TextField
                            size="small"
                            fullWidth
                            label="Date"
                            type="date"
                            value={approvedBy.date}
                            onChange={(e) => setApprovedBy({ ...approvedBy, date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: 'white' }}
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<Icon>check</Icon>}
                          onClick={applySignatoriesToDocuments}
                        >
                          Apply to All Documents
                        </Button>
                      </Box>
                    </Paper>
```

## Commands to Resolve (if you have an active conflict):

```bash
# If you're in the middle of a merge:
git checkout --ours src/components/AIEvidenceGenerator.tsx   # Keep evidence version
# Then manually add the signatories code from main

# OR use a merge tool
git mergetool

# After resolving
git add src/components/AIEvidenceGenerator.tsx
git commit -m "merge: resolve conflict - keep both save and signatories features"
```

## Result:
✅ Save document functionality (from evidence branch)
✅ Signatories functionality (from main branch)
✅ All state variables from both branches
✅ All UI elements from both branches
