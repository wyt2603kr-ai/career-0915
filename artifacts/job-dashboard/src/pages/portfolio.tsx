import { useState } from "react";
import { useJobData, Portfolio } from "@/hooks/use-job-data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, FolderGit2, ExternalLink, Github } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function PortfolioPage() {
  const { data, addPortfolio, updatePortfolio, deletePortfolio } = useJobData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState<Partial<Portfolio>>({
    title: "", description: "", progress: 0, techStack: [], githubUrl: "", demoUrl: "", status: "진행 중"
  });
  const [techInput, setTechInput] = useState("");

  if (!data) return null;

  const handleOpenDialog = (port?: Portfolio) => {
    if (port) {
      setEditingId(port.id);
      setForm(port);
      setTechInput(port.techStack.join(", "));
    } else {
      setEditingId(null);
      setForm({ title: "", description: "", progress: 0, techStack: [], githubUrl: "", demoUrl: "", status: "진행 중" });
      setTechInput("");
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    const techStack = techInput.split(",").map(t => t.trim()).filter(Boolean);
    const updatedForm = { ...form, techStack };
    
    if (editingId) {
      updatePortfolio({ ...updatedForm, id: editingId } as Portfolio);
    } else {
      addPortfolio({ ...updatedForm, id: crypto.randomUUID() } as Portfolio);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">포트폴리오 프로젝트</h2>
          <p className="text-muted-foreground text-sm mt-1">직무 역량을 증명할 프로젝트를 기획하고 완성도를 관리하세요.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> 새 프로젝트
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {data.portfolio.map(port => (
          <Card key={port.id} className="border-muted hover:shadow-md transition-all duration-200 flex flex-col">
            <CardContent className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{port.title}</h3>
                    <span className="text-sm font-medium text-muted-foreground">{port.status}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(port)}>수정</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => { if(window.confirm('삭제하시겠습니까?')) deletePortfolio(port.id); }}>삭제</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-foreground/80 line-clamp-2">
                {port.description}
              </p>

              {port.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {port.techStack.map((tech, idx) => (
                    <span key={idx} className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">완성도</span>
                  <span>{port.progress}%</span>
                </div>
                <Progress value={port.progress} className="h-1.5" />
              </div>
            </CardContent>
            
            {(port.githubUrl || port.demoUrl) && (
              <CardFooter className="bg-muted/30 px-6 py-3 border-t flex gap-3">
                {port.githubUrl && (
                  <a href={port.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors">
                    <Github className="w-3.5 h-3.5" /> Repository
                  </a>
                )}
                {port.demoUrl && (
                  <a href={port.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Demo
                  </a>
                )}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? '프로젝트 수정' : '새 프로젝트'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>프로젝트명 *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>간단한 설명</Label>
              <Textarea 
                value={form.description} 
                onChange={e => setForm(f => ({...f, description: e.target.value}))} 
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>기술 스택 (쉼표로 구분)</Label>
              <Input 
                value={techInput} 
                onChange={e => setTechInput(e.target.value)} 
                placeholder="예: React, TypeScript, Tailwind"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input value={form.githubUrl} onChange={e => setForm(f => ({...f, githubUrl: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>Demo URL</Label>
                <Input value={form.demoUrl} onChange={e => setForm(f => ({...f, demoUrl: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>상태 텍스트</Label>
              <Input value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} placeholder="예: 기획 중, 개발 중, 리팩토링 중" />
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
