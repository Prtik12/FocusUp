# 📕 FocusUp – Boost Your Productivity! 🚀  

Stay on track with **FocusUp**, an AI-powered study planner featuring a Pomodoro timer, task manager, and event tracking—all in one place!  

![FocusUp Banner](https://github.com/user-attachments/assets/bca7ecc2-49b0-48d7-b5a1-bcb4fa5c86c8)  

## ✨ Features  

✅ **AI-Powered Study Planner** – Get personalized study plans with the **Groq API**.  
⏳ **Pomodoro Timer** – Flip-clock style timer with automatic session transitions.  
🗂️ **Task & Event Manager** – Plan tasks, add calendar events, and track progress.  
📝 **Notes with Auto Cleanup** – Automatically deletes notes older than 90 days.  
🔥 **Activity Streaks & Fun Animations** – Stay motivated with streak tracking and smooth UI effects.  
🔑 **Google Authentication** – Secure and seamless sign-in with OAuth.  

---

## 🚀 Tech Stack  

🖥️ **Frontend:** Next.js (React, TypeScript) | Zustand (State Management) | Framer Motion (Animations) | Tailwind CSS  
🛠️ **Backend:** Next.js API Routes | Prisma ORM | PostgreSQL  
🔐 **Authentication:** NextAuth.js (Google OAuth)  
💾 **Storage:** Supabase (Profile Images, Notes)  
🤖 **AI Integration:** Groq API  
☁️ **Deployment:** Vercel (Hosting, Cron Jobs)  

---

## 🎯 Installation  

1️⃣ **Clone the repository**  
```
git clone https://github.com/Prtik12/FocusUp.git
cd FocusUp
```  

2️⃣ **Install dependencies**  
```
npm install
```  

3️⃣ **Set up environment variables**  
```
cp .env.example .env
```  
🔹 Update `.env` with your credentials (PostgreSQL, Supabase, Google OAuth, etc.).  

4️⃣ **Run Prisma migrations**  
```
npx prisma migrate dev
```  

5️⃣ **Start the development server**  
```
npm run dev
```  

---

## 🔄 Auto-Deleting Notes (Vercel Cron Job)  

FocusUp automatically deletes notes older than **90 days** using **Vercel Cron Jobs**.  

📌 **Setup Instructions:**  

📌 Add the following to `vercel.json`:  
```json
{
  "crons": [{
    "path": "/api/cleanup-notes",
    "schedule": "0 0 1 * *"
  }]
}
```  

📌 Add a secret to Vercel for security:  
```
vercel env add CRON_SECRET your_secret_key
```  

📌 Secure the cron job in `app/api/cleanup-notes/route.ts`:  
```ts
export async function GET(req: Request) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Cleanup logic here...
}
```  

---

## 📜 License  

This project is **MIT Licensed** – feel free to use, modify, and contribute! 🎉  

---
