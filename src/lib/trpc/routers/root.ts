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
import { communicationRouter } from './communication'
import { entertainmentRouter } from './entertainment'
import { securityRouter } from './security'
import { automationRouter } from './automation'
import { integrationRouter } from './integration'
import { performanceRouter } from './performance'
import { reportingRouter } from './reporting'
import { blockchainRouter } from './blockchain'
import { arVrRouter } from './ar-vr'
import { mlRouter } from './ml'
import { quantumRouter } from './quantum'
import { edgeRouter } from './edge'
import { networkRouter } from './network'
import { cybersecurityRouter } from './cybersecurity'
import { aiMlRouter } from './ai-ml'
import { cloudRouter } from './cloud'
import { mobileRouter } from './mobile'
import { voiceRouter } from './voice'
import { iotRouter } from './iot'

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
  communication: communicationRouter,
  entertainment: entertainmentRouter,
  security: securityRouter,
  automation: automationRouter,
  integration: integrationRouter,
  performance: performanceRouter,
  reporting: reportingRouter,
  blockchain: blockchainRouter,
  iot: iotRouter,
  arVr: arVrRouter,
  ml: mlRouter,
  quantum: quantumRouter,
  edge: edgeRouter,
  network: networkRouter,
  cybersecurity: cybersecurityRouter,
  aiMl: aiMlRouter,
  cloud: cloudRouter,
  mobile: mobileRouter,
  voice: voiceRouter,
})
