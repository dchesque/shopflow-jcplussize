import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check database connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        supabase: !!supabaseUrl,
        backend: !!apiUrl,
      }
    }
    
    // Optional: Test backend connectivity
    if (apiUrl) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(`${apiUrl}/health`, {
          signal: controller.signal,
          method: 'GET',
        })
        
        clearTimeout(timeoutId)
        checks.services.backend = response.ok
      } catch (error) {
        checks.services.backend = false
      }
    }
    
    return NextResponse.json(checks, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}