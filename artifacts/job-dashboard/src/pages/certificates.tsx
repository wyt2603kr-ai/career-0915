import { useState } from "react";
import { useJobData, Certificate } from "@/hooks/use-job-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Award, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Certificates() {
  const { data, addCertificate, updateCertificate, deleteCertificate } = useJobData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<Certificate>>({
    name: "", progress: 0, status: "", examDate: ""
  });

  if (!data) return null;

  const handleOpenDialog = (cert?: Certificate) => {
    if (cert) {
      setEditingId(cert.id);
      setForm(cert);
    } else {
      setEditingId(null);
      setForm({ name: "", progress: 0, status: "준비 중", examDate: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editingId) {
      updateCertificate({ ...form, id: editingId } as Certificate);
    } else {
      addCertificate({ ...form, id: crypto.randomUUID() } as Certificate);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">자격증 / 어학</h2>
          <p className="text-muted-foreground text-sm mt-1">취득 목표인 자격증의 진행률과 시험일을 관리하세요.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> 새 자격증
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.certificates.map(cert => (
          <Card key={cert.id} className="border-muted hover:shadow-sm transition-shadow">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${cert.progress === 100 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-muted text-muted-foreground'}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{cert.name}</h3>
                    <span className="text-sm text-muted-foreground">{cert.status}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(cert)}>수정</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => { if(window.confirm('삭제하시겠습니까?')) deleteCertificate(cert.id); }}>삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {cert.examDate && (
                <div className="bg-muted/40 p-2.5 rounded-md flex items-center gap-2 text-sm text-foreground">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">시험일:</span>
                  <span>{cert.examDate}</span>
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">학습 진행도</span>
                  <span>{cert.progress}%</span>
                </div>
                <Progress value={cert.progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? '자격증 수정' : '새 자격증'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>자격증/어학명</Label>
              <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>상태 (예: 시험 예정, 합격자 발표 대기 등)</Label>
              <Input value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>시험일 (선택)</Label>
              <Input type="date" value={form.examDate || ''} onChange={e => setForm(f => ({...f, examDate: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>진행도 (%)</Label>
                <span className="text-xs font-bold text-primary">{form.progress}%</span>
              </div>
              <input 
                type="range" min="0" max="100" step="5"
                value={form.progress}
                onChange={e => setForm(f => ({...f, progress: parseInt(e.target.value)}))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={!form.name}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
