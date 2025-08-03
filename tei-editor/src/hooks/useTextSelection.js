import { useState, useEffect, useCallback, useRef } from 'react'

export function useTextSelection() {
  const [selection, setSelection] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const preserveSelection = useRef(false)

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection()
    
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // If we're preserving selection (during toolbar interaction), don't clear
      if (preserveSelection.current) {
        return
      }
      
      // Don't clear immediately - give time for toolbar interaction
      setTimeout(() => {
        const currentSel = window.getSelection()
        if (!preserveSelection.current && (!currentSel || currentSel.rangeCount === 0 || currentSel.isCollapsed)) {
          setSelection(null)
          setIsSelecting(false)
        }
      }, 300) // Reduced timeout for better responsiveness
      return
    }

    const range = sel.getRangeAt(0)
    const selectedText = sel.toString().trim()

    // Only track selections with actual text content
    if (!selectedText) {
      return
    }

    // Check if selection is within the rendered text pane
    const renderedPane = document.querySelector('[data-pane="rendered-text"]')
    
    if (!renderedPane) {
      setSelection(null)
      setIsSelecting(false)
      return
    }

    const isWithinPane = renderedPane.contains(range.commonAncestorContainer)
    
    if (!isWithinPane) {
      setSelection(null)
      setIsSelecting(false)
      return
    }

    const rect = range.getBoundingClientRect()
    
    const selectionData = {
      text: selectedText,
      range: range,
      rect: rect,
      startContainer: range.startContainer,
      endContainer: range.endContainer,
      startOffset: range.startOffset,
      endOffset: range.endOffset
    }
    
    setSelection(selectionData)
    setIsSelecting(true)
  }, [])

  const clearSelection = useCallback(() => {
    preserveSelection.current = false
    window.getSelection()?.removeAllRanges()
    setSelection(null)
    setIsSelecting(false)
  }, [])

  const preserveCurrentSelection = useCallback(() => {
    preserveSelection.current = true
    
    // Auto-release preservation after a delay
    setTimeout(() => {
      preserveSelection.current = false
    }, 2000)
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [handleSelectionChange])

  return {
    selection,
    isSelecting,
    clearSelection,
    preserveCurrentSelection
  }
}