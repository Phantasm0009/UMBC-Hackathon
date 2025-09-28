import { NextResponse } from 'next/server'
import { hasRealSupabase } from '@/lib/supabase'

// GET /api/supabase-test - Test Supabase connection
export async function GET() {
  try {
    const hasReal = hasRealSupabase()
    console.log('Has real Supabase credentials:', hasReal)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0)
    
    return NextResponse.json({
      hasRealSupabase: hasReal,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    })
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}