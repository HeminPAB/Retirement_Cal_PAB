import { useState } from 'react';

const PersonalInfoStep = ({ formData, updateFormData, onNext, onPrev }) => {
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Helper to format number as currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };

  // Helper to parse currency string to number
  const parseCurrency = (value) => {
    if (!value) return 0;
    // Remove all non-digit characters
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Yukon'
  ];

  // Validation
  const isValid = formData.currentAge > 0 && 
                  formData.retirementAge > formData.currentAge && 
                  formData.annualIncome > 0 &&
                  formData.province &&
                  formData.maritalStatus &&
                  formData.incomeGrowthRate > 0 &&
                  formData.incomeReplacementRatio > 0;

  // Error for retirement age
  const retirementAgeError = formData.currentAge > 0 && formData.retirementAge > 0 && formData.retirementAge <= formData.currentAge;

  // Determine which questions should be visible based on completion
  const showRetirementAge = formData.currentAge > 0;
  const showAnnualIncome = showRetirementAge && formData.retirementAge > 0;
  const showProvince = showAnnualIncome && formData.annualIncome > 0;
  const showMaritalStatus = showProvince && formData.province;
  const showIncomeGrowth = showMaritalStatus && formData.maritalStatus;
  const showRetirementLifestyle = showIncomeGrowth && formData.incomeGrowthRate > 0;

  // Ensure incomeReplacementRatio is '' by default for the select
  if (formData.incomeReplacementRatio === undefined || formData.incomeReplacementRatio === null) {
    handleInputChange('incomeReplacementRatio', '');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-12">
        
        {/* Current Age - Always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div>
            <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">What is your current age?</h2>
            <p className="text-gray-500 text-sm">Determines years to save and grow investments</p>
          </div>
          <div>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="35"
              value={formData.currentAge || ''}
              onChange={(e) => handleInputChange('currentAge', parseInt(e.target.value) || 0)}
              min="18"
              max="75"
            />
          </div>
        </div>

        {/* Retirement Age - Shows after current age */}
        {showRetirementAge && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">When do you want to retire?</h2>
              <p className="text-gray-500 text-sm">Full CPP and OAS benefits start at 65</p>
            </div>
            <div>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="65"
                value={formData.retirementAge || ''}
                onChange={(e) => handleInputChange('retirementAge', parseInt(e.target.value) || 0)}
                min={formData.currentAge + 1}
                max="75"
              />
              {retirementAgeError && (
                <p className="text-red-500 text-sm mt-2">Retirement age should be greater than current age.</p>
              )}
            </div>
          </div>
        )}

        {/* Annual Income - Shows after retirement age */}
        {showAnnualIncome && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">What is your current annual income?</h2>
              <p className="text-gray-500 text-sm">Your current gross income before taxes</p>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-md text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. $40,000"
                value={formData.annualIncome && formData.annualIncome > 0 ? formatCurrency(formData.annualIncome) : ''}
                onChange={(e) => {
                  const numericValue = parseCurrency(e.target.value);
                  handleInputChange('annualIncome', numericValue);
                }}
                onBlur={(e) => {
                  // Optionally, reformat on blur
                  const numericValue = parseCurrency(e.target.value);
                  handleInputChange('annualIncome', numericValue);
                }}
                inputMode="numeric"
                pattern="[0-9,]*"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Other Income - Shows after annual income */}
        {showAnnualIncome && formData.annualIncome > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">Any other monthly income?</h2>
              <p className="text-gray-500 text-sm">Rental income, dividends, etc.</p>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-md text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. $1,000"
                value={formData.otherIncome !== undefined ? formatCurrency(formData.otherIncome) : ''}
                onChange={(e) => {
                  const numericValue = parseCurrency(e.target.value);
                  handleInputChange('otherIncome', numericValue);
                }}
                onBlur={(e) => {
                  const numericValue = parseCurrency(e.target.value);
                  handleInputChange('otherIncome', numericValue);
                }}
                inputMode="numeric"
                pattern="[0-9,]*"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Province - Shows after annual income */}
        {showProvince && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 ">Which province do you live in?</h2>
              
            </div>
            <div className="relative">
              <select
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
              >
                <option value="">Select province</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Marital Status - Shows after province */}
        {showMaritalStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700">What is your marital status?</h2>
            
            </div>
            <div className="flex flex-row gap-4 w-full">
              {['single', 'married'].map((status) => (
                <label
                  key={status}
                  className={`flex items-center justify-start px-4 py-3 border rounded-md cursor-pointer transition-all duration-150
                    w-[50%]
                    ${formData.maritalStatus === status
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="maritalStatus"
                    value={status}
                    checked={formData.maritalStatus === status}
                    onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                    className="sr-only"
                  />
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full border-2 mr-3 transition-all
                      ${formData.maritalStatus === status ? 'border-blue-400 bg-white' : 'border-gray-300 bg-white'}`}
                  >
                    {formData.maritalStatus === status && (
                      <span className="block w-4 h-4 rounded-full bg-sky-400"></span>
                    )}
                  </span>
                  <span className="text-gray-700 text-lg font-medium">
                    {status === 'single' ? 'Single' : 'Married'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Income Growth - Shows after marital status */}
        {showIncomeGrowth && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700">What is your projected income growth?</h2>
            </div>
            <div className="relative">
              <select
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={formData.incomeGrowthRate || ''}
                onChange={(e) => handleInputChange('incomeGrowthRate', parseFloat(e.target.value))}
              >
                <option value="">Select income growth</option>
                <option value={0.02}>Limited - up to 2%</option>
                <option value={0.035}>Consistent - 3-4%</option>
                <option value={0.065}>Accelerated - 5-7%</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Final Working Income Display - Shows after income growth */}
        {showRetirementLifestyle && formData.incomeGrowthRate && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">Final Working Income</h2>
              <p className="text-gray-500 text-sm">Your projected annual income at retirement (age {formData.retirementAge})</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-2xl font-bold text-blue-900">
                {formData.annualIncome && formData.retirementAge && formData.currentAge 
                  ? `$${Math.round(formData.annualIncome * Math.pow(1 + formData.incomeGrowthRate, formData.retirementAge - formData.currentAge)).toLocaleString()}`
                  : '$0'
                }
              </div>
            </div>
          </div>
        )}

        {/* Retirement Lifestyle - Shows after income growth */}
        {showRetirementLifestyle && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">How much do you want for your retirement?</h2>
              <p className="text-gray-500 text-sm">Based on your final working income of ${formData.annualIncome && formData.retirementAge && formData.currentAge 
                ? Math.round(formData.annualIncome * Math.pow(1 + formData.incomeGrowthRate, formData.retirementAge - formData.currentAge)).toLocaleString()
                : '0'}, what percentage do you want during retirement?</p>
            </div>
            <div>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  value={
                    formData.incomeReplacementRatio === 0.6
                      ? '0.6'
                      : formData.incomeReplacementRatio === 0.8
                      ? '0.8'
                      : formData.incomeReplacementRatio === '' || formData.incomeReplacementRatio === undefined
                      ? ''
                      : formData.incomeReplacementRatio === 'custom' || (typeof formData.incomeReplacementRatio === 'number' && formData.incomeReplacementRatio !== 0.6 && formData.incomeReplacementRatio !== 0.8)
                      ? 'custom'
                      : ''
                  }
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      handleInputChange('incomeReplacementRatio', 'custom');
                    } else if (e.target.value === '') {
                      handleInputChange('incomeReplacementRatio', '');
                    } else {
                      handleInputChange('incomeReplacementRatio', parseFloat(e.target.value));
                    }
                  }}
                >
                  <option value="">Select retirement lifestyle</option>
                  <option value="0.6">60% - Downsized</option>
                  <option value="0.8">80% - Maintain</option>
                  <option value="custom">Flexible (Custom)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {(
                formData.incomeReplacementRatio === 'custom' ||
                (typeof formData.incomeReplacementRatio === 'number' && formData.incomeReplacementRatio !== 0.6 && formData.incomeReplacementRatio !== 0.8)
              ) && (
                <div className="mt-2 relative">
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter percentage"
                    value={
                      typeof formData.incomeReplacementRatio === 'number' && !isNaN(formData.incomeReplacementRatio)
                        ? Math.round(Number(formData.incomeReplacementRatio) * 100)
                        : ''
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (isNaN(value) || value === '') {
                        handleInputChange('incomeReplacementRatio', 'custom');
                      } else if (value >= 1) {
                        handleInputChange('incomeReplacementRatio', value / 100);
                      }
                    }}
                    min="1"
                    max="150"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PersonalInfoStep;