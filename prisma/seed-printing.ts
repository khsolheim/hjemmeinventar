// ============================================================================
// PRINTING SYSTEM - Seed Data (V3.1)
// ============================================================================

import { PrismaClient, LabelSize } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedPrintingSystem() {
  console.log('🏷️  Seeder printing-system...')

  try {
    // ============================================================================
    // 1. Default Tenant (for single-tenant development)
    // ============================================================================
    
    const defaultTenant = await prisma.tenant.upsert({
      where: { subdomain: 'default' },
      update: {},
      create: {
        name: 'Standard Tenant',
        subdomain: 'default',
        billingPlan: 'FREE',
        maxUsers: 10,
        maxPrintsPerMonth: 1000,
        maxTemplates: 50,
        isActive: true,
        settings: JSON.stringify({
          theme: 'light',
          enableAI: false,
          enableVoiceCommands: false
        })
      }
    })

    console.log('✅ Default tenant opprettet')

    // ============================================================================
    // 2. System Roles
    // ============================================================================
    
    const systemRoles = [
      {
        name: 'System Admin',
        description: 'Full administratortilgang til alle printing-funksjoner',
        permissions: JSON.stringify([
          'READ', 'WRITE', 'DELETE', 'SHARE', 'APPROVE', 'ADMIN'
        ]),
        isSystemRole: true
      },
      {
        name: 'Print Manager',
        description: 'Kan godkjenne utskriftsjobber og administrere maler',
        permissions: JSON.stringify([
          'READ', 'WRITE', 'SHARE', 'APPROVE'
        ]),
        isSystemRole: true
      },
      {
        name: 'Print User',
        description: 'Standard bruker med utskriftstilgang',
        permissions: JSON.stringify([
          'READ', 'WRITE'
        ]),
        isSystemRole: true
      }
    ]

    for (const role of systemRoles) {
      await prisma.role.upsert({
        where: { 
          name_tenantId: { 
            name: role.name, 
            tenantId: defaultTenant.id 
          } 
        },
        update: {},
        create: {
          ...role,
          tenantId: defaultTenant.id
        }
      })
    }

    console.log('✅ System-roller opprettet')

    // ============================================================================
    // 3. Label Media (System etiketter)
    // ============================================================================
    
    const labelMedia = [
      {
        code: '30334',
        dymoId: 'MultiPurpose',
        paperName: '30334 Multi-Purpose',
        size: LabelSize.SMALL,
        widthMm: 19,
        heightMm: 51,
        isActive: true,
        costPerLabel: 0.15,
        supplier: 'DYMO',
        stockQuantity: 1000
      },
      {
        code: '30252',
        dymoId: 'Address',
        paperName: '30252 Address',
        size: LabelSize.STANDARD,
        widthMm: 28,
        heightMm: 89,
        isActive: true,
        costPerLabel: 0.25,
        supplier: 'DYMO',
        stockQuantity: 500
      },
      {
        code: '30323',
        dymoId: 'Shipping',
        paperName: '30323 Shipping',
        size: LabelSize.LARGE,
        widthMm: 54,
        heightMm: 101,
        isActive: true,
        costPerLabel: 0.35,
        supplier: 'DYMO',
        stockQuantity: 250
      },
      {
        code: '99012',
        dymoId: 'Custom',
        paperName: '99012 Custom Size',
        size: LabelSize.CUSTOM,
        widthMm: null,
        heightMm: null,
        isActive: true,
        costPerLabel: 0.30,
        supplier: 'Generic',
        stockQuantity: 100
      }
    ]

    for (const media of labelMedia) {
      await prisma.labelMedia.upsert({
        where: { 
          code_dymoId_tenantId: { 
            code: media.code, 
            dymoId: media.dymoId, 
            tenantId: defaultTenant.id 
          } 
        },
        update: {},
        create: {
          ...media,
          tenantId: defaultTenant.id // System-wide for default tenant
        }
      })
    }

    console.log('✅ Label media opprettet')

    // ============================================================================
    // 4. System Template Hierarchy (Med arv)
    // ============================================================================

    // Base QR Template (Parent)
    const baseQRTemplate = await prisma.labelTemplate.upsert({
      where: { id: 'base-qr-template' },
      update: {},
      create: {
        id: 'base-qr-template',
        name: 'Base QR Template',
        description: 'Grunnmal for alle QR-etiketter med standard oppsett',
        type: 'QR',
        size: 'STANDARD',
        category: 'SYSTEM_BASE',
        xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1440" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <QRCodeObject>
      <Name>QR_CODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{QR_DATA}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <QuietZone Length="0.08in" />
    </QRCodeObject>
  </ObjectInfo>
</DieCutLabel>`,
        fieldMapping: JSON.stringify({
          QR_DATA: { required: true, type: 'string', description: 'QR-kode data' }
        }),
        isSystemDefault: true,
        complexity: 'SIMPLE',
        estimatedRenderTime: 100,
        labelMediaId: null, // Will be linked to 30252
        version: 1,
        locale: 'nb-NO',
        textDirection: 'ltr',
        parentTemplateId: null,
        inheritanceLevel: 0,
        tenantId: defaultTenant.id
      }
    })

    // QR Location Label (Child av Base QR)
    const qrLocationTemplate = await prisma.labelTemplate.upsert({
      where: { id: 'qr-location-template' },
      update: {},
      create: {
        id: 'qr-location-template',
        name: 'QR Lokasjonsetikett',
        description: 'QR-etikett for lokasjonssporing med navn og beskrivelse',
        type: 'QR',
        size: 'STANDARD',
        category: 'QR_LOCATION',
        xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1440" Height="5040" Rx="270" Ry="270" />
  </DrawCommands>
  <ObjectInfo>
    <QRCodeObject>
      <Name>QR_CODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>LOC:{LOCATION_ID}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <QuietZone Length="0.08in" />
    </QRCodeObject>
    <TextObject>
      <Name>LOCATION_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{LOCATION_NAME}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Bottom</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <FontName>Arial</FontName>
      <FontSize>10</FontSize>
      <IsBold>True</IsBold>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`,
        fieldMapping: JSON.stringify({
          LOCATION_ID: { required: true, type: 'string', description: 'Unik lokasjons-ID' },
          LOCATION_NAME: { required: true, type: 'string', description: 'Lokasjonsnavn' }
        }),
        isSystemDefault: true,
        complexity: 'MEDIUM',
        estimatedRenderTime: 150,
        labelMediaId: null,
        version: 1,
        locale: 'nb-NO',
        textDirection: 'ltr',
        parentTemplateId: baseQRTemplate.id,
        inheritanceLevel: 1,
        overriddenFields: JSON.stringify(['QR_DATA', 'TEXT_OBJECTS']),
        tenantId: defaultTenant.id
      }
    })

    // Base Barcode Template (Parent)
    const baseBarcodeTemplate = await prisma.labelTemplate.upsert({
      where: { id: 'base-barcode-template' },
      update: {},
      create: {
        id: 'base-barcode-template',
        name: 'Base Barcode Template',
        description: 'Grunnmal for alle strekkode-etiketter',
        type: 'BARCODE',
        size: 'SMALL',
        category: 'SYSTEM_BASE',
        xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>MultiPurpose</Id>
  <PaperName>30334 Multi-Purpose</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1071" Height="3420" Rx="180" Ry="180" />
  </DrawCommands>
  <ObjectInfo>
    <BarcodeObject>
      <Name>BARCODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{BARCODE_DATA}</Text>
      <Type>Code128</Type>
      <ShowText>True</ShowText>
      <TextPosition>Bottom</TextPosition>
    </BarcodeObject>
  </ObjectInfo>
</DieCutLabel>`,
        fieldMapping: JSON.stringify({
          BARCODE_DATA: { required: true, type: 'string', description: 'Strekkode data' }
        }),
        isSystemDefault: true,
        complexity: 'SIMPLE',
        estimatedRenderTime: 80,
        labelMediaId: null,
        version: 1,
        locale: 'nb-NO',
        textDirection: 'ltr',
        parentTemplateId: null,
        inheritanceLevel: 0,
        tenantId: defaultTenant.id
      }
    })

    // Item Barcode Template (Child av Base Barcode)
    const itemBarcodeTemplate = await prisma.labelTemplate.upsert({
      where: { id: 'item-barcode-template' },
      update: {},
      create: {
        id: 'item-barcode-template',
        name: 'Varestrekkode',
        description: 'Strekkode for varer med navn og pris',
        type: 'BARCODE',
        size: 'SMALL',
        category: 'BARCODE_ITEM',
        xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>MultiPurpose</Id>
  <PaperName>30334 Multi-Purpose</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1071" Height="3420" Rx="180" Ry="180" />
  </DrawCommands>
  <ObjectInfo>
    <BarcodeObject>
      <Name>BARCODE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{ITEM_BARCODE}</Text>
      <Type>Code128</Type>
      <ShowText>True</ShowText>
      <TextPosition>Bottom</TextPosition>
    </BarcodeObject>
    <TextObject>
      <Name>ITEM_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{ITEM_NAME}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <FontName>Arial</FontName>
      <FontSize>8</FontSize>
      <IsBold>False</IsBold>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`,
        fieldMapping: JSON.stringify({
          ITEM_BARCODE: { required: true, type: 'string', description: 'Vare-strekkode' },
          ITEM_NAME: { required: true, type: 'string', description: 'Varenavn' },
          ITEM_PRICE: { required: false, type: 'number', description: 'Pris (valgfri)' }
        }),
        isSystemDefault: true,
        complexity: 'MEDIUM',
        estimatedRenderTime: 120,
        labelMediaId: null,
        version: 1,
        locale: 'nb-NO',
        textDirection: 'ltr',
        parentTemplateId: baseBarcodeTemplate.id,
        inheritanceLevel: 1,
        overriddenFields: JSON.stringify(['BARCODE_DATA', 'TEXT_OBJECTS']),
        tenantId: defaultTenant.id
      }
    })

    // Custom Label Template (Standalone)
    const customTemplate = await prisma.labelTemplate.upsert({
      where: { id: 'custom-large-template' },
      update: {},
      create: {
        id: 'custom-large-template',
        name: 'Stor tilpasset etikett',
        description: 'Stor etikett for omfattende informasjon',
        type: 'CUSTOM',
        size: 'LARGE',
        category: 'CUSTOM_LABEL',
        xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Shipping</Id>
  <PaperName>30323 Shipping</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="2310" Height="7200" Rx="360" Ry="360" />
  </DrawCommands>
  <ObjectInfo>
    <TextObject>
      <Name>TITLE</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{TITLE}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Top</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <FontName>Arial</FontName>
      <FontSize>14</FontSize>
      <IsBold>True</IsBold>
    </TextObject>
    <TextObject>
      <Name>DESCRIPTION</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <Text>{DESCRIPTION}</Text>
      <HorizontalAlignment>Left</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <FontName>Arial</FontName>
      <FontSize>10</FontSize>
      <IsBold>False</IsBold>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`,
        fieldMapping: JSON.stringify({
          TITLE: { required: true, type: 'string', description: 'Hovedtittel' },
          DESCRIPTION: { required: false, type: 'string', description: 'Beskrivelse' },
          EXTRA_INFO: { required: false, type: 'string', description: 'Tilleggsinformasjon' }
        }),
        isSystemDefault: true,
        complexity: 'COMPLEX',
        estimatedRenderTime: 200,
        labelMediaId: null,
        version: 1,
        locale: 'nb-NO',
        textDirection: 'ltr',
        parentTemplateId: null,
        inheritanceLevel: 0,
        tenantId: defaultTenant.id
      }
    })

    console.log('✅ System-maler opprettet med arvshierarki')

    // ============================================================================
    // 5. System Konfigurasjoner
    // ============================================================================
    
    const systemConfigs = [
      // Global settings
      {
        key: 'max_daily_prints_default',
        value: '100',
        dataType: 'INTEGER',
        description: 'Standard daglig utskriftsgrense',
        isUserConfigurable: true,
        scope: 'GLOBAL',
        scopeId: null,
        defaultValue: '100',
        category: 'QUOTAS'
      },
      {
        key: 'enable_cost_tracking',
        value: 'false',
        dataType: 'BOOLEAN',
        description: 'Aktiver kostnadssporing',
        isUserConfigurable: true,
        scope: 'HOUSEHOLD',
        scopeId: null,
        defaultValue: 'false',
        category: 'BILLING'
      },
      {
        key: 'max_retry_attempts',
        value: '3',
        dataType: 'INTEGER',
        description: 'Maks antall gjenforsøk for feilede jobber',
        isUserConfigurable: false,
        scope: 'GLOBAL',
        scopeId: null,
        defaultValue: '3',
        category: 'SYSTEM'
      },
      {
        key: 'enable_audit_logging',
        value: 'true',
        dataType: 'BOOLEAN',
        description: 'Aktiver detaljert audit logging',
        isUserConfigurable: false,
        scope: 'GLOBAL',
        scopeId: null,
        defaultValue: 'true',
        category: 'SECURITY'
      },
      {
        key: 'ai_optimization_enabled',
        value: 'true',
        dataType: 'BOOLEAN',
        description: 'Aktiver AI-optimalisering',
        isUserConfigurable: true,
        scope: 'TENANT',
        scopeId: null,
        defaultValue: 'true',
        category: 'AI'
      },
      {
        key: 'voice_commands_enabled',
        value: 'false',
        dataType: 'BOOLEAN',
        description: 'Aktiver stemmekommandoer',
        isUserConfigurable: true,
        scope: 'USER',
        scopeId: null,
        defaultValue: 'false',
        category: 'ACCESSIBILITY'
      },
      {
        key: 'dark_mode_default',
        value: 'system',
        dataType: 'STRING',
        description: 'Standard tema-modus',
        isUserConfigurable: true,
        scope: 'USER',
        scopeId: null,
        defaultValue: 'system',
        category: 'UI'
      },
      {
        key: 'notification_channels',
        value: '["email","push"]',
        dataType: 'JSON',
        description: 'Aktiverte notification-kanaler',
        isUserConfigurable: true,
        scope: 'USER',
        scopeId: null,
        defaultValue: '["email"]',
        category: 'NOTIFICATIONS'
      },
      {
        key: 'approval_threshold_cost',
        value: '100.00',
        dataType: 'DECIMAL',
        description: 'Kostnadsgrense for godkjenning (NOK)',
        isUserConfigurable: true,
        scope: 'HOUSEHOLD',
        scopeId: null,
        defaultValue: '100.00',
        category: 'APPROVAL'
      },
      {
        key: 'default_printer_connection_timeout',
        value: '30',
        dataType: 'INTEGER',
        description: 'Timeout for skriverforbindelse (sekunder)',
        isUserConfigurable: false,
        scope: 'GLOBAL',
        scopeId: null,
        defaultValue: '30',
        category: 'PRINTING'
      }
    ]

    for (const config of systemConfigs) {
      const scopeId = config.scopeId || 'global' // Use 'global' instead of null for SQLite
      await prisma.printingConfig.upsert({
        where: { 
          key_scope_scopeId: { 
            key: config.key, 
            scope: config.scope as any, 
            scopeId: scopeId 
          } 
        },
        update: {},
        create: {
          ...config,
          scope: config.scope as any,
          dataType: config.dataType as any,
          scopeId: scopeId
        }
      })
    }

    console.log('✅ System-konfigurasjoner opprettet')

    // ============================================================================
    // 6. Validation Rules
    // ============================================================================
    
    const validationRules = [
      {
        name: 'QR Code Format Validation',
        description: 'Validerer QR-kode format og innhold',
        ruleType: 'QR_CONTENT',
        ruleConfig: JSON.stringify({
          maxLength: 2048,
          allowedCharacters: 'alphanumeric',
          requirePrefix: false
        }),
        errorMessage: 'QR-kode må være under 2048 tegn og inneholde gyldige tegn',
        isActive: true,
        severity: 'ERROR',
        templateId: null // Global rule
      },
      {
        name: 'Barcode Format Validation',
        description: 'Validerer strekkode format',
        ruleType: 'BARCODE_FORMAT',
        ruleConfig: JSON.stringify({
          allowedTypes: ['Code128', 'Code39', 'EAN13', 'UPC'],
          checkDigit: true
        }),
        errorMessage: 'Ugyldig strekkode format',
        isActive: true,
        severity: 'ERROR',
        templateId: null
      },
      {
        name: 'Required Field Check',
        description: 'Sjekker at påkrevde felter er utfylt',
        ruleType: 'FIELD_REQUIRED',
        ruleConfig: JSON.stringify({
          fields: ['LOCATION_ID', 'ITEM_BARCODE'],
          allowEmpty: false
        }),
        errorMessage: 'Påkrevde felter må være utfylt',
        isActive: true,
        severity: 'ERROR',
        templateId: null
      }
    ]

    for (const rule of validationRules) {
      await prisma.labelValidationRule.create({
        data: {
          ...rule,
          ruleType: rule.ruleType as any,
          severity: rule.severity as any
        }
      })
    }

    console.log('✅ Validiseringsregler opprettet')

    // ============================================================================
    // 7. Standard Approval Workflows
    // ============================================================================
    
    const approvalWorkflows = [
      {
        name: 'High Cost Approval',
        description: 'Godkjenning for høye kostnader',
        requiredApprovers: JSON.stringify(['manager', 'finance']),
        totalSteps: 2,
        escalationRules: JSON.stringify([
          {
            stepNumber: 1,
            timeoutMinutes: 1440, // 24 hours
            escalateTo: ['manager'],
            notificationMethod: ['EMAIL', 'PUSH']
          },
          {
            stepNumber: 2,
            timeoutMinutes: 720, // 12 hours
            escalateTo: ['finance'],
            notificationMethod: ['EMAIL']
          }
        ]),
        timeoutMinutes: 1440
      }
    ]

    // Note: Approval workflows are created per print job, så vi seeder ikke disse direkte

    console.log('✅ Approval workflow-maler definert')

    // ============================================================================
    // 8. Notification Templates
    // ============================================================================
    
    const notificationTemplates = [
      {
        name: 'Print Job Completed',
        type: 'EMAIL',
        trigger: 'JOB_COMPLETED',
        subject: 'Utskriftsjobb fullført',
        body: 'Din utskriftsjobb "{JOB_TITLE}" er fullført. {LABELS_PRINTED} etiketter ble skrevet ut.',
        variables: JSON.stringify(['JOB_TITLE', 'LABELS_PRINTED', 'COST', 'DURATION']),
        isActive: true
      },
      {
        name: 'Print Job Failed',
        type: 'EMAIL',
        trigger: 'JOB_FAILED',
        subject: 'Utskriftsjobb feilet',
        body: 'Din utskriftsjobb "{JOB_TITLE}" feilet med feilmelding: {ERROR_MESSAGE}',
        variables: JSON.stringify(['JOB_TITLE', 'ERROR_MESSAGE', 'RETRY_COUNT']),
        isActive: true
      },
      {
        name: 'Quota Exceeded Warning',
        type: 'PUSH',
        trigger: 'QUOTA_WARNING',
        subject: 'Utskriftskvote nær grensen',
        body: 'Du har brukt {USAGE_PERCENTAGE}% av din månedlige utskriftskvote.',
        variables: JSON.stringify(['USAGE_PERCENTAGE', 'REMAINING_PRINTS', 'RESET_DATE']),
        isActive: true
      },
      {
        name: 'Approval Required',
        type: 'EMAIL',
        trigger: 'APPROVAL_REQUIRED',
        subject: 'Godkjenning påkrevet for utskriftsjobb',
        body: 'Utskriftsjobb "{JOB_TITLE}" krever din godkjenning. Estimert kostnad: {COST} NOK.',
        variables: JSON.stringify(['JOB_TITLE', 'COST', 'REQUESTER', 'DEADLINE']),
        isActive: true
      }
    ]

    for (const template of notificationTemplates) {
      await prisma.notificationTemplate.create({
        data: {
          ...template,
          type: template.type as any
        }
      })
    }

    console.log('✅ Notification-maler opprettet')

    console.log('🎉 Printing-system seed fullført!')

  } catch (error) {
    console.error('❌ Feil i printing-system seed:', error)
    throw error
  }
}

// Kjør seed hvis denne filen kjøres direkte
if (require.main === module) {
  seedPrintingSystem()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}