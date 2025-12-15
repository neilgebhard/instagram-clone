import { beforeAll, afterEach, vi } from 'vitest'

beforeAll(() => {
  // Set test environment variables
  process.env.NEXTAUTH_SECRET = 'test-secret'
  process.env.AWS_REGION = 'us-east-1'
  process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
})

afterEach(() => {
  // Reset all mocks after each test
  vi.clearAllMocks()
})
