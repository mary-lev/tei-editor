import { useState, useEffect } from 'react'
import FileLoader from './components/FileLoader'
import ThreePaneLayout from './components/ThreePaneLayout'
import ExportButton from './components/ExportButton'
import PageIndicator from './components/PageIndicator'
import { TEIOperations } from './utils/teiOperations'
import { extractTeiMetadata } from './utils/teiMetadata'

function App() {
  const [teiDocument, setTeiDocument] = useState(null)
  const [documentImages, setDocumentImages] = useState([])
  const [showTeiCode, setShowTeiCode] = useState(true)
  const [pageIndicatorProps, setPageIndicatorProps] = useState(null)
  const [documentMetadata, setDocumentMetadata] = useState(null)
  const [availableSamples, setAvailableSamples] = useState([])

  // Load available samples on component mount
  useEffect(() => {
    const loadSamples = async () => {
      try {
        const response = await fetch('/samples/index.json')
        const data = await response.json()
        setAvailableSamples(data.samples || [])
      } catch (error) {
        console.error('Failed to load samples:', error)
      }
    }
    loadSamples()
  }, [])

  const handleFileLoad = (document, images) => {
    setTeiDocument(document)
    setDocumentImages(images)
    
    // Extract document metadata
    const metadata = extractTeiMetadata(document.dom, document.sampleInfo)
    setDocumentMetadata(metadata)
  }

  const handleDocumentSwitch = async (sampleId) => {
    if (!sampleId) return
    
    const sample = availableSamples.find(s => s.id === sampleId)
    if (!sample) return

    try {
      // Load the new sample document
      const response = await fetch(`/${sample.xmlPath}`)
      const text = await response.text()
      const parser = new DOMParser()
      const dom = parser.parseFromString(text, 'application/xml')
      
      // Check for parsing errors
      const parserError = dom.querySelector('parsererror')
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`)
      }

      const teiDocument = {
        dom,
        filename: sample.id,
        documentHash: sample.id.replace('doc_', ''),
        text,
        isLoadedFromSample: true,
        sampleInfo: sample
      }

      // Load images for the new document
      const images = []
      
      handleFileLoad(teiDocument, images)
    } catch (error) {
      alert(`Error switching to document: ${error.message}`)
      console.error('Document switch failed:', error)
    }
  }

  const handleTeiChange = (xmlText, dom) => {
    if (!teiDocument) return

    try {
      // Check for parsing errors
      const parserError = dom.querySelector('parsererror')
      if (parserError) {
        console.warn('XML has parsing errors:', parserError.textContent)
        // Don't update if XML is invalid
        return
      }

      // Update the document with the new DOM
      const updatedDocument = {
        ...teiDocument,
        dom,
        text: xmlText,
        lastModified: Date.now() // Force re-render
      }

      setTeiDocument(updatedDocument)
      
      // Update metadata in case title/author changed
      const metadata = extractTeiMetadata(dom, teiDocument.sampleInfo)
      setDocumentMetadata(metadata)

    } catch (error) {
      console.error('Error updating TEI document:', error)
    }
  }

  const handleTeiOperation = (operation, selectionData) => {
    if (!teiDocument) {
      alert('No TEI document loaded')
      return
    }

    try {
      const teiOps = new TEIOperations(teiDocument)
      const result = teiOps.executeOperation(operation, selectionData)
      
      // Force re-render by updating the document state with a new timestamp
      // This ensures React knows the DOM content has changed
      setTeiDocument({ 
        ...teiDocument, 
        lastModified: Date.now() // Add timestamp to force re-render
      })
      
      // Show success message
      alert(`✅ ${result.operation} completed successfully!`)
      
      console.log('TEI Operation result:', result)
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
      console.error('TEI Operation failed:', error)
    }
  }

  const handleExport = () => {
    if (!teiDocument) return
    
    const serializer = new XMLSerializer()
    const xmlString = serializer.serializeToString(teiDocument.dom)
    const blob = new Blob([xmlString], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${teiDocument.filename || 'tei-document'}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-slate-900">TEI Poetry Editor</h1>
        {teiDocument && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowTeiCode(!showTeiCode)}
              className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
              data-testid="tei-code-toggle"
            >
              {showTeiCode ? 'Hide' : 'Show'} TEI Code
            </button>
            <ExportButton onExport={handleExport} disabled={!teiDocument} />
          </div>
        )}
      </header>

      {/* Page Indicator - only show when document is loaded */}
      {teiDocument && pageIndicatorProps && (
        <PageIndicator
          currentPage={pageIndicatorProps.currentPage}
          totalPages={pageIndicatorProps.totalPages}
          onPageNavigation={pageIndicatorProps.handlePageNavigation}
          isTransitioning={pageIndicatorProps.isTransitioning}
          documentMetadata={documentMetadata}
          availableSamples={availableSamples}
          currentDocument={teiDocument}
          onDocumentSwitch={handleDocumentSwitch}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {!teiDocument ? (
          <FileLoader onFileLoad={handleFileLoad} />
        ) : (
          <ThreePaneLayout 
            teiDocument={teiDocument}
            documentImages={documentImages}
            showTeiCode={showTeiCode}
            onTeiOperation={handleTeiOperation}
            onTeiChange={handleTeiChange}
            onPageIndicatorUpdate={setPageIndicatorProps}
          />
        )}
      </main>
    </div>
  )
}

export default App
