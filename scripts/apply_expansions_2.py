import sys

path = '/Users/satyasmac/AntiGravity/intellidesk-ai/scripts/condense_report_40pages.py'
with open(path, 'r') as f:
    text = f.read()

# 1. Expand Chapter 2 with Stakeholder Governance Dynamics
ch2_addition2 = '''
    add_h3(doc, "2.4.1 Stakeholder Governance Dynamics and Friction Points")
    add_body(doc,
        "A critical organizational dimension revealed during baseline discovery was the conflicting incentives and operational friction between "
        "stakeholder groups at Northstar Technologies. End-user employees prioritize speed of access and minimal administrative friction, often "
        "resorting to 'shadow IT' or sharing credentials when official ticketing channels prove slow. Conversely, SecOps and IAM administrators "
        "are held accountable for strict regulatory compliance, audit defensibility, and zero-trust perimeter defense, causing them to institute "
        "deliberate approval hurdles that frustrate line-of-business managers."
    )
    add_body(doc,
        "Tier-1 service desk engineers are trapped in the middle of this structural tension: they face aggressive SLA quotas for ticket close times, "
        "yet lack the authority or automated tools to grant entitlements or resolve complex network issues directly. By introducing IntelliDesk AI, "
        "the operational dynamic shifts fundamentally: routine transactional tasks are absorbed by the autonomous agentic layer, standard requests "
        "are accelerated through automated in-role verification, and sensitive requests are automatically elevated with full audit context, aligning "
        "incentives across all three stakeholder groups."
    )
'''
text = text.replace('    add_h2(doc, "2.5 Cognitive Analysis of Steps and Agent Automation Feasibility")', ch2_addition2 + '\n    add_h2(doc, "2.5 Cognitive Analysis of Steps and Agent Automation Feasibility")')

# 2. Expand Chapter 6 with Change Management Details
ch6_addition2 = '''
    add_h3(doc, "6.5.1 Departmental Training Curriculum and AI Champion Enablement")
    add_body(doc,
        "To ensure sustainable workforce adoption across all business units, Northstar Technologies structured a comprehensive, 4-week "
        "enablement curriculum. Week 1 introduces enterprise-wide awareness sessions demonstrating the Employee Portal and natural language support chat. "
        "Week 2 conducts hands-on interactive workshops for department managers, focusing on the Manager Approval Portal, reviewing in-role indicators, "
        "and navigating separation-of-duties alerts. Week 3 establishes an 'AI Champion Network'—designating two power users per department trained to "
        "troubleshoot peer queries and gather continuous qualitative feedback."
    )
    add_body(doc,
        "Week 4 transitions into operational steady-state with weekly feedback reviews between IT leadership and departmental representatives. "
        "Continuous telemetry monitoring identifies emergent query patterns, highlighting SOP documents requiring updates and ensuring that agent "
        "confidence thresholds remain optimized. By combining technical excellence with proactive human-centered change management, the organization "
        "mitigates workforce anxiety and achieves rapid, enthusiastic adoption."
    )
'''
text = text.replace('    doc.add_page_break()\n\n# ==========================================\n# CHAPTER 7: CONCLUSION & FUTURE SCOPE', ch6_addition2 + '\n    doc.add_page_break()\n\n# ==========================================\n# CHAPTER 7: CONCLUSION & FUTURE SCOPE')

with open(path, 'w') as f:
    f.write(text)

print("Applied Chapter 2 and Chapter 6 expansions.")

