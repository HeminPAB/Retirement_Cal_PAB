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



        {/* Combined Improvements and Insurance Section */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header Section with Improvements */}
            <div className="bg-gradient-to-r from-magenta-50 to-purple-50 px-8 py-8 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to Improve Your Retirement Plan?</h2>
              <p className="text-gray-600 text-xl mb-8">
                Discover personalized strategies to enhance your retirement savings and protect your family's financial future.
              </p>
              
              <button
                onClick={() => setShowActionableItems(true)}
                className="w-full bg-primary-600 text-white px-6 py-4 rounded-xl font-semibold text-xl hover:bg-primary-700 transition-colors shadow-sm"
              >
                Show My Personalized Recommendations
              </button>
            </div>

            {/* Insurance Content */}
            {showActionableItems && (
              <>
                {/* Insurance Header */}
                <div className="px-8 py-8 bg-white">
                  <h3 className="text-2xl font-bold text-gray-900">Whole Life Insurance</h3>
                  <p className="text-gray-600 text-lg">Retirement & Protection Combined</p>
                  
                  {/* WL Insurance Explanation */}
                  <div className="mt-6">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      Whole Life Insurance offers lifelong coverage with a guaranteed death benefit and cash value growth. It builds wealth safely, offers tax-free loans, and supports both family protection and retirement income.
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="px-8 py-8 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="text-4xl font-bold text-magenta-600 mb-2">6.4%</div>
                      <div className="text-gray-600 font-medium">Current Dividend Scale</div>
                      <div className="text-sm text-gray-500 mt-1">Limited volatility risk</div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="text-4xl font-bold text-magenta-600 mb-2">0%</div>
                      <div className="text-gray-600 font-medium">Tax on Loans*</div>
                      <div className="text-sm text-gray-500 mt-1">Access cash value through collateral loans</div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="text-4xl font-bold text-magenta-600 mb-2">Low</div>
                      <div className="text-gray-600 font-medium">Market Risk</div>
                      <div className="text-sm text-gray-500 mt-1">Stable, predictable returns</div>
                    </div>
                  </div>
                </div>

                {/* Ready to Learn More Section */}
                <div className="bg-gradient-to-r from-magenta-50 to-purple-50 px-8 py-8 text-center">
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">Ready to Learn More?</h4>
                  <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
                    Discover how Whole Life Insurance can complement your retirement strategy and provide the financial security you need.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="w-full sm:w-auto bg-primary-600 text-white px-6 lg:px-8 py-3 rounded-lg font-semibold text-base lg:text-lg hover:bg-primary-700 transition-colors shadow-md">
                      Schedule a Call
                    </button>
                    
                    <button className="w-full sm:w-auto bg-white text-primary-600 border-2 border-primary-600 px-6 lg:px-8 py-3 rounded-lg font-semibold text-base lg:text-lg hover:bg-primary-50 transition-colors shadow-md">
                      Get Whole Life Insurance Quotes
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center items-center gap-4 pt-8 border-t border-gray-200">
          {/* <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Download PDF Report
          </button> */}
          <button
            onClick={onStartOver}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start New Calculation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep; 