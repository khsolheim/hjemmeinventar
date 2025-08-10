// Root tRPC router
import { createTRPCRouter } from './server'
import { itemsRouter } from './routers/items'
import { locationsRouter } from './routers/locations'
import { categoriesRouter } from './routers/categories'
import { activitiesRouter } from './routers/activities'
import { loansRouter } from './routers/loans'
import { tagsRouter } from './routers/tags'
import { yarnRouter } from './routers/yarn'

export const appRouter = createTRPCRouter({
  items: itemsRouter,
  locations: locationsRouter,
  categories: categoriesRouter,
  activities: activitiesRouter,
  loans: loansRouter,
  tags: tagsRouter,
  yarn: yarnRouter
})

export type AppRouter = typeof appRouter
