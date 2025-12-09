import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    const result = await pool.query(
      `INSERT INTO "User" (id, username, email, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [`test_${Date.now()}`, `user_${Date.now()}`, `email_${Date.now()}@test.com`]
    )

    await pool.end()

    return NextResponse.json({
      success: true,
      message: 'User created via direct pg pool',
      user: result.rows[0],
    })
  } catch (error) {
    await pool.end()
    console.error('Pool error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
