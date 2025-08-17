'use client'

import { useState } from 'react'
import { LocationType } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Package, 
  Archive, 
  Folder,
  ShoppingBag,
  FileText,
  BookOpen,
  Square,
  Plus,
  ChevronRight,
  ChevronDown,
  Edit2,
  QrCode,
  Eye,
  MoreVertical,
  ArrowLeft,
  TreePine
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AutoNamingService } from '@/lib/services/auto-naming-service'

interface Location {
  id: string
  name: string
  displayName?: string
  type: LocationType
  level: number
  autoNumber?: string
  children?: Location[]
  itemCount?: number
  isPrivate?: boolean
  colorCode?: string
  tags?: string[]
}

interface HierarchyBuilderProps {
  locations: Location[]
  onAddLocation: (parentId: string | undefined, type: LocationType) => void
  onEditLocation: (location: Location) => void
  onDeleteLocation: (locationId: string) => void
  onShowQR: (location: Location) => void
  onBack?: () => void
  isLoading?: boolean
}

const locationTypeIcons = {
  [LocationType.ROOM]: Home,
  [LocationType.CABINET]: Package,
  [LocationType.RACK]: BookOpen,
  [LocationType.WALL_SHELF]: Square,
  [LocationType.SHELF]: Folder,
  [LocationType.DRAWER]: FileText,
  [LocationType.BOX]: Archive,
  [LocationType.BAG]: ShoppingBag,
  [LocationType.CONTAINER]: Package,
  [LocationType.SHELF_COMPARTMENT]: Folder,
  [LocationType.SECTION]: Square
}

const locationTypeLabels = {
  [LocationType.ROOM]: 'Rom',
  [LocationType.CABINET]: 'Skap',
  [LocationType.RACK]: 'Reol',
  [LocationType.WALL_SHELF]: 'Vegghengt hylle',
  [LocationType.SHELF]: 'Hylle',
  [LocationType.DRAWER]: 'Skuff',
  [LocationType.BOX]: 'Boks',
  [LocationType.BAG]: 'Pose',
  [LocationType.CONTAINER]: 'Beholder',
  [LocationType.SHELF_COMPARTMENT]: 'Hylle',
  [LocationType.SECTION]: 'Avsnitt'
}

interface TreeNodeProps {
  location: Location
  level: number
  isExpanded: boolean
  onToggle: () => void
  onAddChild: (parentId: string, type: LocationType) => void
  onEdit: (location: Location) => void
  onDelete: (locationId: string) => void
  onShowQR: (location: Location) => void
  expandedNodes: Set<string>
  setExpandedNodes: (nodes: Set<string>) => void
}

function TreeNode({ 
  location, 
  level, 
  isExpanded, 
  onToggle, 
  onAddChild, 
  onEdit, 
  onDelete, 
  onShowQR,
  expandedNodes,
  setExpandedNodes
}: TreeNodeProps) {
  const Icon = locationTypeIcons[location.type]
  const hasChildren = location.children && location.children.length > 0
  const allowedChildTypes = AutoNamingService.getAllowedChildTypes(location.type)
  
  const handleAddChild = (type: LocationType) => {
    onAddChild(location.id, type)
  }

  return (
    <div className="select-none">
      {/* Node Header */}
      <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
        location.isPrivate 
          ? 'border-red-200 bg-red-50' 
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}>
        
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-1 h-6 w-6"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* Icon & Name */}
        <div className="flex items-center space-x-2 flex-1">
          <Icon className={`h-5 w-5 ${location.colorCode ? 'text-current' : 'text-gray-600'}`} 
                style={location.colorCode ? { color: location.colorCode } : {}} />
          <span className="font-medium text-gray-900">
            {location.displayName || location.name}
          </span>
          {location.autoNumber && (
            <Badge variant="outline" className="text-xs">
              {location.autoNumber}
            </Badge>
          )}
          {location.isPrivate && (
            <Badge variant="destructive" className="text-xs">
              Privat
            </Badge>
          )}
        </div>

        {/* Item Count */}
        {location.itemCount !== undefined && location.itemCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {location.itemCount} gjenstander
          </Badge>
        )}

        {/* Add Child Buttons */}
        {allowedChildTypes.length > 0 && (
          <div className="flex items-center space-x-1">
            {allowedChildTypes.slice(0, 2).map((childType) => {
              const ChildIcon = locationTypeIcons[childType]
              return (
                <Button
                  key={childType}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddChild(childType)}
                  className="h-7 px-2 text-xs"
                  title={`Legg til ${locationTypeLabels[childType]}`}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <ChildIcon className="h-3 w-3" />
                </Button>
              )
            })}
            
            {allowedChildTypes.length > 2 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 px-2">
                    <Plus className="h-3 w-3 mr-1" />
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {allowedChildTypes.slice(2).map((childType) => {
                    const ChildIcon = locationTypeIcons[childType]
                    return (
                      <DropdownMenuItem 
                        key={childType}
                        onClick={() => handleAddChild(childType)}
                      >
                        <ChildIcon className="h-4 w-4 mr-2" />
                        Legg til {locationTypeLabels[childType]}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Action Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(location)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Rediger
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShowQR(location)}>
              <QrCode className="h-4 w-4 mr-2" />
              Vis QR-kode
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(location.id)}
              className="text-red-600"
            >
              <Archive className="h-4 w-4 mr-2" />
              Slett
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
          {location.children!.map((child) => (
            <TreeNode
              key={child.id}
              location={child}
              level={level + 1}
              isExpanded={expandedNodes.has(child.id)}
              onToggle={() => {
                const newExpanded = new Set(expandedNodes)
                if (newExpanded.has(child.id)) {
                  newExpanded.delete(child.id)
                } else {
                  newExpanded.add(child.id)
                }
                setExpandedNodes(newExpanded)
              }}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onShowQR={onShowQR}
              expandedNodes={expandedNodes}
              setExpandedNodes={setExpandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HierarchyBuilder({ 
  locations, 
  onAddLocation, 
  onEditLocation, 
  onDeleteLocation, 
  onShowQR, 
  onBack,
  isLoading = false
}: HierarchyBuilderProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Ekspander alle root nodes som standard
  useState(() => {
    const rootNodes = locations.filter(loc => !loc.children?.length).map(loc => loc.id)
    setExpandedNodes(new Set(rootNodes))
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laster lokasjonshierarki...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TreePine className="h-8 w-8 text-green-600" />
                Lokasjonshierarki
              </h1>
              <p className="text-lg text-gray-600">
                Bygg opp strukturen for hjemmet ditt
              </p>
            </div>
          </div>
          
          {/* Quick Add Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onAddLocation(undefined, LocationType.ROOM)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nytt rom
            </Button>
          </div>
        </div>

        {/* Hierarchy Tree */}
        {locations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto mb-4 p-4 bg-gray-100 rounded-full w-fit">
                <TreePine className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ingen lokasjoner ennå
              </h3>
              <p className="text-gray-600 mb-6">
                Start med å opprette ditt første rom for å bygge opp strukturen
              </p>
              <Button
                onClick={() => onAddLocation(undefined, LocationType.ROOM)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Opprett første rom
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => (
              <TreeNode
                key={location.id}
                location={location}
                level={0}
                isExpanded={expandedNodes.has(location.id)}
                onToggle={() => {
                  const newExpanded = new Set(expandedNodes)
                  if (newExpanded.has(location.id)) {
                    newExpanded.delete(location.id)
                  } else {
                    newExpanded.add(location.id)
                  }
                  setExpandedNodes(newExpanded)
                }}
                onAddChild={(parentId, type) => onAddLocation(parentId, type)}
                onEdit={onEditLocation}
                onDelete={onDeleteLocation}
                onShowQR={onShowQR}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {locations.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {locations.length}
                    </div>
                    <div className="text-xs text-gray-600">Rom</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {locations.reduce((total, loc) => total + (loc.children?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-600">Underlokasjoner</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {locations.reduce((total, loc) => total + (loc.itemCount || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-600">Gjenstander</div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600">
                  <p>Wizard-basert organisering</p>
                  <p className="text-xs">Automatisk navngiving aktivert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}