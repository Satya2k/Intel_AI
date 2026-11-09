-- ==============================================================================
-- INTELLIDESK AI - KNOWLEDGE BASE SEED SQL (20 Enterprise IT SOPs)
-- ==============================================================================

INSERT INTO knowledge_documents (document_id, title, category, content, source, version, status) VALUES
('SOP-IT-001', 'SOP 01: VPN Connection Failure and Gateway Re-authentication', 'VPN', 
'Overview: This Standard Operating Procedure guides employees through diagnosing Cisco AnyConnect / Secure Client VPN failures.
Common Causes: Stale authentication tokens, captive portals, firewall blocking DTLS port 443.
Step-by-Step Resolution:
1. Disconnect and Close VPN Client: Right-click Cisco Secure Client and select Exit.
2. Flush DNS & Local IP Cache: Run ipconfig /flushdns and netsh int ip reset.
3. Clear Cached Certificates: Delete temporary cache in %LOCALAPPDATA%\Cisco\Cisco Secure Client\.
4. Verify Gateway Hostname: Ensure gateway URL is vpn.northstar-tech.internal.
5. Re-authenticate with Microsoft Authenticator MFA push.
Escalate to Network Support with DART bundle if Error 412 persists.', 'Northstar IT Network Engineering Handbook v4.2', '2.1', 'APPROVED'),

('SOP-IT-002', 'SOP 02: Outlook Desktop Client Synchronization and Exchange Online', 'Email and Microsoft 365',
'Overview: Resolution procedure for Microsoft Outlook desktop client stalling at Updating Inbox or Connecting.
Diagnostic Steps:
1. Check OWA Connectivity: Access https://outlook.office.com in web browser.
2. Verify Outlook Connection Status: Hold Ctrl while right-clicking Outlook system tray icon and click Connection Status.
3. Repair Local OST File: Close Outlook, rename %localappdata%\Microsoft\Outlook\{email}.ost to .ost.old, restart Outlook to rebuild.
4. Check Add-ins: Launch outlook.exe /safe to isolate faulty COM add-ins.', 'M365 Cloud Productivity SOPs', '1.8', 'APPROVED'),

('SOP-IT-003', 'SOP 03: Outlook Authentication and Modern Auth Token Failure', 'Email and Microsoft 365',
'Overview: Troubleshooting repeated credential prompts, password loops, and modern auth token failures.
Resolution Steps:
1. Clear Windows Credential Manager: Remove all entries starting with MicrosoftOffice16_Data or ADAL in Control Panel.
2. Clear Azure AD / Entra Broker Cache: Navigate to Windows Settings -> Accounts -> Access work or school.
3. Reset Office Broker Plugin: Run Get-AppxPackage Microsoft.AAD.BrokerPlugin | Reset-AppxPackage in PowerShell.
4. Relaunch Outlook and re-enter corporate credentials.', 'Identity Governance & Messaging Operations', '2.0', 'APPROVED'),

('SOP-IT-004', 'SOP 04: Windows Domain Login Failure and Trust Relationship Errors', 'Password and account support',
'Overview: Guidance for error: The trust relationship between this workstation and primary domain failed.
Immediate Workarounds:
1. Connect to Wi-Fi and use Network Sign-in icon at Windows login screen to establish VPN tunnel before authentication.
2. Domain Time Sync: Run w32tm /resync /rediscover from command prompt to resolve Kerberos clock skew.
3. Domain Re-join: IT Admin executes Test-ComputerSecureChannel -Repair -Credential (Get-Credential).
4. Re-image machine if TPM chip or computer account is corrupted.', 'Active Directory & Desktop Architecture', '1.5', 'APPROVED'),

('SOP-IT-005', 'SOP 05: Self-Service Password Expiry and Reset Protocol', 'Password and account support',
'Overview: Northstar requires 90-day password rotation. Passwords must be 14+ characters with mixed case, numbers, symbols.
Self-Service Password Reset (SSPR):
1. Navigate to https://passwordreset.northstar-tech.internal
2. Provide corporate email address.
3. Complete MFA via Authenticator push + SMS code.
4. Set new compliant password (no reuse of last 10 passwords).
5. Lock and unlock workstation (Win + L) to refresh cached Kerberos ticket.', 'Northstar Identity Security Standard', '3.0', 'APPROVED'),

('SOP-IT-006', 'SOP 06: Active Directory Account Lockout Investigation and Unlock', 'Password and account support',
'Overview: Accounts lock out after 5 consecutive bad password attempts within 15 minutes.
Troubleshooting Checklist:
1. Verify Employee Identity before unlocking.
2. Locate Lockout Source using Event 4740 in domain controller logs (common culprits: mobile email sync, old Wi-Fi profiles).
3. Unlock Account via Identity Console: Unlock-ADAccount -Identity $employee_id.
4. Disconnect secondary devices until password is updated.', 'Identity Governance & Helpdesk Playbooks', '2.3', 'APPROVED'),

('SOP-IT-007', 'SOP 07: Enterprise Wi-Fi (Northstar-Corp-Secure) Connectivity', 'Network',
'Overview: Connecting corporate laptops to Northstar-Corp-Secure (802.1X EAP-TLS).
Requirements: Corporate enrolled laptop with client certificate from Northstar Intermediate CA.
Troubleshooting Steps:
1. Forget Network and re-scan for SSID.
2. Verify Certificate in certmgr.msc -> Personal -> Certificates.
3. Set EAP method to Microsoft: Protected EAP (PEAP) with Secured password MSCHAPv2.
4. Guests must use Northstar-Guest portal with SMS verification.', 'Global Network Operations Center', '2.0', 'APPROVED'),

('SOP-IT-008', 'SOP 08: Network and Office Printer Troubleshooting', 'Hardware',
'Overview: Diagnostic guide for floor multifunction printers and warehouse thermal printers.
Common Resolutions:
1. Restart Local Print Spooler: Run net stop spooler && del /Q /F /S %systemroot%\System32\Spool\Printers\*.* && net start spooler.
2. Ping printer IP address to verify network connectivity.
3. Remap queue by browsing to \\printserver.northstar-tech.internal\ and double-clicking target printer.
4. Verify paper tray alignment and toner level.', 'End User Computing Field Support', '1.4', 'APPROVED'),

('SOP-IT-009', 'SOP 09: Laptop Startup, BitLocker Recovery, and BSOD Recovery', 'Hardware',
'Overview: Handling workstations that fail to boot or prompt for BitLocker recovery key.
Recovery Steps:
1. Verify user identity.
2. Retrieve 48-digit numerical recovery key from Intune Admin portal using Recovery Key ID.
3. If BitLocker prompts on every reboot, run manage-bde -protectors -disable C: followed by enable.
4. Run ePSA hardware diagnostics by holding Fn while powering on.', 'Desktop Engineering & Endpoint Security', '2.4', 'APPROVED'),

('SOP-IT-010', 'SOP 10: Microsoft 365 License and Desktop Apps Provisioning', 'Email and Microsoft 365',
'Overview: Resolving Unlicensed Product errors in Word, Excel, PowerPoint, and Teams.
Resolution Steps:
1. Verify M365 E5 license assignment in Microsoft Admin Center.
2. Sign out of Office via File -> Account -> Sign Out.
3. Reset cached licenses using OSPP.VBS /dstatus and clear %localappdata%\Microsoft\OneAuth.
4. Relaunch Office and sign in with @northstar-tech.internal email.', 'Cloud Infrastructure & SaaS Operations', '1.9', 'APPROVED'),

('SOP-IT-011', 'SOP 11: SAP S/4HANA GUI & Fiori Login Authentication Failures', 'ERP and SAP',
'Overview: Troubleshooting SAP GUI 800 and Fiori Launchpad login issues.
Procedure:
1. Verify system entry in SAP Logon: PRD - Northstar S/4HANA Production, Instance 00, sap-prd.northstar-tech.internal.
2. Single Sign-On (SNC) Kerberos Failure: Run klist in cmd; lock/unlock Windows if ticket expired.
3. 3 incorrect passwords locks SAP Client 100 account; unlock via Self-Service SAP portal.', 'Enterprise ERP Center of Excellence', '3.1', 'APPROVED'),

('SOP-IT-012', 'SOP 12: SAP Authorization Error RFC_NO_AUTHORITY and T-Code Access', 'ERP and SAP',
'Overview: Resolving You are not authorized to use transaction code or RFC_NO_AUTHORITY.
Steps:
1. Execute transaction /nSU53 immediately after error to capture missing authorization object.
2. Verify role entitlement in RBAC matrix.
3. Financial Analysts have FBL3N/FB03; Period Close (OB52) requires Manager approval.
4. Submit Access Request in IntelliDesk AI referencing the SU53 authorization object.', 'Enterprise ERP Security & GRC', '2.8', 'APPROVED'),

('SOP-IT-013', 'SOP 13: Corporate Network Drive Mapping (Z: and S: Drives)', 'Network',
'Overview: Restoring missing or disconnected network drives (S:\Shared and Z:\Home).
Resolution Steps:
1. Connect to Cisco VPN if working remotely.
2. Map drives manually: net use S: \\storage.northstar-tech.internal\shares /persistent:yes.
3. Flush DFS cache with dfsutil /pktflush and dfsutil /spcflush.
4. Request Active Directory group membership if getting Access Denied Error 5.', 'Storage & File Services Architecture', '1.7', 'APPROVED'),

('SOP-IT-014', 'SOP 14: Microsoft Teams Audio, Video, and Peripheral Diagnostics', 'Hardware',
'Overview: Resolving microphone echo, mute issues, and camera dropouts in Teams.
Steps:
1. Select certified headset in Teams Settings -> Devices.
2. Disable Windows audio enhancements in mmsys.cpl -> Recording Properties.
3. Run Make a test call in Teams Device Settings to verify microphone latency.
4. Ensure Microphone permission is enabled in Windows Settings -> Privacy & Security.', 'Unified Communications Engineering', '2.2', 'APPROVED'),

('SOP-IT-015', 'SOP 15: Corporate Software Installation and Company Portal Deployment', 'Software',
'Overview: Software deployment for users without local admin rights.
Policy & Steps:
1. Open Company Portal app from Start Menu.
2. Select desired software (VS Code, Power BI, Docker, Acrobat, Zoom) and click Install.
3. Intune deploys silent approved packages without requiring admin credentials.
4. For custom software not in portal, submit a Software Access Request in IntelliDesk AI.', 'Client Systems Management', '2.0', 'APPROVED'),

('SOP-IT-016', 'SOP 16: Browser Troubleshooting (Chrome & Edge Enterprise)', 'Software',
'Overview: Fixing SaaS rendering issues, SAML redirect loops, and browser crashes.
Steps:
1. Perform hard refresh (Ctrl + Shift + R or Cmd + Shift + R).
2. Clear cookies and site data for the affected domain.
3. Disable conflicting extensions in chrome://extensions.
4. Ensure corporate profile sync is active with @northstar-tech.internal account.', 'Client Application Standards', '1.3', 'APPROVED'),

('SOP-IT-017', 'SOP 17: Multi-Factor Authentication (MFA) Registration and Hardware FOBs', 'Password and account support',
'Overview: Configuring Microsoft Authenticator and transferring MFA to new devices.
Procedures:
1. New Phone Transfer: Visit https://mysignins.microsoft.com/security-info and click + Add sign-in method.
2. Lost Phone: Contact IT Service Desk for video identity verification to receive an 8-hour Temporary Access Pass (TAP).
3. YubiKey hardware FOBs are provisioned for privileged administrative roles.', 'Cybersecurity Identity Team', '3.2', 'APPROVED'),

('SOP-IT-018', 'SOP 18: Remote Desktop (RDP) Gateway and Bastion Host Access', 'Network',
'Overview: Secure access to Windows Server bastion hosts and jumpboxes.
Prerequisites: Active VPN tunnel and server management permissions.
Steps:
1. Open Remote Desktop Connection (mstsc.exe).
2. Configure Gateway: rdp-gw.northstar-tech.internal on port 443.
3. Check Error 0x204: Verify target server IP, ensure port 3389 is open, and check Network Level Authentication (NLA).', 'Infrastructure and Cloud Operations', '2.1', 'APPROVED'),

('SOP-IT-019', 'SOP 19: Enterprise ERP and Database Connectivity Diagnostics', 'ERP and SAP',
'Overview: Diagnosing SQL Net timeouts, ODBC failures, and database drops.
Steps:
1. Test ports: Test-NetConnection -ComputerName erp-db.northstar-tech.internal -Port 1521.
2. Verify 64-bit ODBC System DSN configuration.
3. Check Snowflake warehouse IP whitelist and connect through corporate egress proxy.', 'Data Platform Engineering', '2.3', 'APPROVED'),

('SOP-IT-020', 'SOP 20: Cybersecurity Incident Response and Phishing Reporting', 'Other IT incidents',
'CRITICAL POLICY: Mandatory immediate reporting of suspected phishing, malware, or compromised credentials.
Actions:
1. Disconnect Ethernet and Wi-Fi immediately. DO NOT turn off the computer.
2. Report Phishing using the Outlook Report Phishing button to forward RFC 822 headers to CIRT.
3. Call 1-800-555-CYBER or create P1 ticket in IntelliDesk AI for lost/stolen laptops.
4. Intune/CrowdStrike will trigger remote cryptographic lock within 15 minutes.', 'Northstar Cyber Incident Response Team (CIRT)', '3.5', 'APPROVED')
ON CONFLICT (document_id) DO NOTHING;

