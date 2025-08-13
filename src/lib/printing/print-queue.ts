'use client'

import type { LabelData } from './dymo-service'

const STORAGE_KEY = 'printQueue.labels.v1'
export const PRINT_QUEUE_EVENT = 'printQueue:change'

function safeGetStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readQueue(): LabelData[] {
  const storage = safeGetStorage()
  if (!storage) return []
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as LabelData[]
    return []
  } catch {
    return []
  }
}

function writeQueue(queue: LabelData[]) {
  const storage = safeGetStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(queue))
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PRINT_QUEUE_EVENT))
    }
  } catch {}
}

export const printQueue = {
  getAll(): LabelData[] {
    return readQueue()
  },
  add(label: LabelData) {
    const q = readQueue()
    q.push(label)
    writeQueue(q)
  },
  addMany(labels: LabelData[]) {
    const q = readQueue()
    writeQueue(q.concat(labels))
  },
  clear() {
    writeQueue([])
  },
  size(): number {
    return readQueue().length
  },
  removeByQr(qrCode: string) {
    const q = readQueue().filter(l => l.qrCode !== qrCode)
    writeQueue(q)
  }
}


