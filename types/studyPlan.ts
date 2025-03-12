export interface StudyTask {
    id: string;
    studyPlanId: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }
  
  export interface StudyPlan {
    id: string;
    userId: string;
    content: string;  
    subject: string;
    examDate: string;
    createdAt: string;
    tasks: StudyTask[];
  }
  