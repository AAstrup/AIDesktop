// StepDetails.tsx
import React from 'react';
import { useJobs } from './JobsContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from './components/ui/button';

const StepDetails: React.FC = () => {
    const { steps, selectedStepId, updateStepDetail } = useJobs();

    // Find the selected step
    const selectedStep = steps.find((step) => step.id === selectedStepId);

    if (!selectedStep) {
        return null; // No step selected, don't render details
    }

    return (
        <div className='flex flex-grows'>
            <div className='flex flex-grows flex-col gap-4'>
                <Card className="p-4">
                    <h2 className="text-xl font-bold mb-4">Step Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <Input
                                value={selectedStep.title}
                                onChange={(e) => updateStepDetail(selectedStep.id, 'title', e.target.value)}
                            />
                        </div>
                        {/* Add more detail fields as needed */}
                    </div>
                </Card>
                <div className='flex flex-col p-4 gap-2'>
                    <Input className='flex' />
                    <Button className='flex'> Generate integration </Button>
                </div>
                <Card className="p-4">
                    <h2 className="text-xl font-bold mb-4">Step Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <Input
                                value={selectedStep.title}
                                onChange={(e) => updateStepDetail(selectedStep.id, 'title', e.target.value)}
                            />
                        </div>
                        {/* Add more detail fields as needed */}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StepDetails;
