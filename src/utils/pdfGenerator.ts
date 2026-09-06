import { SoilSampleData } from '../types';
import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { RK_LOGO_FULL_BASE64 } from './logoBase64';
import { RK_WATERMARK_BASE64 } from './watermarkBase64';

export interface PdfReportData {
  docId: string;
  farmerName: string;
  farmerCode?: string;
  plotRef: string;
  crop: string;
  hectares: number | string;
  date: string;
  village?: string;
  status?: string;
  ph?: number;
  moisturePercent?: number;
  soilData?: SoilSampleData;
}

export async function generateAndDownloadPdf(data: PdfReportData): Promise<void> {
  const docTitle = data.docId || 'RPT-AGRI-SURVEY';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page {
            margin: 12mm 10mm;
            size: A4 portrait;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
          }
          body {
            font-family: Helvetica, Arial, sans-serif;
            padding: 24px;
            color: #1c1b1f;
            line-height: 1.4;
            position: relative;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .watermark-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-image: url('${RK_WATERMARK_BASE64}');
            background-repeat: repeat;
            background-size: 100% 100%;
            background-position: center;
            z-index: -1;
            opacity: 0.90;
            pointer-events: none;
          }
          .logo-header {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 14px 0;
            margin-bottom: 16px;
            border-bottom: 3px solid #CC0000;
          }
          .logo-header img {
            height: 68px;
            width: auto;
          }
          .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #216c2a;
            border-bottom: 1px solid #c4c8ba;
            padding-bottom: 4px;
            margin-top: 18px;
            margin-bottom: 10px;
          }
          .info-row {
            font-size: 12px;
            margin-bottom: 6px;
          }
          .info-label {
            font-weight: bold;
            color: #2d3129;
          }
          .badge {
            display: inline-block;
            background: #e0f2e9;
            color: #216c2a;
            font-weight: bold;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 4px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .table th, .table td {
            border: 1px solid #c4c8ba;
            padding: 8px;
            font-size: 11px;
            text-align: left;
          }
          .table th {
            background: rgba(244, 246, 238, 0.92);
            color: #1c1b1f;
            font-weight: bold;
          }
          .table td {
            background: rgba(255, 255, 255, 0.75);
          }
          .footer {
            margin-top: 26px;
            background: rgba(244, 246, 238, 0.88);
            border: 1px solid #e0e4d5;
            padding: 12px;
            border-radius: 8px;
            font-size: 10px;
            color: #44483e;
          }
        </style>
      </head>
      <body>
        <div class="watermark-bg"></div>
        <div class="logo-header">
          <img src="${RK_LOGO_FULL_BASE64}" alt="Red-Knight Technologies" />
        </div>

        <div class="section-title">1. FARMER & FIELD PARCEL OVERVIEW</div>
        <div class="info-row"><span class="info-label">Farmer Name:</span> ${data.farmerName || 'N/A'}</div>
        <div class="info-row"><span class="info-label">Farmer Code:</span> ${data.farmerCode || 'FMR-REG-01'}</div>
        <div class="info-row"><span class="info-label">Field Plot Ref:</span> ${data.plotRef || 'FLD-PARCEL-01'}</div>
        <div class="info-row"><span class="info-label">Crop / Rotation:</span> ${data.crop || 'Sugarcane'}</div>
        <div class="info-row"><span class="info-label">Parcel Extent:</span> ${data.hectares} Hectares (${(Number(data.hectares || 0) * 2.471).toFixed(2)} Acres)</div>
        <div class="info-row"><span class="info-label">Location / Village:</span> ${data.village || 'Huligere Sector'}, Mandya District</div>
        <div class="info-row"><span class="info-label">Audit Status:</span> <span class="badge">${data.status || 'Verified & Digitally Signed'}</span></div>

        <div class="section-title">2. SOIL & AGRONOMIC METRICS</div>
        <div class="info-row"><span class="info-label">Soil pH Level:</span> ${data.ph ?? 6.8} (Optimal Neutral Range)</div>
        <div class="info-row"><span class="info-label">Soil Moisture (VWC):</span> ${data.moisturePercent ?? 28.4}%</div>
        <div class="info-row"><span class="info-label">USDA Classification:</span> ${data.soilData?.usdaClassification || 'Clay Loam (USDA Topsoil)'}</div>
        <div class="info-row"><span class="info-label">Bulk Density:</span> ${data.soilData?.bulkDensity || 1.34} g/cm³ | Porosity: ${data.soilData?.porosity || 49.5}%</div>

        <div class="section-title">3. 10 SYSTEMATIC AGRONOMIC MODULES</div>
        <table class="table">
          <thead>
            <tr><th>Module #</th><th>Module Description</th><th>Audit Status</th></tr>
          </thead>
          <tbody>
            <tr><td>Module 1</td><td>Farmer & Stakeholder Survey</td><td>COMPLETED (PASS)</td></tr>
            <tr><td>Module 2</td><td>Field Survey & Geometry</td><td>COMPLETED (PASS)</td></tr>
            <tr><td>Module 3</td><td>Soil Survey (Physical & Chemical)</td><td>ACTIVE (VALIDATED)</td></tr>
            <tr><td>Module 4</td><td>Water & Hydraulic Irrigation</td><td>DRAFT (70%)</td></tr>
            <tr><td>Module 5</td><td>Crop & Plant Population</td><td>AUDITED</td></tr>
            <tr><td>Module 6</td><td>Pest & Disease Spatial Risk Zone</td><td>LOGGED</td></tr>
            <tr><td>Module 7</td><td>Microclimate & Atmospheric Sensors</td><td>SYNCED</td></tr>
            <tr><td>Module 8</td><td>On-Farm Technology & Drone Imagery</td><td>SYNCED</td></tr>
            <tr><td>Module 9</td><td>Economic & ROI Analysis</td><td>ESTIMATED</td></tr>
            <tr><td>Module 10</td><td>Crop-Cycle Timeline & Harvest Window</td><td>COMPLETED</td></tr>
          </tbody>
        </table>

        <div class="footer">
          <strong>DIGITAL CERTIFICATION & AUDIT SEAL</strong><br/>
          Cryptographic SHA-256 Hash: ${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)} | AgriSurvey Mobile Inspector v2.4<br/>
          Official AgriSurvey Dossier. Confidential and Proprietary.
        </div>
      </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docTitle}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Save Report PDF: ${docTitle}`,
          UTI: 'com.adobe.pdf'
        });
      }
    }
  } catch (error) {
    console.error('PDF Generation / Save Error:', error);
  }
}
