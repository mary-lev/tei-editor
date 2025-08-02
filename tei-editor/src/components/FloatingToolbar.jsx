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
      className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 min-w-[320px]"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000
      }}
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
      <div className="grid grid-cols-3 gap-1">
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
    </div>
  )
}

export default FloatingToolbar
