import { NextRequest } from 'next/server'
import type { QTestCycleParams } from '@/types/qtest'

export async function POST(request: NextRequest) {
  const body: QTestCycleParams = await request.json()

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      controller.enqueue(
        encoder.encode(
          JSON.stringify({ message: 'Not yet implemented', params: body })
        )
      )
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' },
  })
}
