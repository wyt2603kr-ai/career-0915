import { useState } from "react";
import { useJobData, Task, TaskPriorityEnum } from "@/hooks/use-job-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle2, Circle, Edit, AlertCircle } from "lucide-react";

const PRIORITY_MAP = {
  high: { label: "높음", color: "text-red-500 bg-red-50 dark:bg-red-950/30" },
  medium: { label: "보통", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  low: { label: "낮음", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" }
};

export function Tasks() {
  const { data, addTask, updateTask, deleteTask, toggleTask } = useJobData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Task>>({ title: "", completed: false, priority: "medium" });

  if (!data) return null;

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingId(task.id);
      setForm(task);
    } else {
      setEditingId(null);
      setForm({ title: "", completed: false, priority: "medium" });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    if (editingId) {
      updateTask({ ...form, id: editingId } as Task);
    } else {
      addTask({ ...form, id: crypto.randomUUID() } as Task);
    }
    setDialogOpen(false);
  };

  const activeTasks = data.tasks.filter(t => !t.completed).sort((a, b) => {
    const pVal = { high: 3, medium: 2, low: 1 };
    return pVal[b.priority] - pVal[a.priority];
  });
  const completedTasks = data.tasks.filter(t => t.completed);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">할 일 관리</h2>
          <p className="text-muted-foreground text-sm mt-1">오늘 처리해야 할 취업 준비 목록을 확인하세요.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> 새 할 일
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Active Tasks */}
        <div className="space-y-4 bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">진행 중인 일</h3>
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold ml-auto">
              {activeTasks.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {activeTasks.map(task => (
              <div key={task.id} className="group flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button onClick={() => toggleTask(task.id)} className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                    <Circle className="w-5 h-5" />
                  </button>
                  <span className="font-medium truncate">{task.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${PRIORITY_MAP[task.priority].color}`}>
                    {PRIORITY_MAP[task.priority].label}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleOpenDialog(task)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { if(window.confirm('정말 삭제하시겠습니까?')) deleteTask(task.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {activeTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm bg-muted/10 rounded-lg border border-dashed">
                모든 일을 완료했습니다!
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="space-y-4 bg-card rounded-xl p-6 border shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold text-lg text-muted-foreground">완료된 일</h3>
            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-bold ml-auto">
              {completedTasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="group flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-transparent hover:border-border transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button onClick={() => toggleTask(task.id)} className="text-primary hover:text-primary/80 transition-colors flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <span className="font-medium text-muted-foreground line-through truncate">{task.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { if(window.confirm('정말 삭제하시겠습니까?')) deleteTask(task.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm bg-muted/10 rounded-lg border border-dashed">
                아직 완료된 일이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? '할 일 수정' : '새 할 일'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              value={form.title} 
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="예: 포트폴리오 1차 리뷰"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            <Select 
              value={form.priority} 
              onValueChange={(v) => setForm(f => ({...f, priority: v as Task["priority"]}))}
            >
              <SelectTrigger>
                <SelectValue placeholder="중요도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">중요도: 높음</SelectItem>
                <SelectItem value="medium">중요도: 보통</SelectItem>
                <SelectItem value="low">중요도: 낮음</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={!form.title}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
