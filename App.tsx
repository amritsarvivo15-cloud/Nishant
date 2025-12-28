
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dna, 
  Microscope, 
  BookOpen, 
  Award, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  FlaskConical, 
  Scale, 
  User, 
  Globe,
  Binary,
  GraduationCap,
  ScrollText,
  FileSearch,
  Users,
  Zap
} from 'lucide-react';
import { experiences, publications, education, skillGroups, honors } from './data';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-amber-600 p-1.5 rounded-lg">
            <FlaskConical className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block uppercase">DR. SURAJ KATARIA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-wider text-slate-600">
          <a href="#about" className="hover:text-amber-600 transition-colors">About</a>
          <a href="#experience" className="hover:text-amber-600 transition-colors">Experience</a>
          <a href="#research" className="hover:text-amber-600 transition-colors">Research</a>
          <a href="#skills" className="hover:text-amber-600 transition-colors">Skills</a>
          <a href="#contact" className="hover:text-amber-600 transition-colors px-4 py-2 bg-slate-900 text-white rounded-full">Connect</a>
        </div>
      </div>
    </nav>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-12">
    <h2 className="text-4xl font-bold text-slate-900 mb-2">{title}</h2>
    {subtitle && <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-sm">{subtitle}</p>}
    <div className="w-20 h-1 bg-amber-600 mt-4"></div>
  </div>
);

const SkillProgressBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => {
  const [width, setWidth] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setWidth(percentage);
        }
      },
      { threshold: 0.1 }
    );

    if (barRef.current) observer.observe(barRef.current);
    return () => observer.disconnect();
  }, [percentage]);

  return (
    <div className="mb-6" ref={barRef}>
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold uppercase tracking-widest text-slate-300">{label}</span>
        <span className="text-xs font-mono text-amber-500">{width}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.3)]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

const InteractiveSkillTag: React.FC<{ skill: string, index: number, isVisible: boolean }> = ({ skill, index, isVisible }) => {
  return (
    <div
      style={{ 
        transitionDelay: `${isVisible ? index * 45 : 0}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
      }}
      className="transition-all duration-700 ease-out"
    >
      <span 
        className={`
          inline-block px-5 py-2.5 rounded-xl text-sm font-medium border cursor-default
          transition-all duration-300 ease-in-out
          bg-white/5 border-white/10 text-slate-300
          hover:scale-105 hover:border-amber-500 hover:text-amber-400 hover:bg-amber-500/10 
          hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]
        `}
      >
        {skill}
      </span>
    </div>
  );
};

const App: React.FC = () => {
  const [skillsVisible, setSkillsVisible] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSkillsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (skillsRef.current) observer.observe(skillsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 dna-bg opacity-30 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold mb-6">
              <Award className="w-4 h-4" /> Gold Medalist Researcher
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 leading-[1.1] mb-8">
              Dr. Suraj Kataria, <span className="text-amber-600">Ph.D.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-10">
              Advancing Forensic Science through Research, Education, and Innovation. Specializing in Forensic Biology, DNA Analysis, and Human Identification.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                Get in Touch
              </a>
              <a href="#research" className="px-8 py-4 border-2 border-slate-200 bg-white text-slate-900 rounded-xl font-bold hover:border-amber-600 hover:text-amber-600 transition-all">
                View Research
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Mission & Expertise */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20">
            <div>
              <SectionHeader title="Professional Mission" subtitle="Our Vision" />
              <p className="text-xl text-slate-600 leading-relaxed italic">
                "To contribute to the advancement of forensic science education and research through innovative teaching methodologies and a strong commitment to interdisciplinary and applied learning."
              </p>
              
              <div className="mt-12 space-y-8">
                <div className="flex gap-4 p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-amber-200 transition-all group">
                  <div className="shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <GraduationCap className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Academic Mentorship</h4>
                    <p className="text-slate-600">Shaping the next generation of forensic experts at National Forensic Sciences University.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-amber-200 transition-all group">
                  <div className="shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Binary className="text-amber-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Pioneering Research</h4>
                    <p className="text-slate-600">Expertise in DNA Phenotyping (FDP) and Human Externally Visible Characteristics (EVCs).</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader title="Core Expertise" subtitle="Technical Proficiency" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <Dna />, label: "Forensic DNA Analysis" },
                  { icon: <User />, label: "Human Identification" },
                  { icon: <Microscope />, label: "Forensic Biology" },
                  { icon: <Scale />, label: "Criminal Justice" },
                  { icon: <BookOpen />, label: "Odontology" },
                  { icon: <ScrollText />, label: "Questioned Documents" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all">
                    <div className="text-amber-600 shrink-0">{item.icon}</div>
                    <span className="font-semibold text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-bold mb-4">Current Focus</h3>
                <p className="text-slate-300 leading-relaxed mb-6">
                  Assistant Professor at NFSU Delhi, specializing in Forensic Biology and Biotechnology. Advancing research in DNA Methylation based age and phenotype prediction.
                </p>
                <div className="flex items-center gap-2 text-amber-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Active in Research & Education
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section id="experience" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Career Trajectory" subtitle="Professional Journey" />
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-12">
            {experiences.map((exp, idx) => (
              <div key={idx} className="relative pl-12">
                <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-white ${idx === 0 ? 'bg-amber-600 ring-4 ring-amber-100' : 'bg-slate-400'}`}></div>
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                    <span className="text-amber-600 font-bold tracking-widest text-sm uppercase">{exp.startDate} — {exp.endDate}</span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{exp.domain}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{exp.position}</h3>
                  <p className="text-lg text-slate-600 font-medium mb-4">{exp.organization}</p>
                  <p className="text-slate-500 leading-relaxed">{exp.responsibilities}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Publications */}
      <section id="research" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <SectionHeader title="Research Impact" subtitle="Publications & Thesis" />
                <div className="bg-amber-600 text-white p-8 rounded-3xl shadow-xl shadow-amber-100 mb-8">
                  <h4 className="text-xl font-bold mb-4 uppercase tracking-tighter">Doctoral Focus</h4>
                  <p className="text-sm text-amber-100 font-medium mb-6 uppercase tracking-widest">Pillar I: Forensic Genetics</p>
                  <h3 className="text-2xl font-bold leading-snug mb-6">
                    "Association and Prediction of Human Externally Visible Characteristics (EVCs) using Single Nucleotide Polymorphisms (SNPs)"
                  </h3>
                  <p className="text-amber-50 italic">
                    Ph.D. in Forensic Genetics and Anthropology, Feb 2025.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <FlaskConical className="text-amber-600 shrink-0" />
                    <span className="text-sm font-semibold">ICMR Funded Projects</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <Dna className="text-amber-600 shrink-0" />
                    <span className="text-sm font-semibold">DST-INSPIRE Collaboration</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="text-amber-600" /> Selected Publications
              </h3>
              {publications.map((pub, idx) => (
                <div key={idx} className="group p-8 rounded-2xl border border-slate-100 hover:border-amber-200 bg-white hover:bg-slate-50/50 transition-all flex gap-6">
                  <div className="hidden sm:flex shrink-0 w-16 h-16 bg-slate-100 rounded-2xl items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <FileSearch className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold">{pub.year}</span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{pub.journal}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-amber-700 transition-colors">
                      {pub.title}
                    </h4>
                    <p className="text-slate-500 font-medium">{pub.authors}</p>
                  </div>
                </div>
              ))}
              
              <div className="mt-16 pt-16 border-t border-slate-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Globe className="text-amber-600" /> Global Speaking Engagements
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                   {[
                     { title: "Expanding the DNA Toolkit", host: "University of the Cordilleras, Philippines", date: "June 2025" },
                     { title: "Unearthing the Invisible", host: "Galgotias University, Greater Noida", date: "Invited Speaker" },
                     { title: "Psychopathy and Victim Abuse", host: "CASE 23", date: "Guest Speaker" }
                   ].map((talk, idx) => (
                     <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold mb-2 leading-tight">{talk.title}</h4>
                        <p className="text-sm text-slate-500 mb-1">{talk.host}</p>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-tighter">{talk.date}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Skills Section */}
      <section id="skills" ref={skillsRef} className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full dna-bg opacity-5 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <div>
              <SectionHeader title="Technical Skillset" subtitle="Laboratory & Analysis" />
              <div className="mt-16 space-y-12">
                {skillGroups.map((group, idx) => (
                  <SkillProgressBar key={idx} label={group.category} percentage={group.proficiency} />
                ))}
              </div>
              
              <div className="mt-16 p-8 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Interdisciplinary Expert</h4>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Mastery across molecular genetics, forensic pathology, and computational statistics enables comprehensive investigation strategies and academic leadership.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-12">
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <Microscope className="text-amber-500" /> Interactive Skill Cloud
                </h3>
                <p className="text-slate-400 text-sm">Experience our specialized methodology stack. Hover to focus, scroll to animate.</p>
              </div>
              
              <div className="flex flex-wrap gap-4 md:gap-5">
                {skillGroups.flatMap(group => group.skills).map((skill, idx) => (
                  <InteractiveSkillTag key={idx} index={idx} skill={skill} isVisible={skillsVisible} />
                ))}
              </div>

              <div className="mt-20">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <GraduationCap className="text-amber-500" /> Academic Foundation
                </h3>
                <div className="space-y-6">
                  {education.map((edu, idx) => (
                    <div key={idx} className="flex gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 group hover:bg-white/10 hover:border-amber-500/30 transition-all">
                      <div className="shrink-0 w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1 leading-snug">{edu.degree}</h4>
                        <p className="text-slate-400 font-medium text-sm">{edu.institution}</p>
                        <div className="mt-3 flex items-center gap-3">
                          {edu.details && <span className="text-xs bg-amber-600/20 text-amber-400 px-2 py-1 rounded font-bold">{edu.details}</span>}
                          {edu.status && <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded font-bold">{edu.status}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect & Contact */}
      <section id="contact" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-50 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-12 lg:p-20">
              <SectionHeader title="Connect & Collaborate" subtitle="Let's Talk Science" />
              <p className="text-lg text-slate-600 leading-relaxed mb-12">
                Open for academic collaborations, research opportunities, and professional inquiries in the field of Forensic Science and Genetics.
              </p>
              
              <div className="space-y-8">
                <a href="mailto:katariasuraj.sk@gmail.com" className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                    <span className="text-lg font-bold text-slate-900">katariasuraj.sk@gmail.com</span>
                  </div>
                </a>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Phone className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</span>
                    <span className="text-lg font-bold text-slate-900">+91 7053500467</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <MapPin className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</span>
                    <span className="text-lg font-bold text-slate-900">Delhi, India</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-200 flex items-center gap-6">
                 <span className="text-sm font-bold text-slate-400 uppercase">Languages:</span>
                 <div className="flex gap-4">
                   <span className="text-sm font-bold">English</span>
                   <span className="text-sm font-bold">Hindi</span>
                   <span className="text-sm font-bold">German</span>
                 </div>
              </div>
            </div>

            <div className="lg:w-1/2 bg-slate-900 p-12 lg:p-20 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-10 flex items-center gap-2">
                  <Users className="text-amber-500" /> Professional References
                </h3>
                <div className="space-y-12">
                  <div>
                    <h4 className="text-xl font-bold text-amber-500 underline decoration-amber-500/30 underline-offset-4">Professor of Practice</h4>
                    <p className="text-slate-300 mb-2">NFSU Delhi Campus</p>
                    <a href="mailto:mc.joshi@nfsu.ac.in" className="text-white font-medium block hover:text-amber-500 transition-colors">mc.joshi@nfsu.ac.in</a>
                    <p className="text-slate-500 text-sm mt-1">+91 9418612939</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-amber-500 underline decoration-amber-500/30 underline-offset-4">Professor</h4>
                    <p className="text-slate-300 mb-2">NFSU Delhi Campus</p>
                    <a href="mailto:rajendra.sarin@nfsu.ac.in" className="text-white font-medium block hover:text-amber-500 transition-colors">rajendra.sarin@nfsu.ac.in</a>
                    <p className="text-slate-500 text-sm mt-1">+91 9868160408</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-20">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                   <h4 className="font-bold text-amber-500 mb-2 uppercase tracking-tighter">Affiliations</h4>
                   <p className="text-sm text-slate-400 italic">
                     Life Member, Indian National Confederation and Academy of Anthropologists (INCAA)
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <FlaskConical className="text-amber-600 w-5 h-5" />
            <span className="font-bold text-slate-900">DR. SURAJ KATARIA, PH.D.</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Dr. Suraj Kataria. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#about" className="hover:text-amber-600 transition-colors">About</a>
            <a href="#research" className="hover:text-amber-600 transition-colors">Research</a>
            <a href="#contact" className="hover:text-amber-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
