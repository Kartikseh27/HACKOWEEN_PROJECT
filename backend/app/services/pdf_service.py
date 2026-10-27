"""
PDF Report Generator Service using ReportLab.
Produces professional, printable agronomic dossiers for Indian farmers.
"""

import os
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "generated_reports"))
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_agricultural_pdf(report_data: Dict[str, Any]) -> str:
    """
    Builds a structured, printable agricultural PDF report on A4 paper.
    Returns the absolute path to the generated PDF.
    """
    report_id = report_data.get("reportId", f"KC-REP-{int(datetime.utcnow().timestamp())}")
    file_path = os.path.join(REPORTS_DIR, f"{report_id}.pdf")

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1b4332"),  # Deep Forest Green
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#40916c"),
    )

    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#2d6a4f"),
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#212529"),
    )

    bold_body = ParagraphStyle(
        "BoldBody",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#212529"),
    )

    caution_style = ParagraphStyle(
        "CautionStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#b02a37"),
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("KISAN CULTURE — AGRICULTURAL INTELLIGENCE DOSSIER", title_style))
    story.append(Paragraph("Smarter Farming · Stronger Harvests · Aligned with ICAR Package of Practices", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2d6a4f"), spaceAfter=12))

    # 2. Meta Information Table
    loc = report_data.get("farmerLocation", {})
    loc_str = f"{loc.get('district', 'Karnal')}, {loc.get('state', 'Haryana')}"
    if loc.get("village"):
        loc_str = f"{loc.get('village')}, {loc_str}"

    meta_table_data = [
        [
            Paragraph("<b>Dossier ID:</b> " + report_id, body_style),
            Paragraph("<b>Generated On:</b> " + report_data.get("generatedAt", datetime.utcnow().strftime("%d %B %Y")), body_style),
        ],
        [
            Paragraph("<b>Target Crop:</b> " + report_data.get("cropName", "Wheat"), body_style),
            Paragraph("<b>Field Location:</b> " + loc_str, body_style),
        ],
        [
            Paragraph("<b>Tools Executed:</b> " + ", ".join(report_data.get("toolsUsed", ["Universal AI Agent"])), body_style),
            Paragraph("<b>Validation Status:</b> Grounded ICAR Rules", body_style),
        ],
    ]

    meta_table = Table(meta_table_data, colWidths=[260, 260])
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8f9fa")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e9ecef")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # 3. Title & Executive Summary
    story.append(Paragraph(report_data.get("title", "Integrated Field Advisory Report"), heading_style))
    summary_text = report_data.get("executiveSummary", "Comprehensive agronomic inspection conducted.")
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 14))

    # 4. Action Priorities Roadmap Table
    priorities = report_data.get("actionPriorities", [])
    if priorities:
        story.append(Paragraph("PRIORITIZED FARMER ACTION ROADMAP", heading_style))

        priority_rows = [
            [
                Paragraph("<b>Timeframe</b>", bold_body),
                Paragraph("<b>Scientific Action & Practice</b>", bold_body),
                Paragraph("<b>Critical Safety Caution</b>", bold_body),
            ]
        ]

        for p in priorities:
            tf = p.get("timeframe", "Immediate")
            rec = p.get("recommendation", "")
            caut = p.get("caution", "Verify soil moisture before application.")
            priority_rows.append([
                Paragraph(f"<b>{tf}</b>", body_style),
                Paragraph(rec, body_style),
                Paragraph(caut, caution_style),
            ])

        action_table = Table(priority_rows, colWidths=[110, 260, 150])
        action_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f5e9")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#c8e6c9")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e0e0e0")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ])
        )
        story.append(action_table)
        story.append(Spacer(1, 14))

    # 5. Regulatory Disclaimers
    story.append(Paragraph("REGULATORY NOTICES & FIELD ADVISORY DISCLAIMERS", heading_style))
    disclaimers = report_data.get("disclaimers", [
        "Advisory formulated in accordance with ICAR Package of Practices for North-Western Plain Zone.",
        "Visual evaluation does not replace certified laboratory culture tests. Consult your local Krishi Vigyan Kendra (KVK) for intensive chemical broadcasting."
    ])
    for disc in disclaimers:
        story.append(Paragraph(f"• {disc}", ParagraphStyle("Disc", parent=body_style, fontSize=8, textColor=colors.HexColor("#6c757d"))))

    # Build the document
    doc.build(story)
    return file_path

