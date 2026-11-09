import sys

path = '/Users/satyasmac/AntiGravity/intellidesk-ai/scripts/condense_report_40pages.py'
with open(path, 'r') as f:
    text = f.read()

# 1. Expand Chapter 1
ch1_addition = '''
    add_h3(doc, "1.1.1 Historical Evolution of ITSM Frameworks from ITIL v3 to Agentic Operations")
    add_body(doc,
        "The historical progression of IT Service Management (ITSM) has transitioned across three major architectural eras. In the ITIL v3 era (2007–2018), "
        "processes were strictly siloed and human-dependent: incoming tickets were manually logged, classified, and escalated through rigid hierarchical "
        "support tiers (Tier 1 helpdesk, Tier 2 systems administration, Tier 3 engineering). This model introduced severe operational bottlenecks, "
        "as skilled technicians spent substantial portions of their shifts performing repetitive administrative data routing rather than complex systems diagnosis. "
        "The subsequent ITIL v4 framework emphasized value co-creation and automated service streams, yet practical enterprise implementations remained "
        "constrained by brittle keyword-based search tools and static forms."
    )
    add_body(doc,
        "The advent of Agentic Artificial Intelligence establishes a fourth paradigm: Autonomous Cognitive ITSM. Rather than relying on human dispatchers "
        "or brittle scripted decision trees, agentic architectures combine large language models with programmatic policy gates and dynamic tool calling. "
        "This enables autonomous systems to interpret messy, emotional human requests, construct dynamic multi-step resolution plans, inspect relational "
        "databases, and execute remediations with microsecond latency, transforming enterprise service operations from a reactive cost center into an "
        "agile operational driver."
    )
'''
text = text.replace('    add_h2(doc, "1.2 Motivation: From Static Chatbots to Autonomous Agentic AI")', ch1_addition + '\n    add_h2(doc, "1.2 Motivation: From Static Chatbots to Autonomous Agentic AI")')

# 2. Expand Chapter 4
ch4_addition = '''
    add_h3(doc, "4.3.1 LangGraph State Machine Compilation and Resilience Architecture")
    add_body(doc,
        "The orchestration layer is compiled into a cyclic state graph using LangGraph.js. Unlike linear pipeline abstractions, LangGraph represents "
        "agent workflows as nodes connected by conditional edges, where state transitions are governed by deterministic validation gates. "
        "The central `supervisor` node acts as an intelligent router: upon ingesting an employee message, it evaluates input safety, inspects active "
        "context, and delegates execution to the appropriate worker agent node."
    )
    add_body(doc,
        "System resilience is reinforced through automated fallback handlers: if an external model call encounters rate-limiting or latency timeouts, "
        "the graph executes exponential backoff retries before gracefully falling back to deterministic local rule engines. Furthermore, all state "
        "mutations are transactional: if an error occurs during downstream provisioning, the entire operation is rolled back, preventing orphaned "
        "or half-provisioned accounts in enterprise directories."
    )
'''
text = text.replace('    add_h2(doc, "4.4 End-to-End Workflow Execution Walkthroughs")', ch4_addition + '\n    add_h2(doc, "4.4 End-to-End Workflow Execution Walkthroughs")')

# 3. Expand Chapter 7
ch7_addition = '''
    add_h3(doc, "7.1.1 Synthesis of Empirical Findings Across Operational Domains")
    add_body(doc,
        "The empirical findings gathered across the 20 automated test cases and end-to-end prototype simulations demonstrate three fundamental principles: "
        "(1) Cognitive triage coupled with closed-domain RAG achieves near-instantaneous resolution for high-frequency Tier-1 IT issues without risking "
        "hallucinatory drift; (2) Separating probabilistic natural language interpretation from deterministic security policy enforcement is mandatory "
        "for enterprise viability—the LLM should recommend and format actions, but the database policy engine must retain absolute authority over access grants; "
        "and (3) Human-in-the-loop workflows increase organizational trust, satisfy regulatory statutes such as GDPR Article 22, and eliminate unauthorized "
        "privilege escalations in mission-critical environments."
    )
'''
text = text.replace('    add_h2(doc, "7.2 Achievement of Project Objectives")', ch7_addition + '\n    add_h2(doc, "7.2 Achievement of Project Objectives")')

with open(path, 'w') as f:
    f.write(text)

print("Updated Chapter 1, 4, and 7 expansions.")

