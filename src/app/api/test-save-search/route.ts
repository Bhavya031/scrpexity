import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ server-side secret, don't expose on frontend
);

export async function POST(request: Request) {
  console.log("🛠️ API Called: /api/test-with-auth-user");
  
  try {
    // 1. Create a user in auth.users using Supabase's admin functions
    console.log("👤 Creating auth user...");
    const email = `test-${Date.now()}@example.com`;
    const password = "TestPassword123!";
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm the email so we don't need to handle that flow
    });
    
    if (authError) {
      console.error("❌ Auth user creation error:", authError);
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }
    
    console.log("✅ Created auth user:", authData.user.id);
    
    // 2. Now we can create a record in the public.users table
    console.log("👤 Creating public.users record...");
    const { error: userError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id, // Use the same ID from auth.users
          full_name: "Test User",
          // created_at will use the default current_timestamp
        }
      ]);
    
    if (userError) {
      console.error("❌ Public user creation error:", userError);
      return NextResponse.json(
        { success: false, error: userError.message },
        { status: 500 }
      );
    }
    
    console.log("✅ Created public.users record");
    
    // 3. Now create a search record
    console.log("🔍 Creating search record...");
    const { data: searchData, error: searchError } = await supabase
      .from("searches")
      .upsert(
        [
          {
            user_id: authData.user.id,
            query: "test query for insert",
            enhanced_query: "enhanced test query",
            summary: "This is a test summary of the enhanced query.",
            sources: [
              { name: "Source 1", url: "https://example.com/1" },
              { name: "Source 2", url: "https://example.com/2" },
            ],
            completed_at: new Date(),
          },
        ],
        {
          onConflict: "user_id,query",
        }
      )
      .select();
    
    if (searchError) {
      console.error("❌ Search record creation error:", searchError);
      return NextResponse.json(
        { success: false, error: searchError.message },
        { status: 500 }
      );
    }
    
    console.log("✅ Created search record");
    
    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      email: email,
      searchData: searchData
    }, { status: 200 });
  } catch (err: any) {
    console.error("❌ General error:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}