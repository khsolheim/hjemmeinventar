'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { YarnManager } from '@/components/yarn/YarnManager'

export default function YarnManagePage() {
	return (
		<div className="cq space-y-4">
			<div className="flex items-center justify-between cq">
				<div>
					<h1 className="text-3xl font-bold">Administrer Garn</h1>
					<p className="text-muted-foreground">Tre-kolonne visning: Master → Farger → Batches</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/garn">
						<ChevronLeft className="h-4 w-4 mr-2" />
						Til oversikten
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Integrert dashboard</CardTitle>
					<CardDescription>Rask CRUD direkte i hierarkiet</CardDescription>
				</CardHeader>
				<CardContent>
					<YarnManager />
				</CardContent>
			</Card>
		</div>
	)
}


