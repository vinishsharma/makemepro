'use clinet'

import { forwardRef } from "react";
import { useState, useEffect } from "react";
import { Button } from "../Shared/ui/button";
import { Badge } from "../Shared/ui/badge";

import { cn } from "@/lib/utils"
import {
    CheckIcon,
    XCircle,
    ChevronDown,
    XIcon,
    WandSparkles,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../Shared/ui/popover";
import { Separator } from "../Shared/ui/separator";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../Shared/ui/command";


interface MultiSelectProp {
    options: {
        label: string;
        value: string;
    }[];

    onValueChange: (value: string[]) => void;
    defaultValue: string[];
    placeholder?: string;
    maxCount?: number;
    asChild?: boolean;
    className?: string;
    modalPopover?: boolean;
    isCreatable?: boolean;
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProp>(
    (
        {
            options,
            onValueChange,
            defaultValue = [],
            placeholder = "Select options",
            maxCount = 7,
            modalPopover = false,
            asChild = false,
            className,
            isCreatable = false,
            ...props
        }, ref
    ) => {
        const [selectedValues, setSelectedValues] =
            useState<string[]>(defaultValue);
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        const [isAnimating, setIsAnimating] = useState(false);
        const [customInput, setCustomInput] = useState("");

        const handleInputKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
          ) => {
            if (event.key === "Enter") {
              setIsPopoverOpen(true);
            } else if (event.key === "Backspace" && !event.currentTarget.value) {
              const newSelectedValues = [...selectedValues];
              newSelectedValues.pop();
              setSelectedValues(newSelectedValues);
              onValueChange(newSelectedValues);
            }
          };

        useEffect(() => {
            setSelectedValues(defaultValue);
        }, [defaultValue]);



        const toggleOption = (value: string) => {
            const newSelectedValues = selectedValues.includes(value)
                ? selectedValues.filter((v) => v !== value)
                : [...selectedValues, value];
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const handleClear = () => {
            setSelectedValues([]);
            onValueChange([]);
        };

        const handleTogglePopover = () => {
            setIsPopoverOpen((prev) => !prev);
        };

        const clearExtraOptions = () => {
            const newSelectedValues = selectedValues.slice(0, maxCount);
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const toggleAll = () => {
            if (selectedValues.length === options.length) {
                handleClear();
            } else {
                const allValues = options.map((option) => option.value);
                setSelectedValues(allValues);
                onValueChange(allValues);
            }
        };

        const handleCustomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && customInput.trim()) {
                e.preventDefault();
                const newValue = customInput.trim();
                if (!selectedValues.includes(newValue)) {
                    const newSelectedValues = [...selectedValues, newValue];
                    setSelectedValues(newSelectedValues);
                    onValueChange(newSelectedValues);
                    // Add the new value to options if it doesn't exist
                    if (!options.find(opt => opt.value === newValue)) {
                        options.push({ value: newValue, label: newValue });
                    }
                }
                setCustomInput("");
            }
        };

        return (
            <Popover
                open={isPopoverOpen}
                onOpenChange={setIsPopoverOpen}
                modal={modalPopover}
            >
                <PopoverTrigger asChild>
                    <Button
                        ref={ref}
                        {...props}
                        onClick={handleTogglePopover}
                        className={cn(
                            "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
                            className
                        )}
                    >
                        {selectedValues.length > 0 ? (
                            <div className="flex justify-between items-center w-full">
                                <div className="flex flex-wrap items-center">
                                    {selectedValues.slice(0, maxCount).map((value) => {
                                        const option = options.find((o) => o.value === value);
                                        return (
                                            <Badge
                                                key={value}
                                                className={cn(
                                                    "bg-primary/10 text-primary hover:bg-primary/20 mr-1 mb-1",
                                                    "flex items-center gap-1 rounded-md px-2 py-1"
                                                )}
                                            >
                                                {option?.label || value}
                                                <XCircle
                                                    className="ml-2 h-4 w-4 cursor-pointer hover:text-primary/80"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleOption(value);
                                                    }}
                                                />
                                            </Badge>
                                        );
                                    })}
                                    {selectedValues.length > maxCount && (
                                        <Badge
                                            className={cn(
                                                "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                                            )}
                                        >
                                            {`+ ${selectedValues.length - maxCount} more`}
                                            <XCircle
                                                className="ml-2 h-4 w-4 cursor-pointer"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    clearExtraOptions();
                                                }}
                                            />
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <XIcon
                                        className="h-4 mx-2 cursor-pointer text-muted-foreground"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleClear();
                                        }}
                                    />
                                    <Separator
                                        orientation="vertical"
                                        className="flex min-h-6 h-full"
                                    />
                                    <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between w-full mx-auto">
                                <span className="text-sm text-muted-foreground mx-3">
                                    {placeholder}
                                </span>
                                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                            </div>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                    onEscapeKeyDown={() => setIsPopoverOpen(false)}
                >
                    <Command>
                        {isCreatable && (
                            <div className="flex items-center px-2 py-1 border-b">
                                <input
                                    type="text"
                                    value={customInput}
                                    onChange={(e) => setCustomInput(e.target.value)}
                                    onKeyDown={handleCustomInputKeyDown}
                                    placeholder="Type and press Enter to add"
                                    className="flex-1 px-2 py-1 text-sm outline-none"
                                />
                            </div>
                        )}
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    key="all"
                                    onSelect={toggleAll}
                                    className="cursor-pointer"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                            selectedValues.length === options.length
                                                ? "bg-primary text-primary-foreground"
                                                : "opacity-50 [&_svg]:invisible"
                                        )}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </div>
                                    <span>(Select All)</span>
                                </CommandItem>
                                {options.map((option) => {
                                    const isSelected = selectedValues.includes(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            onSelect={() => toggleOption(option.value)}
                                            className="cursor-pointer"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </div>
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                                <div className="flex items-center justify-between">
                                    {selectedValues.length > 0 && (
                                        <>
                                            <CommandItem
                                                onSelect={handleClear}
                                                className="flex-1 justify-center cursor-pointer"
                                            >
                                                Clear
                                            </CommandItem>
                                            <Separator
                                                orientation="vertical"
                                                className="flex min-h-6 h-full"
                                            />
                                        </>
                                    )}
                                    <CommandItem
                                        onSelect={() => setIsPopoverOpen(false)}
                                        className="flex-1 justify-center cursor-pointer max-w-full"
                                    >
                                        Close
                                    </CommandItem>
                                </div>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        );
    }
);


MultiSelect.displayName = "MultiSelect";
