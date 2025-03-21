import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Cache duration in seconds
const CACHE_DURATION = 60;

// Generate study plan prompt ensuring sequential daily study plan
function generatePrompt(subject: string, examDate: string) {
  const currentDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return `As an expert educator, create a **comprehensive daily study plan** for ${subject} starting from **${currentDate}** and ending on **${examDate}**.

DO NOT RETURN GENERIC TEMPLATES OR PLACEHOLDERS. EVERY SECTION MUST CONTAIN SPECIFIC CONTENT FOR ${subject.toUpperCase()}.

📋 **OVERVIEW**
${subject} is [Write 2-3 specific sentences about what this subject is].
This subject is important because [Write 2-3 specific sentences about real-world applications].
By **${examDate}**, you will be able to [List 3-4 specific, measurable skills].

📆 **DETAILED DAILY SCHEDULE (From ${currentDate} to ${examDate})**
- Provide a **specific study plan for each day** with detailed topics, exercises, and practice materials.
- The difficulty should gradually increase as the exam approaches.
- Include **revision days** and **mock tests** in the final week.

📚 **REQUIRED RESOURCES**
[List specific books, courses, and practice materials relevant to ${subject}.]

📊 **WEEKLY GOALS AND MILESTONES**
[List measurable objectives and key outcomes to track progress.]

💡 **PRACTICAL STUDY TIPS FOR ${subject.toUpperCase()}**
[Provide subject-specific learning strategies.]

🚀 **PROGRESS TRACKING METHOD**
[Suggest ways for the user to track their progress effectively.]
`;
}


// GET handler: Fetch study plans with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    // Add timestamp parameter for cache busting
    const timestamp = searchParams.get('t');

    // Set cache control headers based on whether this is a cache-busting request
    const headers = new Headers();
    if (timestamp) {
      // If timestamp is provided, don't cache
      headers.set('Cache-Control', 'no-store, max-age=0');
    } else {
      // Default caching behavior
      headers.set('Cache-Control', `s-maxage=${CACHE_DURATION}, stale-while-revalidate`);
    }

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400, headers });
    }

    console.log(`Fetching study plans for userId: ${userId}, page: ${page}, timestamp: ${timestamp || 'none'}`);

    const skip = (page - 1) * limit;
    const total = await prisma.studyPlan.count({ where: { userId } });
    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: { id: true, subject: true, examDate: true, content: true, createdAt: true }
    });

    console.log(`Found ${plans.length} plans for user ${userId}`);
    
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
    console.log('Sending request to Groq API with prompt:', prompt.substring(0, 100) + '...');

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
    
    if (!data.choices || !data.choices.length) {
      console.error('Groq API returned no choices:', data);
      throw new Error('No content returned from the AI model');
    }
    
    const generatedPlan = data.choices?.[0]?.message?.content?.trim() ?? '';
    console.log('Received plan from Groq API, length:', generatedPlan.length);
    
    if (!generatedPlan || generatedPlan.length < 500) {
      console.error('Generated plan is too short or empty:', generatedPlan);
      throw new Error('Generated plan is incomplete or too short');
    }

    const newPlan = await prisma.studyPlan.create({
      data: { userId, subject, examDate: new Date(examDate), content: generatedPlan }
    });

    console.log('Study plan created successfully:', newPlan.id);
    
    // Set cache control to prevent caching of this response
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');
    
    return NextResponse.json(newPlan, { status: 201, headers });

  } catch (error) {
    console.error('Error creating study plan:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create study plan' }, { status: 500 });
  }
}

// DELETE handler: Remove a study plan by ID
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, userId } = body;

    if (!planId || !userId) {
      return NextResponse.json({ error: 'Missing planId or userId' }, { status: 400 });
    }

    // Check if the study plan exists and belongs to the user
    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id: planId },
    });

    if (!studyPlan) {
      return NextResponse.json({ error: 'Study plan not found' }, { status: 404 });
    }

    if (studyPlan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: Cannot delete this plan' }, { status: 403 });
    }

    await prisma.studyPlan.delete({ where: { id: planId } });
    
    // Set cache control to prevent caching of this response
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');

    return NextResponse.json({ success: true }, { status: 200, headers });

  } catch (error) {
    console.error('Error deleting study plan:', error);
    return NextResponse.json({ error: 'Failed to delete study plan' }, { status: 500 });
  }
}

