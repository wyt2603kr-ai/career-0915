import { useState } from "react";
import { useJobData, Interview } from "@/hooks/use-job-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, CalendarDays, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function Interviews() {
  const { data, addInterview, updateInterview, deleteInterview } = useJobData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Interview>>({
    companyName: "", position: "", date: "", time: "", type: "", location: "", memo: ""
  });

  if (!data) return null;

  const handleOpenDialog = (interview?: Interview) => {
    if (interview) {
      setEditingId(interview.id);
      setForm(interview);
    } else {
      setEditingId(null);
      setForm({ companyName: "", position: "", date: "", time: "", type: "", location: "", memo: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.companyName || !form.date) return;
    if (editingId) {
      updateInterview({ ...form, id: editingId } as Interview);
    } else {
      addInterview({ ...form, id: crypto.randomUUID() } as Interview);
    }
    setDialogOpen(false);
  };

  const sortedInterviews = [...data.interviews].sort((a, b) => {
    return parseISO(`${a.date}T${a.time || '00:00'}`).getTime() - parseISO(`${b.date}T${b.time || '00:00'}`).getTime();
  });

  const today = new Date();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">면접 일정</h2>
          <p className="text-muted-foreground text-sm mt-1">다가오는 면접을 대비하고 중요한 메모를 남기세요.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> 새 일정
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedInterviews.map(interview => {
          const interviewDate = parseISO(interview.date);
          const daysLeft = differenceInDays(interviewDate, today);
          const isPast = daysLeft < 0;

          return (
            <Card key={interview.id} className={`overflow-hidden border-muted transition-opacity ${isPast ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              <CardContent className="p-0">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg font-bold ${isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                        <span className="text-xs uppercase">{format(interviewDate, "MMM")}</span>
                        <span className="text-lg leading-none">{format(interviewDate, "dd")}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{interview.companyName}</h3>
                        <p className="text-sm text-muted-foreground">{interview.position}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!isPast && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {daysLeft === 0 ? '오늘' : `D-${daysLeft}`}
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(interview)}>수정</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(interview.id)}>삭제</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-2 bg-muted/20 p-3 rounded-lg border text-sm">
                    {interview.type && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="font-medium text-foreground">{interview.type}</span>
                      </div>
                    )}
                    {interview.time && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{interview.time}</span>
                      </div>
                    )}
                    {interview.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{interview.location}</span>
                      </div>
                    )}
                  </div>

                  {interview.memo && (
                    <div className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border-l-2 border-l-primary whitespace-pre-wrap">
                      {interview.memo}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {sortedInterviews.length === 0 && (
          <div className="col-span-full py-16 text-center bg-card border border-dashed rounded-xl shadow-sm">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
            <h3 className="font-bold text-lg text-muted-foreground">등록된 면접 일정이 없습니다</h3>
            <p className="text-sm text-muted-foreground/60 mt-1">새 일정을 등록하여 면접을 체계적으로 준비하세요.</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? '일정 수정' : '새 일정 등록'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>기업명 *</Label>
                <Input value={form.companyName} onChange={e => setForm(f => ({...f, companyName: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>지원 직무</Label>
                <Input value={form.position} onChange={e => setForm(f => ({...f, position: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>날짜 *</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>시간</Label>
                <Input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>면접 유형 (예: 1차 기술, 임원 면접 등)</Label>
              <Input value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>장소 / 링크</Label>
              <Input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>메모 / 준비사항</Label>
              <Textarea 
                value={form.memo} 
                onChange={e => setForm(f => ({...f, memo: e.target.value}))}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={!form.companyName || !form.date}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>면접 일정이 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => { if(deleteId) deleteInterview(deleteId); setDeleteId(null); }}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
