// Email Service for Sharing Reports
import { NaturalEvent } from './eonetService';
import { getEventSeverity } from './disasterBackendService';

export interface EmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

/**
 * Send disaster report via email
 * In production, this would use a backend email service like SendGrid, AWS SES, or Mailgun
 */
export async function sendReportEmail(
  recipientEmail: string,
  events: NaturalEvent[],
  severityFilter: string,
  typeFilter: string
): Promise<EmailResult> {
  try {
    console.log(`[Email] Sending report to: ${recipientEmail}`);
    
    // Validate email
    if (!isValidEmail(recipientEmail)) {
      throw new Error('Invalid email address');
    }
    
    // Generate report content
    const emailContent = generateEmailReport(events, severityFilter, typeFilter);
    
    // In production, this would call your backend API:
    /*
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        attachments: emailContent.attachments
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: data.messageId
    };
    */
    
    // Demo implementation - simulate email sending
    await simulateEmailSending(recipientEmail, emailContent);
    
    return {
      success: true,
      message: `Report email sent successfully to ${recipientEmail}`,
      messageId: `MSG-${Date.now()}-${Math.random().toString(36).substring(7)}`
    };
    
  } catch (error: any) {
    console.error('[Email] Error sending email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email'
    };
  }
}

/**
 * Generate HTML email content
 */
function generateEmailReport(
  events: NaturalEvent[],
  severityFilter: string,
  typeFilter: string
): { subject: string; html: string; text: string; attachments: any[] } {
  const timestamp = new Date().toLocaleString();
  
  // Calculate statistics
  const severityCounts = {
    Critical: events.filter(e => getEventSeverity(e) === 'Critical').length,
    High: events.filter(e => getEventSeverity(e) === 'High').length,
    Medium: events.filter(e => getEventSeverity(e) === 'Medium').length,
    Low: events.filter(e => getEventSeverity(e) === 'Low').length
  };
  
  const subject = `🛰️ Satell-Eye Disaster Report - ${events.length} Active Events - ${new Date().toLocaleDateString()}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      color: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(0, 255, 255, 0.2);
      border-radius: 16px;
      padding: 30px;
      backdrop-filter: blur(10px);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid rgba(0, 255, 255, 0.3);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(90deg, #00ffff, #ff00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    .stat-box {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
    }
    .critical { color: #ff0000; }
    .high { color: #ff6600; }
    .medium { color: #ffaa00; }
    .low { color: #00ffff; }
    .event-list {
      margin-top: 30px;
    }
    .event-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-left: 4px solid;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
    }
    .event-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .event-details {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
    .event-detail {
      display: flex;
      gap: 5px;
    }
    .event-detail-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🛰️ SATELL-EYE</div>
      <div class="subtitle">AI-Powered Satellite Imaging & Mission Control</div>
      <div class="subtitle">Global Disaster Detection Report</div>
      <div class="subtitle" style="margin-top: 10px;">Generated: ${timestamp}</div>
    </div>
    
    <div class="stats">
      <div class="stat-box">
        <div class="stat-value critical">${severityCounts.Critical}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-box">
        <div class="stat-value high">${severityCounts.High}</div>
        <div class="stat-label">High</div>
      </div>
      <div class="stat-box">
        <div class="stat-value medium">${severityCounts.Medium}</div>
        <div class="stat-label">Medium</div>
      </div>
      <div class="stat-box">
        <div class="stat-value low">${severityCounts.Low}</div>
        <div class="stat-label">Low</div>
      </div>
    </div>
    
    <div style="background: rgba(0, 255, 255, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <strong>Report Filters:</strong><br>
      Severity: ${severityFilter === 'all' ? 'All Levels' : severityFilter}<br>
      Type: ${typeFilter === 'all' ? 'All Types' : typeFilter}<br>
      Total Events: ${events.length}
    </div>
    
    <div class="event-list">
      <h2 style="color: #00ffff; margin-bottom: 20px;">Active Disasters</h2>
      ${events.slice(0, 20).map(event => {
        const geometry = event.geometry[event.geometry.length - 1];
        const lat = geometry?.coordinates?.[1]?.toFixed(4) || 'N/A';
        const lon = geometry?.coordinates?.[0]?.toFixed(4) || 'N/A';
        const severity = getEventSeverity(event);
        const severityClass = severity.toLowerCase();
        const category = event.categories.map(c => c.title).join(', ');
        const date = new Date(geometry?.date || event.geometry[0]?.date || '').toLocaleDateString();
        
        return `
          <div class="event-item" style="border-left-color: ${
            severity === 'Critical' ? '#ff0000' :
            severity === 'High' ? '#ff6600' :
            severity === 'Medium' ? '#ffaa00' : '#00ffff'
          }">
            <div class="event-title">${event.title}</div>
            <div class="event-details">
              <div class="event-detail">
                <span class="event-detail-label">Category:</span>
                <span>${category}</span>
              </div>
              <div class="event-detail">
                <span class="event-detail-label">Severity:</span>
                <span class="${severityClass}">${severity}</span>
              </div>
              <div class="event-detail">
                <span class="event-detail-label">Location:</span>
                <span>${lat}°, ${lon}°</span>
              </div>
              <div class="event-detail">
                <span class="event-detail-label">Detected:</span>
                <span>${date}</span>
              </div>
            </div>
            ${event.description ? `<div style="margin-top: 10px; font-size: 13px; color: rgba(255, 255, 255, 0.7);">${event.description}</div>` : ''}
          </div>
        `;
      }).join('')}
      
      ${events.length > 20 ? `<div style="text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.6);">... and ${events.length - 20} more events</div>` : ''}
    </div>
    
    <div class="footer">
      <p>This report was generated by Satell-Eye AI-Powered Disaster Detection System</p>
      <p>Data sources: NASA EONET, ISRO, OpenAI GPT-4 Analysis</p>
      <p>© ${new Date().getFullYear()} Satell-Eye. All rights reserved.</p>
      <p style="margin-top: 15px; font-size: 10px;">
        This is an automated report. For questions or concerns, please contact support@satell-eye.app
      </p>
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `
SATELL-EYE - Global Disaster Detection Report
Generated: ${timestamp}

STATISTICS:
Critical: ${severityCounts.Critical}
High: ${severityCounts.High}
Medium: ${severityCounts.Medium}
Low: ${severityCounts.Low}

FILTERS:
Severity: ${severityFilter}
Type: ${typeFilter}
Total Events: ${events.length}

ACTIVE DISASTERS:
${events.slice(0, 20).map((event, i) => {
  const geometry = event.geometry[event.geometry.length - 1];
  const lat = geometry?.coordinates?.[1]?.toFixed(4) || 'N/A';
  const lon = geometry?.coordinates?.[0]?.toFixed(4) || 'N/A';
  const severity = getEventSeverity(event);
  const category = event.categories.map(c => c.title).join(', ');
  
  return `
${i + 1}. ${event.title}
   Category: ${category}
   Severity: ${severity}
   Location: ${lat}°, ${lon}°
   ${event.description ? `Description: ${event.description}` : ''}
  `;
}).join('\n')}

---
This report was generated by Satell-Eye AI-Powered Disaster Detection System
Data sources: NASA EONET, ISRO, OpenAI GPT-4 Analysis
© ${new Date().getFullYear()} Satell-Eye
  `;
  
  return {
    subject,
    html,
    text,
    attachments: []
  };
}

/**
 * Validate email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Simulate email sending (for demo)
 */
async function simulateEmailSending(email: string, content: any): Promise<void> {
  console.log('[Email] Simulating email send...');
  console.log(`[Email] To: ${email}`);
  console.log(`[Email] Subject: ${content.subject}`);
  console.log(`[Email] Content length: ${content.html.length} chars`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('[Email] ✓ Email sent successfully (demo mode)');
  
  // Store in localStorage for demo purposes
  const sentEmails = JSON.parse(localStorage.getItem('sent-emails') || '[]');
  sentEmails.push({
    to: email,
    subject: content.subject,
    timestamp: new Date().toISOString(),
    preview: content.text.substring(0, 200)
  });
  localStorage.setItem('sent-emails', JSON.stringify(sentEmails.slice(-10))); // Keep last 10
}
