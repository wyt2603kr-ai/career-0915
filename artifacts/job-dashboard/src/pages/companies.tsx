import { useState } from "react";
import { useJobData, Company, CompanyStatusEnum } from "@/hooks/use-job-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Building2, Calendar, MoreVertical, Trash2, Edit } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const STATUS_MAP = {
  preparing: { label: "준비 중", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200" },
  submitted: { label: "지원 완료", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200" },
  passed: { label: "서류 합격", color: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200" },
  rejected: { label: "불합격", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200" }
};

export function Companies() {
  const { data, addCompany, updateCompany, deleteCompany } = useJobData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<Company>>({
    name: "", position: "", deadline: "", status: "preparing", coverLetterProgress: 0, interviewDate: ""
  });

  if (!data) return null;

  const filteredCompanies = data.companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.position.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
  });

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingId(company.id);
      setForm(company);
    } else {
      setEditingId(null);
      setForm({ name: "", position: "", deadline: "", status: "preparing", coverLetterProgress: 0, interviewDate: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.deadline || !form.position) return; // basic validation
    
    if (editingId) {
      updateCompany({ ...form, id: editingId } as Company);
    } else {
      addCompany({ ...form, id: crypto.randomUUID() } as Company);
    }
    setDialogOpen(false);
  };

  const today = new Date();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">지원 기업</h2>
          <p className="text-muted-foreground text-sm mt-1">목표 기업의 지원 일정과 상태를 관리하세요.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> 새 기업 등록
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="기업명 또는 직무 검색..." 
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-muted/50 border-none">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="preparing">준비 중</SelectItem>
            <SelectItem value="submitted">지원 완료</SelectItem>
            <SelectItem value="passed">서류 합격</SelectItem>
            <SelectItem value="rejected">불합격</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map(company => {
          const daysLeft = differenceInDays(parseISO(company.deadline), today);
          const statusConfig = STATUS_MAP[company.status];
          
          return (
            <Card key={company.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border-muted">
              <CardContent className="p-0">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg leading-tight">{company.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig.color} font-medium`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {company.position}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleOpenDialog(company)}>
                          <Edit className="w-4 h-4 mr-2" /> 수정
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(company.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 space-y-2 border border-muted/50">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>마감일</span>
                      </div>
                      <div className="font-semibold text-right flex items-center gap-2">
                        <span>{company.deadline}</span>
                        {company.status === 'preparing' && (
                           <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                             D{daysLeft > 0 ? `-${daysLeft}` : daysLeft === 0 ? '-Day' : `+${Math.abs(daysLeft)}`}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">자소서 완성도</span>
                      <span>{company.coverLetterProgress}%</span>
                    </div>
                    <Progress value={company.coverLetterProgress} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredCompanies.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
            해당하는 기업이 없습니다.
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? '지원 기업 수정' : '새 기업 등록'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>기업명</Label>
              <Input 
                value={form.name} 
                onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="예: 네이버"
              />
            </div>
            <div className="space-y-2">
              <Label>지원 직무</Label>
              <Input 
                value={form.position} 
                onChange={e => setForm(f => ({...f, position: e.target.value}))}
                placeholder="예: 프론트엔드 개발자"
              />
            </div>
            <div className="space-y-2">
              <Label>서류 마감일</Label>
              <Input 
                type="date"
                value={form.deadline} 
                onChange={e => setForm(f => ({...f, deadline: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>진행 상태</Label>
              <Select 
                value={form.status} 
                onValueChange={(v) => setForm(f => ({...f, status: v as Company["status"]}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparing">준비 중</SelectItem>
                  <SelectItem value="submitted">지원 완료</SelectItem>
                  <SelectItem value="passed">서류 합격</SelectItem>
                  <SelectItem value="rejected">불합격</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>자소서 완성도 (%)</Label>
                <span className="text-xs font-bold text-primary">{form.coverLetterProgress}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" step="5"
                value={form.coverLetterProgress}
                onChange={e => setForm(f => ({...f, coverLetterProgress: parseInt(e.target.value)}))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.position || !form.deadline}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 지원 기업 정보가 완전히 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if(deleteId) deleteCompany(deleteId); setDeleteId(null); }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
