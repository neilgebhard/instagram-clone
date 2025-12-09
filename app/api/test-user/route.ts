import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')

    // Test database connection first
    await prisma.$connect()
    console.log('Database connected successfully')

    // Create a test user
    const user = await prisma.user.create({
      data: {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        bio: 'This is a test user created via the API',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user,
    })
  } catch (error) {
    console.error('Full error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
