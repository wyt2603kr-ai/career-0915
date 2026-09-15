import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Data Contract
export const GoalSchema = z.object({
  title: z.string().default(''),
  position: z.string().default(''),
  targetDate: z.string().default(''),
});
export type Goal = z.infer<typeof GoalSchema>;

export const CompanyStatusEnum = z.enum(['preparing', 'submitted', 'passed', 'rejected']);
export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  deadline: z.string(),
  status: CompanyStatusEnum,
  coverLetterProgress: z.number().min(0).max(100),
  interviewDate: z.string().optional(),
});
export type Company = z.infer<typeof CompanySchema>;

export const TaskPriorityEnum = z.enum(['high', 'medium', 'low']);
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  priority: TaskPriorityEnum,
});
export type Task = z.infer<typeof TaskSchema>;

export const InterviewSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  position: z.string(),
  date: z.string(),
  time: z.string(),
  type: z.string(),
  location: z.string(),
  memo: z.string(),
});
export type Interview = z.infer<typeof InterviewSchema>;

export const CoverLetterSchema = z.object({
  id: z.string(),
  title: z.string(),
  progress: z.number().min(0).max(100),
  status: z.string(),
});
export type CoverLetter = z.infer<typeof CoverLetterSchema>;

export const CertificateSchema = z.object({
  id: z.string(),
  name: z.string(),
  progress: z.number().min(0).max(100),
  status: z.string(),
  examDate: z.string().optional(),
});
export type Certificate = z.infer<typeof CertificateSchema>;

export const PortfolioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  progress: z.number().min(0).max(100),
  techStack: z.array(z.string()),
  githubUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  status: z.string(),
});
export type Portfolio = z.infer<typeof PortfolioSchema>;

export const DashboardDataSchema = z.object({
  goal: GoalSchema,
  companies: z.array(CompanySchema),
  tasks: z.array(TaskSchema),
  interviews: z.array(InterviewSchema),
  coverLetters: z.array(CoverLetterSchema),
  certificates: z.array(CertificateSchema),
  portfolio: z.array(PortfolioSchema),
});
export type DashboardData = z.infer<typeof DashboardDataSchema>;

const SEED_DATA: DashboardData = {
  goal: {
    title: '2026 상반기 IT 직무 취업',
    position: '데이터 분석가',
    targetDate: '2026-12-10',
  },
  companies: [
    {
      id: 'demo-1',
      name: 'NAVER',
      position: '데이터 분석가',
      deadline: '2026-10-05',
      status: 'submitted',
      coverLetterProgress: 75,
      interviewDate: '2026-10-12 14:00',
    },
    {
      id: 'demo-2',
      name: '삼성전자',
      position: '데이터 분석',
      deadline: '2026-11-01',
      status: 'passed',
      coverLetterProgress: 100,
    },
    {
      id: 'demo-3',
      name: '카카오',
      position: 'Data Analyst',
      deadline: '2026-11-15',
      status: 'preparing',
      coverLetterProgress: 30,
    },
  ],
  tasks: [
    { id: 't1', title: 'NAVER 자소서 수정', completed: true, priority: 'high' },
    { id: 't2', title: 'SQL 문제 30개', completed: true, priority: 'medium' },
    { id: 't3', title: 'Portfolio README 작성', completed: false, priority: 'high' },
    { id: 't4', title: '삼성전자 지원서 작성', completed: false, priority: 'low' },
  ],
  interviews: [
    {
      id: 'i1',
      companyName: 'NAVER',
      position: '데이터 분석가',
      date: '2026-10-12',
      time: '14:00',
      type: '기술 면접',
      location: '온라인 (Zoom)',
      memo: 'SQL 및 Portfolio Deep-Dive 준비',
    }
  ],
  coverLetters: [
    { id: 'cl1', title: '지원 동기', progress: 100, status: '완료' },
    { id: 'cl2', title: '직무 역량', progress: 75, status: '진행 중' },
    { id: 'cl3', title: '협업 경험', progress: 25, status: '진행 중' },
    { id: 'cl4', title: '입사 후 포부', progress: 0, status: '시작 전' },
  ],
  certificates: [
    { id: 'cert1', name: 'SQLD', progress: 100, status: '취득 완료' },
    { id: 'cert2', name: 'ADsP', progress: 50, status: '시험 예정', examDate: '2026-11-20' },
  ],
  portfolio: [
    {
      id: 'p1',
      title: '데이터 분석 프로젝트',
      description: '이커머스 이탈률 분석 및 Predictive Model 구축',
      progress: 80,
      techStack: ['Python', 'Pandas', 'SQL'],
      githubUrl: 'https://github.com',
      demoUrl: 'https://demo.com',
      status: '진행 중',
    }
  ]
};

const STORAGE_KEY = 'jobDashboardData';

export function useJobData() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Seed data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        setData(SEED_DATA);
      } else {
        const parsed = JSON.parse(raw);
        const validated = DashboardDataSchema.safeParse(parsed);
        if (validated.success) {
          setData(validated.data);
          setError(null);
        } else {
          console.error("Data validation failed:", validated.error);
          // If totally invalid, we might want to backup and reset, but for now we'll just show error
          setError("데이터가 손상되었습니다. 복구가 필요합니다.");
          setData(SEED_DATA); // fallback for UI to not crash entirely, though we won't persist it automatically unless explicitly done
        }
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadData]);

  const updateData = useCallback((updater: (prev: DashboardData) => DashboardData) => {
    setData((prev) => {
      if (!prev) return prev;
      try {
        const next = updater(prev);
        // validate before saving to prevent corrupting
        DashboardDataSchema.parse(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      } catch (e) {
        console.error("Failed to update data", e);
        toast({
          variant: "destructive",
          title: "저장 실패",
          description: "데이터 형식이 잘못되었습니다.",
        });
        return prev;
      }
    });
  }, [toast]);

  // Goal functions
  const updateGoal = (goal: Goal) => updateData(d => ({ ...d, goal }));

  // Generic collection updaters
  const addCompany = (company: Company) => updateData(d => ({ ...d, companies: [...d.companies, company] }));
  const updateCompany = (company: Company) => updateData(d => ({ ...d, companies: d.companies.map(c => c.id === company.id ? company : c) }));
  const deleteCompany = (id: string) => updateData(d => ({ ...d, companies: d.companies.filter(c => c.id !== id) }));

  const addTask = (task: Task) => updateData(d => ({ ...d, tasks: [...d.tasks, task] }));
  const updateTask = (task: Task) => updateData(d => ({ ...d, tasks: d.tasks.map(t => t.id === task.id ? task : t) }));
  const deleteTask = (id: string) => updateData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  const toggleTask = (id: string) => updateData(d => ({
    ...d, 
    tasks: d.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
  }));

  const addInterview = (interview: Interview) => updateData(d => ({ ...d, interviews: [...d.interviews, interview] }));
  const updateInterview = (interview: Interview) => updateData(d => ({ ...d, interviews: d.interviews.map(i => i.id === interview.id ? interview : i) }));
  const deleteInterview = (id: string) => updateData(d => ({ ...d, interviews: d.interviews.filter(i => i.id !== id) }));

  const addCoverLetter = (cl: CoverLetter) => updateData(d => ({ ...d, coverLetters: [...d.coverLetters, cl] }));
  const updateCoverLetter = (cl: CoverLetter) => updateData(d => ({ ...d, coverLetters: d.coverLetters.map(c => c.id === cl.id ? cl : c) }));
  const deleteCoverLetter = (id: string) => updateData(d => ({ ...d, coverLetters: d.coverLetters.filter(c => c.id !== id) }));

  const addCertificate = (cert: Certificate) => updateData(d => ({ ...d, certificates: [...d.certificates, cert] }));
  const updateCertificate = (cert: Certificate) => updateData(d => ({ ...d, certificates: d.certificates.map(c => c.id === cert.id ? cert : c) }));
  const deleteCertificate = (id: string) => updateData(d => ({ ...d, certificates: d.certificates.filter(c => c.id !== id) }));

  const addPortfolio = (port: Portfolio) => updateData(d => ({ ...d, portfolio: [...d.portfolio, port] }));
  const updatePortfolio = (port: Portfolio) => updateData(d => ({ ...d, portfolio: d.portfolio.map(p => p.id === port.id ? port : p) }));
  const deletePortfolio = (id: string) => updateData(d => ({ ...d, portfolio: d.portfolio.filter(p => p.id !== id) }));

  return {
    data,
    loading,
    error,
    updateGoal,
    addCompany, updateCompany, deleteCompany,
    addTask, updateTask, deleteTask, toggleTask,
    addInterview, updateInterview, deleteInterview,
    addCoverLetter, updateCoverLetter, deleteCoverLetter,
    addCertificate, updateCertificate, deleteCertificate,
    addPortfolio, updatePortfolio, deletePortfolio,
  };
}
