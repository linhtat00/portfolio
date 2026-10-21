import { Writeup } from '../../types';

export const testNewFunctionWriteup: Writeup = {
  id: "writeup-1792595326412",
  slug: "test-new-function",
  code: "#IR-261021-2200",
  title: "test new function",
  category: "Memory Forensics",
  categories: ["Memory Forensics"],
  platform: "Internal Range",
  difficulty: "MED",
  date: "Published Today",
  readTime: "2 min read",
  mitreAttack: ["T1055","T1071","T1544.002"],
  tools: ["Volatility 3","Wireshark"],
  featured: false,
  summary: "hello this just a test for new functions",
  iocs: [
    {
        "type": "SHA256",
        "value": "akdfơpq235rseapò23k45po",
        "description": "Malicious payload / artifact indicator"
    },
    {
        "type": "IPv4",
        "value": "192.156.32.1",
        "description": "indicator"
    }
],
  detectionQueries: [],
  timelineTitle: "Attack Timeline",
  timeline: [
    {
        "id": "evt-1",
        "time": "08:14:22 UTC",
        "phase": "Initial Access",
        "title": "Spearphishing Attachment Executed",
        "description": "User opened invoice_oct2024.docm containing macro obfuscation and dropped staged runner.",
        "severity": "high",
        "techniqueId": "T1566.001"
    },
    {
        "id": "evt-2",
        "time": "08:15:05 UTC",
        "phase": "Execution",
        "title": "PowerShell In-Memory Payload Staging",
        "description": "Word spawned powershell.exe with Base64 encoded payload and AMSI bypass technique.",
        "severity": "critical",
        "techniqueId": "T1059.001"
    },
    {
        "id": "evt-3",
        "time": "08:18:40 UTC",
        "phase": "Command and Control",
        "title": "Encrypted Beaconing to Rogue IP",
        "description": "Outbound TLS handshake established to 185.220.101.5:8443 on 60s jitter intervals.",
        "severity": "critical",
        "techniqueId": "T1071.001"
    },
    {
        "id": "evt-1792594910518",
        "time": "10:23:11",
        "phase": "Discovery",
        "title": "Tessting",
        "description": "hello wrold",
        "severity": "info",
        "techniqueId": "T1124"
    },
    {
        "id": "evt-1792594930638",
        "time": "14:39:12",
        "phase": "Initial Access",
        "title": "anothe test",
        "description": "heeeeeeee",
        "severity": "low",
        "techniqueId": "T1231"
    }
],
  content: `here is the attack timeline

<!-- ATTACK_TIMELINE_START -->
| Timestamp | Phase & TTP | Threat Event / Observation | Severity |
| :--- | :--- | :--- | :--- |
| \`08:14:22 UTC\` | **[Initial Access]** \`T1566.001\` | **Spearphishing Attachment Executed**<br>User opened invoice_oct2024.docm containing macro obfuscation and dropped staged runner. | \`HIGH\` |
| \`08:15:05 UTC\` | **[Execution]** \`T1059.001\` | **PowerShell In-Memory Payload Staging**<br>Word spawned powershell.exe with Base64 encoded payload and AMSI bypass technique. | \`CRITICAL\` |
| \`08:18:40 UTC\` | **[Command and Control]** \`T1071.001\` | **Encrypted Beaconing to Rogue IP**<br>Outbound TLS handshake established to 185.220.101.5:8443 on 60s jitter intervals. | \`CRITICAL\` |
| \`10:23:11\` | **[Discovery]** \`T1124\` | **Tessting**<br>hello wrold | \`INFO\` |
| \`14:39:12\` | **[Initial Access]** \`T1231\` | **anothe test**<br>heeeeeeee | \`LOW\` |
<!-- ATTACK_TIMELINE_END -->

---

This is a table

| Phase / Step | Artifact / Technique | Telemetry Log / Output | Status |
| :--- | :--- | :--- | :--- |
| 1. Reconnaissance | MITRE T1595 | EventCode 4624 (Logon Type 3) | Detected |
| 2. Initial Access | Spearphishing Attachment | Sysmon Event 1 (Process Create) | Flagged |
| 3. Execution | PowerShell Staging | ScriptBlock Logging Event 4104 | Blocked |


> Forensic note or quote


This is font-size testing
<span style="font-size: 14px">Text with 14px font size</span>

<span style="font-size: 16px">Text with 16px font size</span>

<span style="font-size: 18px">Text with 18px font size</span>

<span style="font-size: 12px">Text with 12px font size</span>

<span style="font-size: 20px">Text with 20px font size</span>

<span style="font-size: 24px">Text with 24px font size</span>

- ths is the parent:
  - this is the child: testing tab function:

---

here comes callout function


> [!WARNING]
> Ghi chú forensic quan trọng hoặc phát hiện then chốt


> [!TIP]
> Ghi chú forensic quan trọng hoặc phát hiện then chốt



> [!IMPORTANT]
> Ghi chú forensic quan trọng hoặc phát hiện then chốt



> [!CAUTION]
> Ghi chú forensic quan trọng hoặc phát hiện then chốt


> [!NOTE]
> Ghi chú forensic quan trọng hoặc phát hiện then chốt

---
here comes checklist

- [x] Nhiệm vụ điều tra hoặc checklist

- [x] Nhiệm vụ điều tra hoặc checklist

- [ ] Nhiệm vụ điều tra hoặc checklist`
};
