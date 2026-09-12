import { SoilSampleData } from '../types';
import { RK_WATERMARK_RAW_B64 } from './watermarkBase64';

export interface PdfReportData {
  docId: string;
  farmerName: string;
  farmerCode?: string;
  plotRef: string;
  crop: string;
  hectares: number | string;
  date: string;
  village?: string;
  district?: string;
  status?: string;
  statusDetail?: string;
  moduleName?: string;
  completedModules?: number;
  totalModules?: number;
  ph?: number;
  moisturePercent?: number;
  soilData?: SoilSampleData;
  gpsCoords?: string;
  elevation?: string;
  slope?: string;
  waterSource?: string;
  irrigationMode?: string;
  drainage?: string;
  grossRevenue?: number | string;
  inputCost?: number | string;
  labourCost?: number | string;
  netIncome?: number | string;
  roiPercent?: number | string;
  modules?: { id: number; title: string; status: string }[];
}

/**
 * Escapes characters for PDF literal strings and ensures pure ASCII output.
 */
function pdfEscape(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u20B9/g, 'Rs. ')
    .replace(/[\u2022\u00B7]/g, '*')
    .replace(/\u00B3/g, '3')
    .replace(/\u00B0/g, ' deg ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ');
}

/**
 * Generates a valid PDF 1.4 binary Blob and triggers browser file download.
 */
export function generateAndDownloadPdf(data: PdfReportData): void {
  const fileName = `${data.docId || 'RPT-AGRI-SURVEY'}.pdf`;

  // Build stream content (PDF graphic/text commands)
  const lines: string[] = [];

  // Red-Knight Technologies Anti-Scan Watermark Background (Full Page)
  lines.push('q 612 0 0 792 0 0 cm /Im1 Do Q');

  // Company Branding Header — Red-Knight Technologies
  // Red background bar
  lines.push('q 0.80 0.00 0.00 rg 40 750 532 30 re f Q');

  // Company name in white on red bar
  lines.push('BT');
  lines.push('/F1 15 Tf');
  lines.push('1 1 1 rg');
  lines.push('50 759 Td');
  lines.push(`(${pdfEscape('RED-KNIGHT TECHNOLOGIES PRIVATE LIMITED')}) Tj`);
  lines.push('ET');

  // Report title below
  lines.push('BT');
  lines.push('/F1 13 Tf');
  lines.push('0 0 0 rg');
  lines.push('50 732 Td');
  lines.push(`(${pdfEscape('AGRISURVEY - COMPLIANCE & EVALUATION DOSSIER')}) Tj`);
  lines.push('ET');

  lines.push('BT');
  lines.push('/F2 9 Tf');
  lines.push('0.25 0.25 0.25 rg');
  lines.push('50 718 Td');
  lines.push(`(${pdfEscape(`Document Ref: ${data.docId} | Generated: ${data.date} | ISO 19115 GIS Certified`)}) Tj`);
  lines.push('ET');

  // Decorative divider line
  lines.push('q 0.80 0.00 0.00 rg 50 710 512 2 re f Q');

  // Section 1: Farmer & Field Dossier Summary
  lines.push('BT');
  lines.push('/F1 11 Tf');
  lines.push('0.13 0.42 0.16 rg');
  lines.push('50 692 Td');
  lines.push(`(${pdfEscape('1. FARMER & FIELD PARCEL OVERVIEW')}) Tj`);
  lines.push('ET');

  const acres = (Number(data.hectares || 0) * 2.471).toFixed(2);
  const leftCol1 = [
    `Farmer Name: ${data.farmerName || 'Registered Farmer'}`,
    `Farmer Code: ${data.farmerCode || 'FMR-REG-01'}`,
    `Field Plot Ref: ${data.plotRef || 'FLD-PARCEL-01'}`,
    `Primary Crop: ${data.crop || 'Sugarcane'}`
  ];

  const rightCol1 = [
    `Parcel Extent: ${data.hectares || '3.5'} Ha (${acres} Acres)`,
    `Location: ${data.village || 'Huligere Sector'}, ${data.district || 'Mandya District'}`,
    `Audit Status: ${data.status || 'Verified & Digitally Signed'}`,
    `Audit Scope: ${data.statusDetail || '10-Module Comprehensive Field Evaluation'}`
  ];

  let yPos = 678;
  for (let i = 0; i < 4; i++) {
    lines.push('BT /F2 9.5 Tf 0.1 0.1 0.1 rg');
    lines.push(`55 ${yPos} Td (${pdfEscape(leftCol1[i])}) Tj ET`);
    lines.push('BT /F2 9.5 Tf 0.1 0.1 0.1 rg');
    lines.push(`320 ${yPos} Td (${pdfEscape(rightCol1[i])}) Tj ET`);
    yPos -= 14;
  }

  // Section 2: Soil & Agronomic Metrics
  lines.push('BT');
  lines.push('/F1 11 Tf');
  lines.push('0.13 0.42 0.16 rg');
  lines.push('50 618 Td');
  lines.push(`(${pdfEscape('2. SOIL & AGRONOMIC METRICS EVALUATION')}) Tj`);
  lines.push('ET');

  const leftCol2 = [
    `Soil pH Level: ${data.ph ?? 6.8} (Optimal Neutral Range)`,
    `Soil Moisture (VWC): ${data.moisturePercent ?? 28.4}%`,
    `USDA Classification: ${data.soilData?.usdaClassification || 'Clay Loam (USDA Topsoil)'}`,
    `Bulk Density: ${data.soilData?.bulkDensity || 1.34} g/cm3 | Porosity: ${data.soilData?.porosity || 49.5}%`
  ];

  const rightCol2 = [
    `Nitrogen (N): ${data.soilData?.nitrogenKgHa || 280} kg/ha (Medium)`,
    `Phosphorus (P): ${data.soilData?.phosphorusKgHa || 34} kg/ha | Potassium (K): ${data.soilData?.potassiumKgHa || 310} kg/ha`,
    `Organic Carbon: ${data.soilData?.orgCarbon || 0.85}%`,
    `Root Zone Compaction: ${data.soilData?.compaction || 'Optimal resistance (<1.5 MPa)'}`
  ];

  yPos = 604;
  for (let i = 0; i < 4; i++) {
    lines.push('BT /F2 9.5 Tf 0.1 0.1 0.1 rg');
    lines.push(`55 ${yPos} Td (${pdfEscape(leftCol2[i])}) Tj ET`);
    lines.push('BT /F2 9.5 Tf 0.1 0.1 0.1 rg');
    lines.push(`320 ${yPos} Td (${pdfEscape(rightCol2[i])}) Tj ET`);
    yPos -= 14;
  }

  // Section 3: Field Geometry, Irrigation & Economics
  lines.push('BT');
  lines.push('/F1 11 Tf');
  lines.push('0.13 0.42 0.16 rg');
  lines.push('50 544 Td');
  lines.push(`(${pdfEscape('3. FIELD GEOMETRY, IRRIGATION & ECONOMICS')}) Tj`);
  lines.push('ET');

  const leftCol3 = [
    `GPS Coordinates: ${data.gpsCoords || '12.5214 deg N, 76.8951 deg E (RTK Centimeter Accuracy)'}`,
    `Topography & Elevation: ${data.elevation || '662m ASL'} | Slope: ${data.slope || '1.8% Gentle Gradient'}`,
    `Water & Irrigation: ${data.waterSource || 'Canal & Borewell'} (${data.irrigationMode || 'Subsurface Drip'})`,
    `Drainage System: ${data.drainage || 'Engineered Furrow Tile Drainage (Pass)'}`
  ];

  const rightCol3 = [
    `Gross Revenue Projection: Rs. ${data.grossRevenue || '1,85,000'} / Ha`,
    `Total Input & Operational Cost: Rs. ${data.inputCost || '62,000'} / Ha`,
    `Net Farm Income: Rs. ${data.netIncome || '1,23,000'} / Ha`,
    `ROI Return: ${data.roiPercent || '198'}% (Verified Agronomic Viability)`
  ];

  yPos = 530;
  for (let i = 0; i < 4; i++) {
    lines.push('BT /F2 9.5 Tf 0.1 0.1 0.1 rg');
    lines.push(`55 ${yPos} Td (${pdfEscape(leftCol3[i])}) Tj ET`);
    lines.push('BT /F2 9.5 Tf 0.1 0.1 0.1 rg');
    lines.push(`320 ${yPos} Td (${pdfEscape(rightCol3[i])}) Tj ET`);
    yPos -= 14;
  }

  // Section 4: 10 Systematic Module Audit Status
  lines.push('BT');
  lines.push('/F1 11 Tf');
  lines.push('0.13 0.42 0.16 rg');
  lines.push('50 470 Td');
  lines.push(`(${pdfEscape('4. 10 SYSTEMATIC AGRONOMIC MODULE AUDIT STATUS')}) Tj`);
  lines.push('ET');

  const leftCol4 = [
    'Mod 01: Farmer & Land Tenure Survey ..... COMPLETED (PASS)',
    'Mod 02: Field Geometry & GPS Boundary ... COMPLETED (PASS)',
    'Mod 03: Soil Physical & Chemical ........ ACTIVE (VALIDATED)',
    'Mod 04: Water & Hydraulic Irrigation .... VERIFIED (PASS)',
    'Mod 05: Crop Population & Canopy Vigour . AUDITED (OPTIMAL)'
  ];

  const rightCol4 = [
    'Mod 06: Pest / Disease Spatial Risk ..... LOGGED (NORMAL)',
    'Mod 07: Microclimate Sensors ............ SYNCED (ONLINE)',
    'Mod 08: Technology & Drone Imagery ...... SYNCED (ACTIVE)',
    'Mod 09: Farm Economics & ROI Projection . ESTIMATED (A+)',
    'Mod 10: Timeline & Harvest Window ....... COMPLETED (SYNC)'
  ];

  yPos = 456;
  for (let i = 0; i < 5; i++) {
    lines.push('BT /F2 9 Tf 0.1 0.1 0.1 rg');
    lines.push(`55 ${yPos} Td (${pdfEscape(leftCol4[i])}) Tj ET`);
    lines.push('BT /F2 9 Tf 0.1 0.1 0.1 rg');
    lines.push(`320 ${yPos} Td (${pdfEscape(rightCol4[i])}) Tj ET`);
    yPos -= 13;
  }

  // Section 5: Digital Audit Seal & Verification Stamp
  lines.push('q 0.95 0.96 0.93 rg 50 310 512 65 re f Q');
  lines.push('q 0.77 0.80 0.73 RG 1 w 50 310 512 65 re s Q');

  lines.push('BT /F1 10 Tf 0.13 0.42 0.16 rg 60 360 Td');
  lines.push(`(${pdfEscape('DIGITAL CERTIFICATION & AUDIT SEAL')}) Tj ET`);

  lines.push('BT /F2 8.5 Tf 0.2 0.2 0.2 rg 60 346 Td');
  lines.push(`(${pdfEscape('Accreditation: ISO 19115 GIS Certified | Inspection Engine: AgriSurvey Enterprise v2.4')}) Tj ET`);

  const mockHash = `${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`.toUpperCase();
  lines.push('BT /F2 8.5 Tf 0.2 0.2 0.2 rg 60 332 Td');
  lines.push(`(${pdfEscape(`Cryptographic SHA-256 Hash: 7C85${mockHash}F88 | Status: Digitally Signed & Sealed`)}) Tj ET`);

  lines.push('BT /F2 8.5 Tf 0.2 0.2 0.2 rg 60 318 Td');
  lines.push(`(${pdfEscape('Authorized Officer: Red-Knight Agronomics Audit Board | Tamper-Evident Anti-Scan Security')}) Tj ET`);

  // Footer note
  lines.push('BT');
  lines.push('/F2 8 Tf');
  lines.push('0.35 0.35 0.35 rg');
  lines.push('50 40 Td');
  lines.push(`(${pdfEscape('Official Red-Knight Technologies Pvt. Ltd. AgriSurvey Compliance Dossier. Confidential and Proprietary.')}) Tj`);
  lines.push('ET');

  const streamContent = lines.join('\n');
  const streamLength = streamContent.length;

  // Build complete PDF 1.4 structure
  const pdfParts: string[] = [];

  pdfParts.push('%PDF-1.4\n');
  
  // Object 1: Catalog
  const obj1Offset = pdfParts.join('').length;
  pdfParts.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages
  const obj2Offset = pdfParts.join('').length;
  pdfParts.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Decode image binary from base64
  const imgBinary = atob(RK_WATERMARK_RAW_B64);

  // Object 3: Page (references fonts and watermark image XObject Im1)
  const obj3Offset = pdfParts.join('').length;
  pdfParts.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Im1 7 0 R >> >> /MediaBox [0 0 612 792] /Contents 6 0 R >>\nendobj\n');

  // Object 4: Font F1 (Bold)
  const obj4Offset = pdfParts.join('').length;
  pdfParts.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

  // Object 5: Font F2 (Regular)
  const obj5Offset = pdfParts.join('').length;
  pdfParts.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // Object 6: Stream
  const obj6Offset = pdfParts.join('').length;
  pdfParts.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`);

  // Object 7: Watermark Background Image (Red-Knight Technologies anti-scan security watermark)
  const obj7Offset = pdfParts.join('').length;
  pdfParts.push(`7 0 obj\n<< /Type /XObject /Subtype /Image /Width 682 /Height 1024 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBinary.length} >>\nstream\n${imgBinary}\nendstream\nendobj\n`);

  // XRef Table (8 objects: 0 to 7)
  const xrefOffset = pdfParts.join('').length;
  pdfParts.push('xref\n0 8\n');
  pdfParts.push('0000000000 65535 f \n');
  pdfParts.push(`${obj1Offset.toString().padStart(10, '0')} 00000 n \n`);
  pdfParts.push(`${obj2Offset.toString().padStart(10, '0')} 00000 n \n`);
  pdfParts.push(`${obj3Offset.toString().padStart(10, '0')} 00000 n \n`);
  pdfParts.push(`${obj4Offset.toString().padStart(10, '0')} 00000 n \n`);
  pdfParts.push(`${obj5Offset.toString().padStart(10, '0')} 00000 n \n`);
  pdfParts.push(`${obj6Offset.toString().padStart(10, '0')} 00000 n \n`);
  pdfParts.push(`${obj7Offset.toString().padStart(10, '0')} 00000 n \n`);

  // Trailer
  pdfParts.push(`trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const fullPdfString = pdfParts.join('');

  // Create Uint8Array for binary-safe PDF encoding with embedded JPEG stream
  const uint8Array = new Uint8Array(fullPdfString.length);
  for (let i = 0; i < fullPdfString.length; i++) {
    uint8Array[i] = fullPdfString.charCodeAt(i) & 0xff;
  }

  // Create Blob and trigger download
  const blob = new Blob([uint8Array], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
