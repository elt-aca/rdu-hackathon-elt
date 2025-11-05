import {
  Contribution,
  Employee,
  MatchedContribution,
  EmployeeMatches,
} from '../shared/types';

function normalizeName(name: string): string {
  if (!name) return '';
  return name.toLowerCase().replace(/\./g, '').trim().replace(/\s+/g, ' ');
}

function nameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0;
  name1 = normalizeName(name1);
  name2 = normalizeName(name2);
  if (name1 === name2) return 1.0;
  // Simple ratio, or insert a real fuzzy matching later.
  let matches = 0;
  let minLen = Math.min(name1.length, name2.length);
  for (let i = 0; i < minLen; i++) {
    if (name1[i] === name2[i]) matches++;
  }
  return matches / Math.max(name1.length, name2.length);
}

function addressSimilarity(address1: string, address2: string): number {
  // Simple: count fractions of matching characters ignoring case
  address1 = address1.toLowerCase();
  address2 = address2.toLowerCase();
  if (address1 === address2) return 1.0;
  let matches = 0;
  let minLen = Math.min(address1.length, address2.length);
  for (let i = 0; i < minLen; i++) {
    if (address1[i] === address2[i]) matches++;
  }
  return matches / Math.max(address1.length, address2.length);
}

function parseHouseNumber(address: string): string {
  let match = address.trim().match(/^(\d+)[^\d]?/);
  return match ? match[1] : '';
}

function explainMatch(contribName: string, contribAddress: string, emp: any, nameScore: number, addrScore: number, cityMatch: boolean, zipMatch: boolean, matchType: string, thresholds: any): string[] {
  const notes = [];
  if (matchType === 'Direct') {
    notes.push(`Name match`);
    if (nameScore < 1.0)
      notes.push(`Name similarity less than 100% (${nameScore.toFixed(2)}): initials, middle names, or nicknames may differ`);
  } else {
    notes.push(`Name match between contributor and employee's spouse ("${emp.spouse_name}")`);
    if (nameScore < 1.0) notes.push(`Spouse name similarity less than 100% (${nameScore.toFixed(2)})`);
  }
  if (addrScore > 0.9) {
    if (addrScore === 1.0) {
      notes.push(`Exact address match`);
    }
    else {
      notes.push(`Addresses are highly similar (${addrScore.toFixed(2)})`);
    }
    if (parseHouseNumber(emp.home_address) !== parseHouseNumber(contribAddress))
      notes.push('Potential neighbor: street matches but house number is different');
  } else if (addrScore > 0.70) {
    notes.push(`Address partial match (${addrScore.toFixed(2)}). Possible address formatting differences or neighbor`);
  } else {
    notes.push(`Address match is weak (${addrScore.toFixed(2)}).`);
  }
  if (cityMatch) notes.push('City match');
  else notes.push('City does not match exactly');
  if (zipMatch) notes.push('ZIP code match');
  else notes.push('ZIP code does not match');
  if (nameScore < thresholds.name) notes.push('Lower confidence due to incomplete or fuzzy name match');
  if (addrScore < thresholds.address) notes.push('Lower confidence due to partial address match');
  if (!cityMatch || !zipMatch) notes.push('Lower confidence due to city or ZIP mismatch');
  if (matchType === 'Spouse') notes.push('Match is to spouse, not employee directly');
  return notes;
}

export function matchEmployeeContributions(
  employees: Employee[],
  contributions: Contribution[],
  nameThreshold: number = 0.88,
  addressThreshold: number = 0.75
): EmployeeMatches[] {
  const employeeMatches: EmployeeMatches[] = [];
  const thresholds = { name: nameThreshold, address: addressThreshold };

  for (const emp of employees) employeeMatches.push({ employee: emp, matches: [], risk_level: 'low', risk_reason: '', score: 0 });

  for (const c of contributions) {
    const cName = normalizeName(c.contributor_name);
    const cAddress = c.contributor_address.toLowerCase();
    const cCity = c.contributor_city.toLowerCase();
    const cZip = c.contributor_zip;

    // Try direct employee match
    employeeMatches.forEach(item => {
      const emp = item.employee;
      const nameScore = nameSimilarity(emp.full_name, cName);
      const addrScore = addressSimilarity(emp.home_address, cAddress);
      const cityMatch = emp.home_city.toLowerCase() === cCity;
      const zipMatch = emp.home_zip === cZip;
      const confidence = 0.7 * nameScore + 0.2 * addrScore + 0.05 * (cityMatch ? 1 : 0) + 0.05 * (zipMatch ? 1 : 0);
      const explanation = explainMatch(c.contributor_name, c.contributor_address, emp, nameScore, addrScore, cityMatch, zipMatch, "Direct", thresholds);
      if (nameScore > nameThreshold && addrScore > 0.7) {
        const matched: MatchedContribution = {
          contribution_id: c.id,
          contribution: c,
          employee_id: emp.id,
          employee_name: emp.full_name,
          employee_title: emp.title,
          match_type: 'Direct',
          confidence_score: +confidence.toFixed(3),
          name_similarity: +nameScore.toFixed(3),
          address_similarity: +addrScore.toFixed(3),
          city_match: cityMatch,
          zip_match: zipMatch,
          match_explanation: explanation,
          is_covered_associate: emp.is_covered_associate,
          is_solicitor: emp.is_solicitor,
          compliance_flags: [],
          actionable_insights: [],
        };
        if (matched.is_covered_associate)
          matched.compliance_flags.push('Covered Associate Contribution');
        if (matched.is_covered_associate)
          matched.actionable_insights.push('Review for pay-to-play rule violation: Employee is a Covered Associate.');
        if (matched.is_solicitor)
          matched.actionable_insights.push('Employee acts as a solicitor: Enhanced scrutiny recommended.');
        if (matched.confidence_score < 0.93)
          matched.actionable_insights.push('Low/Medium confidence match: Manual review recommended.');
        item.matches.push(matched);
      }
    });
    // Try spouse match
    employeeMatches.forEach(item => {
      const emp = item.employee;
      if (!emp.spouse_name) return;
      const spouseScore = nameSimilarity(emp.spouse_name, cName);
      const addrScore = addressSimilarity(emp.home_address, cAddress);
      const cityMatch = emp.home_city.toLowerCase() === cCity;
      const zipMatch = emp.home_zip === cZip;
      const confidence = 0.7 * spouseScore + 0.2 * addrScore + 0.05 * (cityMatch ? 1 : 0) + 0.05 * (zipMatch ? 1 : 0);
      const explanation = explainMatch(c.contributor_name, c.contributor_address, emp, spouseScore, addrScore, cityMatch, zipMatch, "Spouse", thresholds);
      if (spouseScore > 0.85 && addrScore > 0.7) {
        const matched: MatchedContribution = {
          contribution_id: c.id,
          contribution: c,
          employee_id: emp.id,
          employee_name: emp.full_name,
          employee_title: emp.title,
          match_type: 'Spouse',
          confidence_score: +confidence.toFixed(3),
          name_similarity: +spouseScore.toFixed(3),
          address_similarity: +addrScore.toFixed(3),
          city_match: cityMatch,
          zip_match: zipMatch,
          match_explanation: explanation,
          is_covered_associate: emp.is_covered_associate,
          is_solicitor: emp.is_solicitor,
          compliance_flags: [],
          actionable_insights: [],
        };
        if (matched.is_covered_associate)
          matched.compliance_flags.push('Covered Associate Contribution');
        if (matched.is_covered_associate)
          matched.actionable_insights.push('Review for pay-to-play rule violation: Employee is a Covered Associate.');
        if (matched.is_solicitor)
          matched.actionable_insights.push('Employee acts as a solicitor: Enhanced scrutiny recommended.');
        if (matched.confidence_score < 0.93)
          matched.actionable_insights.push('Low/Medium confidence match: Manual review recommended.');
        item.matches.push(matched);
      }
    });
  }

  // Assign risk and sort
  for (let item of employeeMatches) {
    let total = 0;
    let risk = 'low', riskReason = '';
    if (item.matches.length > 0) {
      // Find top risk
      const highest = item.matches.reduce((p, c) => (c.confidence_score > p.confidence_score ? c : p), item.matches[0]);
      if (highest.is_covered_associate && highest.confidence_score > 0.92) {
        risk = 'high';
        riskReason = 'Covered Associate with likely direct match contribution';
      } else if (highest.confidence_score > 0.92) {
        risk = 'medium';
        riskReason = 'Very strong but not covered associate';
      } else {
        risk = 'medium';
        riskReason = 'Medium confidence match or covered by spouse';
      }
      total =
        item.matches.reduce((sum, m) => sum + (m.is_covered_associate ? 30 : 5) + m.confidence_score * 10, 0) +
        item.matches.length * 3;
    }
    item.risk_level = risk as any;
    item.risk_reason = riskReason;
    item.score = total;
    // sort employee's matches by confidence descending
    item.matches.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  // Sort by number of matches and total score
  employeeMatches.sort((a, b) => b.matches.length - a.matches.length || b.score - a.score);

  return employeeMatches;
}