import React from 'react'
import { useJobs } from './JobsContext'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'

const StepComboBox: React.FC = () => {
  const { addStep } = useJobs()
  const [open, setOpen] = React.useState(false)
  const [availableSteps, setAvailableSteps] = React.useState<string[]>([])

  const handleSelect = async (appName: string) => {
    try {
      await addStep(appName)
      setOpen(false)
    } catch (error) {
      console.error('Error adding step:', error)
    }
  }

  React.useEffect(() => {
    const fetchSteps = async () => {
      try {
        const apps = await window.api.fetchAppsRegistry()
        setAvailableSteps(apps.map((app) => app.name))
      } catch (error) {
        console.error('Failed to fetch steps:', error)
      }
    }

    fetchSteps()
  }, [])

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
              {availableSteps.map((appName) => (
                <CommandItem
                  key={appName}
                  onSelect={async () => {
                    await handleSelect(appName)
                  }}
                >
                  {appName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default StepComboBox
