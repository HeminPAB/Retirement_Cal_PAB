'use client';

import { useState } from 'react';
import Layout from './components/Layout';
import PersonalInfoStep from './components/steps/PersonalInfoStep';
import CurrentSavingsStep from './components/steps/CurrentSavingsStep';
import ProtectionStep from './components/steps/ProtectionStep';
import ResultsStep from './components/steps/ResultsStep';

import { calculateRetirement } from './lib/retirementCalculator';

const initialFormData = {
  // Personal Info
  currentAge: 0,
  retirementAge: 0,
  yearsInRetirement: 25,
  province: '',
  maritalStatus: '',
  annualIncome: 0,
  incomeGrowthRate: '',
  
  // Current Savings - individual account fields
  rrspBalance: 0,
  tfsaBalance: 0,
  otherRegisteredBalance: 0,
  nonRegisteredBalance: 0,
  monthlyTfsa: 0,
  monthlyRrsp: 0,
  monthlyOtherRegistered: 0,
  monthlyNonRegistered: 0,
  expectedReturnType: '',
  
  // Government Benefits
  cppBenefit: 1433,
  oasBenefit: 727.67,
  
  // Income & Goals
  incomeReplacementRatio: '',
  companyPension: 0,
  otherIncome: 0,
  
  // Protection & Family
  hasDependents: undefined,
  dependentTypes: [],
  hasDebt: undefined,
  debtAmount: 0,
  
  // Calculated fields
  preRetirementReturn: 0.07,
  retirementReturn: 0.04,
  inflationRate: 2.5,
};

export default function HomePage() {
  const [formData, setFormData] = useState(initialFormData);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Progressive reveal logic for sections
  const showCurrentSavings = formData.currentAge > 0 && 
                              formData.retirementAge > formData.currentAge && 
                              formData.annualIncome > 0 &&
                              formData.province &&
                              formData.maritalStatus &&
                              formData.incomeGrowthRate > 0 &&
                              formData.incomeReplacementRatio > 0;

  const showProtection = showCurrentSavings && formData.expectedReturnType; // Show protection after current savings
  
  const showResults = showProtection && 
                      formData.hasDependents !== undefined && 
                      formData.hasDebt !== undefined &&
                      (formData.hasDependents === false || (formData.hasDependents === true && formData.dependentTypes?.length > 0)); // Show results after protection questions
  


  const calculateResults = async () => {
    if (!showResults) return;
    
    setIsCalculating(true);
    
    try {
      // Debug logging
      console.log('Form Data:', formData);
      console.log('Custom Accounts:', formData.customAccounts);
      
      // Use the simple calculation function
      const results = calculateRetirement({
        currentAge: formData.currentAge,
        retirementAge: formData.retirementAge,
        annualIncome: formData.annualIncome,
        incomeGrowthRate: formData.incomeGrowthRate || 0.02,
        incomeReplacementRatio: formData.incomeReplacementRatio || 0.8,
        customAccounts: formData.customAccounts || [],
        expectedReturnType: formData.expectedReturnType,
        otherIncome: formData.otherIncome || 0
      });

      // Debug log to check the results
      console.log('Calculation Results:', results);

      setResults(results);
    } catch (error) {
      console.error('Error calculating results:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate when ready
  if (showResults && !results && !isCalculating) {
    calculateResults();
  }

  const handleStartOver = () => {
    setFormData(initialFormData);
    setResults(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Main Header */}
          <div className="lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">RetireSmart Calculator</h1>
          </div>
          <div className="lg:mb-8">
            <h3 className="text-xl sm:text-xl lg:text-4l font-bold text-[#17B3E4] mb-4">Tell us about your needs</h3>
          </div>
          <div className="space-y-8 lg:space-y-16">    
            {/* Personal Info Section - Always visible first */}
            <div>
              <div className="mb-2 lg:mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-[#707070]">Tell us about you</h1>
              </div>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                <PersonalInfoStep 
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </div>
            </div>

            {/* Current Savings Section - Shows after personal info */}
            {showCurrentSavings && (
              <div className="animate-fadeIn">
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal text-gray-600 mb-2">Current savings</h1>
                  <p className="text-sm sm:text-base text-gray-500">Tell us about your existing retirement savings and investments</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <CurrentSavingsStep 
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                </div>
              </div>
            )}

            {/* Protection & Family Section - Shows after current savings */}
            {showProtection && (
              <div className="animate-fadeIn">
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal text-gray-600 mb-2">Help us understand you</h1>
                  <p className="text-sm sm:text-base text-gray-500">Tell us about your family and financial protection needs</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <ProtectionStep 
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                </div>
              </div>
            )}

            {/* Results Section - Shows after protection questions */}
            {showResults && (
              <div className="animate-fadeIn">
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-normal text-gray-600 mb-2">Your retirement plan</h1>
                  <p className="text-sm sm:text-base text-gray-500">Based on your information, here's your personalized retirement projection</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
                  {isCalculating ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                      <p className="mt-4 text-gray-600">Calculating your retirement projection...</p>
                    </div>
                  ) : results ? (
                    <ResultsStep 
                      results={results}
                      formData={formData}
                      onStartOver={handleStartOver}
                    />
                  ) : null}
                </div>
              </div>
            )}



          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-500 text-sm">
            <p>This calculator provides estimates for planning purposes only.</p>
            <p className="mt-1">Consult with a financial advisor for personalized advice.</p>
          </div>

        </div>
      </div>
    </Layout>
  );
} 