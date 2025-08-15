import { AIPageClient } from '@/components/ai/AIPageClient'

export default function AIPage() {
  const aiEnabled = !!process.env.OPENAI_API_KEY
  return <AIPageClient aiEnabled={aiEnabled} />
}