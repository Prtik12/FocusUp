# FocusUp – Boost Your Productivity!  

Stay on track with **FocusUp**, an AI study planner featuring a Pomodoro timer, task manager, and event tracking all in one place!  

![FocusUp Banner](https://github.com/user-attachments/assets/bca7ecc2-49b0-48d7-b5a1-bcb4fa5c86c8)  

---

## Features  

 **AI Study Planner** – Get personalized study plans with the **Groq API**.  
 **Pomodoro Timer** – Flip-clock style timer with automatic session transitions.  
 **Task & Event Manager** – Plan tasks, add calendar events, and track progress.  
 **Notes with Auto Cleanup** – Automatically deletes notes older than 90 days.  
 **Activity Streaks & Fun Animations** – Stay motivated with streak tracking and smooth UI effects.  
 **Google Authentication** – Secure and seamless sign-in with OAuth.  

---

##  Tech Stack  

 **Frontend:**  
- Next.js (React, TypeScript)  
- Zustand (State Management)  
- Framer Motion (Animations)  
- Tailwind CSS  

 **Backend:**  
- Next.js API Routes  
- Prisma ORM  
- PostgreSQL  

 **Authentication:**  
- NextAuth.js (Google OAuth)  

 **Storage:**  
- Supabase (Profile Images, Notes)  

 **AI Integration:**  
- Groq API  

 **Deployment:**  
- Vercel (Hosting, Cron Jobs)  

---

##  Installation  

### 1. Clone the repository  
```sh
git clone https://github.com/Prtik12/FocusUp.git
cd FocusUp
```  

### 2. Install dependencies  
```sh
npm install
```  

### 3. Set up environment variables  
```sh
cp .env.example .env
```  
 Update `.env` with your credentials (PostgreSQL, Supabase, Google OAuth, etc.).  

### 4. Run Prisma migrations  
```sh
npx prisma migrate dev
```  

### 5. Start the development server  
```sh
npm run dev
```  


---

## License  

This project is **MIT Licensed** – feel free to use, modify, and contribute! 
