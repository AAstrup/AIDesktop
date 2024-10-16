// StepComboBox.tsx
import React from 'react';
import { AvailableStep, useJobs } from './JobsContext';
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
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';

const StepComboBox: React.FC = () => {
    const { addStep } = useJobs();
    const [open, setOpen] = React.useState(false);
    const [availableSteps, setAvailableSteps] = React.useState<AvailableStep[]>([]);

    const handleSelect = async (step: AvailableStep) => {
        try {
            await addStep(step);
            setOpen(false);
        } catch (error) {
            console.error('Error adding step:', error);
        }
    };

    React.useEffect(() => {
        // Fetch the available steps from GitHub
        const fetchSteps = async () => {
            try {
                const availableSteps = await window.api.fetchAppsRegistry()
                setAvailableSteps(availableSteps);
            } catch (error) {
                console.error('Failed to fetch steps:', error);
            }
        };

        fetchSteps();
    }, []);

    return (
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
                                    key={step.name}
                                    onSelect={async () => {
                                        await handleSelect(step)
                                    }}
                                >
                                    {step.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default StepComboBox;
