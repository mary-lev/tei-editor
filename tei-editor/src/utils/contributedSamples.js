// Client-side storage for contributed samples
// Since browsers can't write to server filesystem, we store in localStorage

class ContributedSamplesManager {
  constructor() {
    this.storageKey = 'tei-editor-contributed-samples'
    this.indexKey = 'tei-editor-contributed-index'
  }

  // Add a new contributed sample
  async addSample(sampleData) {
    try {
      console.log('💾 Saving contributed sample:', sampleData.metadata.id)
      
      // Get existing samples
      const samples = this.getAllSamples()
      const index = this.getIndex()
      
      // Check if sample already exists
      if (samples[sampleData.documentHash]) {
        console.warn('⚠️ Sample already exists, overwriting:', sampleData.documentHash)
      }
      
      // Store sample data
      samples[sampleData.documentHash] = {
        ...sampleData,
        dateAdded: new Date().toISOString(),
        version: '1.0'
      }
      
      // Update index
      const existingIndex = index.findIndex(item => item.id === sampleData.metadata.id)
      if (existingIndex >= 0) {
        index[existingIndex] = sampleData.metadata
      } else {
        index.push(sampleData.metadata)
      }
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(samples))
      localStorage.setItem(this.indexKey, JSON.stringify(index))
      
      console.log('✅ Sample saved successfully:', sampleData.metadata.title)
      return true
      
    } catch (error) {
      console.error('❌ Failed to save sample:', error)
      throw new Error(`Failed to save sample: ${error.message}`)
    }
  }

  // Get all contributed samples
  getAllSamples() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading contributed samples:', error)
      return {}
    }
  }

  // Get contributed samples index
  getIndex() {
    try {
      const stored = localStorage.getItem(this.indexKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading contributed samples index:', error)
      return []
    }
  }

  // Get a specific sample by hash
  getSample(documentHash) {
    const samples = this.getAllSamples()
    return samples[documentHash] || null
  }

  // Load a contributed sample for editing
  async loadSample(documentHash) {
    try {
      const sample = this.getSample(documentHash)
      if (!sample) {
        throw new Error(`Sample not found: ${documentHash}`)
      }

      console.log('📖 Loading contributed sample:', sample.metadata.title)

      // Parse XML
      const parser = new DOMParser()
      const dom = parser.parseFromString(sample.xmlContent, 'application/xml')
      
      // Check for parsing errors
      const parserError = dom.querySelector('parsererror')
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`)
      }

      // Create TEI document object
      const teiDocument = {
        dom,
        filename: sample.metadata.id,
        documentHash: sample.documentHash,
        text: sample.xmlContent,
        isLoadedFromContributed: true,
        sampleInfo: sample.metadata
      }

      // Convert data URLs back to image objects
      const images = sample.images.map(img => ({
        pageNumber: img.pageNumber,
        filename: img.filename,
        url: img.dataUrl,
        alt: `Page ${img.pageNumber}`,
        blob: null // Don't store blob reference for contributed samples
      }))

      console.log('✅ Contributed sample loaded:', {
        title: sample.metadata.title,
        imageCount: images.length
      })

      return { teiDocument, images }

    } catch (error) {
      console.error('❌ Failed to load contributed sample:', error)
      throw error
    }
  }

  // Remove a contributed sample
  removeSample(documentHash) {
    try {
      const samples = this.getAllSamples()
      const index = this.getIndex()
      
      if (samples[documentHash]) {
        delete samples[documentHash]
        
        const updatedIndex = index.filter(item => !item.id.includes(documentHash))
        
        localStorage.setItem(this.storageKey, JSON.stringify(samples))
        localStorage.setItem(this.indexKey, JSON.stringify(updatedIndex))
        
        console.log('🗑️ Sample removed:', documentHash)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error removing sample:', error)
      return false
    }
  }

  // Export all contributed samples for manual integration
  exportAllSamples() {
    try {
      const samples = this.getAllSamples()
      const index = this.getIndex()
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalSamples: index.length,
        samples: samples,
        index: index
      }
      
      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tei-editor-contributed-samples-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('📦 Exported', index.length, 'contributed samples')
      return true
      
    } catch (error) {
      console.error('Error exporting samples:', error)
      return false
    }
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const samples = this.getAllSamples()
      const index = this.getIndex()
      
      const samplesSize = new Blob([localStorage.getItem(this.storageKey) || '']).size
      const indexSize = new Blob([localStorage.getItem(this.indexKey) || '']).size
      
      return {
        sampleCount: index.length,
        storageSize: samplesSize + indexSize,
        storageSizeMB: ((samplesSize + indexSize) / 1024 / 1024).toFixed(2)
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
      return { sampleCount: 0, storageSize: 0, storageSizeMB: '0.00' }
    }
  }

  // Clear all contributed samples
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.indexKey)
      console.log('🧹 All contributed samples cleared')
      return true
    } catch (error) {
      console.error('Error clearing samples:', error)
      return false
    }
  }
}

// Export singleton instance
export const contributedSamples = new ContributedSamplesManager()
export default contributedSamples