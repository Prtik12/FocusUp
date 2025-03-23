import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Set to node runtime as Prisma may have issues with Edge runtime for some database operations
// export const runtime = 'edge';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Cache duration in seconds
const CACHE_DURATION = 60;

// Optimized, shorter prompt for faster generation
function generatePrompt(subject: string, examDate: string) {
  const currentDate = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return `Create a concise study plan for ${subject} from ${currentDate} to ${examDate}.

Include:
1. Brief overview of ${subject}
2. Week-by-week schedule with key topics
3. 3-4 recommended resources
4. 5 study tips specific to ${subject}
5. Progress tracking suggestions

Format with clear headings and bullet points. Be specific to ${subject}, not generic.`;
}

// GET handler: Fetch study plans with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    // Add timestamp parameter for cache busting
    const timestamp = searchParams.get("t");

    // Set cache control headers based on whether this is a cache-busting request
    const headers = new Headers();
    if (timestamp) {
      // If timestamp is provided, don't cache
      headers.set("Cache-Control", "no-store, max-age=0");
    } else {
      // Default caching behavior
      headers.set(
        "Cache-Control",
        `s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400, headers },
      );
    }

    console.log(
      `Fetching study plans for userId: ${userId}, page: ${page}, timestamp: ${timestamp || "none"}`,
    );

    let plans = [];
    let total = 0;
    
    try {
      // Wrap database operations in a try/catch for better error handling
      const skip = (page - 1) * limit;
      total = await prisma.studyPlan.count({ where: { userId } });
      plans = await prisma.studyPlan.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          subject: true,
          examDate: true,
          content: true,
          createdAt: true,
        },
      });
      console.log(`Found ${plans.length} plans for user ${userId}`);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database error", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500, headers }
      );
    }

    return NextResponse.json(
      { plans, total, page, totalPages: Math.ceil(total / limit) },
      { headers, status: 200 },
    );
  } catch (error) {
    console.error("Error fetching study plans:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch study plans",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    );
  }
}

// POST handler: Create a new study plan using AI-generated content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, subject, examDate } = body;

    if (!userId || !subject || !examDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const prompt = generatePrompt(subject, examDate);
    console.log("Generating study plan for:", subject);

    // Use a timeout to ensure we don't exceed Vercel's function timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI generation timed out")), 9000)
    );
    
    const groqResponsePromise = fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Using the model specified by the user
        messages: [
          {
            role: "system",
            content:
              "You are an expert educator creating concise, practical study plans. Be specific and focused.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1500, // Keeping reduced token limit for faster generation
        temperature: 0.3, // Lower temperature for more focused output
        top_p: 0.8,
      }),
    });

    // Race between the API call and the timeout
    const groqResponse = await Promise.race([
      groqResponsePromise,
      timeoutPromise
    ]) as Response;

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", errorText);
      throw new Error(`Failed to generate study plan: ${errorText}`);
    }

    const data = await groqResponse.json();

    if (!data.choices || !data.choices.length) {
      console.error("Groq API returned no choices:", data);
      throw new Error("No content returned from the AI model");
    }

    const generatedPlan = data.choices?.[0]?.message?.content?.trim() ?? "";
    console.log("Received plan from Groq API, length:", generatedPlan.length);

    if (!generatedPlan || generatedPlan.length < 200) {
      console.error("Generated plan is too short or empty:", generatedPlan);
      throw new Error("Generated plan is incomplete or too short");
    }

    const newPlan = await prisma.studyPlan.create({
      data: {
        userId,
        subject,
        examDate: new Date(examDate),
        content: generatedPlan,
      },
    });

    console.log("Study plan created successfully:", newPlan.id);

    // Set cache control to prevent caching of this response
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0");

    return NextResponse.json(newPlan, { status: 201, headers });
  } catch (error) {
    console.error("Error creating study plan:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create study plan",
      },
      { status: 500 },
    );
  }
}

// DELETE handler: Remove a study plan by ID
export async function DELETE(req: NextRequest) {
  console.log("Received DELETE request for study plan");
  
  try {
    const body = await req.json();
    const { planId, userId } = body;

    console.log(`Delete request for planId: ${planId}, userId: ${userId}`);

    if (!planId || !userId) {
      console.log("Missing planId or userId in delete request");
      return NextResponse.json(
        { error: "Missing planId or userId" },
        { status: 400 },
      );
    }

    // Validate ID formats
    if (!/^c[a-z0-9]+$/i.test(planId)) {
      console.log(`Invalid planId format: ${planId}`);
      return NextResponse.json(
        { error: "Invalid planId format" },
        { status: 400 },
      );
    }

    // Check if the study plan exists and belongs to the user
    const studyPlan = await prisma.studyPlan.findUnique({
      where: { id: planId },
    });

    if (!studyPlan) {
      console.log(`Study plan not found: ${planId}`);
      // Return success if plan doesn't exist as the end result is what the user wanted
      const headers = new Headers();
      headers.set("Cache-Control", "no-store, max-age=0");
      headers.set("Pragma", "no-cache");
      
      return NextResponse.json(
        { success: true, message: "Plan already deleted" },
        { status: 200, headers },
      );
    }

    if (studyPlan.userId !== userId) {
      console.log(`Unauthorized deletion attempt - planId: ${planId}, requestUserId: ${userId}, actualUserId: ${studyPlan.userId}`);
      return NextResponse.json(
        { error: "Unauthorized: Cannot delete this plan" },
        { status: 403 },
      );
    }

    // First try simple delete (more reliable in some cases)
    try {
      await prisma.studyPlan.delete({ 
        where: { id: planId } 
      });
      
      console.log(`Successfully deleted study plan with simple delete: ${planId}`);
    } catch (simpleDeleteError) {
      console.error("Simple delete failed, attempting with transaction:", simpleDeleteError);
      
      // Fallback to transaction approach
      await prisma.$transaction(async (tx) => {
        // Perform the deletion operation
        await tx.studyPlan.delete({ 
          where: { id: planId } 
        });
        
        // Verify the plan is actually deleted
        const verifyDeleted = await tx.studyPlan.findUnique({
          where: { id: planId }
        });
        
        if (verifyDeleted) {
          throw new Error("Failed to delete study plan - still exists after deletion");
        }
        
        return { success: true };
      }, {
        // Set transaction timeout
        timeout: 10000, // 10 seconds
        maxWait: 5000,  // 5 seconds max wait time
        isolationLevel: "Serializable", // Highest isolation level
      });
      
      console.log(`Successfully deleted study plan with transaction: ${planId}`);
    }

    // Set strong cache control headers to prevent caching
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Surrogate-Control", "no-store");

    return NextResponse.json({ 
      success: true, 
      timestamp: Date.now() // Add timestamp to prevent response caching
    }, { 
      status: 200, 
      headers 
    });
  } catch (error) {
    console.error("Error deleting study plan:", error);
    
    // Define interface for Prisma errors
    interface PrismaError extends Error {
      code?: string;
      meta?: Record<string, unknown>;
    }
    
    // Check if this is a Prisma error
    const isPrismaError = error instanceof Error && 
      'code' in error && typeof (error as PrismaError).code === 'string';
    
    // Determine if this is a transient error that could be retried
    const isTransientError = isPrismaError && 
      ['P1001', 'P1002', 'P1008', 'P1011', 'P1017'].includes((error as PrismaError).code || '');
    
    const statusCode = isTransientError ? 503 : 500; // Service Unavailable for transient errors
    const errorMessage = error instanceof Error ? error.message : "Failed to delete study plan";
    
    // Set cache control headers even for error responses
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("Pragma", "no-cache");
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: isPrismaError ? (error as PrismaError).code : undefined,
        isTransient: isTransientError,
        timestamp: Date.now() // Add timestamp to prevent response caching
      },
      { status: statusCode, headers },
    );
  }
}
