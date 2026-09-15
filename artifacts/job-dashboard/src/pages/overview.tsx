import { useJobData } from "@/hooks/use-job-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit2, Target, Calendar, CheckCircle2, Circle, AlertCircle, Users } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "wouter";

export function Overview() {
  const { data, loading, error, updateGoal, toggleTask } = useJobData();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: "", position: "", targetDate: "" });

  if (loading) return <div className="animate-pulse space-y-4">로딩 중...</div>;
  if (error || !data) return <div className="text-destructive font-medium">{error || '데이터 없음'}</div>;

  const today = new Date();
  const targetDate = data.goal.targetDate ? parseISO(data.goal.targetDate) : null;
  const dDay = targetDate ? differenceInDays(targetDate, today) : null;

  const completedTasks = data.tasks.filter(t => t.completed).length;
  const totalTasks = data.tasks.length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const upcomingInterviews = data.interviews
    .filter(i => parseISO(i.date) >= today)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 3);

  const openGoalDialog = () => {
    setGoalForm(data.goal);
    setGoalDialogOpen(true);
  };

  const handleSaveGoal = () => {
    updateGoal(goalForm);
    setGoalDialogOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Goal Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium">
            <Target className="w-4 h-4" />
            <span>최종 목표</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{data.goal.title || "목표를 설정해주세요"}</h2>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="bg-primary-foreground/20 px-2 py-1 rounded-md">{data.goal.position || "직무 미정"}</span>
            {dDay !== null && (
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                <Calendar className="w-4 h-4" />
                D{dDay > 0 ? `-${dDay}` : dDay === 0 ? '-Day' : `+${Math.abs(dDay)}`}
              </span>
            )}
          </div>
        </div>
        <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="w-fit relative z-10" onClick={openGoalDialog}>
              <Edit2 className="w-4 h-4 mr-2" />
              목표 수정
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>목표 설정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>목표 타이틀</Label>
                <Input value={goalForm.title} onChange={e => setGoalForm(prev => ({...prev, title: e.target.value}))} placeholder="ex) 2026 상반기 IT 직무 취업" />
              </div>
              <div className="space-y-2">
                <Label>희망 직무</Label>
                <Input value={goalForm.position} onChange={e => setGoalForm(prev => ({...prev, position: e.target.value}))} placeholder="ex) 데이터 분석가" />
              </div>
              <div className="space-y-2">
                <Label>목표 달성일 (D-Day 기준)</Label>
                <Input type="date" value={goalForm.targetDate} onChange={e => setGoalForm(prev => ({...prev, targetDate: e.target.value}))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>취소</Button>
              <Button onClick={handleSaveGoal}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats */}
        <Card className="md:col-span-2 shadow-sm border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">지원 현황</CardTitle>
            <CardDescription>현재까지의 진행 상황입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">준비 중</div>
                <div className="text-2xl font-bold text-foreground">
                  {data.companies.filter(c => c.status === 'preparing').length}
                </div>
              </div>
              <div className="space-y-1 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-sm text-blue-600 dark:text-blue-400">지원 완료</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {data.companies.filter(c => c.status === 'submitted').length}
                </div>
              </div>
              <div className="space-y-1 p-4 bg-teal-50 dark:bg-teal-950/30 rounded-lg">
                <div className="text-sm text-teal-600 dark:text-teal-400">합격</div>
                <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                  {data.companies.filter(c => c.status === 'passed').length}
                </div>
              </div>
              <div className="space-y-1 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <div className="text-sm text-red-600 dark:text-red-400">불합격</div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {data.companies.filter(c => c.status === 'rejected').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card className="shadow-sm border-muted">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">오늘의 할 일</CardTitle>
              <Link href="/tasks" className="text-xs text-primary hover:underline">모두 보기</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">진척도</span>
                <span className="font-bold">{taskProgress}%</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
            </div>
            <div className="space-y-3">
              {data.tasks.slice(0, 4).map(task => (
                <div key={task.id} className="flex items-center gap-3 group">
                  <button onClick={() => toggleTask(task.id)} className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {task.completed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <span className={`text-sm truncate transition-colors ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              {data.tasks.length === 0 && (
                <div className="text-sm text-muted-foreground py-2">등록된 할 일이 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-muted">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                다가오는 일정
              </CardTitle>
              <Link href="/companies" className="text-xs text-primary hover:underline">더 보기</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.companies
                .filter(c => c.status === 'preparing' && c.deadline)
                .sort((a, b) => parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime())
                .slice(0, 3)
                .map(company => {
                  const daysLeft = differenceInDays(parseISO(company.deadline), today);
                  return (
                    <div key={company.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-sm">{company.name}</div>
                        <div className="text-xs text-muted-foreground">{company.position}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${daysLeft <= 3 ? 'text-destructive' : 'text-foreground'}`}>
                          D{daysLeft > 0 ? `-${daysLeft}` : daysLeft === 0 ? '-Day' : `+${Math.abs(daysLeft)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">{company.deadline}</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                면접 일정
              </CardTitle>
              <Link href="/interviews" className="text-xs text-primary hover:underline">관리</Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length > 0 ? (
              <div className="space-y-4">
                {upcomingInterviews.map(interview => {
                   const daysLeft = differenceInDays(parseISO(interview.date), today);
                   return (
                    <div key={interview.id} className="flex gap-4 p-3 rounded-lg border bg-card">
                      <div className="flex flex-col items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 w-12 h-12 rounded-md font-bold text-sm flex-shrink-0">
                        {format(parseISO(interview.date), "MM.dd")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-sm truncate">{interview.companyName}</div>
                          <div className="text-xs font-semibold whitespace-nowrap bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {daysLeft === 0 ? '오늘' : `D-${daysLeft}`}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{interview.type} • {interview.time}</div>
                      </div>
                    </div>
                   );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                예정된 면접이 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
