import UploadCard from './UploadCard'
import SamplesCard from './SamplesCard'

function FileLoader({ onFileLoad }) {
  return (
      <div className="h-full w-full bg-white flex flex-col justify-center items-center px-6">
      {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-primary mb-3 tracking-tight">
            TEI Poetry Editor
          </h1>
          <p className="text-base text-muted font-normal">
            Load your TEI document or select a sample to get started
          </p>
          {/* Force refresh marker */}
        </div>

      {/* Cards Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-0">
          <UploadCard onFileLoad={onFileLoad} />
          <SamplesCard onFileLoad={onFileLoad} />
        </div>
      </div>

        {/* Optional: Add some bottom spacing or footer info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-muted">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Secure file processing</span>
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>TEI P5 compliant</span>
            </div>
          </div>
        </div>
      </div>
  )
}

export default FileLoader
