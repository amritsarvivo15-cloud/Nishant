
import { Experience, Publication, Education, SkillGroup } from './types';

export const experiences: Experience[] = [
  {
    position: "Assistant Professor",
    organization: "National Forensic Sciences University, LNJN NICFS, Delhi Campus",
    startDate: "October 2024",
    endDate: "Present",
    responsibilities: "Teaching Forensic Biology and Biotechnology at the School of Forensic Sciences.",
    domain: "Forensic Biology and Biotechnology"
  },
  {
    position: "Assistant Professor",
    organization: "K R Mangalam University, Gurugram",
    startDate: "August 2024",
    // Fix: Changed 'October' to 'endDate' to match the Experience interface definition
    endDate: "October 2024",
    responsibilities: "Academic teaching at the Department of Forensic Science, School of Basic and Applied Sciences.",
    domain: "Forensic Science"
  },
  {
    position: "Project Research Scientist - I",
    organization: "Indian Council of Medical Research (ICMR)",
    startDate: "October 2023",
    endDate: "April 2024",
    responsibilities: "Conducted a study on Thalassemia Awareness, Screening, and Counselling among Young Adults of Delhi and NCR.",
    domain: "Public Health and Human Genetics"
  },
  {
    position: "Ph.D. Researcher",
    organization: "Forensic Genetics and Anthropology",
    startDate: "January 2021",
    endDate: "February 2025",
    responsibilities: "Research on the association and prediction of Human Externally Visible Characteristics (EVCs) using Single Nucleotide Polymorphisms (SNPs).",
    domain: "Forensic Genetics and Anthropology"
  },
  {
    position: "Research Assistant",
    organization: "DST-INSPIRE Funded project",
    startDate: "June 2022",
    endDate: "November 2022",
    responsibilities: "Conducted research on DNA Methylation based age and phenotype prediction.",
    domain: "Forensic Epigenetics"
  },
  {
    position: "Laboratory Assistant",
    organization: "DST - CSRI funded project",
    startDate: "February 2019",
    endDate: "February 2019",
    responsibilities: "Conducted research on Genetic and Epigenetic Mechanisms of the Homocysteine Metabolic Pathway in cognitive impairment.",
    domain: "Genetics and Cognitive Science"
  }
];

export const publications: Publication[] = [
  {
    authors: "Kataria, S.",
    year: 2025,
    title: "Illegal human hair trafficking in India: a dark side of a global industry",
    journal: "Trends in Organised Crime, 1-9"
  },
  {
    authors: "Kataria, S., et al.",
    year: 2024,
    title: "From teeth to ethnicity: A neural network approach to predicting population of origin through dental traits and anomalies",
    journal: "Journal of Oral and Maxillofacial Pathology"
  },
  {
    authors: "Kataria, S., et al.",
    year: 2023,
    title: "Investigating the morphology and genetics of scalp and facial hair characteristics for phenotype prediction",
    journal: "Science & Justice"
  },
  {
    authors: "Garg, P. R., & Kataria, S.",
    year: 2023,
    title: "Genetics in Public Health: Advances, Implications, and Ethical Considerations",
    journal: "Book Chapter in Genes, Health and Anthropology"
  }
];

export const education: Education[] = [
  {
    degree: "Ph.D., Forensic Genetics and Anthropology",
    institution: "University of Delhi",
    status: "Feb 2025 Completion"
  },
  {
    degree: "M.Sc. Forensic Science",
    institution: "University of Delhi",
    details: "Gold Medalist, 78.17%"
  },
  {
    degree: "B.Sc. (Hons.) Forensic Science",
    institution: "Amity University, Noida",
    details: "Gold Medalist, CGPA 9.33/10"
  },
  {
    degree: "B.Sc. Multidisciplinary",
    institution: "Zoology, Botany, and Geology Major",
    status: "Pursuing"
  }
];

export const skillGroups: SkillGroup[] = [
  {
    category: "Genetic Analysis",
    skills: ["Multiplex PCR", "RT-PCR", "DNA Sequencing (Sanger)", "Genotyping (IPlex Tech)"],
    proficiency: 95
  },
  {
    category: "Immunoassays",
    skills: ["ELISA", "RIA", "SDS-PAGE"],
    proficiency: 88
  },
  {
    category: "Spectrometry & Chromatography",
    skills: ["TLC", "HPLC-MS", "GC-MS", "UV & IR Spectrophotometry"],
    proficiency: 82
  },
  {
    category: "Software & Statistical",
    skills: ["SPSS", "R", "MATLAB", "AutoAssembler", "Bioedit", "ClustalW"],
    proficiency: 90
  }
];

export const honors = [
  "Gold Medalist - M.Sc. Forensic Science, University of Delhi (2019)",
  "Gold Medalist - B.Sc. (Hons.) Forensic Science, Amity University (2017)",
  "Qualified: Forensic Aptitude and Calibre Plus (FACT+) 2024",
  "Awarded: Best Poster Award, International Forensic Forum - 2023 (IFF-2023)",
  "Awarded: 'Lalji Singh Travel Award,' 23rd-ADNAT Conference",
  "Qualified: UGC-NET in Forensic Science (Nov 2020)",
  "Multiple Meritorious Student Awards",
  "Multiple Certificates of Leadership"
];
