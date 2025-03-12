import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Cache duration in seconds
const CACHE_DURATION = 60;

// Generate study plan prompt
function generatePrompt(subject: string, examDate: string) {
  return `As an expert educator, create a comprehensive study plan for ${subject}. The plan must be completed by ${examDate}.

DO NOT RETURN GENERIC TEMPLATES OR PLACEHOLDERS. EVERY SECTION MUST CONTAIN SPECIFIC CONTENT FOR ${subject.toUpperCase()}.

📋 OVERVIEW
${subject} is [Write 2-3 specific sentences about what this subject is].
This subject is important because [Write 2-3 specific sentences about real-world applications].
By ${examDate}, you will be able to [List 3-4 specific, measurable skills].

📆 DETAILED WEEKLY SCHEDULE
[Provide detailed day-by-day study schedule]

📚 REQUIRED RESOURCES
[List specific books, courses, and practice materials]

📊 WEEKLY GOALS AND MILESTONES
[List measurable objectives and success indicators]

💡 PRACTICAL STUDY TIPS FOR ${subject.toUpperCase()}
[Provide tailored strategies for studying this subject]

🚀 Progress Tracking Method:
[Specify how the user should track progress]
`;
}

// GET handler: Fetch study plans with pagination
export async function GET(req: NextRequest) {
  try {
    const headers = new Headers();
    headers.set('Cache-Control', `s-maxage=${CACHE_DURATION}, stale-while-revalidate`);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400, headers });
    }

    const skip = (page - 1) * limit;
    const total = await prisma.studyPlan.count({ where: { userId } });
    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: { id: true, subject: true, examDate: true, content: true, createdAt: true }
    });

    return NextResponse.json({ plans, total, page, totalPages: Math.ceil(total / limit) }, { headers, status: 200 });

  } catch (error) {
    console.error('Error fetching study plans:', error);
    return NextResponse.json({ error: 'Failed to fetch study plans' }, { status: 500 });
  }
}

// POST handler: Create a new study plan using AI-generated content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, examDate } = body;

    if (!userId || !subject || !examDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = generatePrompt(subject, examDate);

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert educator. Your responses must be detailed and exceed 1000 words." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4096, // Increased token limit
        temperature: 0.4,  // Adjusted for better creativity
        top_p: 0.7,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      }),
    });
    

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API Error:', errorText);
      throw new Error(`Failed to generate study plan: ${errorText}`);
    }

    const data = await groqResponse.json();
    const generatedPlan = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!generatedPlan || generatedPlan.length < 500) {
      throw new Error('Generated plan is incomplete or too short');
    }

    const newPlan = await prisma.studyPlan.create({
      data: { userId, subject, examDate: new Date(examDate), content: generatedPlan }
    });

    return NextResponse.json(newPlan, { status: 201 });

  } catch (error) {
    console.error('Error creating study plan:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create study plan' }, { status: 500 });
  }
}

// DELETE handler: Remove a study plan by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('id');

    if (!planId) {
      return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
    }

    await prisma.studyPlan.delete({ where: { id: planId } });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error deleting study plan:', error);
    return NextResponse.json({ error: 'Failed to delete study plan' }, { status: 500 });
  }
}
