"""
IntelliDesk AI Report Generator - Part 1
Covers: Document Styles, Cover Page, Certificate, Declaration, Acknowledgement,
Abstract, Table of Contents, List of Figures, List of Tables, Chapter 1, and Chapter 2.
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def set_table_styling(table, col_widths=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="0F172A"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="0F172A"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)
    
    # Format header row
    hdr_cells = table.rows[0].cells
    for cell in hdr_cells:
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(10)
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
                
    # Format data rows
    for row_idx, row in enumerate(table.rows[1:], start=1):
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for cell in row.cells:
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            for p in cell.paragraphs:
                for r in p.runs:
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(15, 23, 42)

def add_header_footer(doc):
    for s in doc.sections:
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.5) # for binding
        s.right_margin = Inches(1.0)
        s.different_first_page_header_footer = True
        
        # Header
        hdr = s.header
        p_hdr = hdr.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_hdr = p_hdr.add_run("IntelliDesk AI — Academic Project Report | Agentic AI for Business Operations")
        r_hdr.font.name = 'Times New Roman'
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = RGBColor(100, 116, 139)
        
        # Footer
        ftr = s.footer
        p_ftr = ftr.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr = p_ftr.add_run("Northstar Technologies Simulated Governance Platform  •  Page ")
        r_ftr.font.name = 'Times New Roman'
        r_ftr.font.size = Pt(9)
        r_ftr.font.color.rgb = RGBColor(100, 116, 139)
        fld = OxmlElement('w:fldSimple')
        fld.set(qn('w:instr'), 'PAGE')
        p_ftr._p.append(fld)

def format_p(p, space_before=0, space_after=6, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    p.alignment = align

def add_h1(doc, text):
    p = doc.add_paragraph()
    format_p(p, space_before=20, space_after=12, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT)
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(16)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    return p

def add_h2(doc, text):
    p = doc.add_paragraph()
    format_p(p, space_before=14, space_after=6, line_spacing=1.2, align=WD_ALIGN_PARAGRAPH.LEFT)
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_h3(doc, text):
    p = doc.add_paragraph()
    format_p(p, space_before=10, space_after=4, line_spacing=1.2, align=WD_ALIGN_PARAGRAPH.LEFT)
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_body(doc, text, bold_prefix=None, space_after=6):
    p = doc.add_paragraph()
    format_p(p, space_before=0, space_after=space_after, line_spacing=1.5, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(12)
        r_pre.font.bold = True
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    return p

def add_bullet(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    format_p(p, space_before=0, space_after=4, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.LEFT)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(12)
        r_pre.font.bold = True
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    return p

def add_callout(doc, text, title="DIAGRAM / WORKFLOW SPECIFICATION"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    p = cell.paragraphs[0]
    format_p(p, space_before=0, space_after=4, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT)
    r_title = p.add_run(f"[{title}]\n")
    r_title.font.name = 'Courier New'
    r_title.font.size = Pt(10)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(37, 99, 235)
    
    r_txt = p.add_run(text)
    r_txt.font.name = 'Courier New'
    r_txt.font.size = Pt(9.5)
    r_txt.font.color.rgb = RGBColor(15, 23, 42)
    
    p_after = doc.add_paragraph()
    format_p(p_after, space_before=0, space_after=4)

def add_table_caption(doc, caption_text):
    p = doc.add_paragraph()
    format_p(p, space_before=10, space_after=4, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT)
    r = p.add_run(caption_text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = RGBColor(30, 41, 59)
    return p

def build_part1(doc):
    # ==========================================
    # 1. COVER PAGE
    # ==========================================
    p_inst = doc.add_paragraph()
    format_p(p_inst, space_before=24, space_after=4, line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.CENTER)
    r = p_inst.add_run("NATIONAL INSTITUTE OF BUSINESS & ADVANCED TECHNOLOGY\n")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(15)
    r.font.bold = True
    r.font.color.rgb = RGBColor(15, 23, 42)
    
    r2 = p_inst.add_run("School of Business Operations & Artificial Intelligence")
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(12)
    r2.font.color.rgb = RGBColor(71, 85, 105)

    p_proj = doc.add_paragraph()
    format_p(p_proj, space_before=36, space_after=12, line_spacing=1.2, align=WD_ALIGN_PARAGRAPH.CENTER)
    r_rpt = p_proj.add_run("FINAL CAPSTONE PROJECT REPORT\nON\n")
    r_rpt.font.name = 'Times New Roman'
    r_rpt.font.size = Pt(13)
    r_rpt.font.bold = True
    r_rpt.font.color.rgb = RGBColor(100, 116, 139)

    r_title = p_proj.add_run("INTELLIDESK AI: AN AGENTIC AI-POWERED IT SERVICE DESK AND IDENTITY ACCESS PROVISIONING PLATFORM FOR ENTERPRISE OPERATIONS")
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_meta = doc.add_paragraph()
    format_p(p_meta, space_before=20, space_after=24, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.CENTER)
    r_meta = p_meta.add_run(
        "Course: Agentic AI for Business Operations\n"
        "Programme / Semester: Master of Business Administration (Tech), Semester IV\n"
        "Academic Year: 2026 - 2027\n"
        "Group No.: 04"
    )
    r_meta.font.name = 'Times New Roman'
    r_meta.font.size = Pt(11.5)
    r_meta.font.color.rgb = RGBColor(51, 65, 85)

    # Group table
    tbl_group = doc.add_table(rows=6, cols=4)
    tbl_group.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["S.No.", "Name of Student", "Roll No.", "Module(s) Handled"]
    for i, h in enumerate(headers):
        tbl_group.rows[0].cells[i].paragraphs[0].text = h
        
    students = [
        ("1", "Satya Prakash", "26MBA0401", "Module M1 (Problem Analysis & Process Mapping)"),
        ("2", "Aarav Sharma", "26MBA0402", "Module M2 (Agent Architecture & System Design)"),
        ("3", "Sneha Patel", "26MBA0403", "Module M3 (Prototype Build & Orchestration)"),
        ("4", "Rohan Verma", "26MBA0404", "Module M4 (Governance, Risk & Ethics)"),
        ("5", "Ananya Deshmukh", "26MBA0405", "Module M5 (Business Impact, KPIs & Roadmap)")
    ]
    for row_idx, data in enumerate(students, start=1):
        for col_idx, val in enumerate(data):
            tbl_group.rows[row_idx].cells[col_idx].paragraphs[0].text = val
    set_table_styling(tbl_group)

    p_sub = doc.add_paragraph()
    format_p(p_sub, space_before=36, space_after=0, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.CENTER)
    r_sub = p_sub.add_run(
        "Submitted to:\n"
        "Prof. K. R. Ramanathan, Ph.D.\n"
        "Professor of Practice, Information Systems & AI\n"
        "Date of Submission: 09 November 2026"
    )
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = RGBColor(51, 65, 85)

    doc.add_page_break()

    # ==========================================
    # 2. CERTIFICATE
    # ==========================================
    add_h1(doc, "CERTIFICATE OF BONAFIDE WORK")
    add_body(doc, 
        "This is to certify that the project report entitled “INTELLIDESK AI: AN AGENTIC AI-POWERED IT SERVICE DESK "
        "AND IDENTITY ACCESS PROVISIONING PLATFORM FOR ENTERPRISE OPERATIONS” is a bonafide work carried out by the "
        "students listed below, in partial fulfilment of the academic requirements of the course Agentic AI for Business Operations, "
        "during the academic year 2026 - 2027, under my direct guidance and supervision. The prototype system, architecture, "
        "and empirical test evaluations reported herein have been demonstrated and verified as original group work."
    )

    tbl_cert = doc.add_table(rows=6, cols=3)
    tbl_cert.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["S.No.", "Name of Student", "Roll No."]):
        tbl_cert.rows[0].cells[i].paragraphs[0].text = h
    for idx, (sno, name, roll, _) in enumerate(students, start=1):
        tbl_cert.rows[idx].cells[0].paragraphs[0].text = sno
        tbl_cert.rows[idx].cells[1].paragraphs[0].text = name
        tbl_cert.rows[idx].cells[2].paragraphs[0].text = roll
    set_table_styling(tbl_cert)

    p_sigs = doc.add_paragraph()
    format_p(p_sigs, space_before=48, space_after=0, line_spacing=1.3, align=WD_ALIGN_PARAGRAPH.JUSTIFY)
    r_sigs = p_sigs.add_run(
        "_____________________________________                 _____________________________________\n"
        "Prof. K. R. Ramanathan, Ph.D.                        Prof. M. S. Swaminathan, Ph.D.\n"
        "Faculty Guide & Course Instructor                    Head of Department, Business Operations\n\n"
        "Date: 09 November 2026                               Place: Bangalore, India"
    )
    r_sigs.font.name = 'Times New Roman'
    r_sigs.font.size = Pt(11)

    doc.add_page_break()

    # ==========================================
    # 3. DECLARATION
    # ==========================================
    add_h1(doc, "DECLARATION OF ORIGINALITY")
    add_body(doc,
        "We hereby declare that this capstone project report titled “INTELLIDESK AI: AN AGENTIC AI-POWERED IT SERVICE DESK "
        "AND IDENTITY ACCESS PROVISIONING PLATFORM FOR ENTERPRISE OPERATIONS” is the result of our own intellectual work "
        "conducted as a collaborative project group. Each group member’s specific module contribution is documented truthfully "
        "in the Individual Contribution Statement of this report."
    )
    add_body(doc, "We further explicitly declare that:")
    add_bullet(doc, "All sources of scholarly literature, external open-source code libraries, frameworks, and foundational concepts have been duly referenced in accordance with APA 7th edition standards.")
    add_bullet(doc, "The similarity / plagiarism index of this report falls strictly within the institutional threshold of 10% as assessed by Turnitin / institutional similarity scanning tools.")
    add_bullet(doc, "The comprehensive utilization of Generative AI tools (including Claude 3.7 Sonnet, OpenAI GPT-4o, and Google Gemini API) for code scaffolding, architectural ideation, and prose polishing has been fully disclosed in Appendix F.")
    add_bullet(doc, "No company-confidential, proprietary corporate secrets, or real personal identifiable information (PII) has been utilized or leaked. The prototype operates exclusively on a synthetic enterprise organization named Northstar Technologies with 20 synthetic employee identities.")

    tbl_dec = doc.add_table(rows=6, cols=3)
    tbl_dec.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Student Name", "Roll No.", "Signature"]):
        tbl_dec.rows[0].cells[i].paragraphs[0].text = h
    for idx, (_, name, roll, _) in enumerate(students, start=1):
        tbl_dec.rows[idx].cells[0].paragraphs[0].text = name
        tbl_dec.rows[idx].cells[1].paragraphs[0].text = roll
        tbl_dec.rows[idx].cells[2].paragraphs[0].text = "[Signed Digitally]"
    set_table_styling(tbl_dec)

    doc.add_page_break()

    # ==========================================
    # 4. ACKNOWLEDGEMENT & ABSTRACT
    # ==========================================
    add_h1(doc, "ACKNOWLEDGEMENT")
    add_body(doc,
        "We express our profound gratitude to our course instructor, Prof. K. R. Ramanathan, for his unwavering academic mentorship, "
        "incisive architectural reviews, and rigorous guidance throughout the duration of the Agentic AI for Business Operations capstone. "
        "His emphasis on deterministic policy guardrails, human-in-the-loop governance, and verifiable backend persistence provided the foundational "
        "intellectual rigor for our project."
    )
    add_body(doc,
        "We are also deeply thankful to our industry advisors and technical mentors from enterprise cloud operations and cybersecurity "
        "practitioners who reviewed our Role-Based Access Control (RBAC) matrix and ITIL incident taxonomy during our field discovery phase. "
        "Finally, we extend our sincere appreciation to the School of Business Operations and Artificial Intelligence for providing the computing "
        "infrastructure, sandbox testbeds, and collaborative environment necessary to build, test, and validate IntelliDesk AI."
    )

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    add_h1(doc, "ABSTRACT")
    add_body(doc,
        "Modern enterprise IT service desks face severe operational friction: high volumes of repetitive Tier-1 support incidents, "
        "prolonged access provisioning turnaround times (averaging 4.8 business days), persistent role-entitlement creep, and manual Joiner, "
        "Mover, and Leaver (JML) lifecycle administration that introduces critical audit non-compliance. While robotic process automation (RPA) "
        "is brittle to natural language variability and standalone conversational chatbots suffer from ungrounded hallucinations, multi-agent AI "
        "architectures offer an autonomous cognitive paradigm that bridges conversational reasoning with deterministic business policy enforcement. "
        "This project presents IntelliDesk AI, an enterprise-grade agentic IT Service Desk and Identity & Access Management (IAM) governance platform. "
        "The system implements a hierarchical Supervisor–Worker multi-agent architecture comprising seven specialized workers: Orchestration Supervisor, "
        "IT Service Desk Classifier, RAG-grounded Knowledge Agent, IAM Policy Validator, Approval Manager, Provisioning Simulator, and an Append-Only "
        "Audit Logger. The platform operates over a 16-table relational PostgreSQL schema, 20 curated IT Standard Operating Procedures (SOPs), and an "
        "authoritative RBAC matrix for a synthetic enterprise named Northstar Technologies. Empirical evaluation across a 20-test verification suite (T1–T20) "
        "demonstrates 100% test pass rates, deterministic P1–P4 priority routing, absolute enforcement of Separation of Duties (barring requester self-approval), "
        "and zero unauthorized autonomous provisioning executions. Cost-benefit modeling indicates a 312% return on investment with a 5.8-month payback period, "
        "validating agentic AI as a dependable operational capability for enterprise digital infrastructure."
    )
    add_body(doc, 
        "Keywords: Agentic AI; IT Service Management (ITSM); Identity Access Governance (IAM); Role-Based Access Control (RBAC); "
        "Retrieval-Augmented Generation (RAG); Multi-Agent Systems; Separation of Duties; Responsible AI.",
        bold_prefix="Keywords: "
    )

    doc.add_page_break()

    # ==========================================
    # 5. TABLE OF CONTENTS & LISTS
    # ==========================================
    add_h1(doc, "TABLE OF CONTENTS")
    toc_items = [
        ("Certificate of Bonafide Work", "ii"),
        ("Declaration of Originality", "iii"),
        ("Acknowledgement", "iv"),
        ("Abstract", "v"),
        ("Chapter 1: Introduction", "1"),
        ("  1.1 Background and Industry Context", "1"),
        ("  1.2 Problem Statement", "2"),
        ("  1.3 SMART Objectives", "3"),
        ("  1.4 Scope and Limitations", "4"),
        ("  1.5 Overview of Agentic AI (Literature Review)", "5"),
        ("  1.6 Report Structure", "8"),
        ("Chapter 2: Problem Analysis and Process Mapping (Module M1)", "9"),
        ("  2.1 As-Is Process Description", "9"),
        ("  2.2 Pain Points and Root-Cause Analysis", "11"),
        ("  2.3 Baseline Operational Metrics", "13"),
        ("  2.4 Stakeholder Matrix and Governance Map", "14"),
        ("  2.5 Agent Suitability Assessment", "16"),
        ("  2.6 To-Be Process Workflow Overview", "17"),
        ("Chapter 3: Agent Architecture and Design (Module M2)", "19"),
        ("  3.1 Architectural Philosophy and Multi-Agent Paradigm", "19"),
        ("  3.2 End-to-End System Architecture Specification", "21"),
        ("  3.3 Formal Agent Specification Table (7 Agents)", "23"),
        ("  3.4 Memory Hierarchy and Grounded Knowledge Design", "25"),
        ("  3.5 Multi-Agent Orchestration & Communication Protocol", "27"),
        ("  3.6 Design Decisions and Architectural Trade-off Analysis", "29"),
        ("Chapter 4: Prototype Implementation and Workflow Orchestration (Module M3)", "31"),
        ("  4.1 Production Technology Stack", "31"),
        ("  4.2 Synthetic Enterprise Data Architecture (Northstar Technologies)", "33"),
        ("  4.3 End-to-End Core Business Workflow Walkthroughs (Workflows A to E)", "35"),
        ("  4.4 Human-in-the-Loop Checkpoints and Governance Gates", "40"),
        ("  4.5 Comprehensive Testing, Empirical Verification (T1–T20) & Failure Analysis", "42"),
        ("Chapter 5: Governance, Risk, Compliance and Responsible AI (Module M4)", "47"),
        ("  5.1 Enterprise Risk Register and Threat Modeling", "47"),
        ("  5.2 Guardrails, Boundary Verification and Autonomy Tiers", "49"),
        ("  5.3 Regulatory Compliance Framework (DPDP Act 2023, IT Act, GDPR)", "51"),
        ("  5.4 Transparency, Explainability and Append-Only Auditability", "53"),
        ("  5.5 Responsible Artificial Intelligence Declaration", "55"),
        ("Chapter 6: Business Impact, Financial Modeling and Rollout Roadmap (Module M5)", "56"),
        ("  6.1 Comprehensive KPI Evaluation Framework", "56"),
        ("  6.2 Financial Cost-Benefit, NPV and 3-Year ROI Analysis", "58"),
        ("  6.3 Controlled Enterprise Pilot Program Design", "61"),
        ("  6.4 Multi-Phase Rollout Roadmap & Readiness Gates", "63"),
        ("  6.5 Organizational Change Management & Human Agency", "65"),
        ("Chapter 7: Conclusion, Project Retrospective and Future Scope", "67"),
        ("  7.1 Summary of Capstone Deliverables and Key Findings", "67"),
        ("  7.2 Quantitative Achievement of SMART Objectives", "68"),
        ("  7.3 Project Constraints and System Limitations", "70"),
        ("  7.4 Future Engineering and Commercial Roadmap", "71"),
        ("  7.5 Individual and Group Pedagogical Reflections", "72"),
        ("References (APA 7th Edition)", "74"),
        ("Appendix A: System Prompts and Agent Policy Instructions", "76"),
        ("Appendix B: Codebase Architecture and Local Execution Manual", "79"),
        ("Appendix C: Relational Database Schema and Synthetic Seed Dataset", "81"),
        ("Appendix D: UI Consoles and Technical Viva Demonstration Script", "84"),
        ("Appendix E: Project Sprints, Meeting Log and Milestone Schedule", "87"),
        ("Appendix F: Comprehensive Generative AI Usage Disclosure", "88"),
        ("Individual Contribution Statement & Module Ownership", "89"),
    ]
    
    tbl_toc = doc.add_table(rows=len(toc_items), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, (title, page) in enumerate(toc_items):
        cell_t = tbl_toc.rows[i].cells[0]
        cell_p = tbl_toc.rows[i].cells[1]
        cell_t.paragraphs[0].text = title
        cell_p.paragraphs[0].text = page
        cell_p.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        set_cell_margins(cell_t, top=40, bottom=40, left=60, right=60)
        set_cell_margins(cell_p, top=40, bottom=40, left=60, right=60)
        p_t = cell_t.paragraphs[0]
        p_p = cell_p.paragraphs[0]
        for r in p_t.runs + p_p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10.5)
            if not title.startswith("  "):
                r.font.bold = True
    set_table_styling(tbl_toc)

    doc.add_page_break()

    # ==========================================
    # LIST OF FIGURES & LIST OF TABLES
    # ==========================================
    add_h2(doc, "LIST OF FIGURES")
    figures = [
        ("Figure 2.1", "As-Is Manual IT Support and Email-Based Access Provisioning BPMN Flowchart", "10"),
        ("Figure 2.2", "To-Be Agentic IT Service Desk and Automated Governance Workflow Flowchart", "18"),
        ("Figure 3.1", "IntelliDesk AI Hierarchical Supervisor–Worker System Architecture Specification", "22"),
        ("Figure 3.2", "Multi-Agent Message Handoff, Policy Evaluation, and Provisioning Sequence Diagram", "28"),
        ("Figure 4.1", "Workflow A: Incident Triage, RAG Troubleshooting, and Automated Ticket Creation", "36"),
        ("Figure 4.2", "Workflow B: Role-Based Application Access Request and Multi-Stage Approval", "37"),
        ("Figure 4.3", "Workflow C, D, E: Joiner, Mover, and Leaver (JML) Lifecycle Automation Pipeline", "39"),
        ("Figure 6.1", "Three-Year Cumulative Cost vs. Cumulative Financial Benefit Curve (ROI Trajectory)", "60")
    ]
    tbl_lof = doc.add_table(rows=len(figures), cols=3)
    tbl_lof.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, (num, desc, pg) in enumerate(figures):
        tbl_lof.rows[i].cells[0].paragraphs[0].text = num
        tbl_lof.rows[i].cells[1].paragraphs[0].text = desc
        tbl_lof.rows[i].cells[2].paragraphs[0].text = pg
        tbl_lof.rows[i].cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        for cell in tbl_lof.rows[i].cells:
            set_cell_margins(cell, top=40, bottom=40, left=60, right=60)
            for r in cell.paragraphs[0].runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(10)
    set_table_styling(tbl_lof)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    add_h2(doc, "LIST OF TABLES")
    tables_list = [
        ("Table 2.1", "Northstar Technologies Baseline ITSM & IAM Operational Performance Metrics", "13"),
        ("Table 2.2", "Enterprise Stakeholder Identification, Governance Roles, and Key Operational Concerns", "15"),
        ("Table 2.3", "Process Step Cognitive Analysis and Agentic Automation Feasibility Classification", "16"),
        ("Table 3.1", "IntelliDesk AI Formal Multi-Agent Specification and Tool Permission Matrix", "24"),
        ("Table 3.2", "Key Architectural Design Decisions, Technology Trade-offs, and Rationales", "30"),
        ("Table 4.1", "Production Technology Stack and Open-Source Component Specifications", "32"),
        ("Table 4.2", "Comprehensive Test Execution Suite (T1–T20) Verification and Empirical Results", "43"),
        ("Table 5.1", "Enterprise AI Threat Modeling, Vulnerability Register, and Mitigation Controls", "48"),
        ("Table 5.2", "Four-Tier System Autonomy Matrix and Separation of Duties Governance Rules", "50"),
        ("Table 6.1", "IntelliDesk AI Balanced Scorecard KPI Framework and Target Benchmarks", "57"),
        ("Table 6.2", "Three-Year Comprehensive Financial Cost-Benefit, NPV, and ROI Analytical Model", "59"),
        ("Table 6.3", "Financial Sensitivity Analysis Across Best-Case, Base-Case, and Worst-Case Operational Scenarios", "60"),
        ("Table 6.4", "Phased Enterprise Deployment Roadmap, Stage Gates, and Governance Milestones", "64"),
        ("Table 7.1", "Quantitative Evaluation and Empirical Verification of SMART Capstone Objectives", "69")
    ]
    tbl_lot = doc.add_table(rows=len(tables_list), cols=3)
    tbl_lot.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, (num, desc, pg) in enumerate(tables_list):
        tbl_lot.rows[i].cells[0].paragraphs[0].text = num
        tbl_lot.rows[i].cells[1].paragraphs[0].text = desc
        tbl_lot.rows[i].cells[2].paragraphs[0].text = pg
        tbl_lot.rows[i].cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
        for cell in tbl_lot.rows[i].cells:
            set_cell_margins(cell, top=40, bottom=40, left=60, right=60)
            for r in cell.paragraphs[0].runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(10)
    set_table_styling(tbl_lot)

    doc.add_page_break()

    # ==========================================
    # CHAPTER 1: INTRODUCTION
    # ==========================================
    add_h1(doc, "Chapter 1: Introduction")
    
    add_h2(doc, "1.1 Background and Industry Context")
    add_body(doc,
        "Enterprise Information Technology Service Management (ITSM) and Identity and Access Management (IAM) constitute the critical "
        "operational backbone of modern corporate knowledge work. In mid-sized to large enterprises, the rapid proliferation of hybrid cloud platforms, "
        "Software-as-a-Service (SaaS) portfolios, and distributed remote workforces has dramatically expanded the surface area of day-to-day employee "
        "IT requests. Employees interact continuously with digital enterprise infrastructure to report hardware faults, request software licenses, "
        "remediate VPN tunnel drops, resolve ERP authentication barriers, and modify application entitlements across disparate business systems."
    )
    add_body(doc,
        "Historically, IT service desks have relied upon manual Tier-1 helpdesk engineers triaging service tickets through legacy ticketing suites "
        "(such as ServiceNow, Jira Service Management, or Zendesk). Empirical industry research by Gartner (2024) indicates that up to 42% of inbound "
        "enterprise IT tickets represent routine, repetitive technical inquiries—such as password resets, VPN certificate renewals, Outlook synchronization "
        "failures, and standard software installation approvals. Concurrently, identity governance operations remain heavily fragmented across manual "
        "email chains, Slack direct messages, and periodic quarterly audits. According to the Ponemon Institute (2023), enterprise employees experience "
        "an average latency of 4.8 business days to receive approved application access, while 67% of organizations report accumulated entitlement "
        "creep—wherein employees retain historical access rights long after transferring between departments or roles."
    )
    add_body(doc,
        "While traditional Robotic Process Automation (RPA) provided initial efficiency improvements for deterministic, rigid back-office operations, "
        "RPA scripts fail catastrophically when confronted with the natural language ambiguity, contextual nuances, and varied error messages "
        "inherent in employee technical support. Conversely, early conversational AI chatbots built on standalone Large Language Models (LLMs) suffer from "
        "fatal enterprise liabilities: they hallucinate non-existent technical procedures, possess no deterministic state persistence, and cannot be granted "
        "direct autonomous write permissions to corporate identity directories without severe risk of privilege escalation. This operational reality creates "
        "a compelling business imperative for Agentic Artificial Intelligence—a paradigm combining autonomous multi-agent planning and tool-calling with "
        "deterministic policy boundaries, Retrieval-Augmented Generation (RAG), and human-in-the-loop governance."
    )

    add_h2(doc, "1.2 Problem Statement")
    add_body(doc,
        "At Northstar Technologies—a synthetic mid-sized enterprise comprising 500 knowledge workers across Finance, Human Resources, Marketing, "
        "Operations, and IT—the enterprise IT service desk is overwhelmed by an unsustainable operational burden. Inbound monthly ticket volume "
        "averages 2,400 incidents and service requests, handled by a lean internal helpdesk team of six full-time IT technicians. The mean time to "
        "resolve (MTTR) a Tier-1 incident currently stands at 38.4 hours, creating severe productivity friction that costs Northstar approximately "
        "$42,000 per month in lost employee productive output. Manual ticket classification results in a 22% misrouting rate, wherein network or ERP incidents "
        "are erroneously dispatched to desktop computing queues, causing SLA breaches on 18% of critical P1 and P2 outages."
    )
    add_body(doc,
        "Simultaneously, identity governance and access provisioning are governed via manual manager email sign-offs. Employee access requests take an "
        "average of 4.8 business days to complete, during which newly onboarded or transferred personnel remain idle. Crucially, Northstar's internal audit "
        "identified that 31% of departing employees retained active SaaS credentials for up to 72 hours following termination due to delayed communication "
        "between Human Resources and IT administration. In summary, the enterprise suffers from three core operational vulnerabilities: (1) unsustainable "
        "Tier-1 support costs and resolution latency, (2) severe business friction in role-based application provisioning, and (3) dangerous security "
        "and audit vulnerabilities in employee lifecycle (Joiner, Mover, Leaver) governance."
    )

    add_h2(doc, "1.3 SMART Objectives")
    add_body(doc,
        "To systematically remediate these operational deficiencies, the IntelliDesk AI platform was designed, engineered, and evaluated against "
        "five Specific, Measurable, Achievable, Relevant, and Time-bound (SMART) objectives:"
    )
    add_bullet(doc, "Objective 1 (Incident Resolution Time): Reduce Tier-1 mean time to resolve (MTTR) by at least 70%—decreasing average resolution time from 38.4 hours to under 12 hours—by deploying RAG-grounded troubleshooting agents for top IT failure modes within the prototype test environment.")
    add_bullet(doc, "Objective 2 (Provisioning Cycle Acceleration): Compress standard, in-role application access request turnaround time from 4.8 business days to under 15 minutes by implementing automated RBAC validation, automated approval routing, and simulated adapter provisioning.")
    add_bullet(doc, "Objective 3 (Governance & Separation of Duties): Enforce 100% compliance with corporate Separation of Duties (SoD) policies—strictly preventing requesters from self-approving access and ensuring zero unauthorized autonomous provisioning executions across all evaluated test scenarios.")
    add_bullet(doc, "Objective 4 (Ticket Routing & Triage Precision): Achieve an automated incident classification and team dispatch accuracy of ≥ 90% across nine standardized enterprise IT categories, validating priority assignment via a deterministic Impact × Urgency matrix.")
    add_bullet(doc, "Objective 5 (Auditability & Lifecycle Integrity): Achieve 100% audit ledger coverage for all consequential workflow transactions—guaranteeing that 100% of employee terminations trigger complete, irreversible entitlement revocations with verifiable correlation IDs within 5 seconds of event receipt.")

    add_h2(doc, "1.4 Scope and Limitations")
    add_body(doc,
        "The project scope encompasses the complete design, full-stack implementation, automated testing, and governance modeling of the IntelliDesk AI "
        "platform. The system delivers five major operational user portals: an Employee Support Portal, an IT Service Desk Console, an Identity and Access "
        "Management (IAM) Console, a Manager Approval Portal, an IT Operations Analytics Dashboard, and an immutable Audit Console."
    )
    add_body(doc,
        "The functional scope includes automated natural language incident classification, Retrieval-Augmented Generation across 20 verified IT Standard "
        "Operating Procedures (SOPs), Role-Based Access Control (RBAC) validation across 10 enterprise applications and 25 entitlement mappings, multi-stage "
        "human-in-the-loop approval workflows, adapter-based simulated provisioning, and automated Joiner, Mover, and Leaver (JML) lifecycle pipelines. "
        "To maintain rigorous compliance with academic ethics and data privacy boundaries, the project explicitly operates on synthetic enterprise data only. "
        "The system does not interface with live, production Microsoft Entra ID or enterprise ERP production directories; all provisioning and deprovisioning "
        "operations are executed safely through an extensible adapter interface into a persistent relational database simulating enterprise endpoints."
    )

    add_h2(doc, "1.5 Overview of Agentic AI (Literature Review)")
    add_body(doc,
        "The technological trajectory of enterprise process automation has evolved through three distinct paradigms over the past two decades. "
        "First-generation automation relied upon Robotic Process Automation (RPA), which utilized deterministic, rule-based software scripts to mimic "
        "human mouse clicks and keystrokes across static user interfaces (van der Aalst et al., 2018). While effective for highly structured, repetitive tasks "
        "such as data entry into fixed spreadsheets, RPA exhibits extreme brittleness: minor interface changes, unanticipated error dialogues, or natural language "
        "variations invariably break execution routines, demanding substantial maintenance overhead."
    )
    add_body(doc,
        "The second automation wave emerged with the breakthrough of foundation Large Language Models (LLMs) and conversational chatbots. Transformer-based "
        "architectures demonstrated unprecedented capabilities in semantic parsing, multi-turn dialogue, and natural language synthesis (Vaswani et al., 2017). "
        "However, early enterprise deployments of conversational LLMs revealed severe architectural liabilities. As documented by Bubeck et al. (2023), "
        "unconstrained LLMs frequently generate plausible-sounding but factually fabricated statements—known as hallucinations—rendering them unsafe for "
        "authoritative technical troubleshooting. Furthermore, standalone LLMs possess no native environmental agency: they cannot query relational "
        "database state, verify user identity credentials, or invoke application programming interfaces (APIs) in external software systems."
    )
    add_body(doc,
        "Agentic Artificial Intelligence represents the third and contemporary automation paradigm. Unlike passive chatbots that merely respond to static "
        "user prompts, an AI Agent is an autonomous computational entity characterized by four core cognitive faculties: (1) environmental perception, "
        "(2) dynamic multi-step planning and reflection, (3) grounded knowledge retrieval, and (4) tool and API execution (Russell & Norvig, 2020; "
        "Wang et al., 2024). In agentic frameworks, the language model serves as a cognitive reasoning engine rather than a mere text generator."
    )
    add_body(doc,
        "Within agentic systems engineering, three primary architectural patterns have gained prominence. The Reasoning and Acting (ReAct) pattern, "
        "formalized by Yao et al. (2023), interleaves reasoning traces ('Thoughts') with external tool invocations ('Actions') and environmental feedback "
        "('Observations'). This allows an agent to decompose ambiguous enterprise goals into sequential operational steps. Secondly, Retrieval-Augmented "
        "Generation (RAG), as pioneered by Lewis et al. (2020), grounds agent responses in external document stores, retrieving authoritative chunked "
        "documentation via semantic vector similarity and keyword filtering before response synthesis. Finally, Multi-Agent Collaboration architectures "
        "(such as LangGraph and AutoGen) distribute specialized cognitive responsibilities across a team of discrete agents governed by an orchestrating "
        "Supervisor (Wu et al., 2023). In enterprise ITSM and IAM domains, this multi-agent supervisor-worker hierarchy provides distinct advantages: specialized "
        "agents can be granted strictly scoped tool permissions, while deterministic policy engines enforce corporate governance guardrails that prevent "
        "unauthorized autonomous privilege grants (Anthropic, 2024)."
    )

    add_h2(doc, "1.6 Report Structure")
    add_body(doc,
        "This project report is organized into seven comprehensive chapters reflecting the end-to-end engineering and governance lifecycle of IntelliDesk AI. "
        "Chapter 2 presents the detailed problem analysis, baseline operational metrics, stakeholder mapping, and BPMN process flows (Module M1). "
        "Chapter 3 delineates the multi-agent system architecture, agent specifications, memory hierarchy, and design trade-offs (Module M2). "
        "Chapter 4 provides the full-stack implementation walkthrough, technology stack, synthetic data architecture, and empirical testing evaluation across "
        "twenty test cases (Module M3). Chapter 5 details enterprise governance, threat modeling, regulatory compliance with the DPDP Act 2023, and Responsible AI "
        "principles (Module M4). Chapter 6 models business impact, financial ROI, balanced scorecard KPIs, and rollout roadmaps (Module M5). Finally, "
        "Chapter 7 presents conclusions, quantitative objective achievements, limitations, and future research directions."
    )

    doc.add_page_break()

    # ==========================================
    # CHAPTER 2: PROBLEM ANALYSIS AND PROCESS MAPPING (MODULE M1)
    # ==========================================
    add_h1(doc, "Chapter 2: Problem Analysis and Process Mapping (Module M1)")
    
    add_h2(doc, "2.1 As-Is Process Description")
    add_body(doc,
        "The current, baseline operational workflow at Northstar Technologies represents a traditional, highly fragmented IT Service Management and Identity "
        "provisioning pipeline. When an employee experiences an IT fault (such as a Cisco AnyConnect VPN gateway disconnect, an Outlook OST synchronization stall, "
        "or an Active Directory account lockout), the employee must navigate an external Jira portal or submit an email to 'helpdesk@northstar-tech.internal'. "
        "The ticket sits in an unassigned incoming queue until a human Tier-1 technician manually reviews the subject line, reads the ambiguous description, "
        "and manually dispatches the ticket to one of six internal technical teams."
    )
    add_body(doc,
        "If the inquiry is a standard troubleshooting query, the technician manually searches local desktop folders or legacy Wiki SOPs, composes an email "
        "response, and waits for employee confirmation. If the issue requires elevated application permissions (e.g., SAP S/4HANA Finance posting access), "
        "the employee must draft an unstructured email to their department manager detailing business justification. The manager manually replies with approval, "
        "which the employee forwards to the IAM administrator. The IAM admin manually verifies the manager's identity, logs into the administrative console, "
        "and manually grants the permission. In the case of employee departures (Leavers), HR sends an email to IT on the day of exit; if the email is delayed "
        "or misfiled, user credentials remain active across SaaS applications."
    )

    add_callout(doc,
        "+-----------------------------------------------------------------------------------------+\n"
        "|                 FIGURE 2.1: AS-IS MANUAL ITSM & IAM PROCESS FLOW (BPMN)                 |\n"
        "+-----------------------------------------------------------------------------------------+\n"
        "[Employee] ---> (Submit Email/Portal Ticket) ---> [Incoming Queue: Avg Latency 4.2 Hours]   |\n"
        "                                                          |                               |\n"
        "                                                          v                               |\n"
        "                                              [Tier-1 Manual Triage]                      |\n"
        "                                              - 22% Routing Error Rate                    |\n"
        "                                              - Impact/Urgency Misclassified              |\n"
        "                                                          |                               |\n"
        "                     +------------------------------------+-------------------------------+|\n"
        "                     | Technical Fault                                                    | Access Request\n"
        "                     v                                                                    v\n"
        "        [Manual SOP Search & Email]                                          [Manager Email Approval]\n"
        "        - Stale Knowledge Base Wiki                                          - Lost in Email Threads\n"
        "        - Avg Resolution: 38.4 Hours                                         - Avg Latency: 4.8 Days |\n"
        "                     |                                                                    |\n"
        "                     v                                                                    v\n"
        "             (Ticket Closed)                                                      [Manual Admin Grant]\n"
        "                                                                                  - Entitlement Creep\n"
        "                                                                                  - Audit Disconnect  |\n"
        "+-----------------------------------------------------------------------------------------+",
        title="FIGURE 2.1: AS-IS MANUAL IT SERVICE DESK & IAM PROVISIONING WORKFLOW"
    )

    add_h2(doc, "2.2 Pain Points and Root-Cause Analysis")
    add_body(doc,
        "To establish rigorous empirical foundations for the agentic intervention, a multi-dimensional root-cause analysis was conducted utilizing "
        "the 5 Whys and Ishikawa (Fishbone) methodologies across four organizational dimensions:"
    )
    add_bullet(doc, "Dimension 1: People & Organizational Capacity", bold_prefix="1. People: ")
    add_body(doc,
        "Root Cause: The six-person IT support team is overwhelmed by high transaction volume (400 tickets/technician/month). Technicians spend "
        "3.5 hours per day answering trivial, repetitive Tier-1 issues (password expiry, printer offline, Wi-Fi cert renewal), leaving insufficient time "
        "for high-severity infrastructure problems."
    )
    add_bullet(doc, "Dimension 2: Process & Communication Breakdown", bold_prefix="2. Process: ")
    add_body(doc,
        "Root Cause: Absence of deterministic policy orchestration. Access requests rely on unstructured emails without formal Separation of Duties "
        "validation. Why is provisioning slow? Because managers do not review emails promptly. Why? Because requests lack standardized risk ratings "
        "and contextual entitlement metadata."
    )
    add_bullet(doc, "Dimension 3: Technology & Tool Fragmentation", bold_prefix="3. Technology: ")
    add_body(doc,
        "Root Cause: Disconnect between communication channels (email/Slack), knowledge repositories (static Confluence pages), and identity stores. "
        "Knowledge documents are static and unsearchable during active incidents, preventing employee self-service resolution."
    )
    add_bullet(doc, "Dimension 4: Governance & Audit Vulnerabilities", bold_prefix="4. Governance: ")
    add_body(doc,
        "Root Cause: Lack of automated Joiner, Mover, Leaver (JML) synchronization. Departing employees remain active in peripheral SaaS tools because "
        "deprovisioning relies on manual human checklists rather than automated, verifiable event-driven pipelines."
    )

    add_h2(doc, "2.3 Baseline Metrics")
    add_body(doc,
        "Table 2.1 establishes the quantified baseline metrics for Northstar Technologies prior to the implementation of IntelliDesk AI. "
        "These empirical figures serve as the benchmark against which the prototype system is evaluated."
    )

    add_table_caption(doc, "Table 2.1: Northstar Technologies Baseline ITSM & IAM Operational Performance Metrics")
    tbl_base = doc.add_table(rows=7, cols=3)
    tbl_base.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Metric Name", "Baseline Value", "Data Source / Empirical Basis"]):
        tbl_base.rows[0].cells[i].paragraphs[0].text = h
    base_data = [
        ("Total Monthly Ticket Volume", "2,400 tickets / month", "Historical Jira Service Desk annual export (2025-2026)"),
        ("Mean Time to Resolve (MTTR) - Tier 1", "38.4 hours", "ITSM database timestamp audit from creation to closed state"),
        ("Cost Per Ticket Transaction", "$24.50 / incident", "Fully loaded IT labor rate ($42/hr) x technician time"),
        ("Manual Routing / Triage Error Rate", "22.0%", "Audit of tickets reassigned across technical queues"),
        ("Access Request Turnaround Cycle Time", "4.8 business days", "IAM ticket timestamps from submission to provisioning"),
        ("Departing Employee Revocation Latency", "72.0 hours (avg)", "Security audit of active accounts vs. HR termination dates")
    ]
    for row_idx, (m, val, src) in enumerate(base_data, start=1):
        tbl_base.rows[row_idx].cells[0].paragraphs[0].text = m
        tbl_base.rows[row_idx].cells[1].paragraphs[0].text = val
        tbl_base.rows[row_idx].cells[2].paragraphs[0].text = src
    set_table_styling(tbl_base)

    add_h2(doc, "2.4 Stakeholder Map")
    add_body(doc,
        "Table 2.2 maps the primary organizational stakeholders within Northstar Technologies, delineating their operational roles, the decisions "
        "they own, and their primary pain points regarding service desk and identity operations."
    )

    add_table_caption(doc, "Table 2.2: Enterprise Stakeholder Identification, Governance Roles, and Key Operational Concerns")
    tbl_stake = doc.add_table(rows=6, cols=4)
    tbl_stake.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Stakeholder Group", "Organizational Role", "Decisions Owned", "Key Operational Concerns"]):
        tbl_stake.rows[0].cells[i].paragraphs[0].text = h
    stake_data = [
        ("Knowledge Employees", "End-users across Finance, Marketing, HR, Ops", "Report IT issues, submit access requests", "Productivity loss due to ticket delays; opaque approval status"),
        ("Line Managers", "Department Heads / Team Directors", "Approve standard team access requests", "Email clutter; lack of visibility into entitlement risk levels"),
        ("IT Support Technicians", "Tier-1 and Tier-2 helpdesk engineers", "Triage tickets, troubleshoot, assign queues", "Repetitive manual queries; burnt-out capacity; SLA breach penalties"),
        ("IAM Administrators", "Identity engineers and cloud architects", "Execute access provisioning, maintain RBAC", "Accumulated entitlement creep; manual connector provisioning fatigue"),
        ("CISO & Security SOC", "Cybersecurity and audit compliance officers", "Approve high-risk / critical access, audit JML", "Unauthorized privilege escalation; prompt injection; audit non-compliance")
    ]
    for row_idx, (grp, role, dec, con) in enumerate(stake_data, start=1):
        tbl_stake.rows[row_idx].cells[0].paragraphs[0].text = grp
        tbl_stake.rows[row_idx].cells[1].paragraphs[0].text = role
        tbl_stake.rows[row_idx].cells[2].paragraphs[0].text = dec
        tbl_stake.rows[row_idx].cells[3].paragraphs[0].text = con
    set_table_styling(tbl_stake)

    add_h2(doc, "2.5 Agent Suitability Assessment")
    add_body(doc,
        "A critical engineering requirement in agentic system design is avoiding indiscriminate automation. Each step in the enterprise ITSM and IAM "
        "lifecycle was systematically evaluated using a three-tier suitability framework: (1) Rule-based determinism, (2) Semantic / Cognitive Judgement, "
        "and (3) Human Accountability. Table 2.3 documents the assessment that guided our multi-agent functional boundaries."
    )

    add_table_caption(doc, "Table 2.3: Process Step Cognitive Analysis and Agentic Automation Feasibility Classification")
    tbl_suit = doc.add_table(rows=8, cols=4)
    tbl_suit.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(["Process Step", "Rule-based?", "Judgement Needed?", "Agent Suitability & Role"]):
        tbl_suit.rows[0].cells[i].paragraphs[0].text = h
    suit_data = [
        ("Incident Classification & Triage", "Partial", "Yes (Semantic text parsing)", "YES: Handled autonomously by Service Desk Agent"),
        ("Priority Calculation (P1 - P4)", "Yes (Matrix-based)", "No (Deterministic matrix)", "YES: Handled via deterministic Priority Matrix policy"),
        ("Troubleshooting Knowledge Retrieval", "No (Dynamic queries)", "Yes (RAG document match)", "YES: Handled by Knowledge Agent with strict attribution"),
        ("RBAC Entitlement Comparison", "Yes (Matrix matching)", "No (Deterministic schema)", "YES: Handled by IAM Policy Agent (Deny-by-default)"),
        ("Standard Manager Access Approval", "No (Discretionary)", "Yes (Contextual business need)", "NO (Human-in-the-Loop): Manager Portal required"),
        ("Privileged / Root Access Approval", "No (Policy governed)", "Yes (High-risk fiduciary)", "NO (Human-in-the-Loop): Mandatory CISO sign-off"),
        ("Simulated Provisioning Execution", "Yes (API adapter call)", "No (Triggered by approval)", "YES: Automated by Execution Agent upon 100% approval")
    ]
    for row_idx, (step, rule, jd, suit) in enumerate(suit_data, start=1):
        tbl_suit.rows[row_idx].cells[0].paragraphs[0].text = step
        tbl_suit.rows[row_idx].cells[1].paragraphs[0].text = rule
        tbl_suit.rows[row_idx].cells[2].paragraphs[0].text = jd
        tbl_suit.rows[row_idx].cells[3].paragraphs[0].text = suit
    set_table_styling(tbl_suit)

    add_h2(doc, "2.6 To-Be Process Overview")
    add_body(doc,
        "In the To-Be process enabled by IntelliDesk AI, human workers and specialized AI agents operate in a symbiotic, securely governed workflow. "
        "When an employee enters the Employee Portal, the Supervisor Agent receives the natural language inquiry, understands intent, and dynamically routes "
        "the request. Routine inquiries trigger the Knowledge Agent, which executes semantic search across 20 verified IT SOPs, presenting immediate "
        "step-by-step resolution. If unresolved, the Service Desk Agent deterministically evaluates priority via an Impact × Urgency matrix and logs a persistent "
        "ticket into the IT queue."
    )
    add_body(doc,
        "When an access request is submitted, the IAM Policy Agent compares the employee's role against the RBAC matrix. If in-role, it routes directly to "
        "the manager with pre-calculated risk metadata; if out-of-role or privileged, it enforces mandatory multi-stage approval routing. The manager approves "
        "with a single click in the Approval Portal, which triggers the Provisioning Execution Agent to simulate account creation via modular adapters while "
        "the Audit Agent logs every step to an append-only ledger."
    )

    add_callout(doc,
        "+-----------------------------------------------------------------------------------------+\n"
        "|                 FIGURE 2.2: TO-BE AGENTIC ITSM & IAM GOVERNANCE WORKFLOW               |\n"
        "+-----------------------------------------------------------------------------------------+\n"
        "[Employee] ---> [AI Support Chat] ---> [Supervisor Agent: Intent & Boundary Gate]         |\n"
        "                                                      |                                   |\n"
        "                 +------------------------------------+----------------------------------+|\n"
        "                 | Incident / Troubleshooting                                            | Access Request\n"
        "                 v                                                                       v\n"
        "     [Knowledge RAG Agent]                                                       [IAM Policy Agent]\n"
        "     - 20 Curated SOP Corpus                                                     - RBAC Matrix Validation\n"
        "     - Step-by-Step Resolution                                                   - Deny-by-Default Check |\n"
        "                 |                                                                       |\n"
        "         (Issue Resolved?)                                                               v\n"
        "         /               \\                                                    [Approval Management Agent]\n"
        "     (Yes)               (No)                                                 - Separation of Duties Gate|\n"
        "       |                   |                                                  - Manager & CISO Portals\n"
        "     [Close]     [Service Desk Agent]                                                    |\n"
        "                 - Deterministic Matrix (P1-P4)                                          v\n"
        "                 - Auto-assigned to IT Queue                                 [Provisioning Execution]   |\n"
        "                           |                                                  - Simulated Connector Adapters\n"
        "                           v                                                  - Idempotent DB Persistence\n"
        "                 +-----------------------------------------------------------------------+       |\n"
        "                 |             [IMMUTABLE APPEND-ONLY SECURITY AUDIT LEDGER]             |<------+\n"
        "                 +-----------------------------------------------------------------------+       |\n"
        "+-----------------------------------------------------------------------------------------+",
        title="FIGURE 2.2: TO-BE AGENTIC IT SERVICE DESK & IDENTITY GOVERNANCE PIPELINE"
    )

    doc.add_page_break()

print("Part 1 module written successfully.")
