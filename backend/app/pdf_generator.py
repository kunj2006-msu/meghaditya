"""
PDF Report Generator for Meghaditya Rooftop Resource Assessment.
Generates server-side vector PDFs for Rainwater Harvesting and Rooftop Solar Potential assessments using ReportLab.
"""

from io import BytesIO
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.graphics.shapes import Drawing, Rect, String


def clean_pdf_text(text: Any) -> str:
    """
    Sanitize text strings to use standard ASCII/WinAnsi characters supported by Helvetica.
    Prevents black box glyph bugs (e.g., replacing ₹ with Rs. and subscript ₂ with 2).
    """
    if text is None:
        return ""
    val_str = str(text)
    val_str = val_str.replace("₹", "Rs. ")
    val_str = val_str.replace("\u20b9", "Rs. ")
    val_str = val_str.replace("₂", "2")
    val_str = val_str.replace("\u2082", "2")
    val_str = val_str.replace("™", "")
    val_str = val_str.replace("®", "")
    val_str = val_str.replace("–", "-")
    val_str = val_str.replace("—", "-")
    return val_str


def format_number(val: Any, decimals: int = 0) -> str:
    """Format numeric values with Indian numbering system style formatting."""
    if val is None:
        return "N/A"
    try:
        num = float(val)
        if decimals == 0:
            return f"{int(round(num)):,}"
        return f"{num:,.{decimals}f}"
    except (ValueError, TypeError):
        return str(val)


def draw_solar_monthly_chart(monthly_data: List[Dict[str, Any]], page_width: float) -> Drawing:
    """
    Draw a vector 12-month solar irradiance bar chart matching the dashboard design.
    """
    MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    chart_h = 60
    d = Drawing(page_width, chart_h)

    # Outer panel background box
    d.add(Rect(0, 0, page_width, chart_h, fillColor=colors.HexColor("#fffbeb"), strokeColor=colors.HexColor("#fde68a"), strokeWidth=0.5, rx=4, ry=4))

    # Section Title
    d.add(String(10, chart_h - 12, "Monthly Solar Irradiance Profile (kWh/m2/day)", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#b45309")))

    if not monthly_data:
        d.add(String(page_width / 2.0, 20, "12-month solar radiation profile unavailable", fontName="Helvetica", fontSize=8, textAnchor="middle", fillColor=colors.HexColor("#94a3b8")))
        return d

    # Max irradiance for bar scaling
    max_irr = max([float(item.get("irradiance_kwh_m2_day", 5.0)) for item in monthly_data] + [6.5])

    col_w = (page_width - 20.0) / 12.0
    bar_w = min(col_w * 0.45, 14.0)
    y_base = 15.0
    max_bar_h = 23.0

    for i, item in enumerate(monthly_data[:12]):
        irr = float(item.get("irradiance_kwh_m2_day", 0))
        m_num = item.get("month", i + 1)
        m_name = MONTH_NAMES[m_num - 1] if 1 <= m_num <= 12 else str(m_num)

        x_center = 10.0 + (i * col_w) + (col_w / 2.0)
        bar_x = x_center - (bar_w / 2.0)
        bar_h = max((irr / max_irr) * max_bar_h, 3.0)

        # Background track slot
        d.add(Rect(bar_x, y_base, bar_w, max_bar_h, fillColor=colors.HexColor("#fef3c7"), strokeColor=None, rx=2, ry=2))

        # Filled bar graphic
        d.add(Rect(bar_x, y_base, bar_w, bar_h, fillColor=colors.HexColor("#f97316"), strokeColor=None, rx=2, ry=2))

        # Value label above bar
        d.add(String(x_center, y_base + bar_h + 2.0, f"{irr:.1f}", fontName="Helvetica-Bold", fontSize=6, textAnchor="middle", fillColor=colors.HexColor("#c2410c")))

        # Month label below baseline
        d.add(String(x_center, y_base - 9.0, m_name, fontName="Helvetica", fontSize=7, textAnchor="middle", fillColor=colors.HexColor("#475569")))

    return d


def generate_rainwater_pdf(data: Dict[str, Any]) -> BytesIO:
    """
    Build a one-page vector PDF report for Rainwater Harvesting assessment.

    :param data: Dictionary containing assessment inputs, results, and subsidies.
    :return: BytesIO buffer containing the PDF document.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    story = []
    page_width = 523.27  # A4 width minus margins

    # Brand Colors for Rainwater (Blue theme)
    primary_color = colors.HexColor("#0ea5e9")
    secondary_color = colors.HexColor("#0284c7")
    dark_header = colors.HexColor("#0f172a")
    box_bg = colors.HexColor("#f0f9ff")
    box_border = colors.HexColor("#bae6fd")

    # 1. Header Section
    date_str = clean_pdf_text(data.get("generation_date") or datetime.now().strftime("%d %b %Y"))

    header_left = Paragraph(
        f"<font size=22 color='{primary_color.hexval()}'><b>Meghaditya</b></font><br/>"
        f"<font size=12 color='{dark_header.hexval()}'><b>Rooftop Rainwater Harvesting Assessment Report</b></font>",
        ParagraphStyle("HeadLeft", fontName="Helvetica", leading=16),
    )

    header_right = Paragraph(
        f"<font size=8 color='#64748b'>Generated Date</font><br/>"
        f"<font size=9 color='#0f172a'><b>{date_str}</b></font>",
        ParagraphStyle("HeadRight", fontName="Helvetica", leading=11, alignment=2),
    )

    header_table = Table(
        [[header_left, header_right]],
        colWidths=[page_width * 0.72, page_width * 0.28],
    )
    header_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=4, spaceAfter=10))

    # 2. Labeled Summary Table
    district = clean_pdf_text(data.get("district", "Unknown"))
    state = clean_pdf_text(data.get("state", "Unknown"))
    location_label = f"{district}, {state}"
    roof_area = format_number(data.get("roof_area_m2"), 1)
    roof_type_map = {
        "rcc": "RCC Concrete Flat Roof",
        "tiled": "Tiled / Sloped Sheet Roof",
        "green": "Green / Turf Eco Roof",
    }
    roof_type_raw = str(data.get("roof_type", "rcc")).lower()
    roof_type_display = roof_type_map.get(roof_type_raw, roof_type_raw.upper())
    household = str(data.get("household_size", 4))

    summary_data = [
        [
            Paragraph("<b>Location:</b>", ParagraphStyle("S1", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#475569"))),
            Paragraph(f"<b>{location_label}</b>", ParagraphStyle("S2", fontName="Helvetica", fontSize=9, textColor=dark_header)),
            Paragraph("<b>Roof Area:</b>", ParagraphStyle("S3", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#475569"))),
            Paragraph(f"<b>{roof_area} m²</b>", ParagraphStyle("S4", fontName="Helvetica", fontSize=9, textColor=dark_header)),
        ],
        [
            Paragraph("<b>Roof Surface Type:</b>", ParagraphStyle("S5", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#475569"))),
            Paragraph(roof_type_display, ParagraphStyle("S6", fontName="Helvetica", fontSize=9, textColor=dark_header)),
            Paragraph("<b>Household Occupants:</b>", ParagraphStyle("S7", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#475569"))),
            Paragraph(f"{household} members", ParagraphStyle("S8", fontName="Helvetica", fontSize=9, textColor=dark_header)),
        ],
    ]

    summary_table = Table(summary_data, colWidths=[page_width * 0.22, page_width * 0.32, page_width * 0.22, page_width * 0.24])
    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # 3. Headline Results (Prominent Callout Boxes)
    harvestable = format_number(data.get("harvestable_liters_per_year"), 0)
    tank_size = format_number(data.get("suggested_tank_size_liters"), 0)

    box_1_content = [
        [Paragraph("<font color='#0284c7' size=8><b>ANNUAL HARVESTABLE VOLUME</b></font>", ParagraphStyle("B1Title", leading=10))],
        [Spacer(1, 4)],
        [Paragraph(f"<font color='#0f172a' size=18><b>{harvestable}</b></font> <font color='#0284c7' size=10><b>Liters/year</b></font>", ParagraphStyle("B1Val", leading=20))],
        [Spacer(1, 4)],
        [Paragraph("<font color='#64748b' size=7.5>Total potential rainwater captured from roof runoff</font>", ParagraphStyle("B1Sub", leading=9))],
    ]
    box_1 = Table(box_1_content, colWidths=[(page_width - 12) / 2])
    box_1.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), box_bg),
            ("BOX", (0, 0), (-1, -1), 1, box_border),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ])
    )

    box_2_content = [
        [Paragraph("<font color='#0d9488' size=8><b>RECOMMENDED TANK SIZE</b></font>", ParagraphStyle("B2Title", leading=10))],
        [Spacer(1, 4)],
        [Paragraph(f"<font color='#0f172a' size=18><b>{tank_size}</b></font> <font color='#0d9488' size=10><b>Liters capacity</b></font>", ParagraphStyle("B2Val", leading=20))],
        [Spacer(1, 4)],
        [Paragraph("<font color='#64748b' size=7.5>Sized for peak monsoon runoff & 15-day domestic buffer</font>", ParagraphStyle("B2Sub", leading=9))],
    ]
    box_2 = Table(box_2_content, colWidths=[(page_width - 12) / 2])
    box_2.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#99f6e4")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ])
    )

    results_grid = Table([[box_1, box_2]], colWidths=[(page_width - 12) / 2, (page_width - 12) / 2])
    results_grid.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 6),
            ("LEFTPADDING", (1, 0), (1, 0), 6),
        ])
    )
    story.append(results_grid)
    story.append(Spacer(1, 10))

    # 4. Underlying Data Section
    avg_rainfall = format_number(data.get("avg_rainfall_mm"), 1)
    data_src = data.get("data_source", "district_exact")

    if data_src == "state_average":
        note_text = "<b>Note:</b> Assessment computed using <b>state regional average rainfall data</b> because exact district-level measurement was unindexed."
        note_color = "#b45309"
        note_bg = "#fffbeb"
        note_border = "#fde68a"
    else:
        note_text = "<b>Data Source:</b> Based on verified district-level meteorological annual rainfall data."
        note_color = "#047857"
        note_bg = "#ecfdf5"
        note_border = "#a7f3d0"

    data_section = [
        [
            Paragraph(
                f"<font size=9 color='#1e293b'><b>Underlying Meteorology Data:</b> Average Annual Rainfall = <b>{avg_rainfall} mm</b></font>",
                ParagraphStyle("DS1", fontName="Helvetica", leading=12),
            )
        ],
        [
            Paragraph(
                f"<font size=8 color='{note_color}'>{note_text}</font>",
                ParagraphStyle("DS2", fontName="Helvetica", leading=11),
            )
        ],
    ]

    data_table = Table(data_section, colWidths=[page_width])
    data_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(note_bg)),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor(note_border)),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ])
    )
    story.append(data_table)
    story.append(Spacer(1, 12))

    # 5. Government Schemes & Subsidies Section (With Clickable Portal Links)
    story.append(
        Paragraph(
            f"<font size=11 color='{dark_header.hexval()}'><b>Government Schemes & Subsidies</b></font>",
            ParagraphStyle("SubHead", fontName="Helvetica", leading=14),
        )
    )
    story.append(Spacer(1, 5))

    subsidies = data.get("subsidies", [])
    if not subsidies:
        sub_content = Paragraph(
            "<font size=8.5 color='#64748b'>No specific state subsidy records indexed for this region. Check national Jal Shakti Abhiyan portals.</font>",
            ParagraphStyle("NoSub", fontName="Helvetica"),
        )
        story.append(sub_content)
    else:
        subs_rows = []
        for sub in subsidies[:3]:  # Top 3 subsidies to fit 1 page
            s_name = clean_pdf_text(sub.get("scheme_name", "Government Scheme"))
            s_det = clean_pdf_text(sub.get("subsidy_details", ""))
            s_help = clean_pdf_text(sub.get("helpline_number", ""))
            s_url = sub.get("website_url", "").strip() if sub.get("website_url") else ""

            info_parts = []
            if s_help:
                info_parts.append(f"Helpline: <b>{s_help}</b>")
            if s_url:
                url_href = s_url if s_url.startswith("http") else f"https://{s_url}"
                info_parts.append(f"Portal: <a href='{url_href}' color='#0ea5e9'><u>{s_url}</u></a>")

            info_str = " &nbsp;|&nbsp; ".join(info_parts) if info_parts else "Contact Local Water Authority"

            cell_text = (
                f"<font size=9 color='#0369a1'><b>• {s_name}</b></font><br/>"
                f"<font size=8 color='#334155'>{s_det}</font><br/>"
                f"<font size=7.5 color='#64748b'><i>{info_str}</i></font>"
            )
            subs_rows.append([Paragraph(cell_text, ParagraphStyle("SubItem", fontName="Helvetica", leading=11))])

        subs_table = Table(subs_rows, colWidths=[page_width])
        subs_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(subs_table)

    story.append(Spacer(1, 10))

    # 6. Footer Section
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=6))
    footer_text = (
        "<font size=7.5 color='#64748b'>"
        "Calculated using standard rainwater runoff coefficient methodology.<br/>"
        "Meghaditya Rooftop Resource Assessment Tool &nbsp;|&nbsp; <a href='https://meghaditya.veracel.app' color='#0284c7'><u>https://meghaditya.veracel.app</u></a>"
        "</font>"
    )
    story.append(Paragraph(footer_text, ParagraphStyle("Footer", fontName="Helvetica", leading=10, alignment=1)))

    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_solar_pdf(data: Dict[str, Any]) -> BytesIO:
    """
    Build a one-page vector PDF report for Rooftop Solar Potential assessment.

    :param data: Dictionary containing assessment inputs, results, and subsidies.
    :return: BytesIO buffer containing the PDF document.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    story = []
    page_width = 523.27  # A4 width minus margins

    # Brand Colors for Solar (Orange theme)
    primary_color = colors.HexColor("#f97316")
    secondary_color = colors.HexColor("#ea580c")
    dark_header = colors.HexColor("#0f172a")
    box_bg = colors.HexColor("#fffbeb")
    box_border = colors.HexColor("#fde68a")

    # 1. Header Section
    date_str = clean_pdf_text(data.get("generation_date") or datetime.now().strftime("%d %b %Y"))

    header_left = Paragraph(
        f"<font size=22 color='{primary_color.hexval()}'><b>Meghaditya</b></font><br/>"
        f"<font size=12 color='{dark_header.hexval()}'><b>Rooftop Solar Potential Assessment Report</b></font>",
        ParagraphStyle("HeadLeft", fontName="Helvetica", leading=16),
    )

    header_right = Paragraph(
        f"<font size=8 color='#64748b'>Generated Date</font><br/>"
        f"<font size=9 color='#0f172a'><b>{date_str}</b></font>",
        ParagraphStyle("HeadRight", fontName="Helvetica", leading=11, alignment=2),
    )

    header_table = Table(
        [[header_left, header_right]],
        colWidths=[page_width * 0.72, page_width * 0.28],
    )
    header_table.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=4, spaceAfter=8))

    # 2. Labeled Summary Table
    district = clean_pdf_text(data.get("district", "Unknown"))
    state = clean_pdf_text(data.get("state", "Unknown"))
    location_label = f"{district}, {state}"
    roof_area = format_number(data.get("roof_area_m2"), 1)

    summary_data = [
        [
            Paragraph("<b>Location:</b>", ParagraphStyle("S1", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#475569"))),
            Paragraph(f"<b>{location_label}</b>", ParagraphStyle("S2", fontName="Helvetica", fontSize=9, textColor=dark_header)),
            Paragraph("<b>Available Roof Area:</b>", ParagraphStyle("S3", fontName="Helvetica", fontSize=9, textColor=colors.HexColor("#475569"))),
            Paragraph(f"<b>{roof_area} m²</b>", ParagraphStyle("S4", fontName="Helvetica", fontSize=9, textColor=dark_header)),
        ],
    ]

    summary_table = Table(summary_data, colWidths=[page_width * 0.20, page_width * 0.35, page_width * 0.23, page_width * 0.22])
    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(summary_table)
    story.append(Spacer(1, 8))

    # 3. Headline Results (4 Callout Boxes in 2x2 Grid)
    capacity_kwp = format_number(data.get("capacity_kwp"), 1)
    annual_gen = format_number(data.get("annual_generation_kwh"), 0)

    # Derived financial & environmental metrics (using clean ASCII Rs. and CO2 to prevent black squares)
    gen_val = float(data.get("annual_generation_kwh", 0))
    bill_savings = format_number(gen_val * 7.5, 0)
    co2_reduction = format_number((gen_val * 0.82) / 1000.0, 1)

    half_w = (page_width - 12) / 2.0

    # Row 1 Boxes
    box_1_content = [
        [Paragraph("<font color='#d97706' size=8><b>RECOMMENDED SYSTEM SIZE</b></font>", ParagraphStyle("B1T", leading=10))],
        [Spacer(1, 2)],
        [Paragraph(f"<font color='#0f172a' size=16><b>{capacity_kwp}</b></font> <font color='#d97706' size=9><b>kWp</b></font>", ParagraphStyle("B1V", leading=17))],
        [Spacer(1, 2)],
        [Paragraph("<font color='#64748b' size=7.5>Kilowatt-peak rooftop array capacity</font>", ParagraphStyle("B1S", leading=9))],
    ]
    box_1 = Table(box_1_content, colWidths=[half_w])
    box_1.setStyle([
        ("BACKGROUND", (0, 0), (-1, -1), box_bg),
        ("BOX", (0, 0), (-1, -1), 1, box_border),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ])

    box_2_content = [
        [Paragraph("<font color='#ea580c' size=8><b>EST. ANNUAL GENERATION</b></font>", ParagraphStyle("B2T", leading=10))],
        [Spacer(1, 2)],
        [Paragraph(f"<font color='#0f172a' size=16><b>{annual_gen}</b></font> <font color='#ea580c' size=9><b>kWh/year</b></font>", ParagraphStyle("B2V", leading=17))],
        [Spacer(1, 2)],
        [Paragraph("<font color='#64748b' size=7.5>Clean electricity generated annually</font>", ParagraphStyle("B2S", leading=9))],
    ]
    box_2 = Table(box_2_content, colWidths=[half_w])
    box_2.setStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff7ed")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#ffedd5")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ])

    # Row 2 Boxes - CLEAN TEXT (Rs. and CO2 to prevent black square bug)
    box_3_content = [
        [Paragraph("<font color='#b45309' size=8><b>ESTIMATED BILL SAVINGS</b></font>", ParagraphStyle("B3T", leading=10))],
        [Spacer(1, 2)],
        [Paragraph(f"<font color='#0f172a' size=16><b>Rs. {bill_savings}</b></font> <font color='#b45309' size=9><b>/year</b></font>", ParagraphStyle("B3V", leading=17))],
        [Spacer(1, 2)],
        [Paragraph("<font color='#64748b' size=7.5>Based on avg Rs. 7.5/kWh grid power offset</font>", ParagraphStyle("B3S", leading=9))],
    ]
    box_3 = Table(box_3_content, colWidths=[half_w])
    box_3.setStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fefce8")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#fef08a")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ])

    box_4_content = [
        [Paragraph("<font color='#15803d' size=8><b>EST. CO2 REDUCTION</b></font>", ParagraphStyle("B4T", leading=10))],
        [Spacer(1, 2)],
        [Paragraph(f"<font color='#0f172a' size=16><b>{co2_reduction}</b></font> <font color='#15803d' size=9><b>Tons/year</b></font>", ParagraphStyle("B4V", leading=17))],
        [Spacer(1, 2)],
        [Paragraph("<font color='#64748b' size=7.5>Greenhouse gas emissions avoided annually</font>", ParagraphStyle("B4S", leading=9))],
    ]
    box_4 = Table(box_4_content, colWidths=[half_w])
    box_4.setStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#bbf7d0")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ])

    results_grid = Table(
        [
            [box_1, box_2],
            [Spacer(1, 4), Spacer(1, 4)],
            [box_3, box_4],
        ],
        colWidths=[half_w, half_w],
    )
    results_grid.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (0, -1), 6),
            ("LEFTPADDING", (1, 0), (1, -1), 6),
        ])
    )
    story.append(results_grid)
    story.append(Spacer(1, 8))

    # 4. Monthly Solar Irradiance Profile Visual Vector Bar Chart (Matching Dashboard)
    monthly_data = data.get("monthly_data", [])
    chart_drawing = draw_solar_monthly_chart(monthly_data, page_width)
    story.append(chart_drawing)
    story.append(Spacer(1, 8))

    # 5. Underlying Data Section
    avg_irr = format_number(data.get("avg_annual_irradiance"), 2)
    data_src = data.get("data_source", "district_exact")

    if data_src == "state_average":
        note_text = "<b>Note:</b> Assessment computed using <b>state regional average solar radiation data</b> because exact district-level measurement was unindexed."
        note_color = "#b45309"
        note_bg = "#fffbeb"
        note_border = "#fde68a"
    else:
        note_text = "<b>Data Source:</b> Based on verified district-level NITI Aayog Solar Radiation database."
        note_color = "#047857"
        note_bg = "#ecfdf5"
        note_border = "#a7f3d0"

    data_section = [
        [
            Paragraph(
                f"<font size=9 color='#1e293b'><b>Underlying Irradiance Data:</b> Avg Annual Irradiance = <b>{avg_irr} kWh/m²/day</b></font>",
                ParagraphStyle("DS1", fontName="Helvetica", leading=11),
            )
        ],
        [
            Paragraph(
                f"<font size=8 color='{note_color}'>{note_text}</font>",
                ParagraphStyle("DS2", fontName="Helvetica", leading=10),
            )
        ],
    ]

    data_table = Table(data_section, colWidths=[page_width])
    data_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(note_bg)),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor(note_border)),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(data_table)
    story.append(Spacer(1, 8))

    # 6. Government Schemes & Subsidies Section (With Clickable Portal Links)
    story.append(
        Paragraph(
            f"<font size=10 color='{dark_header.hexval()}'><b>Government Schemes & Subsidies</b></font>",
            ParagraphStyle("SubHead", fontName="Helvetica", leading=12),
        )
    )
    story.append(Spacer(1, 4))

    subsidies = data.get("subsidies", [])
    if not subsidies:
        sub_content = Paragraph(
            "<font size=8 color='#64748b'>No specific solar subsidy records indexed for this state. Check PM Surya Ghar national portal.</font>",
            ParagraphStyle("NoSub", fontName="Helvetica"),
        )
        story.append(sub_content)
    else:
        subs_rows = []
        for sub in subsidies[:3]:  # Top 3 subsidies to fit 1 page
            s_name = clean_pdf_text(sub.get("scheme_name", "Government Scheme"))
            s_det = clean_pdf_text(sub.get("subsidy_details", ""))
            s_help = clean_pdf_text(sub.get("helpline_number", ""))
            s_url = sub.get("website_url", "").strip() if sub.get("website_url") else ""

            info_parts = []
            if s_help:
                info_parts.append(f"Helpline: <b>{s_help}</b>")
            if s_url:
                url_href = s_url if s_url.startswith("http") else f"https://{s_url}"
                info_parts.append(f"Portal: <a href='{url_href}' color='#f97316'><u>{s_url}</u></a>")

            info_str = " &nbsp;|&nbsp; ".join(info_parts) if info_parts else "Contact Discom Office"

            cell_text = (
                f"<font size=8.5 color='#c2410c'><b>• {s_name}</b></font><br/>"
                f"<font size=7.5 color='#334155'>{s_det}</font><br/>"
                f"<font size=7 color='#64748b'><i>{info_str}</i></font>"
            )
            subs_rows.append([Paragraph(cell_text, ParagraphStyle("SubItem", fontName="Helvetica", leading=10))])

        subs_table = Table(subs_rows, colWidths=[page_width])
        subs_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ])
        )
        story.append(subs_table)

    story.append(Spacer(1, 8))

    # 7. Footer Section
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=4))
    footer_text = (
        "<font size=7 color='#64748b'>"
        "Calculated using standard rooftop solar sizing methodology.<br/>"
        "Meghaditya Rooftop Resource Assessment Tool &nbsp;|&nbsp; <a href='https://meghaditya.veracel.app' color='#ea580c'><u>https://meghaditya.veracel.app</u></a>"
        "</font>"
    )
    story.append(Paragraph(footer_text, ParagraphStyle("Footer", fontName="Helvetica", leading=9, alignment=1)))

    doc.build(story)
    buffer.seek(0)
    return buffer
