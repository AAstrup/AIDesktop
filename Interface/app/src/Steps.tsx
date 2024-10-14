// Steps.tsx
import React from 'react';
import { useJobs } from './JobsContext';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { TrashIcon } from '@radix-ui/react-icons';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { ChevronsUpDown } from 'lucide-react'; // Or use an alternative icon
// If you don't have lucide-react, you can use another icon library

const Steps: React.FC = () => {
    const {
        steps,
        addStep,
        deleteStep,
        toggleStepEnabled,
        updateStepTitle,
        selectedJobId,
        selectStep,
        selectedStepId,
    } = useJobs();

    // Filter steps for the selected job
    const jobSteps = steps.filter((step) => step.jobId === selectedJobId);

    const availableSteps = [
        { id: 'step1', title: 'Install dependencies' },
        { id: 'step2', title: 'Run build' },
        { id: 'step3', title: 'Deploy to server' },
    ];

    const [open, setOpen] = React.useState(false);

    return (
        <div className="flex flex-col">
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="w-20">Enabled</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobSteps.map((step) => (
                        <TableRow
                            key={step.id}
                            onClick={() => handleRowClick(step.id)}
                            className={`cursor-pointer ${selectedStepId === step.id ? 'bg-gray-100' : ''
                                }`}
                        >
                            <TableCell>
                                <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateStepTitle(step.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-2 py-1 border border-gray-300 rounded"
                                />
                            </TableCell>
                            <TableCell>
                                <Checkbox
                                    checked={step.enabled}
                                    onCheckedChange={() => toggleStepEnabled(step.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="border border-gray-400 bg-white checked:bg-black checked:border-black"
                                />
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            ...
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onSelect={() => deleteStep(step.id)}>
                                            <TrashIcon className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-center mt-2">
                {/* CHANGE CODE HERE */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[200px] justify-between"
                        >
                            Add step...
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                            <CommandList>
                                <CommandGroup>
                                    {availableSteps.map((step) => (
                                        <CommandItem
                                            key={step.id}
                                            onSelect={() => {
                                                addStep(step.title);
                                                setOpen(false);
                                            }}
                                        >
                                            {step.title}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );

    function handleRowClick(id: number) {
        if (selectedStepId === id) {
            selectStep(null);
        } else {
            selectStep(id);
        }
    }
};

export default Steps;
