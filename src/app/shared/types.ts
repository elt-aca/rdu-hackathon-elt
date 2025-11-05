export interface Contribution {
  id: string;
  contributor_name: string;
  contributor_address: string;
  contributor_city: string;
  contributor_state: string;
  contributor_zip: string;
  employer: string;
  occupation: string;
  contribution_amount: number;
  contribution_date: string;
  recipient_name: string;
  recipient_office: string;
  recipient_state: string;
  election_year: number;
  election_type: string;
}

export interface Employee {
  id: string;
  full_name: string;
  title: string;
  home_address: string;
  home_city: string;
  home_state: string;
  home_zip: string;
  is_covered_associate: boolean;
  is_solicitor: boolean;
  hire_date: string;
  spouse_name: string | null;
}

// Matching output structure
export interface MatchedContribution {
  contribution_id: string;
  contribution: Contribution;
  employee_id: string;
  employee_name: string;
  employee_title: string;
  match_type: string;
  confidence_score: number;
  name_similarity: number;
  address_similarity: number;
  city_match: boolean;
  zip_match: boolean;
  match_explanation: string[];
  is_covered_associate: boolean;
  is_solicitor: boolean;
  compliance_flags: string[];
  actionable_insights: string[];
}

export interface EmployeeMatches {
  employee: Employee;
  matches: MatchedContribution[];
  risk_level: 'low' | 'medium' | 'high';
  risk_reason: string;
  score: number;
}