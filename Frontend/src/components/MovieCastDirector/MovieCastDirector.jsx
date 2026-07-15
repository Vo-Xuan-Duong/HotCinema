import React from 'react';

const MovieCastDirector = ({ actors = [], director = '', title = 'Thông tin ekip' }) => {
    if (!actors.length && !director) {
        return null;
    }

    return (
        <div className="mb-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.05] md:mb-2 md:px-3 md:py-2">
            <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-card-foreground before:h-4 before:w-[3px] before:rounded-sm before:bg-gradient-to-br before:from-primary before:to-amber-500 md:mb-2 md:text-[13px] max-[480px]:mb-1.5 max-[480px]:text-xs max-[480px]:before:h-3 max-[480px]:before:w-0.5">
                {title}
            </h3>

            <div className="flex flex-col gap-2">
                {/* Director Section */}
                {director && (
                    <div className="flex items-start gap-2.5 py-1.5 md:flex-col md:gap-1 md:py-1 max-[480px]:gap-0.5">
                        <span className="min-w-20 shrink-0 text-[13px] font-semibold text-primary md:min-w-0 md:text-xs">
                            Đạo diễn:
                        </span>
                        <span className="text-[13px] font-semibold leading-snug text-card-foreground md:text-xs">
                            {director}
                        </span>
                    </div>
                )}

                {/* Actors Section */}
                {actors.length > 0 && (
                    <div className="flex items-start gap-2.5 py-1.5 md:flex-col md:gap-1 md:py-1 max-[480px]:gap-0.5">
                        <span className="min-w-20 shrink-0 text-[13px] font-semibold text-primary md:min-w-0 md:text-xs">
                            Diễn viên:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 md:gap-1">
                            {actors.map((actor, index) => (
                                <span
                                    key={index}
                                    className="inline-flex whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-medium text-orange-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-orange-100 hover:shadow-[0_2px_6px_rgba(255,107,53,0.15)] dark:border-primary/30 dark:bg-primary/10 dark:text-orange-300 dark:hover:border-primary/50 dark:hover:bg-primary/20 md:px-1.5 md:py-0.5 md:text-[11px] max-[480px]:px-1 max-[480px]:text-[10px]"
                                >
                                    {actor}
                                    {index < actors.length - 1 && <span className="-mr-0.5 ml-0.5">,</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCastDirector;
