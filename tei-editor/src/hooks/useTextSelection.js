import { useState, useEffect, useCallback, useRef } from 'react'

export function useTextSelection() {
  const [selection, setSelection] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection()
    
    if (!sel || sel.rangeCount === 0) {
      setSelection(null)
      setIsSelecting(false)
      return
    }

    const range = sel.getRangeAt(0)
    const selectedText = sel.toString().trim()

    // Only track selections with actual text content
    if (!selectedText) {
      // Don't clear immediately - keep selection for toolbar interaction
      setTimeout(() => {
        const currentSel = window.getSelection()
        if (!currentSel || !currentSel.toString().trim()) {
          setSelection(null)
          setIsSelecting(false)
        }
      }, 1000) // 1 second delay
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
    window.getSelection()?.removeAllRanges()
    setSelection(null)
    setIsSelecting(false)
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
    clearSelection
  }
}