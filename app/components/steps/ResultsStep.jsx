import { useState } from 'react';
import RetirementChart from '../RetirementChart';
import InsuranceSolutionChart from '../InsuranceSolutionChart';
import { generateRetirementReport } from '../../lib/pdfGenerator';

const ResultsStep = ({ results, formData, onPrev, onStartOver }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showActionableItems, setShowActionableItems] = useState(false);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  const formatFullCurrency = (value) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Safety check for results
  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Calculating your retirement projection...</p>
      </div>
    );
  }

  // Use the results from the calculation, not formData
  const {
    currentAge,
    retirementAge,
    yearsToRetirement,
    currentAnnualIncome,
    incomeAtRetirement,
    requiredAnnualIncome,
    currentSavings,
    annualContributions,
    monthlyContributions,
    totalSavingsAtRetirement,
    monthlyGovernmentBenefits,
    totalMonthlyRetirementIncome,
    targetMonthlyIncome,
    // Money duration data
    depletionAge,
    yearsMoneyWillLast,
    moneyLastsForever,
    // Withdrawal needs
    annualWithdrawalNeeded,
    monthlyWithdrawalNeeded,
    shortfall,
    isOnTrack,
    needsMoreSavings,
    annualReturn,
    expectedReturnType
  } = results;

  // Calculate some display values
  const incomeReplacementRatio = formData.incomeReplacementRatio * 100; // Convert to percentage

  // Function to handle PDF generation
  const handleDownloadPDF = async () => {
    const calculations = {
      currentAge,
      retirementAge,
      yearsToRetirement,
      currentAnnualIncome,
      incomeGrowthRate: formData.incomeGrowthRate,
      incomeReplacementRatio,
      targetMonthlyIncome,
      monthlyGovernmentBenefits,
      monthlyWithdrawalNeeded,
      currentSavings,
      monthlyContributions,
      expectedReturn: annualReturn,
      totalSavingsAtRetirement,
      monthlyWithdrawalFromSavings
    };
    
    try {
      await generateRetirementReport(formData, calculations);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="text-primary-500">Planning</span>
          <span>/</span>
          <span>Retirement</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your retirement outlook</h1>
        <p className="text-gray-600">
          Based on your inputs, here's a projection of your retirement savings and income.
        </p>
      </div>

      <div className="space-y-8">
        {/* Real Money Duration Warning */}
        {depletionAge && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Reality Check: Your money will only last until age {depletionAge}
                </h3>
                <p className="text-sm text-red-700">
                  That's {yearsMoneyWillLast} years in retirement. You'll need {formatCurrency(shortfall)} more to fund a comfortable retirement.
                </p>
              </div>
            </div>
          </div>
        )}

        {moneyLastsForever && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Great news! Your money will last throughout retirement
                </h3>
                <p className="text-sm text-green-700">
                  Your savings will support you for 40+ years in retirement.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Final Working Income */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-primary-500 text-sm font-medium mb-2">
                Final Working Income
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                {formatCurrency(incomeAtRetirement)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Your projected annual income at retirement (age {retirementAge})
              </p>
            </div>

            {/* Projected Savings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-primary-500 text-sm font-medium mb-2">
                Projected Savings at Retirement
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                {formatCurrency(totalSavingsAtRetirement)}
              </div>
            </div>

            {/* Required Monthly Withdrawal */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-primary-500 text-sm font-medium mb-2">
                Monthly Withdrawal Needed
              </h3>
              <div className="text-4xl font-bold text-primary-600 mb-1">
                {formatCurrency(monthlyWithdrawalNeeded)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                From your savings (Government benefits: {formatCurrency(monthlyGovernmentBenefits)}/month)
              </p>
            </div>
          </div>
        </div>


        {/* Retirement Coverage Chart */}
        <div>
          <RetirementChart
            currentAge={currentAge}
            retirementAge={retirementAge}
            projectedSavings={totalSavingsAtRetirement}
            netRequiredMonthlyWithdrawal={monthlyWithdrawalNeeded}
            expectedReturn={annualReturn}
          />
        </div>



        {/* Actionable Items Toggle */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to Improve Your Retirement Plan?</h2>
            <p className="text-gray-600 mb-6">
              Discover personalized strategies to enhance your retirement savings and protect your family's financial future.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowActionableItems(true)}
                className={`px-6 lg:px-8 py-3 rounded-lg font-medium transition-all ${
                  showActionableItems 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                Yes, Show Me Options
              </button>
              <button
                onClick={() => setShowActionableItems(false)}
                className={`px-6 lg:px-8 py-3 rounded-lg font-medium transition-all ${
                  !showActionableItems 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                No Thanks
              </button>
            </div>
          </div>

          {/* Actionable Items Content */}
          {showActionableItems && (
            <div className="mt-8">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-magenta-50 to-purple-50 px-6 py-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Whole Life Insurance</h3>
                    <p className="text-gray-600 text-lg">Retirement & Protection Combined</p>
                  </div>
                  
                  {/* WL Insurance Explanation */}
                  <div className=" bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-700 leading-relaxed text-lg">
                    Whole Life Insurance offers lifelong coverage with a guaranteed death benefit and cash value growth. It builds wealth safely, offers tax-free loans, and supports both family protection and retirement income.
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="px-8 py-8 bg-gray-50 text-[#d81671] font-bolder">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="text-4xl font-bold text-magenta-600 mb-2">6.4%</div>
                      <div className="text-gray-600 font-medium">Current Divident Scale</div>
                      <div className="text-sm text-gray-500 mt-1">No market volatility</div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="text-4xl font-bold text-magenta-600 mb-2">0%</div>
                      <div className="text-gray-600 font-medium">Tax on Loans*</div>
                      <div className="text-sm text-gray-500 mt-1">Access your cash value</div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="text-4xl font-bold text-magenta-600 mb-2">Low</div>
                      <div className="text-gray-600 font-medium">Market Risk</div>
                      <div className="text-sm text-gray-500 mt-1">Stable, predictable returns</div>
                    </div>
                  </div>
                </div>

                {/* Why Choose WL Over Alternatives */}
                {/* <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Whole Life vs. Other Options</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-3 font-semibold text-gray-900">Feature</th>
                          <th className="text-center py-3 font-semibold text-magenta-600">Whole Life</th>
                          <th className="text-center py-3 font-semibold text-gray-600">RRSPs</th>
                          <th className="text-center py-3 font-semibold text-gray-600">Term Insurance</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        <tr className="border-b border-gray-200">
                          <td className="py-3 font-medium">Guaranteed Growth</td>
                          <td className="text-center py-3 text-green-600 font-bold">✓</td>
                          <td className="text-center py-3 text-red-500">✗</td>
                          <td className="text-center py-3 text-red-500">✗</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 font-medium">Tax-Free Access</td>
                          <td className="text-center py-3 text-green-600 font-bold">✓</td>
                          <td className="text-center py-3 text-red-500">✗</td>
                          <td className="text-center py-3 text-red-500">✗</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-3 font-medium">Death Benefit</td>
                          <td className="text-center py-3 text-green-600 font-bold">✓</td>
                          <td className="text-center py-3 text-red-500">✗</td>
                          <td className="text-center py-3 text-orange-500">Temporary</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-medium">Market Risk</td>
                          <td className="text-center py-3 text-green-600 font-bold">None</td>
                          <td className="text-center py-3 text-red-500">High</td>
                          <td className="text-center py-3 text-gray-500">N/A</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div> */}

                {/* Ready to Learn More */}
                <div className="bg-gradient-to-r from-magenta-50 to-purple-50 px-8 py-8 text-center">
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">Ready to Learn More?</h4>
                  <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
                    Discover how Whole Life Insurance can complement your retirement strategy and provide the financial security you need.
                  </p>
                  
                  {/* Fresh CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="w-full sm:w-auto bg-primary-600 text-white px-6 lg:px-8 py-3 rounded-lg font-semibold text-base lg:text-lg hover:bg-primary-700 transition-colors shadow-md">
                      Schedule a Call
                    </button>
                    
                    <button className="w-full sm:w-auto bg-white text-primary-600 border-2 border-primary-600 px-6 lg:px-8 py-3 rounded-lg font-semibold text-base lg:text-lg hover:bg-primary-50 transition-colors shadow-md">
                      Get Whole Life Insurance Quotes
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
          {/* <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Download PDF Report
          </button> */}
          <button
            onClick={onStartOver}
            className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start New Calculation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep; 