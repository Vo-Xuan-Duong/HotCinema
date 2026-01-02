import * as React from "react"
import { Upload as UploadIcon, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

const Upload = ({ 
  beforeUpload,
  onChange,
  fileList = [],
  maxCount = 1,
  accept,
  children,
  className,
  ...props 
}) => {
  const [files, setFiles] = React.useState(fileList)

  React.useEffect(() => {
    setFiles(fileList)
  }, [fileList])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (maxCount === 1 && selectedFiles.length > 0) {
      const file = selectedFiles[0]
      
      if (beforeUpload) {
        const result = beforeUpload(file, [])
        if (result === false) return
      }

      const fileObj = {
        uid: Date.now().toString(),
        name: file.name,
        status: 'uploading',
        url: URL.createObjectURL(file)
      }

      setFiles([fileObj])
      onChange?.({ file: fileObj, fileList: [fileObj] })

      setTimeout(() => {
        const doneFile = { ...fileObj, status: 'done' }
        setFiles([doneFile])
        onChange?.({ file: doneFile, fileList: [doneFile] })
      }, 1000)
    }
  }

  const handleRemove = (uid) => {
    const newFiles = files.filter(f => f.uid !== uid)
    setFiles(newFiles)
    onChange?.({ file: null, fileList: newFiles })
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <label className="cursor-pointer">
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          multiple={maxCount > 1}
        />
        {children || (
          <Button variant="outline" type="button" asChild>
            <span>
              <UploadIcon className="h-4 w-4 mr-2" />
              Tải lên
            </span>
          </Button>
        )}
      </label>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.uid} className="flex items-center gap-2 p-2 border rounded">
              <span className="flex-1 text-sm truncate">{file.name}</span>
              {file.status === 'uploading' && (
                <span className="text-xs text-gray-500">Đang tải...</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(file.uid)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

Upload.Dragger = ({ children, ...props }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
      <Upload {...props}>
        {children || (
          <>
            <UploadIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Kéo thả file vào đây hoặc click để chọn</p>
          </>
        )}
      </Upload>
    </div>
  )
}

export { Upload }


