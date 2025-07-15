import { useState } from 'react';

// No imports needed for this component

const ProtectionStep = ({ formData, updateFormData, onNext, onPrev }) => {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

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
      if (!value || value.length === 0) {
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

  // Helper function to handle multiple dependent type selections
  const handleDependentTypeChange = (type) => {
    const currentSelections = formData.dependentTypes || [];
    let newSelections;
    
    if (currentSelections.includes(type)) {
      // Remove if already selected
      newSelections = currentSelections.filter(item => item !== type);
    } else {
      // Add if not selected
      newSelections = [...currentSelections, type];
    }
    
    handleInputChange('dependentTypes', newSelections);
  };

  // Determine visibility based on progressive reveal
  const showWhoDepends = formData.hasDependents === true;
  const showDebt = formData.hasDependents !== undefined && (formData.hasDependents === false || (formData.hasDependents === true && formData.dependentTypes && formData.dependentTypes.length > 0));
  const showDebtAmount = formData.hasDebt === true;
  const showCoverage = formData.hasDebt !== undefined && (formData.hasDebt === false || (formData.hasDebt === true && formData.debtAmount > 0));
  const showCoverageType = formData.hasCoverage === true;
  const showCoverageAmount = formData.hasCoverage === true && formData.currentCoverageType;

  const dependentOptions = [
    { value: 'children', label: 'Child(ren)' },
    { value: 'spouse', label: 'Spouse/Partner' },
    { value: 'parents', label: 'Parents' },
    { value: 'other', label: 'Other family' }
  ];

  const coverageOptions = [
    { value: 'term', label: 'Term' },
    { value: 'permanent', label: 'Permanent' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-12">
        
        {/* Dependents Question - Always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          <div>
            <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">Do you have anyone depending on your income?</h2>
            <p className="text-gray-500 text-sm">Consider spouse, children, parents, or others who rely on your financial support</p>
          </div>
          <div className="flex gap-4 justify-start lg:justify-end lg:mr-[15%] w-full">
            <label
              className={`flex items-center cursor-pointer w-1/2 border-2 rounded-lg px-4 py-3 transition-colors
                ${formData.hasDependents === true
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-gray-300 bg-white hover:border-gray-400'}
              `}
            >
              <input
                type="radio"
                name="hasDependents"
                value="true"
                checked={formData.hasDependents === true}
                onChange={(e) => handleInputChange('hasDependents', e.target.value === 'true')}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                ${formData.hasDependents === true
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-gray-300 bg-white'}
              `}>
                {formData.hasDependents === true && (
                  <div className="w-3 h-3 rounded-full bg-[#00C2FF]"></div>
                )}
              </div>
              <span className="text-gray-700 text-base lg:text-lg">Yes</span>
            </label>
            
            <label
              className={`flex items-center cursor-pointer w-1/2 border-2 rounded-lg px-4 py-3 transition-colors
                ${formData.hasDependents === false
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-gray-300 bg-white hover:border-gray-400'}
              `}
            >
              <input
                type="radio"
                name="hasDependents"
                value="false"
                checked={formData.hasDependents === false}
                onChange={(e) => handleInputChange('hasDependents', e.target.value === 'true')}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                ${formData.hasDependents === false
                  ? 'bg-blue-50 border-blue-200'
                  : 'border-gray-300 bg-white'}
              `}>
                {formData.hasDependents === false && (
                  <div className="w-3 h-3 rounded-full bg-[#00C2FF]"></div>
                )}
              </div>
              <span className="text-gray-700 text-base lg:text-lg">No</span>
            </label>
          </div>
        </div>

        {/* Who Depends - Shows after selecting yes */}
        {showWhoDepends && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">Who depends on your income?</h2>
              <p className="text-gray-500 text-sm">Select all that apply to understand your protection needs</p>
            </div>
            <div>
              {/* Mobile Multi-Select */}
              <div className="block md:hidden">
                <div className="space-y-2">
                  {['spouse', 'children', 'parents', 'other'].map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={(formData.dependentTypes || []).includes(type)}
                        onChange={() => handleDependentTypeChange(type)}
                      />
                      <div className={`w-6 h-6 rounded border-2 mr-3 flex items-center justify-center ${
                        (formData.dependentTypes || []).includes(type)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {(formData.dependentTypes || []).includes(type) && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-gray-700 text-base lg:text-lg capitalize">
                        {type === 'spouse' ? 'Spouse' : 
                         type === 'children' ? 'Children' : 
                         type === 'parents' ? 'Parents' : 'Other'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Desktop Buttons */}
              <div className="hidden md:grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg border-2 transition-all text-center ${
                    (formData.dependentTypes || []).includes('spouse')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleDependentTypeChange('spouse')}
                >
                  <div className="font-semibold text-base">Spouse</div>
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg border-2 transition-all text-center ${
                    (formData.dependentTypes || []).includes('children')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleDependentTypeChange('children')}
                >
                  <div className="font-semibold text-base">Children</div>
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg border-2 transition-all text-center ${
                    (formData.dependentTypes || []).includes('parents')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleDependentTypeChange('parents')}
                >
                  <div className="font-semibold text-base">Parents</div>
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-lg border-2 transition-all text-center ${
                    (formData.dependentTypes || []).includes('other')
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleDependentTypeChange('other')}
                >
                  <div className="font-semibold text-base">Other</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debt Question - Shows after dependents */}
        {showDebt && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">Do you have debt you'd want paid off?</h2>
              <p className="text-gray-500 text-sm">Consider mortgage, loans, credit cards, or other debts you'd want covered</p>
            </div>
            <div className="flex gap-4 justify-start lg:justify-end lg:mr-[15%] w-full">
              <label
                className={`flex items-center cursor-pointer w-1/2 border-2 rounded-lg px-4 py-3 transition-colors
                  ${formData.hasDebt === true
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white hover:border-gray-400'}
                `}
              >
                <input
                  type="radio"
                  name="hasDebt"
                  value="true"
                  checked={formData.hasDebt === true}
                  onChange={(e) => handleInputChange('hasDebt', true)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                  ${formData.hasDebt === true
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white'}
                `}>
                  {formData.hasDebt === true && (
                    <div className="w-3 h-3 rounded-full bg-[#00C2FF]"></div>
                  )}
                </div>
                <span className="text-gray-700 text-base lg:text-lg">Yes</span>
              </label>
              
              <label
                className={`flex items-center cursor-pointer w-1/2 border-2 rounded-lg px-4 py-3 transition-colors
                  ${formData.hasDebt === false
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white hover:border-gray-400'}
                `}
              >
                <input
                  type="radio"
                  name="hasDebt"
                  value="false"
                  checked={formData.hasDebt === false}
                  onChange={(e) => handleInputChange('hasDebt', false)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                  ${formData.hasDebt === false
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white'}
                `}>
                  {formData.hasDebt === false && (
                    <div className="w-3 h-3 rounded-full bg-[#00C2FF]"></div>
                  )}
                </div>
                <span className="text-gray-700 text-base lg:text-lg">No</span>
              </label>
            </div>
          </div>
        )}

        {/* Debt Amount - Shows after selecting yes */}
        {showDebtAmount && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">How much debt would you want paid off?</h2>
              <p className="text-gray-500 text-sm">Total amount of debt you'd want covered by insurance</p>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. $300,000"
                min={0}
                value={formData.debtAmount ? '$' + formatNumberWithCommas(formData.debtAmount) : ''}
                onChange={(e) => {
                  const cleanValue = removeCommas(e.target.value.replace(/[^0-9]/g, ''));
                  const parsedValue = parseFloat(cleanValue);
                  const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
                  handleInputChange('debtAmount', numericValue);
                }}
              />
            </div>
          </div>
        )}

        {/* Coverage Question - Shows after debt */}
        {showCoverage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">Do you currently have coverage?</h2>
              <p className="text-gray-500 text-sm">Life insurance, disability insurance, or other coverage through work or personal policies</p>
            </div>
            <div className="flex gap-4 justify-start lg:justify-end lg:mr-[15%] w-full">
              <label
                className={`flex items-center cursor-pointer w-1/2 border-2 rounded-lg px-4 py-3 transition-colors
                  ${formData.hasCoverage === true
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white hover:border-gray-400'}
                `}
              >
                <input
                  type="radio"
                  name="hasCoverage"
                  value="true"
                  checked={formData.hasCoverage === true}
                  onChange={(e) => handleInputChange('hasCoverage', true)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                  ${formData.hasCoverage === true
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white'}
                `}>
                  {formData.hasCoverage === true && (
                    <div className="w-3 h-3 rounded-full bg-[#00C2FF]"></div>
                  )}
                </div>
                <span className="text-gray-700 text-base lg:text-lg">Yes</span>
              </label>
              
              <label
                className={`flex items-center cursor-pointer w-1/2 border-2 rounded-lg px-4 py-3 transition-colors
                  ${formData.hasCoverage === false
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white hover:border-gray-400'}
                `}
              >
                <input
                  type="radio"
                  name="hasCoverage"
                  value="false"
                  checked={formData.hasCoverage === false}
                  onChange={(e) => handleInputChange('hasCoverage', false)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                  ${formData.hasCoverage === false
                    ? 'bg-blue-50 border-blue-200'
                    : 'border-gray-300 bg-white'}
                `}>
                  {formData.hasCoverage === false && (
                    <div className="w-3 h-3 rounded-full bg-[#00C2FF]"></div>
                  )}
                </div>
                <span className="text-gray-700 text-base lg:text-lg">No</span>
              </label>
            </div>
          </div>
        )}

        {/* Coverage Type - Shows after selecting yes */}
        {showCoverageType && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-lg lg:text-xl font-normal text-gray-700 mb-2">What type of coverage do you have?</h2>
              <p className="text-gray-500 text-sm">Select the type that best describes your current coverage</p>
            </div>
            <div>
              {/* Mobile Dropdown */}
              <select
                className="block md:hidden w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={formData.currentCoverageType || ''}
                onChange={(e) => handleInputChange('currentCoverageType', e.target.value)}
              >
                <option value="">Select coverage type</option>
                <option value="term">Term Life Insurance</option>
                <option value="whole">Whole Life Insurance</option>
                <option value="universal">Universal Life Insurance</option>
                <option value="other">Other</option>
              </select>

              {/* Desktop Buttons */}
              <div className="hidden md:grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.currentCoverageType === 'term'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('currentCoverageType', 'term')}
                >
                  <div className="font-semibold text-md">Term Life Insurance</div>
                </button>
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.currentCoverageType === 'whole'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('currentCoverageType', 'whole')}
                >
                  <div className="font-semibold text-md">Whole Life Insurance</div>
                </button>
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.currentCoverageType === 'universal'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('currentCoverageType', 'universal')}
                >
                  <div className="font-semibold text-md">Universal Life Insurance</div>
                </button>
                <button
                  type="button"
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formData.currentCoverageType === 'other'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => handleInputChange('currentCoverageType', 'other')}
                >
                  <div className="font-semibold text-md">Other</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coverage Amount - Shows after selecting coverage type */}
        {showCoverageAmount && (
          <div className="grid grid-cols-2 gap-8 items-center animate-fadeIn">
            <div>
              <h2 className="text-xl font-normal text-gray-700 mb-2">Total coverage amount</h2>
              <p className="text-gray-500 text-sm">Combined value of all your current policies</p>
            </div>
            <div className="relative">
              <input
                type="text"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. $500,000"
                value={formData.currentCoverageAmount ? '$' + formatNumberWithCommas(formData.currentCoverageAmount) : ''}
                onChange={(e) => {
                  const cleanValue = removeCommas(e.target.value.replace(/[^0-9]/g, ''));
                  const parsedValue = parseFloat(cleanValue);
                  const numericValue = isNaN(parsedValue) ? 0 : parsedValue;
                  handleInputChange('currentCoverageAmount', numericValue);
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProtectionStep; 