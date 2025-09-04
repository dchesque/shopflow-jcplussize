import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'shopflow-frontend',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0'
    },
    { status: 200 }
  )
}