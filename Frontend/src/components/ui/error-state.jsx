import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ErrorState = ({
  code,
  title,
  description,
  icon: Icon,
  retry = false,
  className,
}) => (
  <div className={cn('flex min-h-dvh w-full items-center justify-center bg-muted/30 p-4 sm:p-6', className)}>
    <Card className="w-full max-w-lg shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
        {Icon && (
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary ring-8 ring-primary/5">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
        )}

        {code && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary">{code}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
          {retry && (
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export { ErrorState };
