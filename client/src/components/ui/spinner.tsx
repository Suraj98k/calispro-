import { LucideLoader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
    return (
        <LucideLoader2
            className={cn("h-4 w-4 animate-spin", className)}
        />
    )
}
