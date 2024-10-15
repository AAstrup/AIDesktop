// StepDetails.tsx
import React from 'react';
import { useJobs } from './JobsContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const StepDetails: React.FC = () => {
    const { steps, selectedStepId, updateStepDetail } = useJobs();

    // Find the selected step
    const selectedStep = steps.find((step) => step.id === selectedStepId);

    if (!selectedStep) {
        return null; // No step selected, don't render details
    }

    return (
        <div className="flex flex-grow">
            <div className="flex flex-col gap-4">
                <Card className="p-4">
                    <h2 className="text-xl font-bold mb-4">Step Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <Input
                                value={selectedStep.name}
                                onChange={(e) =>
                                    updateStepDetail(selectedStep.id, 'name', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Version</label>
                            <Input
                                value={selectedStep.version}
                                onChange={(e) =>
                                    updateStepDetail(selectedStep.id, 'version', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">GitHub URL</label>
                            <Input
                                value={selectedStep.github}
                                onChange={(e) =>
                                    updateStepDetail(selectedStep.id, 'github', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Download URL</label>
                            <Input
                                value={selectedStep.zipDownload}
                                onChange={(e) =>
                                    updateStepDetail(selectedStep.id, 'zipDownload', e.target.value)
                                }
                            />
                        </div>
                    </div>
                </Card>
                <div className="flex flex-col p-4 gap-2">
                    <Input placeholder="Integration details..." />
                    <Button>Generate Integration</Button>
                </div>
            </div>
        </div>
    );
};

export default StepDetails;
