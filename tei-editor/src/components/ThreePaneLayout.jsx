import { useState, useEffect } from 'react'
import ImagePane from './ImagePane'
import RenderedTextPane from './RenderedTextPane'
import TEICodePane from './TEICodePane'
import FloatingToolbar from './FloatingToolbar'
import { useTextSelection } from '../hooks/useTextSelection'
import { usePageBlockScrolling } from '../hooks/usePageBlockScrolling'

function ThreePaneLayout({ teiDocument, documentImages, showTeiCode, onTeiOperation, onTeiChange, onPageIndicatorUpdate }) {
  const paneWidth = showTeiCode ? 'w-1/3' : 'w-1/2'
  const { selection, isSelecting, clearSelection, preserveCurrentSelection } = useTextSelection()
  const [selectedStanzas, setSelectedStanzas] = useState([])
  const [isModifyingTei, setIsModifyingTei] = useState(false)
  
  // Page-block synchronized scrolling (disable during text selection to prevent unwanted scrolling)
  const {
    renderedTextRef,
    imageRef,
    teiCodeRef,
    currentPage,
    totalPages,
    isTransitioning,
    handlePageNavigation,
    detectPageFromScroll
  } = usePageBlockScrolling(teiDocument, isModifyingTei || isSelecting)

  // Pass page indicator props to parent
  useEffect(() => {
    if (onPageIndicatorUpdate) {
      onPageIndicatorUpdate({
        currentPage,
        totalPages,
        isTransitioning,
        handlePageNavigation
      })
    }
  }, [currentPage, totalPages, isTransitioning, handlePageNavigation, onPageIndicatorUpdate])

  const handleStanzaSelectionChange = (stanzaId, isSelected) => {
    console.log('🎛️ Stanza selection change:', stanzaId, isSelected)
    setSelectedStanzas(prev => {
      const newSelection = isSelected 
        ? [...prev, stanzaId]
        : prev.filter(id => id !== stanzaId)
      console.log('🎛️ New selected stanzas:', newSelection)
      return newSelection
    })
  }

  const handleTeiOperation = async (operation, selectionData) => {
    console.log('🔧 TEI Operation starting:', operation, selectionData)
    
    // Set modification flag to prevent page detection during operation
    setIsModifyingTei(true)
    
    try {
      // Map new button IDs to existing operations for backwards compatibility
      let mappedOperation = operation
      
      // Map line conversion operations to existing tag operations
      if (operation === 'line-to-title') mappedOperation = 'tag-heading'
      if (operation === 'line-to-subtitle') mappedOperation = 'tag-subtitle'  
      if (operation === 'line-to-epigraph') mappedOperation = 'tag-epigraph'
      if (operation === 'line-to-dedication') mappedOperation = 'tag-dedication'
      
      // Map create operations to existing operations
      if (operation === 'create-heading') mappedOperation = 'tag-heading'
      // Note: create-line, create-stanza are new operations that may need backend implementation
      
      // For merge operations, use checkbox selection instead of text selection
      if (operation === 'merge-stanzas') {
        if (selectedStanzas.length < 2) {
          alert('Please select at least 2 stanzas using the checkboxes to merge them.')
          return
        }
        
        // Create merge data object even if selectionData is null
        const mergeData = {
          selectedStanzaIds: selectedStanzas,
          text: `${selectedStanzas.length} stanzas selected`,
          // Add dummy properties in case they're needed
          range: null,
          rect: null,
          startContainer: null,
          endContainer: null,
          startOffset: 0,
          endOffset: 0
        }
        
        if (onTeiOperation) {
          onTeiOperation(mappedOperation, mergeData)
        }
        
        // Clear stanza selection after merge
        setSelectedStanzas([])
      } else if (operation === 'delete-element' && selectedStanzas.length > 0) {
        // For delete operations with checkbox selections
        if (window.confirm(`Delete ${selectedStanzas.length} selected element(s)?`)) {
          // Process all deletions first
          const elementsToDelete = [...selectedStanzas] // Create a copy
          
          elementsToDelete.forEach(elementId => {
            // Create fake selection for each selected element
            const fakeSelection = {
              text: elementId, // Use the ID as text for matching
              selectedStanzaIds: [elementId]
            }
            
            if (onTeiOperation) {
              onTeiOperation('delete-element', fakeSelection)
            }
          })
          
          // Clear selection after all deletions are complete
          setSelectedStanzas([])
        }
      } else {
        // For other operations, use text selection
        if (onTeiOperation) {
          onTeiOperation(mappedOperation, selectionData)
        }
      }
      
      // Clear text selection after operation
      clearSelection()
      
    } finally {
      // Always clear modification flag after operation completes
      // Use timeout to ensure DOM updates are processed
      setTimeout(() => {
        setIsModifyingTei(false)
        console.log('✅ TEI Operation completed, page detection re-enabled')
      }, 500) // Give time for content to settle
    }
  }

  return (
    <div className="h-full flex relative font-sans" data-testid="three-pane-layout">
      {/* Images Pane */}
      <div className={`${paneWidth} border-r border-slate-200 bg-white`} data-testid="image-pane">
        <ImagePane 
          ref={imageRef}
          documentImages={documentImages}
          documentHash={teiDocument.documentHash}
          teiDocument={teiDocument}
          onScroll={detectPageFromScroll}
        />
      </div>

      {/* Rendered Text Pane */}
      <div className={`${paneWidth} border-r border-slate-200 bg-white`} data-testid="rendered-text-pane">
        <RenderedTextPane 
          ref={renderedTextRef}
          teiDocument={teiDocument}
          selectedStanzas={selectedStanzas}
          onStanzaSelectionChange={handleStanzaSelectionChange}
          onTeiOperation={handleTeiOperation}
          onScroll={detectPageFromScroll}
        />
      </div>

      {/* TEI Code Pane (toggleable) */}
      {showTeiCode && (
        <div className="w-1/3 bg-slate-50" data-testid="tei-code-pane">
          <TEICodePane 
            ref={teiCodeRef} 
            teiDocument={teiDocument}
            onScroll={detectPageFromScroll}
            onTeiChange={onTeiChange}
          />
        </div>
      )}

      {/* Floating Toolbar */}
      {(selection?.text || selectedStanzas.length > 0) && (
        <FloatingToolbar
          selection={selection}
          onOperation={handleTeiOperation}
          onClose={() => {
            clearSelection()
            setSelectedStanzas([])
          }}
          selectedStanzasCount={selectedStanzas.length}
          preserveSelection={preserveCurrentSelection}
        />
      )}

    </div>
  )
}

export default ThreePaneLayout
