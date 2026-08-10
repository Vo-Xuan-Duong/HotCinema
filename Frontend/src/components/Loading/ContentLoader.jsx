import React from 'react';

const sizeClasses = {
  small: 'min-h-[96px] py-4',
  default: 'min-h-[160px] py-6',
  large: 'min-h-[240px] py-8',
};

const spinnerClasses = {
  small: 'h-7 w-7',
  default: 'h-9 w-9',
  large: 'h-11 w-11',
};

const ContentLoader = ({
  loading = true,
  message = 'Đang tải...',
  size = 'default',
}) => {
  if (!loading) return null;

  const normalizedSize = sizeClasses[size] ? size : 'default';

  return (
    <div className={`flex w-full items-center justify-center ${sizeClasses[normalizedSize]}`}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <div
          className={`${spinnerClasses[normalizedSize]} shrink-0 animate-spin rounded-full border-[3px] border-muted border-t-primary`}
          aria-hidden="true"
        />
        <p className="m-0 text-sm font-medium text-foreground">{message}</p>
      </div>
    </div>
  );
};

export default ContentLoader;
