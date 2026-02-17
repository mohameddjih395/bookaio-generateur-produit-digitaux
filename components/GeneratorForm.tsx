import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { GenerationForm, Step } from '../types';
import { StepContent } from './generator/StepContent';
import { StepNaming } from './generator/StepNaming';
import { StepDesign } from './generator/StepDesign';
import { StepMockup } from './generator/StepMockup';
import { DashboardStep } from './generator/DashboardStep';
import { SuccessStep } from './generator/SuccessStep';

interface GeneratorProps {
  sharedForm: GenerationForm;
  onSharedFormUpdate: (updates: GenerationForm) => void;
  onModeChange: (mode: any) => void;
  profile: any;
  user: any;
}

export const GeneratorForm: React.FC<GeneratorProps> = ({ sharedForm, onSharedFormUpdate, onModeChange, profile, user }) => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.CONTENT);
  const [resultData, setResultData] = useState<any>(null);
  const updateForm = (u: any) => onSharedFormUpdate({ ...sharedForm, ...u });
  const next = (d?: any) => { if (d) setResultData(d); setCurrentStep(s => s + 1); };
  const prev = () => setCurrentStep(s => s - 1);
  const fail = () => setCurrentStep(Step.ERROR);

  return (
    <div className="max-w-3xl mx-auto">
      {currentStep === Step.CONTENT && <StepContent form={sharedForm} updateForm={updateForm} onNext={next} onPrev={prev} profile={profile} user={user} />}
      {currentStep === Step.NAMING && <StepNaming form={sharedForm} updateForm={updateForm} onNext={next} onPrev={prev} profile={profile} user={user} />}
      {currentStep === Step.DESIGN && <StepDesign form={sharedForm} updateForm={updateForm} onNext={next} onPrev={prev} onModeChange={onModeChange} profile={profile} user={user} />}
      {currentStep === Step.MOCKUP && <StepMockup form={sharedForm} updateForm={updateForm} onPrev={prev} onNext={next} onFail={fail} profile={profile} user={user} />}
      {currentStep === Step.DASHBOARD && <DashboardStep resultData={resultData} onNext={() => next()} />}
      {currentStep === Step.SUCCESS && <SuccessStep onGoToDashboard={() => onModeChange('history')} />}
      {currentStep === Step.ERROR && <div className="py-20 text-center"><AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" /><h2 className="text-3xl font-serif mb-6">Erreur Technique</h2><button onClick={() => setCurrentStep(Step.MOCKUP)} className="px-10 py-4 rounded-xl gradient-amber font-bold">Réessayer</button></div>}
    </div>
  );
};
