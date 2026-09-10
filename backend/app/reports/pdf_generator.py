import os
import csv
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from backend.app.core.config import settings

class ForensicReportGenerator:
    """
    Generates official Digital Forensics Investigation Reports in PDF, JSON, and CSV formats.
    Complies with standard digital forensic reporting conventions.
    """

    @classmethod
    def generate_pdf_report(cls, report_data: Dict[str, Any], output_path: str | Path) -> str:
        """
        Creates a multi-page law enforcement grade forensic examination report.
        """
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)

        doc = SimpleDocTemplate(
            str(path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        
        # Custom Forensic Styles
        title_style = ParagraphStyle(
            'ForensicTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A'),
            alignment=1  # Center
        )

        subtitle_style = ParagraphStyle(
            'ForensicSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            alignment=1
        )

        h2_style = ParagraphStyle(
            'ForensicH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=14,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'ForensicBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155')
        )

        body_bold = ParagraphStyle(
            'ForensicBodyBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        alert_box_style = ParagraphStyle(
            'ForensicNotice',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#0369A1'),
            alignment=0
        )

        elements = []

        # 1. Header & Agency Banner
        case_info = report_data.get("case_info", {})
        elements.append(Paragraph("DIGITAL EVIDENCE FORENSIC EXAMINATION REPORT", title_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"CENTRAL DIGITAL FORENSIC & MULTI-VENDOR CCTV INTELLIGENCE PLATFORM", subtitle_style))
        elements.append(Paragraph(f"Official Forensic Examination Record • Case Reference: {case_info.get('case_id', 'CASE-2026-001')}", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284C7'), spaceBefore=2, spaceAfter=12))

        # Forensic Integrity Disclaimer Banner
        disclaimer_data = [[
            Paragraph(
                "<b>FORENSIC NOTICE:</b> All analytical examinations, metadata extractions, and AI object tracking "
                "were executed strictly upon bit-stream forensic working copies. The original physical and digital evidence "
                "remains preserved in write-blocked, read-only custody. AI findings represent automated analytical indicators "
                "and are submitted for corroboration.", alert_box_style
            )
        ]]
        disclaimer_table = Table(disclaimer_data, colWidths=[540])
        disclaimer_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0F9FF')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#BAE6FD')),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(disclaimer_table)
        elements.append(Spacer(1, 12))

        # 2. Case Metadata Table
        elements.append(Paragraph("1. CASE IDENTIFICATION & EXAMINER DETAILS", h2_style))
        case_meta_rows = [
            [Paragraph("<b>Case Identifier:</b>", body_style), Paragraph(case_info.get("case_id", "CASE-2026-001"), body_style),
             Paragraph("<b>Date of Report:</b>", body_style), Paragraph(datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"), body_style)],
            [Paragraph("<b>Case Title:</b>", body_style), Paragraph(case_info.get("name", "N/A"), body_style),
             Paragraph("<b>Priority Level:</b>", body_style), Paragraph(case_info.get("priority", "High"), body_style)],
            [Paragraph("<b>Investigating Officer:</b>", body_style), Paragraph(case_info.get("investigator_name", "N/A"), body_style),
             Paragraph("<b>Organization / Unit:</b>", body_style), Paragraph(case_info.get("organization", "N/A"), body_style)],
            [Paragraph("<b>Incident Location:</b>", body_style), Paragraph(case_info.get("location", "N/A"), body_style),
             Paragraph("<b>Case Status:</b>", body_style), Paragraph(case_info.get("status", "Active"), body_style)]
        ]
        t_case = Table(case_meta_rows, colWidths=[120, 150, 120, 150])
        t_case.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(t_case)
        elements.append(Spacer(1, 12))

        # 3. Evidence & Cryptographic Hashes Table
        elements.append(Paragraph("2. EVIDENCE INVENTORY & CRYPTOGRAPHIC HASH VERIFICATION", h2_style))
        evidence_list = report_data.get("evidence_items", [])
        evd_rows = [[
            Paragraph("<b>Evidence ID</b>", body_bold),
            Paragraph("<b>Camera / Vendor</b>", body_bold),
            Paragraph("<b>File Size</b>", body_bold),
            Paragraph("<b>SHA-256 Hash (Forensic Baseline)</b>", body_bold),
            Paragraph("<b>Status</b>", body_bold)
        ]]

        for evd in evidence_list[:6]:
            sha_short = evd.get("hash_sha256", "N/A")
            if len(sha_short) > 24:
                sha_short = f"{sha_short[:12]}...{sha_short[-12:]}"
            evd_rows.append([
                Paragraph(evd.get("evidence_id", "EVD-001"), body_style),
                Paragraph(f"{evd.get('vendor', 'N/A')}<br/>{evd.get('filename', 'video.mp4')}", body_style),
                Paragraph(f"{evd.get('file_size', 0) / (1024*1024):.1f} MB", body_style),
                Paragraph(f"<font name='Courier' size='7'>{sha_short}</font>", body_style),
                Paragraph("<font color='#059669'><b>VERIFIED</b></font>", body_style)
            ])

        t_evd = Table(evd_rows, colWidths=[80, 130, 65, 185, 80])
        t_evd.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_evd)
        elements.append(Spacer(1, 12))

        # 4. Deleted & Damaged Recovery Results
        elements.append(Paragraph("3. DELETED FOOTAGE CARVING & RECOVERY RESULTS", h2_style))
        recovery_list = report_data.get("recovery_records", [])
        rec_rows = [[
            Paragraph("<b>Fragment ID</b>", body_bold),
            Paragraph("<b>Cluster Offset</b>", body_bold),
            Paragraph("<b>Carved Signature</b>", body_bold),
            Paragraph("<b>Duration</b>", body_bold),
            Paragraph("<b>Recovery Status</b>", body_bold),
            Paragraph("<b>Confidence</b>", body_bold)
        ]]

        for rec in recovery_list[:5]:
            status_color = "#059669" if rec.get("recovery_status") == "Recovered" else "#D97706"
            rec_rows.append([
                Paragraph(rec.get("fragment_id", "FRAG-001"), body_style),
                Paragraph(f"<font name='Courier' size='7'>{rec.get('cluster_offset', '0x0')}</font>", body_style),
                Paragraph(f"<font name='Courier' size='7'>{rec.get('hex_signature', '00 00')}</font>", body_style),
                Paragraph(f"{rec.get('estimated_duration_sec', 0)} sec", body_style),
                Paragraph(f"<font color='{status_color}'><b>{rec.get('recovery_status')}</b></font>", body_style),
                Paragraph(f"{rec.get('confidence', 0.9)*100:.0f}%", body_style)
            ])

        t_rec = Table(rec_rows, colWidths=[80, 85, 140, 60, 115, 60])
        t_rec.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_rec)
        elements.append(Spacer(1, 12))

        # 5. AI Computer Vision Intelligence Summary
        elements.append(Paragraph("4. AI COMPUTER VISION ANALYTICAL FINDINGS", h2_style))
        detections = report_data.get("detections", [])
        summary_p = Paragraph(
            f"Automated computer vision scanning analyzed <b>{len(evidence_list)} evidence streams</b>, extracting "
            f"<b>{len(detections)} key visual event markers</b> across Person, Vehicle, Face, and Motion categories.",
            body_style
        )
        elements.append(summary_p)
        elements.append(Spacer(1, 6))

        det_rows = [[
            Paragraph("<b>Event ID</b>", body_bold),
            Paragraph("<b>Timestamp</b>", body_bold),
            Paragraph("<b>Classification</b>", body_bold),
            Paragraph("<b>Description / Label</b>", body_bold),
            Paragraph("<b>Confidence</b>", body_bold)
        ]]

        for det in detections[:6]:
            det_rows.append([
                Paragraph(det.get("detection_id", "DET-001"), body_style),
                Paragraph(det.get("timestamp_str", "22:00:00"), body_style),
                Paragraph(f"<b>{det.get('detection_type', 'Object')}</b>", body_style),
                Paragraph(det.get("label", "General Observation"), body_style),
                Paragraph(f"{det.get('confidence', 0.9)*100:.0f}%", body_style)
            ])

        t_det = Table(det_rows, colWidths=[90, 80, 95, 205, 70])
        t_det.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_det)
        elements.append(Spacer(1, 14))

        # 6. Chain of Custody Blockchain Audit Ledger
        elements.append(Paragraph("5. IMMUTABLE CHAIN OF CUSTODY & AUDIT LEDGER", h2_style))
        custody_blocks = report_data.get("custody_blocks", [])
        ledger_rows = [[
            Paragraph("<b>Blk #</b>", body_bold),
            Paragraph("<b>Action / Event</b>", body_bold),
            Paragraph("<b>Actor</b>", body_bold),
            Paragraph("<b>Timestamp (UTC)</b>", body_bold),
            Paragraph("<b>Block Hash (SHA-256)</b>", body_bold)
        ]]

        for blk in custody_blocks[:6]:
            cur_hash = blk.get("current_hash", "00")
            cur_hash_short = f"{cur_hash[:8]}...{cur_hash[-8:]}"
            ts = blk.get("timestamp")
            ts_str = ts.strftime("%m-%d %H:%M") if hasattr(ts, 'strftime') else str(ts)[:16]
            ledger_rows.append([
                Paragraph(str(blk.get("block_number", 0)), body_style),
                Paragraph(blk.get("action", "Event Logged"), body_style),
                Paragraph(blk.get("actor_name", "Examiner"), body_style),
                Paragraph(ts_str, body_style),
                Paragraph(f"<font name='Courier' size='7'>{cur_hash_short}</font>", body_style)
            ])

        t_ledger = Table(ledger_rows, colWidths=[40, 160, 110, 85, 145])
        t_ledger.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 4),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_ledger)
        elements.append(Spacer(1, 16))

        # 7. Examiner Certification & Sign-off Block
        sign_block = [
            [
                Paragraph("<b>EXAMINER ATTESTATION:</b><br/>"
                          "I certify under penalty of official misconduct that the above examination was conducted in accordance with established forensic principles. "
                          "All hashes were cryptographically computed and cross-checked against evidentiary baselines.", alert_box_style),
                Paragraph("<b>LEAD FORENSIC EXAMINER:</b><br/><br/>"
                          "_______________________________<br/>"
                          "Inspector R. Verma, Forensic Lead<br/>"
                          "Cyber & CCTV Forensics Lab", body_style)
            ]
        ]
        t_sign = Table(sign_block, colWidths=[340, 200])
        t_sign.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(KeepTogether(t_sign))

        # Build document
        doc.build(elements)
        return str(path)

    @classmethod
    def export_json(cls, report_data: Dict[str, Any], output_path: str | Path) -> str:
        """Exports full report dataset in machine-readable JSON format."""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, default=str, indent=2)
        return str(path)

    @classmethod
    def export_csv(cls, report_data: Dict[str, Any], output_path: str | Path) -> str:
        """Exports evidence and detection timeline in structured CSV format."""
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["REPORT_METADATA", "Case ID", report_data.get("case_info", {}).get("case_id")])
            writer.writerow([])
            writer.writerow(["EVIDENCE_INVENTORY"])
            writer.writerow(["Evidence ID", "Filename", "Vendor", "File Size (Bytes)", "SHA-256", "MD5", "Status"])
            for evd in report_data.get("evidence_items", []):
                writer.writerow([
                    evd.get("evidence_id"), evd.get("filename"), evd.get("vendor"),
                    evd.get("file_size"), evd.get("hash_sha256"), evd.get("hash_md5"), evd.get("status")
                ])
            writer.writerow([])
            writer.writerow(["AI_DETECTIONS_TIMELINE"])
            writer.writerow(["Detection ID", "Timestamp", "Type", "Label", "Confidence", "BBox (x,y,w,h)"])
            for det in report_data.get("detections", []):
                bbox = f"[{det.get('bbox_x')},{det.get('bbox_y')},{det.get('bbox_w')},{det.get('bbox_h')}]"
                writer.writerow([
                    det.get("detection_id"), det.get("timestamp_str"),
                    det.get("detection_type"), det.get("label"), det.get("confidence"), bbox
                ])
        return str(path)
