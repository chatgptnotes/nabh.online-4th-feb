// KPI Graph Storage Service for Supabase
// Handles storing KPI graphs and their history

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// KPI Graph record structure
export interface KPIGraphRecord {
  id: string;
  kpi_id: string;
  kpi_number: number;
  kpi_name: string;
  graph_url: string;
  graph_data: KPIDataEntry[];
  prompt_used?: string;
  ai_modifications?: string;
  created_at: string;
  is_current: boolean;
}

export interface KPIDataEntry {
  month: string;
  value: number;
  target: number;
  numeratorValue?: number;
  denominatorValue?: number;
  remarks?: string;
}

/**
 * Convert base64 data URL to Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload KPI graph image to Supabase Storage
 */
async function uploadGraphToStorage(
  kpiId: string,
  dataUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const blob = dataURLtoBlob(dataUrl);
    const timestamp = Date.now();
    const fileName = `kpi-graphs/${kpiId}/${timestamp}.png`;

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/nabh-evidence/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': blob.type,
          'x-upsert': 'true',
        },
        body: blob,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Storage upload failed:', uploadResponse.status, errorText);
      return { success: false, error: `Upload failed: ${errorText}` };
    }

    // Get the public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/nabh-evidence/${fileName}`;
    console.log('KPI graph uploaded to:', publicUrl);

    return { success: true, url: publicUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading KPI graph:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Save KPI graph record to database
 */
export async function saveKPIGraph(
  kpiId: string,
  kpiNumber: number,
  kpiName: string,
  canvasDataUrl: string,
  graphData: KPIDataEntry[],
  promptUsed?: string,
  aiModifications?: string
): Promise<{ success: boolean; id?: string; url?: string; error?: string }> {
  try {
    // First, mark any existing current graph as not current
    await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs?kpi_id=eq.${kpiId}&is_current=eq.true`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ is_current: false }),
      }
    );

    // Upload graph image to storage
    const uploadResult = await uploadGraphToStorage(kpiId, canvasDataUrl);
    if (!uploadResult.success || !uploadResult.url) {
      return { success: false, error: uploadResult.error || 'Failed to upload graph image' };
    }

    // Save graph record to database
    const graphRecord = {
      kpi_id: kpiId,
      kpi_number: kpiNumber,
      kpi_name: kpiName,
      graph_url: uploadResult.url,
      graph_data: graphData,
      prompt_used: promptUsed || null,
      ai_modifications: aiModifications || null,
      is_current: true,
    };

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(graphRecord),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error saving KPI graph record:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const savedId = data[0]?.id;

    return { success: true, id: savedId, url: uploadResult.url };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving KPI graph:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load all graph history for a KPI
 */
export async function loadKPIGraphHistory(
  kpiId: string
): Promise<{ success: boolean; data?: KPIGraphRecord[]; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs?kpi_id=eq.${kpiId}&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading KPI graph history:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, data: data as KPIGraphRecord[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading KPI graph history:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load the current/latest graph for a KPI
 */
export async function loadCurrentKPIGraph(
  kpiId: string
): Promise<{ success: boolean; data?: KPIGraphRecord; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs?kpi_id=eq.${kpiId}&is_current=eq.true&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading current KPI graph:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return { success: true, data: undefined };
    }

    return { success: true, data: data[0] as KPIGraphRecord };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading current KPI graph:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a specific graph record
 */
export async function deleteKPIGraph(
  graphId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs?id=eq.${graphId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting KPI graph:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting KPI graph:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Restore a previous graph version as current
 */
export async function restoreKPIGraph(
  kpiId: string,
  graphId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark all graphs for this KPI as not current
    await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs?kpi_id=eq.${kpiId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ is_current: false }),
      }
    );

    // Mark the selected graph as current
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs?id=eq.${graphId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ is_current: true }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error restoring KPI graph:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error restoring KPI graph:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load all KPI graphs for dashboard view
 */
export async function loadAllKPIGraphs(): Promise<{
  success: boolean;
  data?: Record<string, KPIGraphRecord>;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_kpi_graphs?is_current=eq.true&order=kpi_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading all KPI graphs:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const graphsMap: Record<string, KPIGraphRecord> = {};

    for (const graph of data as KPIGraphRecord[]) {
      graphsMap[graph.kpi_id] = graph;
    }

    return { success: true, data: graphsMap };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading all KPI graphs:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
