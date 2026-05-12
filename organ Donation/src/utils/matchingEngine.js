/**
 * Organ Donor-Recipient Matching Engine
 *
 * Pure functions — no side effects, fully testable.
 * All scoring is deterministic given the same inputs.
 */

// ── Blood type compatibility map ─────────────────────────────────────────────
// Key = recipient blood type → Value = array of compatible donor blood types
export const BLOOD_COMPATIBILITY = {
  'O-':  ['O-'],
  'O+':  ['O-', 'O+'],
  'A-':  ['O-', 'A-'],
  'A+':  ['O-', 'O+', 'A-', 'A+'],
  'B-':  ['O-', 'B-'],
  'B+':  ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

// ── Urgency priority weights ─────────────────────────────────────────────────
export const URGENCY_WEIGHT = {
  Critical:  40,
  Emergency: 35,
  High:      25,
  Medium:    10,
  Low:        0,
  Voluntary:  0,
};

// ── Organ name normaliser ────────────────────────────────────────────────────
// Handles "Liver (Partial)" === "Liver", "Kidney (Left)" === "Kidney", etc.
export function normaliseOrgan(name = '') {
  return name.trim().split(/[\s(]/)[0].toLowerCase();
}

/**
 * Check whether a donor's blood type is compatible with a recipient's.
 *
 * @param {string} donorBlood     - e.g. "O+"
 * @param {string} recipientBlood - e.g. "A+"
 * @returns {boolean}
 */
export function isBloodCompatible(donorBlood, recipientBlood) {
  const compatible = BLOOD_COMPATIBILITY[recipientBlood];
  if (!compatible) return false;
  return compatible.includes(donorBlood);
}

/**
 * Check whether a donor organ matches a recipient's needed organ.
 * Uses normalised comparison so "Liver (Partial)" matches "Liver".
 *
 * @param {string} donorOrgan     - organ the donor is offering
 * @param {string} recipientOrgan - organ the recipient needs
 * @returns {boolean}
 */
export function isOrganMatch(donorOrgan, recipientOrgan) {
  return normaliseOrgan(donorOrgan) === normaliseOrgan(recipientOrgan);
}

/**
 * Compute a match score (0–100) for a donor–recipient pair.
 *
 * Scoring breakdown:
 *   50 pts — organ type match (required)
 *   30 pts — blood type compatibility (required)
 *   20 pts — urgency bonus (split between donor urgency + recipient urgency)
 *
 * Returns null if either required condition fails.
 *
 * @param {Object} donor     - { organType|organ, bloodType, urgency?, isAvailable? }
 * @param {Object} recipient - { organNeeded|organ, bloodType, urgency? }
 * @returns {{ score: number, reasons: string[] } | null}
 */
export function computeMatchScore(donor, recipient) {
  const donorOrgan     = donor.organType     || donor.organ     || '';
  const recipientOrgan = recipient.organNeeded || recipient.organ || '';
  const donorBlood     = donor.bloodType     || '';
  const recipientBlood = recipient.bloodType || '';

  // Hard requirements
  if (!isOrganMatch(donorOrgan, recipientOrgan))       return null;
  if (!isBloodCompatible(donorBlood, recipientBlood))  return null;

  const reasons = [];
  let score = 80; // base for passing both hard requirements

  // Urgency bonus (up to 20 pts)
  const recipientUrgency = URGENCY_WEIGHT[recipient.urgency] ?? 0;
  const donorUrgency     = URGENCY_WEIGHT[donor.urgency]     ?? 0;
  const urgencyBonus     = Math.min(20, Math.round((recipientUrgency + donorUrgency) / 8));
  score += urgencyBonus;

  // Cap at 100
  score = Math.min(100, score);

  reasons.push(`Organ match: ${donorOrgan}`);
  reasons.push(`Blood compatible: ${donorBlood} → ${recipientBlood}`);
  if (urgencyBonus > 0) reasons.push(`Urgency boost: +${urgencyBonus} pts`);

  return { score, reasons };
}

/**
 * Run the matching engine against a list of donors and a single recipient.
 * Returns matched donors sorted by score descending, emergency first.
 *
 * @param {Array}  donors    - array of donor/organ records
 * @param {Object} recipient - the recipient/request record
 * @returns {Array} sorted array of { donor, score, reasons, isEmergency }
 */
export function findMatches(donors, recipient) {
  const results = [];

  for (const donor of donors) {
    // Skip unavailable donors if availability is tracked
    if (donor.isAvailable === false) continue;

    const result = computeMatchScore(donor, recipient);
    if (!result) continue;

    const isEmergency =
      recipient.urgency === 'Critical' ||
      recipient.urgency === 'Emergency' ||
      donor.urgency     === 'Critical';

    results.push({
      donor,
      score:       result.score,
      reasons:     result.reasons,
      isEmergency,
    });
  }

  // Sort: emergency first, then by score descending
  return results.sort((a, b) => {
    if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
    return b.score - a.score;
  });
}

/**
 * Run the engine for multiple recipients at once.
 * Returns a map: recipientId → sorted match array.
 *
 * @param {Array} donors     - all available donors
 * @param {Array} recipients - all recipient requests
 * @returns {Object} { [recipientId]: matchArray }
 */
export function buildMatchMap(donors, recipients) {
  return recipients.reduce((map, recipient) => {
    map[recipient.id] = findMatches(donors, recipient);
    return map;
  }, {});
}
