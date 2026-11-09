export interface KnowledgeDocument {
  document_id: string;
  title: string;
  category: string;
  content: string;
  source: string;
  version: string;
  status: 'APPROVED' | 'DRAFT' | 'ARCHIVED';
  keywords: string[];
}

export const KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  {
    document_id: "SOP-IT-001",
    title: "SOP 01: VPN Connection Failure and Gateway Re-authentication",
    category: "VPN",
    source: "Northstar IT Network Engineering Handbook v4.2",
    version: "2.1",
    status: "APPROVED",
    keywords: ["vpn", "cisco", "anyconnect", "gateway", "tunnel", "disconnected", "error 412", "remote access"],
    content: `Overview:
This Standard Operating Procedure guides employees and support technicians through diagnosing and resolving Cisco AnyConnect / Secure Client VPN connection failures.

Common Causes:
- Stale authentication tokens or cached local gateway certificates.
- Conflicting local Wi-Fi captive portals.
- Antivirus endpoint firewall blocking port 443 (DTLS/TLS).

Step-by-Step Resolution:
1. Disconnect and Close VPN Client: Right-click Cisco Secure Client in the system tray and select 'Exit'.
2. Flush DNS & Local IP Cache:
   - On Windows: Open Command Prompt as Administrator and execute:
     ipconfig /flushdns
     netsh int ip reset
   - On macOS: Open Terminal and execute:
     sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
3. Clear Cached Certificates: Navigate to %LOCALAPPDATA%\\Cisco\\Cisco Secure Client\\ and delete temporary session cache files.
4. Verify Gateway Hostname: Ensure the gateway URL is set to 'vpn.northstar-tech.internal' and port 443 is reachable.
5. Multi-Factor Re-authentication: Initiate connection and approve the Microsoft Authenticator push notification within 60 seconds.

Escalation:
If the connection still fails with Error 412 or 416, escalate to the Network Support Team with the client DART log bundle.`
  },
  {
    document_id: "SOP-IT-002",
    title: "SOP 02: Outlook Desktop Client Synchronization and Exchange Online",
    category: "Email and Microsoft 365",
    source: "M365 Cloud Productivity SOPs",
    version: "1.8",
    status: "APPROVED",
    keywords: ["outlook", "sync", "exchange", "mailbox", "connecting", "stalled", "ost", "cache"],
    content: `Overview:
Resolution procedure for Microsoft Outlook desktop client stalling at 'Updating Inbox...' or 'Connecting...'.

Diagnostic Steps:
1. Check OWA Connectivity: Access https://outlook.office.com in a web browser. If webmail functions normally, the issue is restricted to the local client cache.
2. Verify Outlook Connection Status: Hold Ctrl while right-clicking the Outlook icon in the taskbar and select 'Connection Status'. Verify that Exchange endpoints show state 'Established'.
3. Repair Local OST File:
   - Close Outlook.
   - Press Win + R, enter '%localappdata%\\Microsoft\\Outlook', and locate the user's primary .ost file.
   - Rename file to '{email}.ost.old'.
   - Restart Outlook; Exchange Online will rebuild the local mailbox cache automatically.
4. Check Add-ins: Launch Outlook in Safe Mode ('outlook.exe /safe'). If sync resumes, disable third-party COM add-ins under File -> Options -> Add-ins.`
  },
  {
    document_id: "SOP-IT-003",
    title: "SOP 03: Outlook Authentication and Modern Auth Token Failure",
    category: "Email and Microsoft 365",
    source: "Identity Governance & Messaging Operations",
    version: "2.0",
    status: "APPROVED",
    keywords: ["outlook", "login", "password loop", "modern auth", "tokens", "credential manager"],
    content: `Overview:
Troubleshooting repeated credential prompts, password loops, and modern authentication failures in Microsoft Outlook.

Resolution Steps:
1. Clear Windows Credential Manager:
   - Open Windows Control Panel -> Credential Manager -> Windows Credentials.
   - Under 'Generic Credentials', locate and remove all entries beginning with 'MicrosoftOffice16_Data', 'MS.Outlook', or 'ADAL'.
2. Clear Azure AD / Entra Broker Cache:
   - Sign out of all Office desktop applications.
   - Navigate to Windows Settings -> Accounts -> Access work or school.
   - Verify connection to Northstar Technologies Entra ID. Click 'Manage' and ensure device compliance status is healthy.
3. Restart Office Authentication Broker:
   - In PowerShell run: Get-AppxPackage Microsoft.AAD.BrokerPlugin | Reset-AppxPackage
4. Relaunch Outlook and enter corporate email to trigger a clean Modern Auth web prompt.`
  },
  {
    document_id: "SOP-IT-004",
    title: "SOP 04: Windows Domain Login Failure and Trust Relationship Errors",
    category: "Password and account support",
    source: "Active Directory & Desktop Architecture",
    version: "1.5",
    status: "APPROVED",
    keywords: ["windows", "login", "trust relationship", "domain controller", "workstation", "kerberos"],
    content: `Overview:
Guidance for error: 'The trust relationship between this workstation and the primary domain failed' or 'No logon servers available'.

Immediate Workarounds:
1. Local Cached Credentials: If off-network, ensure device is connected to a reliable home Wi-Fi before turning on corporate VPN at the Windows login screen (Network Sign-in icon).
2. Domain Time Synchronization:
   - Desynchronization greater than 5 minutes breaks Kerberos ticketing.
   - From recovery console or admin prompt: w32tm /resync /rediscover
3. Rejoining the Domain:
   - Must be performed by an IT Support Administrator.
   - In elevated PowerShell: Test-ComputerSecureChannel -Repair -Credential (Get-Credential)
4. Escalation: If hardware TPM or machine password account is corrupt, re-image or reset computer object in Active Directory Users and Computers.`
  },
  {
    document_id: "SOP-IT-005",
    title: "SOP 05: Self-Service Password Expiry and Reset Protocol",
    category: "Password and account support",
    source: "Northstar Identity Security Standard",
    version: "3.0",
    status: "APPROVED",
    keywords: ["password", "expiry", "reset", "self service", "sspr", "credential"],
    content: `Policy Overview:
Northstar Technologies requires 90-day password rotation for standard accounts. Passwords must be at least 14 characters with uppercase, lowercase, numbers, and symbols.

Self-Service Password Reset (SSPR) Protocol:
1. Navigate to: https://passwordreset.northstar-tech.internal
2. Provide your Northstar corporate email (e.g., alice.chen@northstar-tech.internal).
3. Complete two authentication methods:
   - Microsoft Authenticator push notification approval.
   - SMS or voice code to verified registered corporate mobile.
4. Set new compliant password. Do not reuse any of the last 10 historical passwords.
5. Workstation Lock: Lock your screen (Win + L) and unlock with the new password to update Windows Credential provider.`
  },
  {
    document_id: "SOP-IT-006",
    title: "SOP 06: Active Directory Account Lockout Investigation and Unlock",
    category: "Password and account support",
    source: "Identity Governance & Helpdesk Playbooks",
    version: "2.3",
    status: "APPROVED",
    keywords: ["lockout", "account locked", "bad passwords", "active directory", "unlock"],
    content: `Overview:
Accounts lock out automatically after 5 consecutive incorrect password attempts within a 15-minute window to defend against brute force and credential stuffing.

Troubleshooting Checklist:
1. Identify Caller Identity: Verify employee via employee ID and manager verification question before taking action.
2. Locate Lockout Source:
   - Support Tech opens Active Directory LockoutStatus tool or queries domain controller event 4740.
   - Check common culprit devices: Stored Wi-Fi profiles on mobile phones, old iPad mail sync, or forgotten remote desktop sessions.
3. Unlock Account:
   - IT Administrator uses Identity Console to unlock user account:
     Unlock-ADAccount -Identity $employee_id
4. Disconnect secondary mobile devices until new password has been applied across all endpoints.`
  },
  {
    document_id: "SOP-IT-007",
    title: "SOP 07: Enterprise Wi-Fi (Northstar-Corp-Secure) Connectivity",
    category: "Network",
    source: "Global Network Operations Center",
    version: "2.0",
    status: "APPROVED",
    keywords: ["wifi", "wireless", "802.1x", "certificate", "radius", "roaming", "ssid"],
    content: `Overview:
Instructions for connecting to Northstar-Corp-Secure (802.1X EAP-TLS / PEAP-MSCHAPv2).

Requirements:
- Corporate-managed laptop with enrolled machine certificate issued by Northstar Enterprise Intermediate CA.
- Active Directory user account.

Troubleshooting Steps:
1. Forget Network: Remove 'Northstar-Corp-Secure' from saved Wi-Fi networks and re-scan.
2. Verify Certificate Validity:
   - Open certmgr.msc -> Personal -> Certificates.
   - Confirm 'Northstar Client Auth Certificate' is not expired.
3. Validate 802.1x Settings:
   - EAP method must be 'Microsoft: Protected EAP (PEAP)'.
   - Authentication method: 'Secured password (EAP-MSCHAP v2)'.
4. Guests and Personal Devices: Personal devices are strictly prohibited from Corp Wi-Fi; connect to 'Northstar-Guest' and complete SMS captive portal sponsorship.`
  },
  {
    document_id: "SOP-IT-008",
    title: "SOP 08: Network and Office Printer Troubleshooting",
    category: "Hardware",
    source: "End User Computing Field Support",
    version: "1.4",
    status: "APPROVED",
    keywords: ["printer", "print spooler", "zebra", "xerox", "offline", "jam", "paper"],
    content: `Overview:
Standard diagnostic guide for floor multifunction printers (MFDs) and warehouse thermal printers.

Common Resolutions:
1. Restart Local Print Spooler:
   - Open Command Prompt as Administrator:
     net stop spooler
     del /Q /F /S "%systemroot%\\System32\\Spool\\Printers\\*.*"
     net start spooler
2. Verify Network Status: Check if the printer IP (e.g., 10.45.x.x) responds to ICMP ping.
3. Re-map Corporate Print Queue:
   - Browse to '\\\\printserver.northstar-tech.internal\\'.
   - Double-click the desired floor printer (e.g., 'FL3-Xerox-Color') to reinstall verified signed print drivers.
4. Physical Check: Ensure paper trays are firmly seated and toner cartridges have security chips engaged.`
  },
  {
    document_id: "SOP-IT-009",
    title: "SOP 09: Laptop Startup, BitLocker Recovery, and BSOD Recovery",
    category: "Hardware",
    source: "Desktop Engineering & Endpoint Security",
    version: "2.4",
    status: "APPROVED",
    keywords: ["laptop", "boot", "bitlocker", "recovery key", "blue screen", "bsod", "hardware"],
    content: `Overview:
Procedures for workstations that fail to boot, trigger BitLocker recovery screens, or crash with Stop Code BSODs.

BitLocker Recovery Key Retrieval:
1. User Verification: Identity must be confirmed before releasing 48-digit numeric recovery keys.
2. IT Support / Self-Service Portal:
   - Query Microsoft Entra ID / Intune Device portal using the Recovery Key ID displayed on screen.
   - Enter the 48-digit numerical key on the target workstation.
3. Firmware / TPM Failure: If BitLocker prompts upon every single reboot, boot Windows and run:
   manage-bde -protectors -disable C:
   manage-bde -protectors -enable C:
4. Hardware Diagnostics: On Dell workstations, hold Fn while powering on to run ePSA hardware diagnostics.`
  },
  {
    document_id: "SOP-IT-010",
    title: "SOP 10: Microsoft 365 License and Desktop Apps Provisioning",
    category: "Email and Microsoft 365",
    source: "Cloud Infrastructure & SaaS Operations",
    version: "1.9",
    status: "APPROVED",
    keywords: ["office", "m365", "license", "teams", "word", "excel", "unlicensed product"],
    content: `Overview:
Handling 'Unlicensed Product' errors and enabling Microsoft 365 E5 desktop applications.

Resolution Steps:
1. Check Cloud License Status:
   - Verify user has 'Microsoft 365 E5' SKU assigned in Microsoft Admin Center.
2. Sign-out and Re-activate:
   - Open Word -> File -> Account -> Switch Account -> Sign Out.
   - Close all Office applications.
3. Reset Office Activation State:
   - Run C:\\Program Files\\Microsoft Office\\Office16\\OSPP.VBS /dstatus to check existing product keys.
   - Clear cached identity tokens in %localappdata%\\Microsoft\\OneAuth and %localappdata%\\Microsoft\\IdentityCache.
4. Relaunch Excel or Word, sign in with corporate email, and select 'Allow my organization to manage my device'.`
  },
  {
    document_id: "SOP-IT-011",
    title: "SOP 11: SAP S/4HANA GUI & Fiori Login Authentication Failures",
    category: "ERP and SAP",
    source: "Enterprise ERP Center of Excellence",
    version: "3.1",
    status: "APPROVED",
    keywords: ["sap", "s4hana", "gui", "fiori", "login", "password", "client 100", "sso"],
    content: `Overview:
Troubleshooting SAP GUI 800 and SAP Fiori launchpad login issues for Finance, Supply Chain, and Operations staff.

Diagnostic Procedure:
1. SAP GUI Connection Test:
   - Ensure target server entry is 'PRD - Northstar S/4HANA Production'.
   - System ID: PRD, Instance: 00, Application Server: sap-prd.northstar-tech.internal.
2. Single Sign-On (SNC) Kerberos Failure:
   - If error 'SNC Error: GSS-API(maj): A token was invalid' appears, check Kerberos ticket cache.
   - Run klist in command prompt. If ticket is expired, lock and unlock Windows or re-authenticate to VPN.
3. Password Lockout in Client 100:
   - 3 incorrect SAP passwords lock the user profile in Client 100.
   - Contact SAP Security Admin or use Self-Service SAP Unlock tool.`
  },
  {
    document_id: "SOP-IT-012",
    title: "SOP 12: SAP Authorization Error RFC_NO_AUTHORITY and T-Code Access",
    category: "ERP and SAP",
    source: "Enterprise ERP Security & GRC",
    version: "2.8",
    status: "APPROVED",
    keywords: ["sap", "authorization", "rfc_no_authority", "su53", "tcode", "permissions", "grc"],
    content: `Overview:
When an employee encounters 'You are not authorized to use transaction code XXXX' or 'RFC_NO_AUTHORITY'.

Resolution & Entitlement Verification:
1. Capture Authorization Failure via SU53:
   - Immediately after error, execute transaction '/nSU53'.
   - Save or screenshot the missing Authorization Object, Field name, and Value.
2. Check Role Matrix:
   - Verify if the requested transaction belongs to the employee's approved job role in the Northstar RBAC matrix.
   - Financial Analysts have access to FBL3N, FB03, KS03. They do NOT have access to Period Close (OB52) without Manager approval.
3. Request Entitlement:
   - If valid business need exists, submit an Access Request through IntelliDesk AI IAM Portal referencing the Authorization Object.`
  },
  {
    document_id: "SOP-IT-013",
    title: "SOP 13: Corporate Network Drive Mapping (Z: and S: Drives)",
    category: "Network",
    source: "Storage & File Services Architecture",
    version: "1.7",
    status: "APPROVED",
    keywords: ["network drive", "shared drive", "smb", "nas", "z drive", "s drive", "dfs"],
    content: `Overview:
Resolution for missing or disconnected mapped network shares ('S:\\Shared' and 'Z:\\Home').

Resolution Steps:
1. Verify VPN / Corporate LAN: Network shares are internal only. If remote, connect to Cisco VPN first.
2. Manual Drive Mapping via PowerShell:
   - For Shared Departmental drive:
     net use S: \\\\storage.northstar-tech.internal\\shares /persistent:yes
   - For Personal Home directory:
     net use Z: \\\\storage.northstar-tech.internal\\home\\$username /persistent:yes
3. DFS Namespace Health: If path is unreachable, flush DFS cache with:
   dfsutil /pktflush
   dfsutil /spcflush
4. NTFS Permission Escalation: If user receives 'Access is Denied' (Error 5), submit an IAM access ticket for the specific Active Directory security group.`
  },
  {
    document_id: "SOP-IT-014",
    title: "SOP 14: Microsoft Teams Audio, Video, and Peripheral Diagnostics",
    category: "Hardware",
    source: "Unified Communications Engineering",
    version: "2.2",
    status: "APPROVED",
    keywords: ["teams", "audio", "headset", "microphone", "camera", "video", "echo"],
    content: `Overview:
Resolving microphone echo, mute synchronization issues, and camera dropouts in Microsoft Teams desktop client.

Steps:
1. Teams Peripheral Selection:
   - In Teams, click Settings (...) -> Devices.
   - Select certified Northstar headset (Jabra/Plantronics) under Audio devices rather than 'PC Mic and Speakers'.
2. Disable Windows Audio Enhancements:
   - Open mmsys.cpl -> Recording -> Properties -> Advanced.
   - Uncheck 'Enable audio enhancements'.
3. Test Call Verification:
   - Click 'Make a test call' in Teams Device Settings to verify microphone latency and speaker return.
4. Privacy Permissions: In Windows Settings -> Privacy & Security -> Microphone, verify that 'Let desktop apps access your microphone' is toggled ON.`
  },
  {
    document_id: "SOP-IT-015",
    title: "SOP 15: Corporate Software Installation and Company Portal Deployment",
    category: "Software",
    source: "Client Systems Management",
    version: "2.0",
    status: "APPROVED",
    keywords: ["software", "install", "company portal", "intune", "admin rights", "uac"],
    content: `Policy Notice:
Employees do not possess local administrative privileges on corporate workstations. All software must be installed via the self-service catalog or an approved IAM ticket.

Installation Workflow:
1. Open Company Portal:
   - Search Windows Start menu for 'Company Portal'.
   - Browse the curated catalog (VS Code, Power BI Desktop, Docker Desktop, Adobe Acrobat, Zoom, Postman).
   - Click 'Install' to initiate silent, trusted Intune deployment without requiring administrative credentials.
2. Custom Software Request:
   - If software is not listed in Company Portal, submit a Software Access Request in IntelliDesk AI.
   - Security evaluation and software license verification will be routed automatically.`
  },
  {
    document_id: "SOP-IT-016",
    title: "SOP 16: Browser Troubleshooting (Chrome & Edge Enterprise)",
    category: "Software",
    source: "Client Application Standards",
    version: "1.3",
    status: "APPROVED",
    keywords: ["chrome", "edge", "browser", "cookies", "cache", "cors", "clear data"],
    content: `Overview:
Fixing unresponsive SaaS applications, SAML single sign-on redirect loops, and rendering errors in Google Chrome and Microsoft Edge.

Standard Procedure:
1. Hard Refresh: Press Ctrl + Shift + R (Windows) or Cmd + Shift + R (macOS) to bypass local cached assets.
2. Clear Site Cookies and Storage:
   - Click padlock icon beside address bar -> Cookies and site data -> Manage on-device site data -> Remove.
3. Disable Interfering Extensions:
   - Navigate to chrome://extensions or edge://extensions.
   - Temporarily disable third-party ad blockers or script modifiers.
4. Corporate Browser Profile Sync:
   - Ensure the browser profile is signed in with @northstar-tech.internal to receive mandatory enterprise root CAs and proxy configurations.`
  },
  {
    document_id: "SOP-IT-017",
    title: "SOP 17: Multi-Factor Authentication (MFA) Registration and Hardware FOBs",
    category: "Password and account support",
    source: "Cybersecurity Identity Team",
    version: "3.2",
    status: "APPROVED",
    keywords: ["mfa", "2fa", "authenticator", "yubikey", "push notification", "phone changed"],
    content: `Overview:
Guidelines for configuring Microsoft Authenticator, transferring MFA to new mobile devices, and issuing hardware FIDO2 security keys.

MFA Device Replacement:
1. If employee retains access to old device or registered fallback phone:
   - Visit https://mysignins.microsoft.com/security-info
   - Click '+ Add sign-in method' and select 'Authenticator app'.
   - Scan QR code with Microsoft Authenticator on new phone.
2. Complete Device Loss (No registered fallback):
   - Employee must join a video verification session with IT Service Desk.
   - IT Agent verifies government ID and issues a temporary 8-hour One-Time Bypass Code (TAP - Temporary Access Pass).
3. YubiKey Provisioning: Employees in high-security environments (Cybersecurity, AWS Production) receive FIDO2 hardware keys configured via Identity Console.`
  },
  {
    document_id: "SOP-IT-018",
    title: "SOP 18: Remote Desktop (RDP) Gateway and Bastion Host Access",
    category: "Network",
    source: "Infrastructure and Cloud Operations",
    version: "2.1",
    status: "APPROVED",
    keywords: ["rdp", "remote desktop", "gateway", "bastion", "jumpbox", "error 0x204"],
    content: `Overview:
Connecting securely to internal Windows Server jumpboxes and administrative staging hosts.

Prerequisites:
- Active corporate VPN tunnel.
- Validated server management role.

Connection Steps:
1. Open Remote Desktop Connection (mstsc.exe).
2. Configure Gateway Settings:
   - Click 'Show Options' -> 'Advanced' tab -> 'Settings' under Connect from anywhere.
   - Select 'Use these RD Gateway server settings':
     Server name: rdp-gw.northstar-tech.internal
     Logon method: Allow me to select later
   - Check 'Use my RD Gateway credentials for the remote computer'.
3. Error 0x204 Troubleshooting:
   - Verify target server IP address and confirm port 3389 is open through host firewall.
   - Ensure Network Level Authentication (NLA) is supported by client.`
  },
  {
    document_id: "SOP-IT-019",
    title: "SOP 19: Enterprise ERP and Database Connectivity Diagnostics",
    category: "ERP and SAP",
    source: "Data Platform Engineering",
    version: "2.3",
    status: "APPROVED",
    keywords: ["erp", "database", "sql", "oracle", "snowflake", "odbc", "connectivity"],
    content: `Overview:
Resolving SQL Net timeout, ODBC driver connection failures, and SAP RFC communication drops.

Resolution Steps:
1. Port Testing:
   - Test connectivity from PowerShell:
     Test-NetConnection -ComputerName erp-db.northstar-tech.internal -Port 1521
     Test-NetConnection -ComputerName sap-app.northstar-tech.internal -Port 3200
2. Verify ODBC System DSN:
   - Open 64-bit ODBC Data Source Administrator (odbcad32.exe).
   - Click 'System DSN' -> Test Connection. Ensure Windows NT authentication or database service principal is active.
3. Snowflake Warehouse Connectivity:
   - Ensure IP whitelist does not block client subnets; connect through Northstar Corporate Egress IP proxy.`
  },
  {
    document_id: "SOP-IT-020",
    title: "SOP 20: Cybersecurity Incident Response and Phishing Reporting",
    category: "Other IT incidents",
    source: "Northstar Cyber Incident Response Team (CIRT)",
    version: "3.5",
    status: "APPROVED",
    keywords: ["security", "phishing", "malware", "compromise", "incident", "cirt", "soc", "suspicious"],
    content: `CRITICAL POLICY:
Employees must immediately report suspected security incidents, phishing attempts, ransomware symptoms, or lost devices.

Immediate Actions for Suspected Compromise:
1. Disconnect Network: Unplug Ethernet cable and turn off Wi-Fi immediately. DO NOT power off the computer (preserves volatile memory for forensics).
2. Report Phishing via Outlook:
   - Click the 'Report Phishing' button in the Outlook toolbar. This quarantines the email and alerts the SOC with full RFC 822 email headers.
3. Lost or Stolen Laptop:
   - Call CIRT Emergency Hotline: 1-800-555-CYBER or create a P1 ticket in IntelliDesk AI.
   - Remote lock and cryptographic wipe command will be dispatched via Intune/CrowdStrike Falcon within 15 minutes.
4. Never attempt to contact attacker or forward phishing emails to other colleagues.`
  }
];

