// Root tRPC router
import { createTRPCRouter } from './server'
import { itemsRouter } from './routers/items'
import { locationsRouter } from './routers/locations'
import { categoriesRouter } from './routers/categories'
import { activitiesRouter } from './routers/activities'
import { loansRouter } from './routers/loans'
import { tagsRouter } from './routers/tags'
import { yarnRouter } from './routers/yarn'
import { usersRouter } from './routers/users'
import { analyticsRouter } from './routers/analytics'
import { householdsRouter } from './routers/households'
import { aiRouter } from './routers/ai'
import { importExportRouter } from './routers/import-export'
import { hierarchyRouter } from './routers/hierarchy'
import { printingRouter } from './routers/printing'

export const appRouter = createTRPCRouter({
  items: itemsRouter,
  locations: locationsRouter,
  categories: categoriesRouter,
  activities: activitiesRouter,
  loans: loansRouter,
  tags: tagsRouter,
  yarn: yarnRouter,
  users: usersRouter,
  analytics: analyticsRouter,
  households: householdsRouter,
  ai: aiRouter,
  importExport: importExportRouter,
  hierarchy: hierarchyRouter,
  printing: printingRouter
})

export type AppRouter = typeof appRouter
