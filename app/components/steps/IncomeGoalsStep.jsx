import { useEffect, useState } from 'react';
import { calculateRetirement } from '../../lib/retirementCalculator';

const IncomeGoalsStep = ({ formData, updateFormData, onNext, onPrev, isCalculating }) => {
  const [localEstimate, setLocalEstimate] = useState(null);

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'currentIncome' || field === 'monthlyContribution') {
      processedValue = parseFloat(value) || 0;
    } else if (field === 'incomeReplacementRatio' || field === 'savingsRate' || field === 'inflationRate') {
      processedValue = parseFloat(value) || 0;
    }
    
    updateFormData({ [field]: processedValue });
    
    // Auto-open next relevant question based on selection
    if (field === 'hasDependents') {
      if (value === true) {
        setExpandedQuestion('whoDepends');
      } else {
        setExpandedQuestion('debt');
      }
    } else if (field === 'dependentTypes') {
      if (!Object.values(value).some(v => v)) {
        // If no dependent types selected, go to debt
        setExpandedQuestion('debt');
      }
      // Keep whoDepends open for all selections (including children)
    } else if (field === 'hasDebt') {
      if (value === true) {
        setExpandedQuestion('debtAmount');
      } else {
        setExpandedQuestion(null);
      }
    }
  };

  // toggleLearnMore function removed since educational sections are no longer needed

  // No longer needed since CPP/OAS are hardcoded
  // const handleBenefitChange = (field, value) => {
  //   const numericValue = parseFloat(value) || 0;
  //   updateFormData({ [field]: numericValue });
  // };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return value ? `${value}%` : '0%';
  };

  // Format number with commas
  const formatNumberWithCommas = (value) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Remove commas from input
  const removeCommas = (value) => {
    return value.replace(/,/g, '');
  };

  // Handle currency input formatting
  const handleCurrencyInput = (value, updateFunction) => {
    const cleanValue = removeCommas(value);
    const numericValue = parseFloat(cleanValue) || 0;
    updateFunction(numericValue);
  };

  // Educational content and other unused variables removed since CPP/OAS are now hardcoded

  // Calculate quick estimate
  useEffect(() => {
    if (formData.currentAge && formData.retirementAge && formData.currentIncome && formData.monthlyContribution) {
      try {
        const totalSavings = (formData.rrspBalance || 0) + 
                           (formData.tfsaBalance || 0) + 
                           (formData.otherRegisteredSavings || 0) + 
                           (formData.nonRegisteredInvestments || 0);

        // Calculate actual savings rate from monthly contribution
        const monthlyContribution = formData.monthlyContribution || 0;
        const annualContribution = monthlyContribution * 12;
        const currentIncome = formData.currentIncome || 0;
        const calculatedSavingsRate = currentIncome > 0 ? (annualContribution / currentIncome) * 100 : 0;

        // Convert investment approach to specific return rates
        let preRetirementReturnRate;
        let retirementReturnRate;
        
        if (formData.expectedReturnType === 'conservative') {
          preRetirementReturnRate = 0.045; // 4.5% (middle of 4-5% range)
          retirementReturnRate = 0.045;    // 4.5% (same as pre-retirement)
        } else if (formData.expectedReturnType === 'balanced') {
          preRetirementReturnRate = 0.065; // 6.5% (middle of 6-7% range)
          retirementReturnRate = 0.065;    // 6.5% (same as pre-retirement)
        } else if (formData.expectedReturnType === 'growth') {
          preRetirementReturnRate = 0.085; // 8.5% (middle of 8-9% range)
          retirementReturnRate = 0.085;    // 8.5% (same as pre-retirement)
        } else {
          // Fallback to form data or defaults
          preRetirementReturnRate = (formData.preRetirementReturn || 6) / 100;
          retirementReturnRate = (formData.retirementReturn || 5) / 100;
        }

        const estimateInputs = {
          currentAge: formData.currentAge,
          retirementAge: formData.retirementAge,
          annualIncome: formData.currentIncome,
          incomeGrowthRate: (formData.incomeGrowthRate || 2) / 100,
          incomeReplacementRatio: (formData.incomeReplacementRatio || 70) / 100,
          customAccounts: formData.customAccounts || [],
          expectedReturnType: formData.expectedReturnType,
          otherIncome: formData.otherIncome || 0
        };

        const results = calculateRetirement(estimateInputs);
        setLocalEstimate(results);
      } catch (error) {
        console.log('Error calculating estimate:', error);
        setLocalEstimate(null);
      }
    }
  }, [formData]);

  // No progressive reveal needed - just show the info

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Income & goals</h2>
        <p className="text-gray-600">Let's plan your retirement income and lifestyle</p>
      </div>

      <div className="space-y-6">
        
        {/* Info about hardcoded government benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Government Benefits Included</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">CPP Monthly Benefit:</span>
              <span className="text-blue-900 font-bold">$1,433</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">OAS Monthly Benefit:</span>
              <span className="text-blue-900 font-bold">$727.67</span>
            </div>
          </div>
          <p className="text-blue-700 text-sm mt-3">
            These maximum government benefits are automatically included in your retirement calculations.
          </p>
        </div>





      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center border-t border-border pt-6 mt-8">
        <button
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={onPrev}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-accent hover:bg-primary-500 text-white shadow-sm hover:shadow-md"
          onClick={onNext}
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default IncomeGoalsStep; 