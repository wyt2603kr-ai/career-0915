import { useState } from "react";
import { useJobData, CoverLetter } from "@/hooks/use-job-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function CoverLetters() {
  const { data, addCoverLetter, updateCoverLetter, deleteCoverLetter } = useJobData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<CoverLetter>>({
    title: "", progress: 0, status: "시작 전"
  });

  if (!data) return null;

  const handleOpenDialog = (cl?: CoverLetter) => {
    if (cl) {
      setEditingId(cl.id);
      setForm(cl);
    } else {
      setEditingId(null);
      setForm({ title: "", progress: 0, status: "시작 전" });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    if (editingId) {
      updateCoverLetter({ ...form, id: editingId } as CoverLetter);
    } else {
      addCoverLetter({ ...form, id: crypto.randomUUID() } as CoverLetter);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">자기소개서 문항</h2>
          <p className="text-muted-foreground text-sm mt-1">자주 나오는 자소서 문항의 완성도를 관리하세요.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> 새 문항 등록
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.coverLetters.map(cl => (
          <Card key={cl.id} className="border-muted hover:shadow-sm transition-shadow">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${cl.progress === 100 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{cl.title}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(cl)}>수정</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => { if(window.confirm('삭제하시겠습니까?')) deleteCoverLetter(cl.id); }}>삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{cl.status}</span>
                  <span className={`font-bold ${cl.progress === 100 ? 'text-primary' : ''}`}>{cl.progress}%</span>
                </div>
                <Progress value={cl.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? '자소서 문항 수정' : '새 자소서 문항'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>문항 주제 / 타이틀</Label>
              <Input 
                value={form.title} 
                onChange={e => setForm(f => ({...f, title: e.target.value}))}
                placeholder="예: 지원 동기, 직무 역량 등"
              />
            </div>
            <div className="space-y-2">
              <Label>상태 텍스트</Label>
              <Input 
                value={form.status} 
                onChange={e => setForm(f => ({...f, status: e.target.value}))}
                placeholder="예: 초안 작성 중, 피드백 반영, 완성 등"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>완성도 (%)</Label>
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
            <Button onClick={handleSave} disabled={!form.title}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
