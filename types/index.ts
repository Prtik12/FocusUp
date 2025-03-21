export type Event = {
  id: number;
  title: string;
  date: string;
};

export type UserStats = {
  streak: number;
  lastActive: string;
  timeSpent: {
    date: string;
    minutes: number;
  }[];
}; 