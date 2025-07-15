/**
 * Simple Retirement Calculator
 * Clear, straightforward calculations that match the UI inputs
 */

// Helper function to format currency values
export function formatCurrency(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  } else {
    return `$${Math.round(value).toLocaleString()}`;
  }
}

// Helper function to parse currency strings back to numbers
function parseCurrency(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  // Remove all non-numeric characters except decimal point
  const numericValue = value.toString().replace(/[^0-9.]/g, '');
  return parseFloat(numericValue) || 0;
}

export function calculateRetirement(inputs) {
  // Extract inputs with clear variable names
  const {
    currentAge,
    retirementAge,
    annualIncome,
    incomeGrowthRate, // Already as decimal (0.02, 0.03, 0.04)
    incomeReplacementRatio, // Already as decimal (0.6, 0.8, or custom)
    customAccounts = [],
    expectedReturnType,
    otherIncome = 0
  } = inputs;

  // Calculate basic metrics
  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = 25; // Standard assumption for calculations

  // Convert investment approach to return rates
  let preRetirementReturn;
  let retirementReturn; // Lower return in retirement (more conservative)
  
  if (expectedReturnType === 'conservative') {
    preRetirementReturn = 0.045; // 4.5%
    retirementReturn = 0.035; // 3.5% (more conservative in retirement)
  } else if (expectedReturnType === 'balanced') {
    preRetirementReturn = 0.065; // 6.5%
    retirementReturn = 0.05; // 5% (more conservative in retirement)
  } else if (expectedReturnType === 'growth') {
    preRetirementReturn = 0.085; // 8.5%
    retirementReturn = 0.065; // 6.5% (more conservative in retirement)
  } else {
    preRetirementReturn = 0.065; // Default to balanced
    retirementReturn = 0.05;
  }

  // Calculate current total savings and annual contributions
  const currentSavings = customAccounts.reduce((total, account) => {
    return total + parseCurrency(account.currentBalance);
  }, 0);

  const annualContributions = customAccounts.reduce((total, account) => {
    return total + parseCurrency(account.annualContribution);
  }, 0);

  // Calculate income at retirement (with growth)
  const incomeAtRetirement = annualIncome * Math.pow(1 + incomeGrowthRate, yearsToRetirement);
  
  // Calculate required annual income in retirement
  const requiredAnnualIncome = incomeAtRetirement * incomeReplacementRatio;
  
  // Government benefits (monthly amounts converted to annual)
  const cppAnnual = 1433 * 12; // $17,196
  const oasAnnual = 727.67 * 12; // $8,732
  const otherIncomeAnnual = otherIncome * 12;
  const totalGovernmentBenefits = cppAnnual + oasAnnual + otherIncomeAnnual;
  
  // Annual withdrawal needed from personal savings
  const annualWithdrawalNeeded = Math.max(0, requiredAnnualIncome - totalGovernmentBenefits);
  
  // Calculate future value of current savings
  const futureValueCurrentSavings = currentSavings * Math.pow(1 + preRetirementReturn, yearsToRetirement);
  
  // Calculate future value of annual contributions (annuity)
  const futureValueContributions = annualContributions > 0 ? 
    annualContributions * ((Math.pow(1 + preRetirementReturn, yearsToRetirement) - 1) / preRetirementReturn) : 0;
  
  // Total savings at retirement
  const totalSavingsAtRetirement = futureValueCurrentSavings + futureValueContributions;
  
  // Calculate how long money will last with actual withdrawals
  const { depletionAge, yearlyProjections } = calculateMoneyDuration(
    totalSavingsAtRetirement,
    annualWithdrawalNeeded,
    retirementReturn,
    retirementAge,
    0.025 // 2.5% inflation rate
  );
  
  // Monthly amounts
  const monthlyWithdrawalNeeded = annualWithdrawalNeeded / 12;
  const monthlyGovernmentBenefits = totalGovernmentBenefits / 12;
  const totalMonthlyRetirementIncome = monthlyGovernmentBenefits + monthlyWithdrawalNeeded; // Total income during retirement
  
  // Calculate if they're on track with realistic withdrawals
  const isOnTrack = depletionAge === null || depletionAge >= retirementAge + 25; // Money lasts 25+ years
  const shortfall = isOnTrack ? 0 : calculateShortfall(
    annualWithdrawalNeeded,
    totalSavingsAtRetirement,
    retirementReturn,
    25 // Target 25 years of retirement
  );

  return {
    // Basic info
    yearsToRetirement,
    yearsInRetirement,
    currentAge,
    retirementAge,
    
    // Income calculations
    currentAnnualIncome: annualIncome,
    incomeAtRetirement,
    requiredAnnualIncome,
    
    // Savings calculations
    currentSavings,
    annualContributions,
    monthlyContributions: annualContributions / 12,
    totalSavingsAtRetirement,
    
    // Government benefits
    monthlyGovernmentBenefits,
    totalGovernmentBenefits,
    
    // Retirement income calculations
    totalMonthlyRetirementIncome,
    
    // Withdrawal calculations (what they actually need)
    annualWithdrawalNeeded,
    monthlyWithdrawalNeeded,
    targetMonthlyIncome: requiredAnnualIncome / 12,
    
    // Money duration analysis - realistic spending down
    depletionAge,
    yearsMoneyWillLast: depletionAge ? depletionAge - retirementAge : null,
    yearlyProjections,
    moneyLastsForever: depletionAge === null,
    
    // Gap analysis
    shortfall,
    isOnTrack,
    needsMoreSavings: !isOnTrack,
    
    // Investment details
    preRetirementReturn,
    retirementReturn,
    annualReturn: preRetirementReturn, // For UI compatibility
    expectedReturnType
        };
    }

    /**
 * Calculate how long money will last with actual withdrawals
 */
function calculateMoneyDuration(initialBalance, annualWithdrawal, returnRate, startAge, inflationRate) {
  let balance = initialBalance;
  let age = startAge;
  let currentWithdrawal = annualWithdrawal;
  const projections = [];
  
  // Project year by year until money runs out or 40 years pass
  for (let year = 0; year < 40; year++) {
    const beginningBalance = balance;
    
    // Adjust withdrawal for inflation
    if (year > 0) {
      currentWithdrawal = currentWithdrawal * (1 + inflationRate);
    }
    
    // Can't withdraw more than available
    const actualWithdrawal = Math.min(currentWithdrawal, balance);
    
    // Investment return on remaining balance
    const investmentReturn = (balance - actualWithdrawal) * returnRate;
    
    // End of year balance
    balance = balance - actualWithdrawal + investmentReturn;
    
    projections.push({
      year: year + 1,
      age: age + year + 1,
      beginningBalance,
      withdrawal: actualWithdrawal,
      investmentReturn,
      endingBalance: Math.max(0, balance)
    });
    
    // Money depleted
    if (balance <= 0) {
      return {
        depletionAge: age + year + 1,
        yearlyProjections: projections
      };
    }
  }
  
  // Money lasted 40+ years
  return {
    depletionAge: null,
    yearlyProjections: projections
  };
}

/**
 * Calculate how much more money is needed for 25 years of retirement
 */
function calculateShortfall(annualWithdrawal, currentSavings, returnRate, targetYears) {
  // Calculate present value of annuity needed for target years
  const presentValueFactor = (1 - Math.pow(1 + returnRate, -targetYears)) / returnRate;
  const neededCapital = annualWithdrawal * presentValueFactor;
  
  return Math.max(0, neededCapital - currentSavings);
} 