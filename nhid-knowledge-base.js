window.NHID_KB = {
  priorities: [
    { strength: '9/10', title: 'Machine identity and delegated authorization', rule: 'Do not trust a public NPI, voice impression, or claimed office relationship without machine-verifiable authority.' },
    { strength: '9/10', title: 'Enforceable human oversight', rule: 'Escalate when risk, confidence gaps, disagreement, or clinical thresholds appear.' },
    { strength: '8/10', title: 'Voice perception is not proof', rule: 'Treat human-sounding audio as untrusted until identity, authority, and session scope are verified.' }
  ],
  fields: ['Actor Type', 'Represented Organization', 'Task Intent', 'Permitted Data Scope', 'Risk Level', 'Disclosure Status', 'Authority Evidence', 'Trust Score', 'Human Escalation', 'Audit Requirements', 'Failure Handling'],
  scenarioCards: [
    {
      id: 'prior-auth',
      title: 'Prior Authorization Status Check',
      tier: 'Low-risk administrative',
      participants: 'Inbound provider AI agent → payer call center rep',
      allowed: 'Confirm non-PHI workflow availability after disclosure and passport validation.',
      disallowed: 'Prior-auth status, member eligibility, claim details, diagnosis, or treatment data before identity proof.',
      proof: 'NHID-Auth provider passport bound to NPI, issuer, domain, current session, and unexpired scope.',
      escalation: 'Invalid passport, late disclosure, pressure for PHI, or caller asks to bypass policy.',
      expected: 'Hold data, challenge identity, validate passport, then release only minimum necessary status.'
    },
    {
      id: 'discharge-callback',
      title: 'Discharge Coordination Callback',
      tier: 'Medium-risk clinical-adjacent',
      participants: 'Hospital discharge agent → payer/utilization management desk',
      allowed: 'Scheduling logistics and non-sensitive routing once authority is verified.',
      disallowed: 'Medication changes, diagnosis details, home-care instructions, or new clinical decisions by bot.',
      proof: 'Delegated authority with organization, care episode, duration, and revocation path.',
      escalation: 'Patient safety uncertainty, care-team disagreement, missing delegation scope, or low confidence.',
      expected: 'Verify delegated authority and route clinical uncertainty to a human coordinator.'
    },
    {
      id: 'urgent-triage',
      title: 'Urgent Triage / Crisis Escalation',
      tier: 'High-risk',
      participants: 'Automated clinical agent → payer nurse line or crisis workflow',
      allowed: 'Identity disclosure, emergency routing, and transfer metadata only.',
      disallowed: 'Diagnosis, treatment advice, medication adjustment, or crisis counseling by unverified bot.',
      proof: 'Verified source plus explicit human-on-the-loop availability.',
      escalation: 'Any urgent symptoms, mental-health crisis language, disagreement, or confidence drop.',
      expected: 'Mandatory deferral to human clinician or emergency workflow; log all handoff events.'
    }
  ],
  failureModes: [
    { mode: 'Identity spoofing', response: 'Require non-voice proof, session binding, and contextual checks.' },
    { mode: 'Delegation drift', response: 'Revalidate scope after role, workflow, or configuration changes.' },
    { mode: 'Confused deputy', response: 'Prevent inherited full authority downstream; enforce least privilege.' },
    { mode: 'Silent PHI overreach', response: 'Bind access to task context and minimum necessary data.' },
    { mode: 'Escalation failure', response: 'Stop automation and trigger documented human handoff.' }
  ],
  ifThenRules: [
    ['If authority cannot be proven', 'identity may be disclosed, but PHI and workflow actions remain blocked.'],
    ['If the task enters diagnosis, treatment, medication, or crisis support', 'defer to a human clinician or emergency workflow.'],
    ['If confidence drops, systems disagree, or risk increases', 'escalate and create an audit event.'],
    ['If passport scope is expired, revoked, or mismatched', 'reject, log, and route to secure human verification.']
  ]
};
