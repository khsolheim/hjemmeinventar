import { createTRPCRouter } from '../server'
import { healthRouter } from './health'
import { itemsRouter } from './items'
import { locationsRouter } from './locations'
import { categoriesRouter } from './categories'
import { householdsRouter } from './households'
import { analyticsRouter } from './analytics'
import { aiRouter } from './ai'
import { hierarchyRouter } from './hierarchy'
import { importExportRouter } from './import-export'
import { notificationsRouter } from './notifications'
import { searchRouter } from './search'
import { collaborationRouter } from './collaboration'
import { gamificationRouter } from './gamification'
import { socialRouter } from './social'
import { learningRouter } from './learning'
import { financeRouter } from './finance'
import { productivityRouter } from './productivity'

export const appRouter = createTRPCRouter({
  items: itemsRouter,
  locations: locationsRouter,
  categories: categoriesRouter,
  households: householdsRouter,
  analytics: analyticsRouter,
  ai: aiRouter,
  hierarchy: hierarchyRouter,
  importExport: importExportRouter,
  notifications: notificationsRouter,
  search: searchRouter,
  collaboration: collaborationRouter,
  gamification: gamificationRouter,
  social: socialRouter,
  learning: learningRouter,
  health: healthRouter,
  finance: financeRouter,
  productivity: productivityRouter,
})
