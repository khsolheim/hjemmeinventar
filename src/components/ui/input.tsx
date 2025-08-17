import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  // Handle controlled vs uncontrolled mode properly
  const inputProps: React.ComponentProps<"input"> = { ...props }
  
  // If defaultValue is provided, use uncontrolled mode
  if (props.defaultValue !== undefined) {
    // Uncontrolled - keep as is
  } 
  // If readOnly is set, allow any value without onChange
  else if (props.readOnly) {
    inputProps.value = props.value ?? ''
  }
  // If onChange is provided, use controlled mode
  else if (props.onChange) {
    inputProps.value = props.value ?? ''
  }
  // Otherwise, use uncontrolled with defaultValue
  else {
    inputProps.defaultValue = props.value ?? ''
    delete inputProps.value
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...inputProps}
    />
  )
}

export { Input }
