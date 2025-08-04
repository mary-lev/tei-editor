import { useCallback, useState } from 'react'
import { unzip } from 'unzipit'
import contributedSamples from '../utils/contributedSamples'

function UploadCard({ onFileLoad }) {
  const [uploadType, setUploadType] = useState('xml') // 'xml' or 'zip'
  const [contributeToSamples, setContributeToSamples] = useState(false)

  const extractPageNumber = useCallback((filename) => {
    // Support multiple page number patterns: page_0001.png, page_001.png, page_01.png, page_1.png
    const match = filename.match(/page_?(\d+)\.(png|jpg|jpeg)$/i)
    return match ? parseInt(match[1], 10) : null
  }, [])

  const findXmlFile = useCallback((entries) => {
    const xmlFiles = Object.keys(entries).filter(name => name.endsWith('.xml'))
    if (xmlFiles.length === 0) {
      throw new Error('No XML file found in ZIP archive')
    }
    if (xmlFiles.length > 1) {
      throw new Error('Multiple XML files found. Please include only one TEI document.')
    }
    return entries[xmlFiles[0]]
  }, [])

  const findImageFiles = useCallback((entries) => {
    return Object.keys(entries)
      .filter(name => {
        const isInImagesDir = name.includes('images/') || name.includes('Images/')
        const isImageFile = /\.(png|jpg|jpeg)$/i.test(name)
        const hasPageNumber = extractPageNumber(name) !== null
        return isInImagesDir && isImageFile && hasPageNumber
      })
      .map(name => ({
        entry: entries[name],
        filename: name,
        pageNumber: extractPageNumber(name)
      }))
      .sort((a, b) => a.pageNumber - b.pageNumber)
  }, [extractPageNumber])

  const saveSampleContribution = useCallback(async (teiDocument, images, xmlText) => {
    try {
      console.log('💾 Saving sample contribution locally...')
      
      // Generate a document hash if none exists
      const docHash = teiDocument.documentHash || generateDocumentHash()
      
      // Create sample metadata
      const metadata = extractSampleMetadata(teiDocument.dom, docHash)
      
      // Create sample data structure
      const sampleData = {
        documentHash: docHash,
        metadata,
        xmlContent: xmlText,
        images: images.map(img => ({
          filename: img.filename,
          pageNumber: img.pageNumber,
          dataUrl: img.url
        }))
      }
      
      // Save to local storage
      await contributedSamples.addSample(sampleData)
      
      // Show success message
      alert(`✅ Thank you for contributing!\n\nYour document "${metadata.title}" has been added to your local sample collection and is now available for selection.`)
      
    } catch (error) {
      console.error('❌ Sample contribution failed:', error)
      alert(`Error saving sample contribution: ${error.message}`)
    }
  }, [])

  const generateDocumentHash = useCallback(() => {
    // Generate a simple hash based on timestamp and random
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `${timestamp}${random}`
  }, [])

  const extractSampleMetadata = useCallback((dom, docHash) => {
    // Extract title from TEI header
    const titleElement = dom.querySelector('titleStmt title')
    const title = titleElement ? titleElement.textContent.trim() : 'Untitled Document'
    
    // Extract author from TEI header
    const authorElement = dom.querySelector('titleStmt author') || dom.querySelector('sourceDesc bibl author')
    const author = authorElement ? authorElement.textContent.trim() : 'Unknown Author'
    
    // Count pages
    const pageBreaks = dom.querySelectorAll('pb')
    const pageNumbers = Array.from(pageBreaks).map(pb => parseInt(pb.getAttribute('n'))).filter(n => !isNaN(n))
    const minPage = Math.min(...pageNumbers)
    const maxPage = Math.max(...pageNumbers)
    const totalPages = pageNumbers.length
    
    return {
      id: `doc_${docHash}`,
      title: title,
      author: author,
      description: `User contributed document (${totalPages} pages, ${minPage}-${maxPage})`,
      xmlPath: `samples/doc_${docHash}/doc_${docHash}.xml`,
      imageDir: `samples/doc_${docHash}/images`,
      pageRange: `${minPage}-${maxPage}`,
      totalPages: totalPages,
      contributed: new Date().toISOString()
    }
  }, [])


  const handleZipUpload = useCallback(async (file) => {
    try {
      console.log('📦 Processing ZIP file:', file.name)
      
      // Extract ZIP contents
      const { entries } = await unzip(file)
      console.log('📁 ZIP entries:', Object.keys(entries))
      
      // Find and validate XML file
      const xmlEntry = findXmlFile(entries)
      const xmlText = await xmlEntry.text()
      
      // Parse XML
      const parser = new DOMParser()
      const dom = parser.parseFromString(xmlText, 'application/xml')
      
      // Check for parsing errors
      const parserError = dom.querySelector('parsererror')
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`)
      }

      // Find and process images
      const imageFiles = findImageFiles(entries)
      console.log('🖼️ Found images:', imageFiles.map(f => f.filename))
      
      if (imageFiles.length === 0) {
        console.warn('⚠️ No images found in ZIP. Expected images in images/ directory with page_NNNN format.')
      }

      // Create data URLs for images (more reliable than blob URLs)
      const images = await Promise.all(
        imageFiles.map(async ({ entry, filename, pageNumber }) => {
          console.log('🖼️ Processing image:', { filename, pageNumber })
          const blob = await entry.blob()
          
          // Convert blob to data URL to avoid security restrictions
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
          
          console.log('🔗 Created data URL for', filename, '- size:', dataUrl.length, 'chars')
          return {
            pageNumber,
            filename,
            blob,
            url: dataUrl, // Use data URL instead of blob URL
            alt: `Page ${pageNumber}`
          }
        })
      )

      // Extract filename for document
      const xmlFilename = Object.keys(entries).find(name => name.endsWith('.xml'))
      const filename = xmlFilename ? xmlFilename.replace('.xml', '') : 'uploaded-document'
      
      // Try to extract hash from filename, but it's optional
      const hashMatch = filename.match(/doc_([a-f0-9]+)/)
      const documentHash = hashMatch ? hashMatch[1] : null

      const teiDocument = {
        dom,
        filename,
        documentHash,
        text: xmlText,
        isUserUpload: true,
        hasImages: images.length > 0,
        contributeToSamples
      }

      console.log('✅ ZIP processed successfully:', {
        filename,
        documentHash,
        imageCount: images.length,
        pageNumbers: images.map(img => img.pageNumber),
        willContribute: contributeToSamples
      })

      // If user wants to contribute to samples, save to local storage
      if (contributeToSamples) {
        await saveSampleContribution(teiDocument, images, xmlText)
      }

      onFileLoad(teiDocument, images)
    } catch (error) {
      console.error('❌ ZIP processing failed:', error)
      alert(`Error processing ZIP file: ${error.message}`)
    }
  }, [findXmlFile, findImageFiles, onFileLoad])

  const handleXmlUpload = useCallback(async (file) => {
    try {
      const text = await file.text()
      const parser = new DOMParser()
      const dom = parser.parseFromString(text, 'application/xml')
      
      // Check for parsing errors
      const parserError = dom.querySelector('parsererror')
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`)
      }

      // Extract document hash from filename if it follows the doc_hash pattern
      // This is optional for user uploads since they may not have accompanying images
      const filename = file.name.replace('.xml', '')
      const hashMatch = filename.match(/doc_([a-f0-9]+)/)
      const documentHash = hashMatch ? hashMatch[1] : null

      const teiDocument = {
        dom,
        filename,
        documentHash,
        text,
        isUserUpload: true,
        hasImages: false
      }

      const images = []
      
      onFileLoad(teiDocument, images)
    } catch (error) {
      alert(`Error loading TEI file: ${error.message}`)
    }
  }, [onFileLoad])

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (uploadType === 'zip' && file.name.endsWith('.zip')) {
      await handleZipUpload(file)
    } else if (uploadType === 'xml' && file.name.endsWith('.xml')) {
      await handleXmlUpload(file)
    } else {
      const expectedType = uploadType === 'zip' ? 'ZIP' : 'XML'
      alert(`Please select a ${expectedType} file`)
    }
  }, [uploadType, handleZipUpload, handleXmlUpload])

  return (
    <div className="bg-white border border-gray-200 hover:border-teal-700 transition-all duration-200 h-full">
      {/* Card Header */}
      <div className="text-center p-8 pb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 mb-6">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-light text-gray-900 mb-3 tracking-wide">Upload Your File</h3>
        <p className="text-sm text-gray-500 font-light">Upload your own TEI document</p>
      </div>

      {/* Upload Type Selection */}
      <div className="px-8 pb-4">
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="uploadType"
              value="xml"
              checked={uploadType === 'xml'}
              onChange={(e) => setUploadType(e.target.value)}
              className="mr-3 text-teal-700 focus:ring-teal-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">TEI XML only</div>
              <div className="text-xs text-gray-500">Upload just the TEI document</div>
            </div>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="uploadType"
              value="zip"
              checked={uploadType === 'zip'}
              onChange={(e) => setUploadType(e.target.value)}
              className="mr-3 text-teal-700 focus:ring-teal-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">TEI XML + Images (ZIP)</div>
              <div className="text-xs text-gray-500">ZIP with TEI file and images/ folder</div>
            </div>
          </label>
        </div>
      </div>

      {/* Sample Contribution Consent (only for ZIP uploads) */}
      {uploadType === 'zip' && (
        <div className="px-8 pb-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={contributeToSamples}
              onChange={(e) => setContributeToSamples(e.target.checked)}
              className="mt-1 mr-3 text-teal-700 focus:ring-teal-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                📚 Contribute to sample collection
              </div>
              <div className="text-xs text-gray-500 mt-1">
                I consent to share this document and images as a sample for other users.
                Files will be packaged for download and submission to maintainers.
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Upload Button */}
      <div className="px-8 pb-8 flex-1 flex items-center justify-center">
        <label className="w-full px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-light cursor-pointer transition-colors flex items-center justify-center">
          <input
            type="file"
            className="hidden"
            accept={uploadType === 'zip' ? '.zip' : '.xml'}
            onChange={handleFileSelect}
          />
          Browse {uploadType === 'zip' ? 'ZIP' : 'XML'} Files
        </label>
      </div>

      {/* Card Footer */}
      <div className="px-8 pb-8">
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center text-xs text-gray-400 font-light">
            <div className="w-1 h-1 bg-teal-700 rounded-full mr-2"></div>
            {uploadType === 'zip' 
              ? 'ZIP with TEI XML + images in images/ folder'
              : 'Supports TEI P5 XML files'
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadCard