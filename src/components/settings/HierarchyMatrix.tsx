'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Save, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { LocationType } from '@prisma/client'

interface HierarchyMatrixProps {
  matrix: Record<string, Record<string, boolean>>
  locationTypes: LocationType[]
  locationTypeLabels: Record<string, string>
  onUpdate: (rules: Array<{
    parentType: LocationType
    childType: LocationType
    isAllowed: boolean
  }>) => void
  isLoading?: boolean
}

export function HierarchyMatrix({ 
  matrix, 
  locationTypes, 
  locationTypeLabels, 
  onUpdate, 
  isLoading = false 
}: HierarchyMatrixProps) {
  const [localMatrix, setLocalMatrix] = useState(matrix)
  const [hasChanges, setHasChanges] = useState(false)
  const [showOnlyAllowed, setShowOnlyAllowed] = useState(false)
  const [validationError, setValidationError] = useState<string>('')

  // Update local matrix when prop changes
  useEffect(() => {
    setLocalMatrix(matrix)
    setHasChanges(false)
  }, [matrix])

  // Toggle rule
  const toggleRule = (parentType: string, childType: string) => {
    if (parentType === childType) {
      return // Don't allow self-reference
    }

    const newMatrix = { ...localMatrix }
    if (!newMatrix[parentType]) {
      newMatrix[parentType] = {}
    }
    
    newMatrix[parentType][childType] = !newMatrix[parentType][childType]
    
    // Validate for circular dependencies
    const error = validateMatrix(newMatrix)
    if (error) {
      setValidationError(error)
      return // Don't apply change if it creates circular dependency
    }

    setValidationError('')
    setLocalMatrix(newMatrix)
    setHasChanges(true)
  }

  // Save changes
  const handleSave = () => {
    const rules: Array<{
      parentType: LocationType
      childType: LocationType
      isAllowed: boolean
    }> = []

    locationTypes.forEach(parentType => {
      locationTypes.forEach(childType => {
        if (parentType !== childType) {
          rules.push({
            parentType,
            childType,
            isAllowed: localMatrix[parentType]?.[childType] ?? false
          })
        }
      })
    })

    onUpdate(rules)
    setHasChanges(false)
  }

  // Reset changes
  const handleReset = () => {
    setLocalMatrix(matrix)
    setHasChanges(false)
    setValidationError('')
  }

  // Get rule count
  const getTotalRules = () => {
    let count = 0
    locationTypes.forEach(parentType => {
      locationTypes.forEach(childType => {
        if (parentType !== childType && localMatrix[parentType]?.[childType]) {
          count++
        }
      })
    })
    return count
  }

  // Filter types for display
  const displayTypes = showOnlyAllowed 
    ? locationTypes.filter(type => 
        locationTypes.some(otherType => 
          localMatrix[type]?.[otherType] || localMatrix[otherType]?.[type]
        )
      )
    : locationTypes

  return (
    <div className="matrix-panel space-y-6 cq">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {getTotalRules()} aktive regler
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyAllowed(!showOnlyAllowed)}
              className="text-xs"
            >
              {showOnlyAllowed ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Vis alle
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Vis kun aktive
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} size="sm">
              Tilbakestill
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading || !!validationError}
            size="sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lagre endringer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Matrix table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hierarki-matrise</CardTitle>
          <CardDescription>
            Rader = overordnet lokasjon (kan inneholde). Kolonner = underordnet lokasjon (kan plasseres i).
            Kryss av for tillatte kombinasjoner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="table-wrap overflow-x-auto">
            <table className="hierarchy-matrix table w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-2 bg-gray-50 text-left font-medium text-sm w-32">
                    Kan inneholde →
                    <br />
                    <span className="text-xs text-muted-foreground">↓ Plasseres i</span>
                  </th>
                  {displayTypes.map(childType => (
                    <th 
                      key={childType} 
                      className="border border-gray-200 p-2 bg-gray-50 text-center font-medium text-xs min-w-20"
                      title={locationTypeLabels[childType]}
                    >
                      <div className="transform -rotate-45 origin-center whitespace-nowrap">
                        {locationTypeLabels[childType]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayTypes.map(parentType => (
                  <tr key={parentType} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-2 font-medium text-sm bg-gray-50">
                      {locationTypeLabels[parentType]}
                    </td>
                    {displayTypes.map(childType => {
                      const isChecked = localMatrix[parentType]?.[childType] ?? false
                      const isSelfReference = parentType === childType
                      
                      return (
                        <td 
                          key={childType} 
                          className="border border-gray-200 p-2 text-center"
                        >
                          {isSelfReference ? (
                            <span className="text-gray-300 text-xs">—</span>
                          ) : (
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleRule(parentType, childType)}
                              className="mx-auto"
                              title={`${locationTypeLabels[parentType]} kan ${isChecked ? 'inneholde' : 'ikke inneholde'} ${locationTypeLabels[childType]}`}
                            />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Compact list fallback */}
          <div className="matrix-compact hidden">
            {displayTypes.map(parentType => {
              const allowedChildren = displayTypes.filter(childType => 
                childType !== parentType && localMatrix[parentType]?.[childType]
              )
              
              return (
                <div key={parentType} className="matrix-compact__item">
                  <div>
                    <div className="font-medium">{locationTypeLabels[parentType]}</div>
                    <div className="text-sm text-muted-foreground">
                      {allowedChildren.length > 0 
                        ? `Kan inneholde: ${allowedChildren.map(type => locationTypeLabels[type]).join(', ')}`
                        : 'Kan ikke inneholde andre typer'
                      }
                    </div>
                  </div>
                  <Badge variant="outline">
                    {allowedChildren.length} tillatt
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Eksempler på gjeldende regler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {locationTypes.map(parentType => {
              const allowedChildren = locationTypes.filter(childType => 
                childType !== parentType && localMatrix[parentType]?.[childType]
              )
              
              if (allowedChildren.length === 0) return null

              return (
                <div key={parentType} className="text-sm">
                  <span className="font-medium">{locationTypeLabels[parentType]}</span>
                  <span className="text-muted-foreground"> kan inneholde: </span>
                  <span className="text-blue-600">
                    {allowedChildren.map(type => locationTypeLabels[type]).join(', ')}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Simple circular dependency validation
function validateMatrix(matrix: Record<string, Record<string, boolean>>): string {
  const graph: Record<string, string[]> = {}
  
  // Build adjacency list for allowed relationships
  Object.entries(matrix).forEach(([parent, children]) => {
    graph[parent] = Object.entries(children)
      .filter(([_, allowed]) => allowed)
      .map(([child, _]) => child)
  })

  // Check for cycles using DFS
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function hasCycle(node: string, path: string[] = []): string | null {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node)
      const cycle = path.slice(cycleStart).concat(node)
      return `Sirkulær avhengighet: ${cycle.join(' → ')}`
    }
    if (visited.has(node)) {
      return null
    }

    visited.add(node)
    recursionStack.add(node)

    const neighbors = graph[node] || []
    for (const neighbor of neighbors) {
      const cycleError = hasCycle(neighbor, [...path, node])
      if (cycleError) return cycleError
    }

    recursionStack.delete(node)
    return null
  }

  // Check all nodes
  for (const node of Object.keys(graph)) {
    visited.clear()
    recursionStack.clear()
    const error = hasCycle(node)
    if (error) return error
  }

  return ''
}
