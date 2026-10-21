import { CrimeIncident, PredictionResult } from '../types';

export function exportIncidentsToCSV(incidents: CrimeIncident[], filename = 'crime_analytics_filtered_export.csv') {
  if (!incidents || incidents.length === 0) return;

  const headers = [
    'Incident_ID',
    'Case_Number',
    'Timestamp',
    'Offense_Category',
    'Subcategory',
    'District',
    'Location_Description',
    'Address',
    'Latitude',
    'Longitude',
    'Arrest_Made',
    'Domestic_Incident',
    'Case_Status',
    'Severity_Level',
    'Hour',
    'Day_of_Week',
    'Month',
    'Year'
  ];

  const rows = incidents.map(item => [
    `"${item.id}"`,
    `"${item.caseNumber}"`,
    `"${item.date}"`,
    `"${item.category}"`,
    `"${item.subCategory}"`,
    `"${item.district}"`,
    `"${item.locationDescription}"`,
    `"${item.address.replace(/"/g, '""')}"`,
    item.latitude,
    item.longitude,
    item.arrest ? 'YES' : 'NO',
    item.domestic ? 'YES' : 'NO',
    `"${item.status}"`,
    `"${item.severity}"`,
    item.hour,
    `"${item.dayOfWeek}"`,
    `"${item.month}"`,
    item.year
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

export function exportPredictionsToCSV(predictions: PredictionResult[], filename = 'crime_prediction_intelligence_log.csv') {
  if (!predictions || predictions.length === 0) return;

  const headers = [
    'Prediction_ID',
    'Generated_Timestamp',
    'Target_Date',
    'Hour',
    'Day_of_Week',
    'District',
    'Premise_Type',
    'Predicted_Primary_Offense',
    'Model_Confidence_Pct',
    'Risk_Tier',
    'Analyst_Notes'
  ];

  const rows = predictions.map(p => [
    `"${p.id}"`,
    `"${p.timestamp}"`,
    `"${p.inputs.date}"`,
    p.inputs.hour,
    `"${p.inputs.dayOfWeek}"`,
    `"${p.inputs.district}"`,
    `"${p.inputs.locationDescription}"`,
    `"${p.predictedCategory}"`,
    p.confidence,
    `"${p.riskLevel}"`,
    `"${(p.analystNotes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function triggerPrintReport() {
  window.print();
}
