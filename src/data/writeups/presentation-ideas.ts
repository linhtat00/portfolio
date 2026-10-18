import { Writeup } from '../../types';

export const presentationIdeasWriteup: Writeup = {
  id: "writeup-1792032268645",
  slug: "presentation-ideas",
  code: "#CD-20261015-0944",
  title: "PRESENTATION IDEAS",
  category: "OSINT",
  platform: "CyberDefenders",
  difficulty: "EASY",
  date: "Published Today",
  readTime: "7 min read",
  mitreAttack: ["T1055.012","T1574.002","T1071.001"],
  tools: ["Volatility 3","Splunk ES","Wireshark","Ghidra"],
  featured: false,
  summary: "testing testing here",
  iocs: [],
  detectionQueries: [],
  content: `**PRESENTATION IDEAS**

**Scenario 1: The Ransomware Deployment (Optimal for Technical Audience)** This tracks a payload, such as a Petya variant or Agent Tesla infostealer, moving from external delivery to internal execution. It provides distinct physical and software appliances for each stage.

- **Speaker 1 (Intro &amp; Deterrent):** Attacker maps the corporate footprint.Tools: External CCTV on server rooms, strict warning banners on the VPN login portal stating all traffic is monitored.

- **Speaker 2 (Preventive &amp; Detective):** Attacker sends a malicious macro via email.Tools: Email Security Gateway (Preventive) strips the attachment. Attacker pivots to an infected USB drive dropped in the parking lot. An employee plugs it in. Host Intrusion Detection System / HIDS (Detective) flags anomalous command-line execution.

- **Speaker 3 (Corrective):** The ransomware begins encrypting the master boot record or local files.Tools: Network Access Control / NAC automatically quarantines the host to a dead VLAN. Immutable Backup Appliance is utilized to format and restore the machine without paying the ransom.

- **Speaker 4 (Directive &amp; Conclusion):** Post-incident response.Tools: Implementation of an automated Phishing Simulation Platform to retrain the employee, and SIEM dashboard reports used to update the company's acceptable use policy.

**Scenario 2: The Disgruntled Insider (Data Exfiltration)** This focuses on internal lateral movement and unauthorized access by a credentialed user, requiring different toolsets.

- **Speaker 1 (Intro &amp; Deterrent):** An employee decides to steal proprietary database records before resigning.Tools: Visible biometric scanners on physical archive doors, aggressive login banners detailing legal prosecution for data theft.

- **Speaker 2 (Preventive &amp; Detective):** The employee attempts to copy the database to a personal external drive.Tools: Endpoint USB port locks / Data Loss Prevention (DLP) agents (Preventive) block the file transfer. The employee then tries to email the database to a personal account. The SIEM (Detective) triggers a high-severity alert for a massive outbound data spike.

- **Speaker 3 (Corrective):** The security team responds to the alert.Tools: Security Orchestration, Automation, and Response / SOAR platform (Corrective) automatically disables the employee's Active Directory account and terminates their current session, neutralizing the threat.

- **Speaker 4 (Directive &amp; Conclusion):** System audit and policy adjustment.Tools: Privileged Access Management (PAM) software logs are reviewed to rewrite the Principle of Least Privilege mandate.

**Scenario 3: The Automated Web Server Breach** This scenario operates entirely at the network and application layer, focusing on perimeter defense against automated botnets.

- **Speaker 1 (Intro &amp; Deterrent):** A botnet scans the company's public web server for unpatched vulnerabilities.Tools: Honeypots mimicking vulnerable servers placed outside the firewall to waste attacker resources and deter further scanning of the real network.

- **Speaker 2 (Preventive &amp; Detective):** The botnet initiates a brute-force attack or SQL injection.Tools: Web Application Firewall / WAF (Preventive) blocks the malformed SQL queries. Network Intrusion Detection System / NIDS (Detective) logs the source IPs of the brute-force attempt.

- **Speaker 3 (Corrective):** The botnet shifts to a volumetric DDoS attack, overwhelming the server.Tools: DDoS Mitigation Appliance / Anycast routing (Corrective) absorbs and drops the junk traffic, bringing the web server back online.

- **Speaker 4 (Directive &amp; Conclusion):** Securing the infrastructure against future attacks.Tools: Vulnerability Scanners are scheduled to automatically audit the web server weekly to enforce the company's patch management policy.

**Scenario 1: The Ransomware Phishing Campaign** This is the most common and easiest to map to physical tools and software appliances.

- **Speaker 1 (Setup &amp; Deterrent):** An employee receives a fake invoice. Deterrent means: Email client banners stating "EXTERNAL SENDER - DO NOT CLICK UNVERIFIED LINKS" and physical security awareness posters in the office.
- **Speaker 2 (Preventive &amp; Detective):** The employee clicks the link. Preventive means: Email Security Gateway attempts to block the domain. Detective means: EDR (Endpoint Detection and Response) software detects a malicious PowerShell script executing in the background and alerts the SOC.
- **Speaker 3 (Corrective):** The ransomware begins encrypting files. Corrective means: NAC (Network Access Control) automatically quarantines the infected PC to an isolated VLAN. The IT team uses an Immutable Backup Appliance to restore the encrypted data without paying the ransom.
- **Speaker 4 (Directive &amp; Compensating):** Post-incident review. Directive means: Implementing mandatory phishing simulation training for all staff. Compensating means: Deploying hardware security keys (YubiKeys) because the standard password policy (Directive) failed to prevent unauthorized access.

**Scenario 2: The Web Server Brute Force &amp; Breach** This is highly technical, suited for Information Security majors, and strictly tests perimeter defenses.

- **Speaker 1 (Setup &amp; Deterrent):** An external attacker targets the company's customer database portal. Deterrent means: Warning banners on the SSH/Admin login page stating "UNAUTHORIZED ACCESS WILL BE PROSECUTED."
- **Speaker 2 (Preventive &amp; Detective):** The attacker runs an automated password cracking tool. Preventive means: WAF (Web Application Firewall) blocking known malicious IP ranges and Account Lockout appliances freezing the account after 5 failed attempts. Detective: IDS (Intrusion Detection System) flags the rapid succession of login attempts.
- **Speaker 3 (Corrective):** The attacker bypasses the WAF and corrupts the database. Corrective means: Automated failover to a redundant backup server to maintain uptime, and automated IP blackholing at the routing layer to sever the connection.
- **Speaker 4 (Directive &amp; Compensating):** Post-incident review. Directive: Enforcing a strict 16-character minimum password policy. Compensating: Implementing CAPTCHA tools on the login page to compensate for the web portal's inability to distinguish between human and bot traffic.

**Scenario 3: The Malicious Insider (Data Exfiltration)** This focuses on internal threats, which forces the presentation of different toolsets.

- **Speaker 1 (Setup &amp; Deterrent):** A fired employee attempts to steal proprietary code before their access is revoked. Deterrent means: NDA (Non-Disclosure Agreement) contracts and visible CCTV cameras in the server room.
- **Speaker 2 (Preventive &amp; Detective):** The employee plugs in a personal hard drive. Preventive means: Endpoint management software explicitly disabling all USB storage ports. Detective means: SIEM (Security Information and Event Management) platform triggering an alert for a massive internal file transfer attempt.
- **Speaker 3 (Corrective):** The employee attempts to delete the original files to sabotage the company. Corrective means: Automated IAM (Identity and Access Management) systems instantly revoking account privileges based on the SIEM alert, and restoring the deleted files from cloud backups.
- **Speaker 4 (Directive &amp; Compensating):** Post-incident review. Directive: Updating the HR offboarding policy to instantly revoke digital access before the termination meeting. Compensating: Requiring a "Two-Man Rule" (multi-party authorization software) for deleting critical root directories.

**Note**

  **NGFWs protect the *User* (Outbound Control):** An NGFW is designed to understand what applications your internal users are running. For example, it can see that a user is using *Facebook*, and it can block them from using *Facebook Games* while allowing *Facebook Messenger*. It prevents users from downloading malware or visiting dangerous sites.

  **WAFs protect the *Server* (Inbound Control):** A WAF doesn't care about what your employees are browsing. It sits in front of your public-facing web server and looks at what external users are inputting into your website. It understands the mechanics of web code (SQL, HTML, JSON) and stops hackers from exploiting vulnerabilities in your website's code (like SQL Injection or Cross-Site Scripting).

**REFERENCES**

Defense-in-depth framework: [What is Defense in Depth? Defined and Explained | Fortinet](https://www.fortinet.com/resources/cyberglossary/defense-in-depth)

[What is the Difference Between Network-Based Intrusion Detection Systems and Host-Based Intrusion Detection Systems? | Institute of Data](https://www.institutedata.com/blog/what-is-the-difference-between-network-based-intrusion-detection-systems-and-host-based-intrusion-detection-systems/)`
};
