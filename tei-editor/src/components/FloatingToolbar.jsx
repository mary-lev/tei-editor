import { useState, useEffect } from 'react'

function FloatingToolbar({ selection, onOperation, onClose, selectedStanzasCount, preserveSelection }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show toolbar if there's text selection OR selected stanzas
    if ((selection && selection.rect) || selectedStanzasCount > 0) {
      setIsVisible(true)
      
      if (selection && selection.rect) {
        // Position based on text selection
        const rect = selection.rect
        const estimatedWidth = 320
        const estimatedHeight = 80
        
        let x = rect.left + (rect.width / 2) - (estimatedWidth / 2)
        let y = rect.top - estimatedHeight - 10
        
        const margin = 10
        x = Math.max(margin, Math.min(x, window.innerWidth - estimatedWidth - margin))
        
        if (y < margin) {
          y = rect.bottom + 10
        }
        
        setPosition({ x, y })
      } else {
        // Position at center-top for stanza selection mode
        const estimatedWidth = 320
        setPosition({ 
          x: (window.innerWidth / 2) - (estimatedWidth / 2),
          y: 100 
        })
      }
    } else {
      setIsVisible(false)
    }
  }, [selection, selectedStanzasCount])

  // Fine-tune position after toolbar is rendered
  useEffect(() => {
    if (isVisible && selection) {
      const toolbar = document.querySelector('[data-toolbar="floating"]')
      if (toolbar) {
        const toolbarRect = toolbar.getBoundingClientRect()
        const rect = selection.rect
        
        // Recalculate with actual toolbar dimensions
        let x = rect.left + (rect.width / 2) - (toolbarRect.width / 2)
        let y = rect.top - toolbarRect.height - 10
        
        // Keep toolbar within viewport
        const margin = 10
        x = Math.max(margin, Math.min(x, window.innerWidth - toolbarRect.width - margin))
        
        if (y < margin) {
          y = rect.bottom + 10
        }
        
        setPosition({ x, y })
      }
    }
  }, [isVisible, selection])

  if (!isVisible) {
    return null
  }

  const handleOperation = (operation) => {
    onOperation(operation, selection)
  }

  // Helper function to count selected line-like elements in text selection
  const countSelectedLines = (selection) => {
    if (!selection?.range) return 0
    
    // Find all line-like elements within the selection range
    const range = selection.range
    const container = range.commonAncestorContainer
    
    // Get the parent element that contains the selection
    const parentElement = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
    
    // Look for line-like elements by checking closest ancestors
    const lineElements = []
    
    // Check if we're inside a line-like element (including nested spans)
    const closestLineElement = parentElement?.closest('.line, .heading, .subtitle, .dedication, .epigraph')
    
    if (closestLineElement) {
      lineElements.push(closestLineElement)
    } else {
      // Search for line-like elements within the selection
      const lines = parentElement?.querySelectorAll?.('.line, .heading, .subtitle, .dedication, .epigraph') || []
      for (const line of lines) {
        if (range.intersectsNode(line)) {
          lineElements.push(line)
        }
      }
    }
    return lineElements.length
  }

  // Define all available buttons
  const allButtons = {
    'merge-stanzas': {
      icon: '⫸',
      label: 'Merge',
      description: 'Merge selected stanzas into one'
    },
    'delete-element': {
      icon: '×',
      label: 'Delete',
      description: 'Delete selected element'
    },
    'split-stanza': {
      icon: '⫷',
      label: 'Split',
      description: 'Split stanza at selection'
    },
    'create-stanza': {
      icon: '📋',
      label: 'Stanza',
      description: 'Create stanza from selected lines'
    },
    'create-line': {
      icon: '📝',
      label: 'Line',
      description: 'Create line from selected text'
    },
    'create-heading': {
      icon: 'H',
      label: 'Heading',
      description: 'Create heading from selected text'
    },
    'line-to-title': {
      icon: 'T',
      label: 'Title',
      description: 'Convert line to title'
    },
    'line-to-subtitle': {
      icon: 'Sub',
      label: 'Subtitle',
      description: 'Convert line to subtitle'
    },
    'line-to-epigraph': {
      icon: '❝',
      label: 'Epigraph',
      description: 'Convert line to epigraph'
    },
    'line-to-dedication': {
      icon: '♦',
      label: 'Dedication',
      description: 'Convert line to dedication'
    }
  }

  // Context-aware button selection
  const getContextualButtons = () => {
    // 1. Text selections get priority for single line-like elements
    if (selection?.text) {
      const selectedLines = countSelectedLines(selection)
      
      if (selectedLines === 1) {
        // Single line-like element (including headings) - treat as line conversion
        return ['line-to-title', 'line-to-subtitle', 'line-to-epigraph', 'line-to-dedication', 'delete-element']
      }
      if (selectedLines > 1) {
        return ['create-stanza', 'delete-element']
      }
      
      // Free text selection (no line elements detected)
      return ['create-line', 'create-heading']
    }
    
    // 2. Checkbox selections (when no text selection)
    if (selectedStanzasCount > 1) {
      return ['merge-stanzas', 'delete-element']
    }
    if (selectedStanzasCount === 1) {
      return ['delete-element', 'split-stanza']
    }
    
    // No selection
    return []
  }

  // Get buttons for current context
  const activeButtonIds = getContextualButtons()
  const toolbarButtons = activeButtonIds.map(id => ({ id, ...allButtons[id] }))

  return (
    <div
      data-toolbar="floating"
      className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 min-w-[320px]"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        userSelect: 'none'
      }}
      onMouseEnter={() => preserveSelection && preserveSelection()}
      onMouseLeave={() => {}}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 px-2">
          {selection && selection.text ? (
            `Selected: "${selection.text.length > 30 
              ? selection.text.substring(0, 30) + '...' 
              : selection.text}"`
          ) : selectedStanzasCount > 0 ? (
            `${selectedStanzasCount} stanza${selectedStanzasCount > 1 ? 's' : ''} selected`
          ) : (
            'No selection'
          )}
        </span>
        <button
          className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center"
          onClick={onClose}
          title="Close toolbar"
        >
          ×
        </button>
      </div>
      {toolbarButtons.length > 0 ? (
        <div className={`grid gap-1 ${toolbarButtons.length <= 2 ? 'grid-cols-2' : toolbarButtons.length <= 3 ? 'grid-cols-3' : toolbarButtons.length <= 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
          {toolbarButtons.map((button) => (
            <button
              key={button.id}
              className="flex flex-col items-center p-2 rounded-md hover:bg-slate-100 transition-colors"
              onClick={() => handleOperation(button.id)}
              title={button.description}
            >
              <span className="text-lg font-bold text-slate-700">{button.icon}</span>
              <span className="text-xs text-slate-600">{button.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center text-xs text-slate-500 py-2">
          No actions available for this selection
        </div>
      )}
    </div>
  )
}

export default FloatingToolbar
