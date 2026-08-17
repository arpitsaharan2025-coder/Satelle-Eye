// Backend Service for Export and Share Functionality
import { NaturalEvent } from './eonetService';
import { getEventSeverity } from './disasterBackendService';

export interface ExportResult {
  success: boolean;
  data: string;
  filename: string;
  format: 'csv' | 'json';
}

export interface ShareResult {
  success: boolean;
  shareUrl?: string;
  reportId?: string;
  expiresAt?: Date;
}

/**
 * Export disaster data to CSV format
 */
export async function exportDisasterData(
  events: NaturalEvent[],
  severityFilter: string,
  typeFilter: string
): Promise<ExportResult> {
  try {
    // Generate CSV header
    const headers = [
      'Event ID',
      'Title',
      'Category',
      'Severity',
      'Latitude',
      'Longitude',
      'First Detected',
      'Last Updated',
      'Magnitude',
      'Description'
    ];

    // Generate CSV rows
    const rows = events.map(event => {
      const geometry = event.geometry[event.geometry.length - 1];
      const lat = geometry?.coordinates?.[1] || 'N/A';
      const lon = geometry?.coordinates?.[0] || 'N/A';
      const severity = getEventSeverity(event);
      const category = event.categories.map(c => c.title).join('; ');
      const magnitude = geometry?.magnitudeValue || 'N/A';
      const firstDetected = event.geometry[0]?.date || 'N/A';
      const lastUpdated = geometry?.date || 'N/A';
      const description = (event.description || 'N/A').replace(/,/g, ';').replace(/\n/g, ' ');

      return [
        event.id,
        `"${event.title.replace(/"/g, '""')}"`,
        `"${category}"`,
        severity,
        lat,
        lon,
        firstDetected,
        lastUpdated,
        magnitude,
        `"${description}"`
      ].join(',');
    });

    // Combine header and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Add metadata header
    const metadata = [
      `# Satell-Eye Disaster Report`,
      `# Generated: ${new Date().toISOString()}`,
      `# Total Events: ${events.length}`,
      `# Severity Filter: ${severityFilter}`,
      `# Type Filter: ${typeFilter}`,
      `#`,
      ''
    ].join('\n');

    const fullCsv = metadata + csvContent;

    console.log(`[Export] Successfully exported ${events.length} events to CSV`);

    return {
      success: true,
      data: fullCsv,
      filename: `disaster-report-${new Date().toISOString().split('T')[0]}.csv`,
      format: 'csv'
    };
  } catch (error) {
    console.error('[Export] Error exporting disaster data:', error);
    return {
      success: false,
      data: '',
      filename: '',
      format: 'csv'
    };
  }
}

/**
 * Export disaster data to JSON format
 */
export async function exportDisasterDataJSON(
  events: NaturalEvent[],
  severityFilter: string,
  typeFilter: string
): Promise<ExportResult> {
  try {
    const exportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalEvents: events.length,
        filters: {
          severity: severityFilter,
          type: typeFilter
        },
        platform: 'Satell-Eye',
        version: '1.0.0'
      },
      events: events.map(event => {
        const geometry = event.geometry[event.geometry.length - 1];
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          categories: event.categories.map(c => ({
            id: c.id,
            title: c.title
          })),
          severity: getEventSeverity(event),
          location: {
            latitude: geometry?.coordinates?.[1] || null,
            longitude: geometry?.coordinates?.[0] || null,
            magnitude: geometry?.magnitudeValue || null,
            magnitudeUnit: geometry?.magnitudeUnit || null
          },
          timeline: {
            firstDetected: event.geometry[0]?.date || null,
            lastUpdated: geometry?.date || null
          },
          sources: event.sources || []
        };
      })
    };

    const jsonContent = JSON.stringify(exportData, null, 2);

    console.log(`[Export] Successfully exported ${events.length} events to JSON`);

    return {
      success: true,
      data: jsonContent,
      filename: `disaster-report-${new Date().toISOString().split('T')[0]}.json`,
      format: 'json'
    };
  } catch (error) {
    console.error('[Export] Error exporting disaster data to JSON:', error);
    return {
      success: false,
      data: '',
      filename: '',
      format: 'json'
    };
  }
}

/**
 * Generate a shareable report
 * In a real implementation, this would upload to a backend server
 */
export async function generateShareableReport(
  events: NaturalEvent[],
  severityFilter: string,
  typeFilter: string
): Promise<ShareResult> {
  try {
    // Simulate backend processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a unique report ID (in production, this would come from backend)
    const reportId = `SATL-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Calculate summary statistics
    const severityCounts = {
      Critical: events.filter(e => getEventSeverity(e) === 'Critical').length,
      High: events.filter(e => getEventSeverity(e) === 'High').length,
      Medium: events.filter(e => getEventSeverity(e) === 'Medium').length,
      Low: events.filter(e => getEventSeverity(e) === 'Low').length
    };

    // Create report summary
    const reportSummary = {
      id: reportId,
      generatedAt: new Date().toISOString(),
      totalEvents: events.length,
      severityCounts,
      filters: {
        severity: severityFilter,
        type: typeFilter
      },
      topEvents: events.slice(0, 5).map(e => ({
        title: e.title,
        severity: getEventSeverity(e),
        category: e.categories[0]?.title || 'Unknown'
      }))
    };

    // In production, this would be a real backend URL
    // For now, we'll create a data URL that can be shared
    const shareUrl = `https://satell-eye.app/reports/${reportId}`;

    // Store report in localStorage for demo purposes
    // In production, this would be sent to backend
    localStorage.setItem(`report-${reportId}`, JSON.stringify(reportSummary));

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log(`[Share] Generated shareable report: ${reportId}`);
    console.log(`[Share] Report URL: ${shareUrl}`);
    console.log(`[Share] Expires: ${expiresAt.toISOString()}`);

    return {
      success: true,
      shareUrl,
      reportId,
      expiresAt
    };
  } catch (error) {
    console.error('[Share] Error generating shareable report:', error);
    return {
      success: false
    };
  }
}

/**
 * Retrieve a shared report by ID
 */
export async function getSharedReport(reportId: string): Promise<any> {
  try {
    // In production, this would fetch from backend
    const reportData = localStorage.getItem(`report-${reportId}`);
    
    if (!reportData) {
      throw new Error('Report not found or expired');
    }

    return JSON.parse(reportData);
  } catch (error) {
    console.error('[Share] Error retrieving shared report:', error);
    throw error;
  }
}

/**
 * Generate PDF report (placeholder for future implementation)
 */
export async function generatePDFReport(
  events: NaturalEvent[],
  severityFilter: string,
  typeFilter: string
): Promise<Blob> {
  // This would use a library like jsPDF in production
  console.log('[PDF] PDF generation not yet implemented');
  throw new Error('PDF generation not yet implemented');
}
