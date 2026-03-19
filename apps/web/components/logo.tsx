import { cn } from '@workspace/ui/lib/utils'

export const Logo = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <svg
            viewBox="0 0 120 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('text-foreground h-6 w-auto', className)}>
            {/* AGENCI text only */}
            <text
                x="0"
                y="17.5"
                fontSize="16"
                fontFamily="system-ui, -apple-system, 'SF Pro Display', sans-serif"
                fontWeight="600"
                letterSpacing="-0.01em"
                fill="currentColor"
            >
                AGENCI
            </text>
        </svg>
    )
}

export const LogoIcon = ({ className }: { className?: string; uniColor?: boolean }) => {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('size-6', className)}>
            {/* Just the letter "A" as icon */}
            <text
                x="50%"
                y="50%"
                fontSize="16"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="700"
                fill="currentColor"
                textAnchor="middle"
                dominantBaseline="central"
            >
                A
            </text>
        </svg>
    )
}

export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <svg
            className={cn('size-7 w-7', className)}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <text
                x="50%"
                y="50%"
                fontSize="18"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="700"
                fill="currentColor"
                textAnchor="middle"
                dominantBaseline="central"
            >
                A
            </text>
        </svg>
    )
}
