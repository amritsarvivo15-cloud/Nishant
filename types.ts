
export interface Experience {
  position: string;
  organization: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  domain: string;
}

export interface Publication {
  authors: string;
  year: number;
  title: string;
  journal: string;
}

export interface Education {
  degree: string;
  institution: string;
  details?: string;
  status?: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
  proficiency: number; // Percentage 0-100
}
