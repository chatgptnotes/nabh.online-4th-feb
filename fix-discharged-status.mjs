// Fix patients with discharge date to have "Discharged" status
// Run with: node fix-discharged-status.mjs

import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length) {
    env[key.trim()] = value.join('=').trim();
  }
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

async function fixDischargedStatus() {
  console.log('Fixing patients with discharge date to have "Discharged" status...\n');

  // First, get count of patients that need to be fixed
  const countResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/nabh_patients?discharge_date=not.is.null&status=eq.Active&select=id`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!countResponse.ok) {
    console.error('Error counting patients:', await countResponse.text());
    return;
  }

  const patientsToFix = await countResponse.json();
  console.log(`Found ${patientsToFix.length} patients with discharge date but status "Active"`);

  if (patientsToFix.length === 0) {
    console.log('No patients to fix!');
    return;
  }

  // Update all patients with discharge_date to have status = 'Discharged'
  const updateResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/nabh_patients?discharge_date=not.is.null&status=eq.Active`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        status: 'Discharged',
        updated_at: new Date().toISOString()
      }),
    }
  );

  if (!updateResponse.ok) {
    console.error('Error updating patients:', await updateResponse.text());
    return;
  }

  const updatedPatients = await updateResponse.json();
  console.log(`\n✅ Successfully updated ${updatedPatients.length} patients to "Discharged" status`);

  // Show summary
  const summaryResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/nabh_patients?select=status`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (summaryResponse.ok) {
    const allPatients = await summaryResponse.json();
    const statusCounts = allPatients.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
  }
}

fixDischargedStatus().catch(console.error);
