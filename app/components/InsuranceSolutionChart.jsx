import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const InsuranceSolutionChart = ({ 
  currentAge,
  retirementAge,
  currentAnnualIncome,
  retirementShortfall,
  formData,
  projectedSavings,
  netRequiredMonthlyWithdrawal
}) => {
  
  // Calculate insurance needs
  const calculateInsuranceNeed = () => {
    let totalNeed = 0;
    
    // 1. Income replacement (10-12x annual income)
    const incomeMultiplier = 11; // Use 11x as middle ground
    const incomeReplacementNeed = currentAnnualIncome * incomeMultiplier;
    totalNeed += incomeReplacementNeed;
    
    // 2. Debt coverage (if they have debt)
    const debtCoverage = formData.hasDebt ? (formData.debtAmount || 0) : 0;
    totalNeed += debtCoverage;
    
    // 3. Family expenses until dependents are independent (if they have dependents)
    let dependentExpenses = 0;
    if (formData.hasDependents && formData.dependentTypes?.selected) {
      const dependentType = formData.dependentTypes.selected;
      
      // Check for children in any combination
      if (dependentType.includes('children')) {
        // Assume $15,000/year per child until age 18, estimate 2 children for 15 years average
        dependentExpenses += 15000 * 2 * 15;
      }
      
      // Check for spouse in any combination
      if (dependentType.includes('spouse')) {
        // Spouse needs income replacement for longer period
        dependentExpenses += currentAnnualIncome * 0.6 * 10; // 60% income for 10 years
      }
      
      // Check for parents or other family members
      if (dependentType.includes('parents') || dependentType === 'other') {
        // Additional support needed
        dependentExpenses += 10000 * 10; // $10k/year for 10 years
      }
    }
    totalNeed += dependentExpenses;
    
    return {
      total: totalNeed,
      incomeReplacement: incomeReplacementNeed,
      debtCoverage: debtCoverage,
      dependentExpenses: dependentExpenses
    };
  };

  const insuranceNeed = calculateInsuranceNeed();
  const currentCoverage = formData.insuranceType !== 'No' ? (formData.insuranceCoverage || 0) : 0;
  const coverageGap = Math.max(0, insuranceNeed.total - currentCoverage);
  
  // Calculate Whole Life projections
  const calculateWholeLifeProjections = () => {
    const ages = [];
    const cashValues = [];
    const deathBenefits = [];
    const retirementSupplements = [];
    
         // More realistic Whole Life policy for retirement supplementation
     // Focus on retirement gap, not full insurance need
     const suggestedCoverage = Math.min(500000, Math.max(250000, retirementShortfall / 2)); // Cap at $500K
     const annualPremium = suggestedCoverage * 0.02; // More realistic 2% of coverage for WL
    const guaranteedGrowthRate = 0.04; // 4% guaranteed growth
    
    for (let age = currentAge; age <= 85; age++) {
      const yearsFromNow = age - currentAge;
      ages.push(age);
      
      // Cash value grows at guaranteed rate
      let cashValue = 0;
      if (yearsFromNow > 2) { // Cash value typically starts building after 2-3 years
        const premiumsAccumulated = annualPremium * yearsFromNow;
        cashValue = premiumsAccumulated * Math.pow(1 + guaranteedGrowthRate, yearsFromNow - 2) * 0.7; // 70% of premiums become cash value over time
      }
      cashValues.push(cashValue);
      
      // Death benefit (level or increasing)
      const deathBenefit = Math.max(suggestedCoverage, suggestedCoverage + (cashValue * 0.1));
      deathBenefits.push(deathBenefit);
      
      // Retirement supplement (available cash value after retirement)
      let retirementSupplement = 0;
      if (age >= retirementAge) {
        // Can access cash value for retirement income
        const availableCashValue = cashValue * 0.9; // Keep some for death benefit
        const yearsInRetirement = age - retirementAge + 1;
        retirementSupplement = availableCashValue / Math.max(1, (85 - retirementAge)); // Spread over retirement years
      }
      retirementSupplements.push(retirementSupplement);
    }
    
    return { ages, cashValues, deathBenefits, retirementSupplements, suggestedCoverage, annualPremium };
  };

  const wholeLifeData = calculateWholeLifeProjections();
  
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  const formatFullCurrency = (value) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  // Chart configuration
  const chartData = {
    labels: wholeLifeData.ages,
    datasets: [
      {
        label: 'Whole Life Cash Value',
        data: wholeLifeData.cashValues.map(v => v / 1000), // Convert to thousands
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
      {
        label: 'Death Benefit Protection',
        data: wholeLifeData.deathBenefits.map(v => v / 1000),
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: 'rgb(17, 24, 39)',
        bodyColor: 'rgb(55, 65, 81)',
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 8,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y * 1000; // Convert back from thousands
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Age',
          font: { size: 12 },
          color: 'rgb(107, 114, 128)'
        },
        grid: { display: false },
        ticks: { color: 'rgb(107, 114, 128)' }
      },
      y: {
        title: {
          display: true,
          text: 'Value (Thousands)',
          font: { size: 12 },
          color: 'rgb(107, 114, 128)'
        },
        beginAtZero: true,
        grid: { color: 'rgba(229, 231, 235, 0.5)' },
        ticks: {
          color: 'rgb(107, 114, 128)',
          callback: function(value) {
            return formatCurrency(value * 1000);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header Section - Compelling Hook */}
      <div className="px-6 py-6 border-b border-gray-100">
                 <div className="text-center mb-6">
           <h3 className="text-2xl font-bold text-gray-900 mb-2">
             💡 Supplement Your Retirement with Whole Life Insurance
           </h3>
           <p className="text-gray-600">
             A modest whole life policy can provide guaranteed growth plus family protection
           </p>
         </div>
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
             <div className="text-red-600 text-sm font-medium mb-1">Annual Retirement Shortfall</div>
             <div className="text-2xl font-bold text-red-700">{formatCurrency(retirementShortfall)}</div>
           </div>
           <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
             <div className="text-green-600 text-sm font-medium mb-1">Suggested WL Coverage</div>
             <div className="text-2xl font-bold text-green-700">{formatCurrency(wholeLifeData.suggestedCoverage)}</div>
           </div>
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
             <div className="text-blue-600 text-sm font-medium mb-1">Monthly Premium</div>
             <div className="text-2xl font-bold text-blue-700">{formatCurrency(wholeLifeData.annualPremium / 12)}</div>
           </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6">
        <div className="mb-6">
          <div style={{ height: '400px' }}>
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>

        {/* Solution Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Retirement Benefits */}
          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Retirement Solution
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-700">Guaranteed Growth:</span>
                <span className="font-semibold text-green-800">4.0% annually</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Cash Value at {retirementAge}:</span>
                <span className="font-semibold text-green-800">
                  {formatCurrency(wholeLifeData.cashValues[retirementAge - currentAge] || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Tax-Free Loans:</span>
                <span className="font-semibold text-green-800">Available</span>
              </div>
              <div className="bg-green-100 p-3 rounded">
                <p className="text-green-800 text-sm font-medium">
                  ✨ No market risk - your money grows regardless of stock market performance!
                </p>
              </div>
            </div>
          </div>

          {/* Family Protection */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Family Protection
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-700">Death Benefit:</span>
                <span className="font-semibold text-blue-800">
                  {formatCurrency(wholeLifeData.suggestedCoverage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Income Replacement:</span>
                <span className="font-semibold text-blue-800">{Math.round(wholeLifeData.suggestedCoverage / currentAnnualIncome)}x income</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Tax-Free to Beneficiaries:</span>
                <span className="font-semibold text-blue-800">100%</span>
              </div>
              <div className="bg-blue-100 p-3 rounded">
                <p className="text-blue-800 text-sm font-medium">
                  🛡️ Protects your retirement savings from estate taxes!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Advantages */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
            🚀 Why Whole Life Beats Traditional Investments
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">📈</div>
                <h5 className="font-bold text-gray-900 mb-1">Guaranteed Growth</h5>
                <p className="text-sm text-gray-600">No market volatility - your money grows every year</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">💰</div>
                <h5 className="font-bold text-gray-900 mb-1">Tax Advantages</h5>
                <p className="text-sm text-gray-600">Tax-free loans, tax-free death benefit</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl mb-2">🔒</div>
                <h5 className="font-bold text-gray-900 mb-1">Dual Purpose</h5>
                <p className="text-sm text-gray-600">Retirement savings + family protection in one</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white text-center">
          <h4 className="text-xl font-bold mb-2">Ready to Secure Your Financial Future?</h4>
          <p className="mb-4 opacity-90">
            Estimated monthly premium: <span className="font-bold text-2xl">{formatCurrency(wholeLifeData.annualPremium / 12)}</span>
          </p>
          <p className="text-sm opacity-80 mb-4">
            This small monthly investment could solve both your retirement shortfall AND protect your family
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            Get My Whole Life Quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceSolutionChart; 