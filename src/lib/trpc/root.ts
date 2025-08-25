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
import { searchRouter } from './routers/search'
import { inventoryRouter } from './routers/inventory'
import { gamificationRouter } from './routers/gamification'
import { collaborationRouter } from './routers/collaboration'
import { integrationsRouter } from './routers/integrations'
import { emergencyRouter } from './routers/emergency'
import { sustainabilityRouter } from './routers/sustainability'
import { iotRouter } from './routers/iot'
import { mlRouter } from './routers/ml'
import { securityRouter } from './routers/security'
import { blockchainRouter } from './routers/blockchain'
import { automationRouter } from './routers/automation'
import { reportingRouter } from './routers/reporting'
import { mobileRouter } from './routers/mobile'
import { voiceRouter } from './routers/voice'
import { cameraRouter } from './routers/camera'
import { locationRouter } from './routers/location'
import { notificationsRouter } from './routers/notifications'
import { dashboardRouter } from './routers/dashboard'
import { importExportRouter } from './routers/import-export'
import { hierarchyRouter } from './routers/hierarchy'
import { printingRouter } from './routers/printing'
import { labelSizesRouter } from './routers/label-sizes'

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
  search: searchRouter,
  inventory: inventoryRouter,
  gamification: gamificationRouter,
  collaboration: collaborationRouter,
  integrations: integrationsRouter,
  emergency: emergencyRouter,
  sustainability: sustainabilityRouter,
  iot: iotRouter,
  ml: mlRouter,
  security: securityRouter,
  blockchain: blockchainRouter,
  automation: automationRouter,
  reporting: reportingRouter,
  mobile: mobileRouter,
  voice: voiceRouter,
  camera: cameraRouter,
  location: locationRouter,
  notifications: notificationsRouter,
  dashboard: dashboardRouter,
  importExport: importExportRouter,
  hierarchy: hierarchyRouter,
  printing: printingRouter,
  labelSizes: labelSizesRouter
})

export type AppRouter = typeof appRouter
