// Debug script to test CodeMirror content extraction
// Run this in the browser console after loading a sample document

function debugCodeMirrorContent() {
  console.log('🔍 Debug: Testing CodeMirror content extraction')
  
  // Find the TEI code pane
  const teiPane = document.querySelector('[data-testid="tei-code-pane"]')
  if (!teiPane) {
    console.error('❌ TEI pane not found')
    return
  }
  
  // Find CodeMirror elements
  const cmScroller = teiPane.querySelector('.cm-scroller')
  const cmContent = teiPane.querySelector('.cm-content')
  const cmEditor = teiPane.querySelector('.cm-editor')
  
  console.log('🔍 CodeMirror DOM elements:', {
    cmScroller,
    cmContent,
    cmEditor,
    scrollerClass: cmScroller?.className,
    contentClass: cmContent?.className
  })
  
  if (cmContent) {
    const text = cmContent.textContent || cmContent.innerText
    const lines = text.split('\n')
    
    console.log('📝 Content extraction results:', {
      totalChars: text.length,
      totalLines: lines.length,
      firstLines: lines.slice(0, 5),
      hasPageBreaks: text.includes('<pb n='),
      pageBreakCount: (text.match(/<pb n=/g) || []).length
    })
    
    // Look for specific page breaks
    const pageBreakLines = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.includes('<pb n='))
      .slice(0, 5) // First 5 page breaks
    
    console.log('🔍 Page break positions:', pageBreakLines)
    
    return {
      text,
      lines,
      pageBreakLines
    }
  } else {
    console.error('❌ CodeMirror content not found')
  }
}

// Make it available globally
window.debugCodeMirrorContent = debugCodeMirrorContent

console.log('✅ Debug script loaded. Run debugCodeMirrorContent() in console after loading a document.')