import * as React from 'react';
import { Upload as UploadIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [files, setFiles] = React.useState(fileList);

  React.useEffect(() => {
    setFiles(fileList);
  }, [fileList]);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const nextFiles = maxCount === 1 ? selectedFiles.slice(0, 1) : selectedFiles.slice(0, maxCount);
    const mapped = nextFiles.map((file) => ({
      uid: `${Date.now()}-${file.name}`,
      name: file.name,
      status: 'done',
      url: URL.createObjectURL(file),
      originFileObj: file,
    }));

    const accepted = mapped.filter((fileObj) => beforeUpload?.(fileObj.originFileObj, nextFiles) !== false);
    if (accepted.length === 0) return;

    setFiles(accepted);
    onChange?.({ file: accepted[0] || null, fileList: accepted });
  };

  const handleRemove = (uid) => {
    const nextFiles = files.filter((file) => file.uid !== uid);
    setFiles(nextFiles);
    onChange?.({ file: null, fileList: nextFiles });
  };

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <label className="inline-flex cursor-pointer">
        <input type="file" className="sr-only" onChange={handleFileChange} accept={accept} multiple={maxCount > 1} />
        {children || (
          <Button variant="outline" type="button" asChild>
            <span>
              <UploadIcon className="mr-2 h-4 w-4" />
              Tải lên
            </span>
          </Button>
        )}
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.uid} className="flex items-center gap-2 rounded-md border bg-card p-2 text-card-foreground shadow-sm">
              <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(file.uid)} className="h-7 w-7">
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Xóa tệp</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Upload.Dragger = ({ children, className, ...props }) => (
  <div className={cn('rounded-lg border border-dashed bg-muted/30 p-8 text-center transition-colors hover:border-primary/60 hover:bg-muted/50', className)}>
    <Upload {...props}>
      {children || (
        <div className="space-y-2 text-muted-foreground">
          <UploadIcon className="mx-auto h-10 w-10" />
          <p className="text-sm">Kéo thả file vào đây hoặc click để chọn</p>
        </div>
      )}
    </Upload>
  </div>
);

export { Upload };
