import { LocationType } from '@prisma/client'

export function validateAcyclic(rules: Array<{ parentType: LocationType; childType: LocationType; isAllowed: boolean }>): string | null {
	const allowedRules = rules.filter(r => r.isAllowed)
	const graph: Record<string, string[]> = {}

	allowedRules.forEach(rule => {
		if (!graph[rule.parentType]) {
			graph[rule.parentType] = []
		}
		         graph[rule.parentType]!.push(rule.childType)
	})

	const visited = new Set<string>()
	const recursionStack = new Set<string>()

	function hasCycle(node: string): boolean {
		if (recursionStack.has(node)) return true
		if (visited.has(node)) return false

		visited.add(node)
		recursionStack.add(node)

		const neighbors = graph[node] || []
		for (const neighbor of neighbors) {
			if (hasCycle(neighbor)) return true
		}

		recursionStack.delete(node)
		return false
	}

	for (const node of Object.keys(graph)) {
		if (hasCycle(node)) {
			return `Cycle detected involving ${node}`
		}
	}
	return null
}