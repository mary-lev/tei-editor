import { useState, useEffect } from 'react'

function FloatingToolbar({ selection, onOperation, onClose, selectedStanzasCount }) {
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

  const toolbarButtons = [
    {
      id: 'merge-stanzas',
      label: 'Merge',
      icon: '⫸',
      description: 'Merge selected stanzas into one'
    },
    {
      id: 'tag-dedication',
      label: 'Dedication',
      icon: '♦',
      description: 'Convert line to dedication'
    },
    {
      id: 'tag-subtitle',
      label: 'Subtitle',
      icon: 'Sub',
      description: 'Convert line to subtitle'
    },
    {
      id: 'tag-epigraph',
      label: 'Epigraph',
      icon: '❝',
      description: 'Convert line to epigraph'
    },
    {
      id: 'split-stanza',
      label: 'Split',
      icon: '⫷',
      description: 'Split stanza at selection'
    },
    {
      id: 'delete-element',
      label: 'Delete',
      icon: '×',
      description: 'Delete selected element'
    }
  ]

  return (
    <div
      data-toolbar="floating"
      className="bg-white border border-gray-300 rounded-lg shadow-xl p-2 min-w-[320px] text-xs select-none"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000
      }}
    >
      <div className="flex flex-col gap-2">
        {/* Close button */}
        <button
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs flex items-center justify-center"
          onClick={onClose}
          title="Close toolbar"
        >
          ×
        </button>

        {/* Toolbar buttons */}
        <div className="flex flex-wrap gap-1">
          {toolbarButtons.map((button) => (
            <button
              key={button.id}
              className="flex flex-col items-center px-2 py-1 border border-gray-200 rounded bg-gray-50 cursor-pointer transition-all min-w-[48px] text-[11px] hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5"
              onClick={() => handleOperation(button.id)}
              title={button.description}
            >
              <span className="text-sm font-bold mb-0.5 text-gray-700">{button.icon}</span>
              <span className="text-[10px] leading-none text-gray-500">{button.label}</span>
            </button>
          ))}
        </div>

        {/* Selection info */}
        <div className="border-t border-gray-300 pt-1.5 text-gray-500 text-[11px]">
          <small className="block text-center">
            {selection && selection.text ? (
              `Selected: "${selection.text.length > 30
                ? selection.text.substring(0, 30) + '...'
                : selection.text}"`
            ) : selectedStanzasCount > 0 ? (
              `${selectedStanzasCount} stanza${selectedStanzasCount > 1 ? 's' : ''} selected`
            ) : (
              'No selection'
            )}
          </small>
        </div>
      </div>
    </div>
  )
}

export default FloatingToolbar