export const SECURITY_PLUS_DOMAINS = [
  {
    id: 'sec-general-concepts',
    number: '1.0',
    weight: '12%',
    label: 'General Security Concepts',
    summary: 'Controls, CIA, zero trust, change management, and cryptography.',
    signals: ['control type', 'CIA impact', 'zero trust', 'hash / salt / signature', 'PKI'],
    flow: [
      'Identify the security objective or control category.',
      'Separate authentication, authorization, and accounting.',
      'For cryptography, identify confidentiality, integrity, or non-repudiation.',
      'Choose the control that directly provides the requested property.',
    ],
    traps: [
      'Encryption provides confidentiality; hashing primarily supports integrity.',
      'A digital signature does not encrypt the entire message by itself.',
      'Zero trust means continuous verification, not automatic denial of all access.',
    ],
  },
  {
    id: 'sec-threats-mitigations',
    number: '2.0',
    weight: '22%',
    label: 'Threats, Vulnerabilities, and Mitigations',
    summary: 'Actors, attack vectors, vulnerability indicators, and mitigations.',
    signals: ['actor + motive', 'attack vector', 'indicator', 'exploit', 'best mitigation'],
    flow: [
      'Name the actor, vector, vulnerability, or observed indicator.',
      'Map the symptom to the most specific attack technique.',
      'Choose a mitigation that blocks the stated technique.',
      'Reject controls that only detect when prevention is requested.',
    ],
    traps: [
      'Phishing is a delivery technique; malware is the payload.',
      'A vulnerability is a weakness; an exploit is how the weakness is abused.',
      'Least privilege limits impact but may not remove the initial vulnerability.',
    ],
  },
  {
    id: 'sec-architecture',
    number: '3.0',
    weight: '18%',
    label: 'Security Architecture',
    summary: 'Cloud, infrastructure, segmentation, resilience, and data protection.',
    signals: ['cloud responsibility', 'network zone', 'resilience', 'data state', 'secure design'],
    flow: [
      'Locate the trust boundary and the data being protected.',
      'Identify on-premises, cloud, hybrid, or third-party responsibility.',
      'Apply segmentation and least exposure before adding monitoring.',
      'For resilience, remove the stated single point of failure.',
    ],
    traps: [
      'A public subnet is not the right home for databases by default.',
      'Redundancy improves availability but does not replace backups.',
      'Tokenization and masking reduce exposure; they are not identical to encryption.',
    ],
  },
  {
    id: 'sec-operations',
    number: '4.0',
    weight: '28%',
    label: 'Security Operations',
    summary: 'IAM, hardening, monitoring, vulnerability management, and incident response.',
    signals: ['operational task', 'log / alert', 'IAM lifecycle', 'incident phase', 'forensics'],
    flow: [
      'Decide whether the task is prevention, detection, response, or recovery.',
      'Use the requested data source or security tool at the correct stage.',
      'Preserve evidence before making destructive incident-response changes.',
      'Contain first when active damage is spreading; eradicate after scope is known.',
    ],
    traps: [
      'SIEM correlates logs; SOAR automates workflows and response actions.',
      'A vulnerability scan finds likely weaknesses; a penetration test validates exploitation.',
      'Containment limits spread; recovery restores normal operations.',
    ],
  },
  {
    id: 'sec-program-management',
    number: '5.0',
    weight: '20%',
    label: 'Security Program Management and Oversight',
    summary: 'Governance, risk, vendors, compliance, audits, and awareness.',
    signals: ['policy hierarchy', 'risk decision', 'third party', 'compliance', 'awareness'],
    flow: [
      'Identify the owner: governance, risk, compliance, audit, or training.',
      'Quantify likelihood and impact before selecting a risk response.',
      'Use contracts and assessments to manage third-party obligations.',
      'Choose the artifact that documents the requested decision or evidence.',
    ],
    traps: [
      'A policy states intent; a procedure gives step-by-step instructions.',
      'Risk acceptance retains risk; risk transfer shifts financial responsibility.',
      'An SLA defines service targets; it does not replace a full security agreement.',
    ],
  },
];

export function getSecurityPlusDomain(domainId) {
  return SECURITY_PLUS_DOMAINS.find((domain) => domain.id === domainId);
}
