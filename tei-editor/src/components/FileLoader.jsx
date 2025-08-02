import UploadCard from './UploadCard'
import SamplesCard from './SamplesCard'

function FileLoader({ onFileLoad }) {
  return (
    <div className="h-full w-full bg-white flex flex-col justify-center items-center px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-light text-gray-900 mb-3 tracking-tight">
          TEI Poetry Editor
        </h1>
        <p className="text-gray-500 font-light">
          Load your TEI document or select a sample to get started
        </p>
        {/* Force refresh marker */}
      </div>

      {/* Cards Container - Single Row */}
      <div className="flex justify-center items-center gap-8">
        <div className="w-80">
          <UploadCard onFileLoad={onFileLoad} />
        </div>
        <div className="w-80">
          <SamplesCard onFileLoad={onFileLoad} />
        </div>
      </div>

        {/* Optional: Add some bottom spacing or footer info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Secure file processing</span>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>TEI P5 compliant</span>
            </div>
          </div>
        </div>
      </div>
  )
}

export default FileLoader