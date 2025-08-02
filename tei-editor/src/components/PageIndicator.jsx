import { useState, useEffect, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { formatDocumentInfo } from '../utils/teiMetadata'

function PageIndicator({ currentPage, totalPages, onPageNavigation, isTransitioning, documentMetadata, availableSamples, currentDocument, onDocumentSwitch }) {
  const [pageInput, setPageInput] = useState('')
  const [showPageInput, setShowPageInput] = useState(false)
  const [showDocumentDropdown, setShowDocumentDropdown] = useState(false)
  const dropdownRef = useRef(null)

  if (totalPages === 0) return null

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDocumentDropdown(false)
      }
    }

    if (showDocumentDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDocumentDropdown])

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < totalPages

  const handlePageInputSubmit = (e) => {
    e.preventDefault()
    const targetPage = parseInt(pageInput)
    if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
      onPageNavigation('goto', 'ui', targetPage)
    }
    setPageInput('')
    setShowPageInput(false)
  }

  const handleQuickJump = (direction) => {
    let targetPage
    switch (direction) {
      case 'first':
        targetPage = 1
        break
      case 'last':
        targetPage = totalPages
        break
      case 'jump-back':
        targetPage = Math.max(1, currentPage - 5)
        break
      case 'jump-forward':
        targetPage = Math.min(totalPages, currentPage + 5)
        break
      default:
        return
    }
    if (targetPage !== currentPage) {
      onPageNavigation('goto', 'ui', targetPage)
    }
  }

  const firstPage = 1
  const lastPage = totalPages

  // Format document information for display
  const documentInfo = documentMetadata ? formatDocumentInfo(documentMetadata.title, documentMetadata.author) : ''

  // Handle document switching
  const handleDocumentSelect = (sampleId) => {
    if (sampleId && sampleId !== currentDocument?.sampleInfo?.id) {
      onDocumentSwitch(sampleId)
    }
    setShowDocumentDropdown(false)
  }

  // Check if we can show the dropdown (only for sample documents)
  const canShowDropdown = availableSamples && availableSamples.length > 0 && currentDocument?.isLoadedFromSample
  const otherSamples = canShowDropdown ? availableSamples.filter(sample => sample.id !== currentDocument?.sampleInfo?.id) : []

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 w-full" data-testid="page-indicator">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Document Information - Left Side */}
        <div className="flex-1 min-w-0 relative">
          {documentInfo ? (
            canShowDropdown && otherSamples.length > 0 ? (
              // Dropdown for sample documents with other samples available
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDocumentDropdown(!showDocumentDropdown)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors group"
                  title="Click to switch document"
                >
                  <span className="truncate max-w-sm">{documentInfo}</span>
                  <span className={`text-xs text-slate-400 transition-transform ${showDocumentDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {/* Dropdown menu */}
                {showDocumentDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50" style={{width: '100%', maxWidth: '320px', minWidth: '200px'}}>
                    <div className="py-1">
                      {otherSamples.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => handleDocumentSelect(sample.id)}
                          className="w-full text-left text-sm hover:bg-slate-50 transition-colors"
                          style={{padding: '4px 8px', display: 'block'}}
                          title={sample.description}
                        >
                          <div className="font-medium text-slate-900" style={{textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {formatDocumentInfo(sample.title, sample.author)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Static text for uploaded documents or single sample
              <h2 className="text-sm font-medium text-slate-700 truncate" title={documentInfo}>
                {documentInfo}
              </h2>
            )
          ) : (
            <div></div>
          )}
        </div>
        
        {/* Page Navigation - Center */}
        <div className="flex items-center justify-center">
        {/* Previous Navigation */}
        <button
          onClick={() => onPageNavigation('prev', 'ui')}
          disabled={!canGoPrev || isTransitioning}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-all duration-200 ${
            canGoPrev && !isTransitioning
              ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
              : 'text-slate-400 cursor-not-allowed border border-slate-100 bg-slate-50'
          }`}
          title="Previous page"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Spacer */}
        <div className="w-8"></div>

        {/* Page Information */}
        <div className="flex items-center gap-2">
          {/* First Page */}
          <button
            onClick={() => handleQuickJump('first')}
            disabled={currentPage === firstPage || isTransitioning}
            className={`px-2 py-1 rounded text-sm transition-all duration-200 ${
              currentPage === firstPage
                ? 'bg-blue-600 text-white'
                : !isTransitioning
                ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            [{firstPage}]
          </button>

          {/* Separator if there's a gap */}
          {currentPage > firstPage + 1 && (
            <span className="text-slate-400 text-sm">...</span>
          )}

          {/* Current Page (if not first or last) */}
          {currentPage !== firstPage && currentPage !== lastPage && (
            <>
              {showPageInput ? (
                <form onSubmit={handlePageInputSubmit} className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => {
                      setShowPageInput(false)
                      setPageInput('')
                    }}
                    className="w-12 px-1 py-1 text-sm text-center border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={currentPage.toString()}
                    autoFocus
                  />
                </form>
              ) : (
                <button
                  onClick={() => setShowPageInput(true)}
                  className="px-2 py-1 rounded text-sm bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700"
                  title="Click to jump to specific page"
                >
                  [{currentPage}]
                </button>
              )}
            </>
          )}

          {/* Separator if there's a gap */}
          {currentPage < lastPage - 1 && (
            <span className="text-slate-400 text-sm">...</span>
          )}

          {/* Last Page (if different from first) */}
          {firstPage !== lastPage && (
            <button
              onClick={() => handleQuickJump('last')}
              disabled={currentPage === lastPage || isTransitioning}
              className={`px-2 py-1 rounded text-sm transition-all duration-200 ${
                currentPage === lastPage
                  ? 'bg-blue-600 text-white'
                  : !isTransitioning
                  ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              [{lastPage}]
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="w-8"></div>

        {/* Next Navigation */}
        <button
          onClick={() => onPageNavigation('next', 'ui')}
          disabled={!canGoNext || isTransitioning}
          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-all duration-200 ${
            canGoNext && !isTransitioning
              ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
              : 'text-slate-400 cursor-not-allowed border border-slate-100 bg-slate-50'
          }`}
          title="Next page"
        >
          <span>Next</span>
          <ChevronRightIcon className="w-4 h-4" />
        </button>

        {/* Status Indicator */}
        {isTransitioning && (
          <div className="flex items-center text-sm text-slate-500 ml-4">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        )}
        </div>
        
        {/* Right Spacer - Balance the layout */}
        <div className="flex-1 min-w-0"></div>
      </div>
    </div>
  )
}

export default PageIndicator