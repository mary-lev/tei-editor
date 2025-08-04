import { useState, useEffect, useCallback } from 'react'
import contributedSamples from '../utils/contributedSamples'

function SamplesCard({ onFileLoad }) {
  const [samples, setSamples] = useState([])
  const [contributedSamplesList, setContributedSamplesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSample, setSelectedSample] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Load available samples on component mount
  useEffect(() => {
    async function loadSamples() {
      try {
        // Load public samples
        const response = await fetch('/samples/index.json')
        const data = await response.json()
        setSamples(data.samples || [])
        
        // Load contributed samples
        const contributed = contributedSamples.getIndex()
        setContributedSamplesList(contributed)
        
        console.log('📚 Loaded samples:', {
          public: data.samples?.length || 0,
          contributed: contributed.length
        })
      } catch (error) {
        console.warn('Could not load sample documents index:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSamples()
  }, [])

  const handleSampleSelect = useCallback(async (sample) => {
    setSelectedSample(sample.title)
    setIsDropdownOpen(false)
    
    try {
      let teiDocument, images
      
      // Check if this is a contributed sample (by checking if it has contributed metadata)
      const isContributed = contributedSamplesList.find(contrib => contrib.id === sample.id)
      
      if (isContributed) {
        console.log('📖 Loading contributed sample:', sample.title)
        
        // Extract document hash from ID
        const hashMatch = sample.id.match(/doc_([a-f0-9a-z]+)/)
        const documentHash = hashMatch ? hashMatch[1] : null
        
        if (!documentHash) {
          throw new Error('Invalid contributed sample ID format')
        }
        
        // Load from contributed samples storage
        const result = await contributedSamples.loadSample(documentHash)
        teiDocument = result.teiDocument
        images = result.images
        
      } else {
        console.log('📖 Loading public sample:', sample.title)
        
        // Load public sample
        const response = await fetch(`/${sample.xmlPath}`)
        const text = await response.text()
        const parser = new DOMParser()
        const dom = parser.parseFromString(text, 'application/xml')
        
        // Check for parsing errors
        const parserError = dom.querySelector('parsererror')
        if (parserError) {
          throw new Error(`XML parsing failed: ${parserError.textContent}`)
        }
        
        teiDocument = {
          dom,
          filename: sample.id,
          documentHash: sample.id.replace('doc_', ''),
          text,
          isLoadedFromSample: true,
          sampleInfo: sample
        }
        
        images = []
      }
      
      onFileLoad(teiDocument, images)
    } catch (error) {
      alert(`Error loading sample document: ${error.message}`)
    }
  }, [onFileLoad])

  return (
    <div className="bg-white border border-gray-200 hover:border-teal-700 transition-all duration-200 h-full">
      {/* Card Header */}
      <div className="text-center p-8 pb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 mb-6">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-light text-gray-900 mb-3 tracking-wide">Sample Documents</h3>
        <p className="text-sm text-gray-500 font-light">
          Try the editor with example files
          {contributedSamplesList.length > 0 && (
            <span className="block text-blue-600 text-xs mt-1">
              + {contributedSamplesList.length} contributed sample{contributedSamplesList.length !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* Dropdown */}
      <div className="px-8 pb-8 flex-1 flex items-center justify-center">
        <div className="relative w-full">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading || samples.length === 0}
            className="w-full px-8 py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-gray-400 text-white text-sm font-light cursor-pointer transition-colors text-left flex items-center justify-between"
          >
            {loading ? (
              'Loading samples...'
            ) : samples.length === 0 ? (
              'No samples available'
            ) : selectedSample ? (
              selectedSample
            ) : (
              'Select a sample book'
            )}
            <svg 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (samples.length > 0 || contributedSamplesList.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-10 max-h-64 overflow-y-auto">
              {/* Public Samples */}
              {samples.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-700 border-b border-gray-200">
                    📚 Public Samples
                  </div>
                  {samples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleSelect(sample)}
                      className="w-full px-4 py-3 text-left hover:bg-teal-50 hover:text-teal-700 transition-colors border-b border-gray-100"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {sample.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {sample.author} • {sample.totalPages} pages
                      </div>
                    </button>
                  ))}
                </>
              )}
              
              {/* Contributed Samples */}
              {contributedSamplesList.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-blue-50 text-xs font-medium text-blue-700 border-b border-gray-200">
                    💝 Your Contributions ({contributedSamplesList.length})
                  </div>
                  {contributedSamplesList.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleSelect(sample)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {sample.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {sample.author} • {sample.totalPages} pages
                        <span className="ml-2 text-blue-600">✨ Contributed</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-8 pb-8">
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center text-xs text-gray-400 font-light">
            <div className="w-1 h-1 bg-teal-700 rounded-full mr-2"></div>
            Perfect for testing features
          </div>
        </div>
      </div>
    </div>
  )
}

export default SamplesCard