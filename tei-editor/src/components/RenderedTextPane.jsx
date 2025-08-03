import { useMemo, useState, useRef, forwardRef, useCallback } from 'react'

const RenderedTextPane = forwardRef(({ teiDocument, onTextSelection, selectedStanzas, onStanzaSelectionChange, onTeiOperation, onScroll }, ref) => {
  const stanzaIdCounter = useRef(0)
  const renderedContent = useMemo(() => {
    if (!teiDocument?.dom) return null

    // Get both front matter and body content
    const textElement = teiDocument.dom.querySelector('text')
    if (!textElement) return null
    
    // Process all children of <text> including <front> and <body>
    const allTextContent = Array.from(textElement.children)

    // Helper function to generate page markers for elements with facs attributes
    // Only generates markers if there's no <pb> element for the same page
    const generatePageMarker = (element) => {
      const facs = element.getAttribute('facs')
      const pageMatch = facs?.match(/#page_?(\d+)/)
      const pageNum = pageMatch ? pageMatch[1] : null
      
      if (!pageNum) return null
      
      // Check if there's already a <pb> element for this page number in the document
      // by looking for siblings or preceding elements
      const textElement = teiDocument.dom.querySelector('text')
      if (textElement) {
        const existingPb = textElement.querySelector(`pb[n="${pageNum}"]`)
        if (existingPb) {
          // There's already a <pb> element for this page, don't create duplicate marker
          return null
        }
      }
      
      return (
        <div 
          key={`page-marker-${pageNum}`}
          className="page-break border-t-2 border-blue-200 py-2 my-4"
          data-page-break="true"
          data-page-number={pageNum}
        >
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Page {pageNum}
          </span>
        </div>
      )
    }

    const renderElement = (element) => {
      const tagName = element.tagName?.toLowerCase()

      switch (tagName) {
        case 'pb': {
          const pageNum = element.getAttribute('n')
          
          // For now, don't try to detect empty pages at render time
          // The page synchronization system will handle empty page spacing
          return (
            <div 
              key={Math.random()} 
              className="page-break border-t-2 border-blue-200 py-2 my-4"
              data-page-break="true"
              data-page-number={pageNum}
            >
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Page {pageNum}
              </span>
            </div>
          )
        }

        case 'front':
          return (
            <div key={Math.random()} className="front-matter mb-8 p-4 bg-slate-50 rounded-lg">
              <div className="text-sm font-semibold text-slate-600 mb-4">Front Matter</div>
              {Array.from(element.children).map(child => renderElement(child))}
            </div>
          )

        case 'body':
          return (
            <div key={Math.random()} className="body-content">
              {Array.from(element.children).map(child => renderElement(child))}
            </div>
          )

        case 'titlepage':
          const facs = element.getAttribute('facs')
          const pageMarker = generatePageMarker(element)
          
          return (
            <div key={Math.random()}>
              {/* Add page marker for elements with facs attributes */}
              {pageMarker}
              <div className="title-page mb-6 p-4 bg-white rounded border-2 border-amber-200">
                <div className="text-xs text-amber-700 mb-2">Title Page {facs}</div>
                <div className="text-center space-y-2">
                  {Array.from(element.children).map(child => renderElement(child))}
                </div>
              </div>
            </div>
          )

        case 'doctitle':
          return (
            <div key={Math.random()} className="doc-title mb-4">
              {Array.from(element.children).map(child => renderElement(child))}
            </div>
          )

        case 'titlepart':
          return (
            <div key={Math.random()} className="title-part text-xl font-bold text-gray-900 mb-2 text-center">
              {element.textContent}
            </div>
          )

        case 'docimprint':
          return (
            <div key={Math.random()} className="doc-imprint text-sm text-gray-600 mt-4">
              {Array.from(element.children).map(child => renderElement(child))}
            </div>
          )

        case 'publisher':
          return (
            <div key={Math.random()} className="publisher italic text-gray-700">
              {element.textContent}
            </div>
          )

        case 'div': {
          const type = element.getAttribute('type')
          const xmlId = element.getAttribute('xml:id')
          const pageMarker = generatePageMarker(element)
          
          if (type === 'poem') {
            return (
              <div key={xmlId || Math.random()}>
                {pageMarker}
                <div className="poem mb-8 p-4 bg-gray-50 rounded-lg">
                  {Array.from(element.children).map(child => renderElement(child))}
                </div>
              </div>
            )
          }
          
          if (type === 'part') {
            return (
              <div key={Math.random()}>
                {pageMarker}
                <div className="poem-part mb-6 p-3 bg-white rounded border">
                  {Array.from(element.children).map(child => renderElement(child))}
                </div>
              </div>
            )
          }
          
          return (
            <div key={Math.random()}>
              {pageMarker}
              <div className="div-element mb-4">
                {Array.from(element.children).map(child => renderElement(child))}
              </div>
            </div>
          )
        }

        case 'head': {
          const type = element.getAttribute('type')
          // Create stable ID based on content and position to avoid re-rendering issues
          const headId = element.getAttribute('xml:id') || `head_${element.textContent?.trim().replace(/\s+/g, '_').substring(0, 20)}_${Math.abs(element.textContent?.trim().split('').reduce((a, b) => a + b.charCodeAt(0), 0) || 0)}`
          const isSelected = selectedStanzas && selectedStanzas.includes(headId)
          
          if (type === 'sub') {
            return (
              <div 
                key={headId} 
                className={`subtitle flex items-start py-1 mb-2 p-2 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'border-transparent hover:border-gray-200'}`}
                data-head-id={headId}
              >
                <div className="flex items-center justify-between mb-1 w-full">
                  <div className="flex items-start">
                    <span 
                      className="text-xs text-gray-400 w-8 flex-shrink-0 mt-1"
                      style={{ userSelect: 'none' }}
                    >
                      Sub
                    </span>
                    <span className="flex-1 text-base font-semibold text-gray-800 italic leading-relaxed">
                      {element.textContent}
                    </span>
                  </div>
                  {onStanzaSelectionChange ? (
                    <label className="flex items-center cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={(e) => {
                          console.log('📦 Subtitle checkbox clicked:', headId, e.target.checked)
                          onStanzaSelectionChange(headId, e.target.checked)
                        }}
                        className="mr-1 text-blue-600"
                      />
                      <span className="text-xs text-gray-600">Select</span>
                    </label>
                  ) : null}
                </div>
              </div>
            )
          }
          return (
            <div 
              key={headId} 
              className={`heading flex items-start py-1 mb-3 p-2 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'border-transparent hover:border-gray-200'}`}
              data-head-id={headId}
            >
              <div className="flex items-center justify-between mb-1 w-full">
                <div className="flex items-start">
                  <span 
                    className="text-xs text-gray-400 w-8 flex-shrink-0 mt-1"
                    style={{ userSelect: 'none' }}
                  >
                    H
                  </span>
                  <span className="flex-1 text-lg font-bold text-gray-900 leading-relaxed">
                    {element.textContent}
                  </span>
                </div>
                {onStanzaSelectionChange ? (
                  <label className="flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={isSelected || false}
                      onChange={(e) => {
                        console.log('📦 Header checkbox clicked:', headId, e.target.checked)
                        onStanzaSelectionChange(headId, e.target.checked)
                      }}
                      className="mr-1 text-blue-600"
                    />
                    <span className="text-xs text-gray-600">Select</span>
                  </label>
                ) : null}
              </div>
            </div>
          )
        }

        case 'dedication':
          return (
            <div 
              key={Math.random()} 
              className="dedication italic text-gray-700 mb-3"
              style={{ userSelect: 'text', cursor: 'text' }}
            >
              {Array.from(element.children).map(child => renderElement(child))}
            </div>
          )

        case 'epigraph':
          return (
            <div 
              key={Math.random()} 
              className="epigraph text-gray-600 mb-3 pl-4 border-l-2 border-gray-300"
              style={{ userSelect: 'text', cursor: 'text' }}
            >
              {Array.from(element.children).map(child => renderElement(child))}
            </div>
          )

        case 'lg': {
          const type = element.getAttribute('type')
          const stanzaNum = element.getAttribute('n')
          
          if (type === 'poem') {
            return (
              <div 
                key={Math.random()} 
                className="poem-lg"
                style={{ userSelect: 'text', cursor: 'text' }}
              >
                {Array.from(element.children).map(child => renderElement(child))}
              </div>
            )
          }
          
          if (type === 'stanza') {
            // Create a stable ID - use xml:id if available, otherwise use stanza number
            const stanzaId = element.getAttribute('xml:id') || `stanza_${stanzaNum}`
            const isSelected = selectedStanzas && selectedStanzas.includes(stanzaId)
                       
            return (
              <div 
                key={stanzaNum || Math.random()} 
                className={`stanza mb-4 p-2 rounded border ${isSelected ? 'bg-blue-50 border-blue-300' : 'border-transparent hover:border-gray-200'}`}
                data-stanza-id={stanzaId}
              >
                <div 
                  className="flex items-center justify-between mb-1"
                  style={{ userSelect: 'none' }}
                >
                  <div className="text-xs text-gray-500" style={{ userSelect: 'none' }}>
                    Stanza {stanzaNum}
                  </div>
                  {onStanzaSelectionChange ? (
                    <label className="flex items-center cursor-pointer" style={{ userSelect: 'none' }}>
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={(e) => {
                          console.log('📦 Checkbox clicked:', stanzaId, e.target.checked)
                          onStanzaSelectionChange(stanzaId, e.target.checked)
                        }}
                        className="mr-1 text-blue-600"
                        style={{ userSelect: 'none' }}
                      />
                      <span className="text-xs text-gray-600" style={{ userSelect: 'none' }}>
                        Select
                      </span>
                    </label>
                  ) : (
                    <span className="text-xs text-red-500" style={{ userSelect: 'none' }}>
                      No handler
                    </span>
                  )}
                </div>
                <div className="pl-4">
                  {Array.from(element.children).map(child => renderElement(child))}
                </div>
              </div>
            )
          }
          
          return (
            <div key={Math.random()} className="lg-element mb-3">
              {Array.from(element.children).map(child => renderElement(child))}
            </div>
          )
        }

        case 'l': {
          const lineNum = element.getAttribute('n')
          const xmlId = element.getAttribute('xml:id')
          
          return (
            <div 
              key={xmlId || Math.random()} 
              className="line flex items-start py-1"
              style={{ userSelect: 'text', cursor: 'text' }}
            >
              <span 
                className="text-xs text-gray-400 w-8 flex-shrink-0 mt-1"
                style={{ userSelect: 'none' }}
              >
                {lineNum}
              </span>
              <span className="flex-1 leading-relaxed">
                {element.textContent}
              </span>
            </div>
          )
        }

        case 'p':
          return (
            <p 
              key={Math.random()} 
              className="paragraph mb-2"
              style={{ userSelect: 'text', cursor: 'text' }}
            >
              {element.textContent}
            </p>
          )

        default:
          // For unknown elements, render children
          if (element.children?.length > 0) {
            return (
              <div key={Math.random()}>
                {Array.from(element.children).map(child => renderElement(child))}
              </div>
            )
          }
          // For text nodes or elements without children
          return element.textContent ? (
            <span key={Math.random()}>{element.textContent}</span>
          ) : null
      }
    }

    return allTextContent.map(child => renderElement(child))
  }, [teiDocument, selectedStanzas, onStanzaSelectionChange, onTeiOperation])

  // Handle scroll events for page detection
  const handleScroll = useCallback((event) => {
    if (onScroll && ref.current) {
      const container = event.target
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      onScroll(scrollTop, containerHeight, 'text')
    }
  }, [onScroll, ref])

  if (!teiDocument) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">No document loaded</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto" ref={ref} onScroll={handleScroll}>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Rendered Text</h2>
        
        <div 
          className="prose prose-sm max-w-none"
          data-pane="rendered-text"
          style={{ userSelect: 'text' }}
        >
          {renderedContent}
        </div>
      </div>
    </div>
  )
})

export default RenderedTextPane