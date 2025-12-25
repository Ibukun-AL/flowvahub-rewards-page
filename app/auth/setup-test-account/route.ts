import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Create test user with Supabase Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: "test@flowwahub.com",
      password: "test123456",
      email_confirm: true,
    })

    if (error) {
      // If user already exists, that's fine
      if (error.message.includes("already registered")) {
        return NextResponse.json({
          success: true,
          message: "Test account already exists",
        })
      }

      console.error("Error creating test user:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Test account created successfully",
      user: data.user,
    })
  } catch (error) {
    console.error("Error in setup-test-account:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test account",
      },
      { status: 500 },
    )
  }
}
