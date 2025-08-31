// Script to create default system templates
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultTemplates = [
  {
    name: 'Standard HMS QR-etikett',
    description: 'Standard QR-kode etikett med gjenstandsnavn og lokasjon',
    type: 'QR' as const,
    size: 'STANDARD' as const,
    category: 'Standard',
    xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
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
      <Text>{{item.qrCode}}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText />
    </QRCodeObject>
    <TextObject>
      <Name>ITEM_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>{{item.name}}</String>
          <Attributes>
            <Font Family="Arial" Size="12" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
    <TextObject>
      <Name>LOCATION_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>{{location.name}}</String>
          <Attributes>
            <Font Family="Arial" Size="10" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`,
    fieldMapping: '{"item.name": "ITEM_NAME", "location.name": "LOCATION_NAME", "item.qrCode": "QR_CODE"}',
    isSystemDefault: true,
    complexity: 'SIMPLE' as const,
    estimatedRenderTime: 150
  },
  {
    name: 'Kompakt QR-etikett',
    description: 'Mindre QR-etikett for små gjenstander',
    type: 'QR' as const,
    size: 'SMALL' as const,
    category: 'Kompakt',
    xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Small</Id>
  <PaperName>30346 Small</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1080" Height="3600" Rx="180" Ry="180" />
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
      <Text>{{item.qrCode}}</Text>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText />
    </QRCodeObject>
    <TextObject>
      <Name>ITEM_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>{{item.name}}</String>
          <Attributes>
            <Font Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`,
    fieldMapping: '{"item.name": "ITEM_NAME", "item.qrCode": "QR_CODE"}',
    isSystemDefault: true,
    complexity: 'SIMPLE' as const,
    estimatedRenderTime: 100
  },
  {
    name: 'Strekkode etikett',
    description: 'Standard strekkode etikett med produktnummer',
    type: 'BARCODE' as const,
    size: 'STANDARD' as const,
    category: 'Strekkode',
    xml: `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <Id>Address</Id>
  <PaperName>30252 Address</PaperName>
  <DrawCommands>
    <RoundRectangle X="0" Y="0" Width="1581" Height="5040" Rx="270" Ry="270" />
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
      <Text>{{item.barcode}}</Text>
      <Type>Code128Auto</Type>
      <Size>Medium</Size>
      <TextPosition>Bottom</TextPosition>
      <TextFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <CheckSumFont Family="Arial" Size="8" Bold="False" Italic="False" Underline="False" Strikeout="False" />
      <TextColor Alpha="255" Red="0" Green="0" Blue="0" />
      <CheckSumColor Alpha="255" Red="0" Green="0" Blue="0" />
    </BarcodeObject>
    <TextObject>
      <Name>ITEM_NAME</Name>
      <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
      <BackColor Alpha="0" Red="255" Green="255" Blue="255" />
      <LinkedObjectName></LinkedObjectName>
      <Rotation>Rotation0</Rotation>
      <IsMirrored>False</IsMirrored>
      <IsVariable>True</IsVariable>
      <HorizontalAlignment>Center</HorizontalAlignment>
      <VerticalAlignment>Middle</VerticalAlignment>
      <TextFitMode>ShrinkToFit</TextFitMode>
      <UseFullFontHeight>True</UseFullFontHeight>
      <Verticalized>False</Verticalized>
      <StyledText>
        <Element>
          <String>{{item.name}}</String>
          <Attributes>
            <Font Family="Arial" Size="10" Bold="False" Italic="False" Underline="False" Strikeout="False" />
            <ForeColor Alpha="255" Red="0" Green="0" Blue="0" />
          </Attributes>
        </Element>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`,
    fieldMapping: '{"item.name": "ITEM_NAME", "item.barcode": "BARCODE"}',
    isSystemDefault: true,
    complexity: 'SIMPLE' as const,
    estimatedRenderTime: 120
  }
]

async function createDefaultTemplates() {
  try {
    console.log('🚀 Oppretter standard systemmaler...')
    
    for (const template of defaultTemplates) {
      // Sjekk om malen allerede eksisterer
      const existing = await prisma.labelTemplate.findFirst({
        where: {
          name: template.name,
          isSystemDefault: true
        }
      })
      
      if (existing) {
        console.log(`⏭️  Mal "${template.name}" eksisterer allerede`)
        continue
      }
      
      // Opprett malen
      const created = await prisma.labelTemplate.create({
        data: {
          ...template,
          userId: null, // System templates have no specific user
          version: 1,
          usageCount: 0
        }
      })
      
      console.log(`✅ Opprettet mal: "${created.name}" (${created.id})`)
    }
    
    console.log('🎉 Alle standard systemmaler er opprettet!')
    
  } catch (error) {
    console.error('❌ Feil ved oppretting av systemmaler:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Kjør scriptet hvis det kalles direkte
if (require.main === module) {
  createDefaultTemplates()
}

export { createDefaultTemplates }
