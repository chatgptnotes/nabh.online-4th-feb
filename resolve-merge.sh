#!/bin/bash

# Merge Resolution Script
# This script helps resolve the conflict between evidence and main branches

echo "🔀 Starting merge of main into evidence branch..."
echo ""

# Make sure we're on evidence branch
git checkout evidence

echo "📝 Current branch:"
git branch --show-current
echo ""

# Try to merge main
echo "🔄 Attempting to merge main branch..."
git merge main

# Check if there are conflicts
if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Merge conflict detected!"
  echo ""
  echo "📋 Conflicted files:"
  git status --short | grep "^UU"
  echo ""
  echo "To resolve:"
  echo "1. Check MERGE_RESOLUTION.md for detailed instructions"
  echo "2. Edit src/components/AIEvidenceGenerator.tsx"
  echo "3. Keep BOTH feature sets (save functionality + signatories)"
  echo "4. Run: git add src/components/AIEvidenceGenerator.tsx"
  echo "5. Run: git commit -m 'merge: combine save and signatories features'"
  echo ""
  echo "Or abort the merge with: git merge --abort"
else
  echo "✅ Merge completed successfully with no conflicts!"
  echo ""
  echo "📊 Changes:"
  git log --oneline -1
  echo ""
  echo "Next steps:"
  echo "1. Test the application: npm run dev"
  echo "2. Push to remote: git push"
fi
