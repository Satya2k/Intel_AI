"""
Master Assembly Script for IntelliDesk AI Academic Project Report
Stitches together Part 1, Part 2, and Part 3 into a polished, professional,
and strictly formatted Microsoft Word (.docx) document adhering to academic guidelines.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Ensure scripts directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from report_sections_part1 import build_part1, add_header_footer
from report_sections_part2 import build_part2
from report_sections_part3 import build_part3

def generate_report():
    print("=" * 60)
    print("INTELLIDESK AI: MASTER ACADEMIC REPORT GENERATION")
    print("=" * 60)

    doc = docx.Document()

    # 1. Page Setup: A4, 1.5" Left Margin, 1.0" Right/Top/Bottom
    section = doc.sections[0]
    section.page_width = Inches(8.27)   # A4 Width (210 mm)
    section.page_height = Inches(11.69) # A4 Height (297 mm)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.5)   # Academic binding margin
    section.right_margin = Inches(1.0)

    # 2. Base Typography: Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(15, 23, 42)
    normal_style.paragraph_format.line_spacing = 1.5
    normal_style.paragraph_format.space_after = Pt(6)

    # 3. Build Parts
    print("Generating Part 1 (Cover, Preliminaries, Ch 1, Ch 2)...")
    build_part1(doc)

    print("Generating Part 2 (Ch 3 Agent Design, Ch 4 Implementation & Testing)...")
    build_part2(doc)

    print("Generating Part 3 (Ch 5 Governance, Ch 6 Impact/ROI, Ch 7 Conclusion, References, Appendices A-F)...")
    build_part3(doc)

    # 4. Apply Running Headers and Footers
    print("Configuring running headers and footers...")
    add_header_footer(doc)

    # 5. Output Destinations
    output_dir1 = "/Users/satyasmac/AntiGravity/intellidesk-ai"
    output_path1 = os.path.join(output_dir1, "IntelliDesk_AI_Academic_Project_Report.docx")
    
    output_dir2 = "/Users/satyasmac/AntiGravity"
    output_path2 = os.path.join(output_dir2, "IntelliDesk_AI_Academic_Project_Report.docx")

    print(f"Saving report to: {output_path1}")
    doc.save(output_path1)

    print(f"Saving copy to: {output_path2}")
    doc.save(output_path2)

    # 6. Verify and Report Metrics
    file_size_kb1 = os.path.getsize(output_path1) / 1024
    num_paragraphs = len(doc.paragraphs)
    num_tables = len(doc.tables)

    print("\n" + "=" * 60)
    print("SUCCESS: REPORT GENERATION COMPLETED")
    print(f"Total Paragraphs: {num_paragraphs}")
    print(f"Total Tables: {num_tables}")
    print(f"File Size: {file_size_kb1:.2f} KB")
    print(f"Primary Output: {output_path1}")
    print(f"Secondary Output: {output_path2}")
    print("=" * 60)

if __name__ == "__main__":
    generate_report()

