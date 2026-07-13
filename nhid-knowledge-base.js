// Knowledge base content for the Zero Latency simulator.
// Grounded in the NHID-Clinical v1.3 control catalog and the reference
// conformance traces (IDG-01, PDX-01, DBC-01, EIT-01, ATR-01). Rotated
// 2026-07 with adversarial-input, bot-to-bot, and deceptive-artifact material.
window.NHID_KB = {
  rotation: 'Content set 2026-07 · grounded in NHID-Clinical v1.3 conformance traces',
  priorities: [
    { strength: '9/10', title: 'Machine identity and delegated authorization', rule: 'Do not trust a public NPI, voice impression, or claimed office relationship without machine-verifiable authority (IDG-01).' },
    { strength: '9/10', title: 'Enforceable human oversight', rule: 'Escalate when risk, confidence gaps, disagreement, or clinical thresholds appear — and confirm the transfer path actually works (EIT-01).' },
    { strength: '8/10', title: 'Voice perception is not proof', rule: 'Treat human-sounding audio — including synthetic breathing or typing — as untrusted and as a deception signal, not evidence of a person (DBC-01).' }
  ],
  // Canonical NHID-Clinical control gates exercised by the simulator.
  controls: [
    { id: 'IDG-01', name: 'Identity Disclosure Gate', trigger: 'disclosure_timestamp is null on any turn (including silence and empty speech).', decision: 'DISCLOSE_IDENTITY before the interaction proceeds.' },
    { id: 'PDX-01', name: 'Pre-Data Exchange Gate', trigger: 'PHI pattern (member ID, DOB, claim, diagnosis) detected before disclosure + verification.', decision: 'DENY_DATA — dominates other decisions by priority.' },
    { id: 'DBC-01', name: 'Deceptive Behavior Check', trigger: 'deceptive_artifact_flags non-empty (e.g. fake_breathing, typing SFX, "I\'m a nurse").', decision: 'LOG_ONLY + partial_failure=true; CA AB 489 (eff. Jan 1 2026) exposure.' },
    { id: 'EIT-01', name: 'Escalation Implementation Test', trigger: 'Human transfer requested but escalation_path_available=false.', decision: 'ESCALATE_HUMAN; a path that is untested in production counts as no path.' },
    { id: 'ATR-01', name: 'Audit Trail Requirements', trigger: 'Missing session binding (CallSid) or execution_context field (e.g. pipeline_version).', decision: 'Record the violation; without it the session is unreplayable and audit-incomplete.' }
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
    },
    {
      id: 'bot-to-bot',
      title: 'Bot-to-Bot Prior Authorization',
      tier: 'Medium-risk automation',
      participants: 'Payer AI agent ↔ provider AI agent (counterparty_type=ai_agent)',
      allowed: 'Automated exchange only after mutual disclosure and passport validation on both sides.',
      disallowed: 'Skipping IDG-01 because "the other side is also a machine" — gates apply to bot counterparties too.',
      proof: 'Bidirectional NHID-Auth passports plus a bot-to-bot policy gate, not just human-facing IDG-01.',
      escalation: 'Either passport missing/expired, or no bot-to-bot gate configured (trace-08 gap).',
      expected: 'Enforce IDG-01/PDX-01 regardless of counterparty type; disclosure_timestamp must be set both ways.'
    },
    {
      id: 'deceptive-artifact',
      title: 'Synthetic Human Artifact (Fake Breathing)',
      tier: 'High-risk deception',
      participants: 'Provider AI agent emitting *exhales* / typing sounds → payer rep',
      allowed: 'Nothing — DBC-01 flags the call as deceptive and taints every subsequent event.',
      disallowed: 'Implying human or licensed-professional presence via breathing, sighs, "one sec, typing…", or "I\'m a nurse".',
      proof: 'STT deceptive_artifact_flags classifier output; disclosure state.',
      escalation: 'Any deceptive_artifact_flag; log DBC-01, set partial_failure=true, review under CA AB 489.',
      expected: 'Record DBC-01, treat the human-sounding cue as a red flag, and re-verify identity — do not relax.'
    },
    {
      id: 'silence-injection',
      title: 'Silence / Empty-Speech Injection',
      tier: 'Adversarial input',
      participants: 'Caller sends empty or null-byte-padded speech to slip past the gate',
      allowed: 'Re-evaluating policy on silence; disclosure gate reset.',
      disallowed: 'Treating empty SpeechResult as a valid turn that passes through without policy evaluation.',
      proof: 'Sanitized input payload; validation-boundary event recorded for ATR-01.',
      escalation: 'Empty speech, embedded null bytes, or control characters in the transcript.',
      expected: 'Sanitize input, reset the disclosure gate on silence, and never short-circuit the audit record.'
    }
  ],
  failureModes: [
    { mode: 'Identity spoofing (IDG-01)', response: 'Require non-voice proof, session binding, and contextual checks before trust.' },
    { mode: 'Impersonation latency (PDX-01)', response: 'Enforce the pre-data gate on EVERY turn, not just turn zero — late disclosure still blocks PHI.' },
    { mode: 'Deceptive artifacts (DBC-01)', response: 'Flag synthetic breathing/typing/human claims; set partial_failure and review under CA AB 489.' },
    { mode: 'Escalation failure (EIT-01)', response: 'Stop automation and trigger a tested human handoff; an untested path is no path.' },
    { mode: 'Audit gap (ATR-01)', response: 'Reject or flag events missing CallSid or pipeline_version; incomplete records are unreplayable.' },
    { mode: 'Adversarial input injection', response: 'Sanitize null bytes/control chars before policy evaluation; store sanitized text, not the raw payload.' },
    { mode: 'Bot-to-bot policy gap', response: 'Apply disclosure/data gates to AI counterparties too, not only human callers.' },
    { mode: 'Replay divergence', response: 'Cache external calls in replay; a non-deterministic re-run breaks audit reconstruction.' },
    { mode: 'Silent partial failure', response: 'A session that looks normal but carries a boundary violation is the most dangerous mode — surface it.' }
  ],
  ifThenRules: [
    ['If authority cannot be proven (IDG-01)', 'identity may be disclosed, but PHI and workflow actions remain blocked.'],
    ['If a PHI pattern appears before disclosure (PDX-01)', 'DENY_DATA — the data gate dominates every other decision.'],
    ['If the task enters diagnosis, treatment, medication, or crisis support', 'defer to a human clinician or emergency workflow.'],
    ['If the caller emits breathing, typing, or "I\'m a nurse" cues (DBC-01)', 'log deception, keep the gate closed, and re-verify identity.'],
    ['If a human transfer is requested but no path is available (EIT-01)', 'record the violation and offer an alternate contact — do not strand the caller.'],
    ['If CallSid or pipeline_version is missing (ATR-01)', 'the event is unreplayable — reject or flag rather than silently pass.'],
    ['If confidence drops, systems disagree, or risk increases', 'escalate and create an audit event.'],
    ['If passport scope is expired, revoked, or mismatched', 'reject, log, and route to secure human verification.']
  ]
};
