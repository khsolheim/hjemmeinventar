import { trpc } from '@/lib/trpc/client'

export function invalidateAfterBatchCreate(utils: ReturnType<typeof trpc.useUtils>, masterId: string) {
	utils.yarn.getBatchesForMaster.invalidate({ masterId })
	utils.yarn.getAllMasters.invalidate()
}

export function invalidateAfterColorCreate(utils: ReturnType<typeof trpc.useUtils>, masterId: string) {
	utils.yarn.getColorsForMaster.invalidate({ masterId })
	utils.yarn.getAllMasters.invalidate()
}