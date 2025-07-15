import { useState, useEffect } from 'react';

const CurrentSavingsStep = ({ formData, updateFormData, onNext, onPrev }) => {
  
  // State for custom accounts - start empty, let users add accounts via dropdown
  const [customAccounts, setCustomAccounts] = useState(formData.customAccounts || []);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  
  // State for the new account form
  const [newCurrentBalance, setNewCurrentBalance] = useState('');
  const [newAnnualContribution, setNewAnnualContribution] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('');
  
  // Auto-save effect - saves account when user fills in the details
  useEffect(() => {
    // Check if we should auto-save
    const hasAccountType = selectedAccountType && (selectedAccountType !== 'Other' || newAccountName.trim());
    const hasFinancialData = (parseFloat(newCurrentBalance) > 0) || (parseFloat(newAnnualContribution) > 0);
    
    if (hasAccountType && hasFinancialData && showAddAccount) {
      // Auto-save after a brief delay to avoid saving on every keystroke
      const saveTimer = setTimeout(() => {
        addCustomAccount();
      }, 1000); // 1 second delay
      
      return () => clearTimeout(saveTimer);
    }
  }, [selectedAccountType, newAccountName, newCurrentBalance, newAnnualContribution, showAddAccount]);

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Format number to currency string
  const formatCurrency = (value) => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Parse currency string back to number
  const parseCurrency = (value) => {
    if (!value) return 0;
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    return parseFloat(numericValue) || 0;
  };

  const handleCustomAccountChange = (index, field, value) => {
    const updatedAccounts = [...customAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setCustomAccounts(updatedAccounts);
    updateFormData({ customAccounts: updatedAccounts });
  };

  const addCustomAccount = () => {
    const accountName = selectedAccountType === 'Other' ? newAccountName.trim() : selectedAccountType;
    if (accountName) {
      const annualContribution = parseFloat(newAnnualContribution) || 0;
      const newAccount = {
        id: Date.now(),
        name: accountName,
        currentBalance: parseFloat(newCurrentBalance) || 0,
        annualContribution: annualContribution,
        monthlyContribution: annualContribution / 12
      };
      const updatedAccounts = [...customAccounts, newAccount];
      setCustomAccounts(updatedAccounts);
      updateFormData({ customAccounts: updatedAccounts });
      
      // Reset form and hide add account section
      setSelectedAccountType('');
      setNewAccountName('');
      setNewCurrentBalance('');
      setNewAnnualContribution('');
      setShowAddAccount(false);
    }
  };

  const removeCustomAccount = (index) => {
    const updatedAccounts = customAccounts.filter((_, i) => i !== index);
    setCustomAccounts(updatedAccounts);
    updateFormData({ customAccounts: updatedAccounts });
  };

  const cancelAddAccount = () => {
    setShowAddAccount(false);
    setSelectedAccountType('');
    setNewAccountName('');
    setNewCurrentBalance('');
    setNewAnnualContribution('');
  };

  // Define available account types for dropdown
  const availableAccountTypes = [
    'RRSP',
    'TFSA', 
    'RESP',
    'Other registered accounts',
    'Non-registered accounts',
    'Pension plan',
    'Stock options',
    'Savings account',
    'GIC',
    'Bonds',
    'Stocks',
    'Mutual funds',
    'ETFs',
    'Other'
  ];

  // Progressive reveal logic
  const hasAnyBalance = customAccounts.some(account => (account.currentBalance || 0) > 0);
  const hasAnyContributions = customAccounts.some(account => (account.annualContribution || 0) > 0);
  const showInvestmentApproach = true; // Always show investment approach

  // Include values being typed in the add form
  const totalCurrentSavings = customAccounts.reduce((total, account) => {
    return total + (parseFloat(account.currentBalance) || 0);
  }, 0) + (parseFloat(newCurrentBalance) || 0);

  const totalAnnualContributions = customAccounts.reduce((total, account) => {
    return total + (parseFloat(account.annualContribution) || 0);
  }, 0) + (parseFloat(newAnnualContribution) || 0);

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Table Layout */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
          <div className="p-4 font-medium text-gray-900">Investment Accounts</div>
          <div className="p-4 font-medium text-gray-900 text-center">Current Savings</div>
          <div className="p-4 font-medium text-gray-900 text-center">Annual Contribution</div>
        </div>

        {/* Account Rows */}
        {customAccounts.length > 0 && customAccounts.map((account, index) => (
          <div key={account.id} className="grid grid-cols-3 border-b border-gray-200">
            
            {/* Account Name with delete button */}
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-900">{account.name}</span>
              <button
                onClick={() => removeCustomAccount(index)}
                className="text-red-400 hover:text-red-600 transition-colors ml-2"
                title="Remove account"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Current Savings */}
            <div className="p-4 flex items-center justify-center">
              <div className="relative w-32">
                <input
                  type="text"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="e.g. $10,000"
                  value={formatCurrency(account.currentBalance)}
                  onChange={(e) => handleCustomAccountChange(index, 'currentBalance', parseCurrency(e.target.value))}
                  onBlur={(e) => {
                    const numericValue = parseCurrency(e.target.value);
                    handleCustomAccountChange(index, 'currentBalance', numericValue);
                  }}
                />
              </div>
            </div>
            
            {/* Annual Contribution */}
            <div className="p-4 flex items-center justify-center">
              <div className="relative w-32">
                <input
                  type="text"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="e.g. $7,200"
                  value={formatCurrency(account.annualContribution)}
                  onChange={(e) => {
                    const annualValue = parseCurrency(e.target.value);
                    handleCustomAccountChange(index, 'annualContribution', annualValue);
                    handleCustomAccountChange(index, 'monthlyContribution', annualValue / 12);
                  }}
                  onBlur={(e) => {
                    const annualValue = parseCurrency(e.target.value);
                    handleCustomAccountChange(index, 'annualContribution', annualValue);
                    handleCustomAccountChange(index, 'monthlyContribution', annualValue / 12);
                  }}
                />
              </div>
            </div>
            
          </div>
        ))}

        {/* Add Account Row */}
        {showAddAccount ? (
          <>
            <div className="grid grid-cols-3 border-b border-gray-200 bg-blue-50 relative">
              {/* Cancel button */}
              <button
                onClick={cancelAddAccount}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Account Type Selection */}
              <div className="p-4 flex flex-col gap-2">
                <select
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={selectedAccountType}
                  onChange={(e) => setSelectedAccountType(e.target.value)}
                  autoFocus
                >
                  <option value="">Select account type...</option>
                  {availableAccountTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {selectedAccountType === 'Other' && (
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="Enter account name"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                )}
              </div>
              
              {/* Current Savings */}
              <div className="p-4 flex flex-col items-center gap-2">
                <div className="relative w-32">
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="e.g. $10,000"
                    value={formatCurrency(parseFloat(newCurrentBalance) || 0)}
                    onChange={(e) => setNewCurrentBalance(parseCurrency(e.target.value).toString())}
                    onBlur={(e) => {
                      const numericValue = parseCurrency(e.target.value);
                      setNewCurrentBalance(numericValue.toString());
                    }}
                  />
                </div>
              </div>
              
              {/* Annual Contribution */}
              <div className="p-4 flex flex-col items-center gap-2">
                <div className="relative w-32">
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    placeholder="e.g. $7,200"
                    value={formatCurrency(parseFloat(newAnnualContribution) || 0)}
                    onChange={(e) => setNewAnnualContribution(parseCurrency(e.target.value).toString())}
                    onBlur={(e) => {
                      const numericValue = parseCurrency(e.target.value);
                      setNewAnnualContribution(numericValue.toString());
                    }}
                  />
                </div>
              </div>
            </div>

          </>
        ) : (
          <div className="grid grid-cols-3">
            <div className="p-4 flex items-center">
              <button
                onClick={() => setShowAddAccount(true)}
                className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors font-medium"
              >
                <div className="w-5 h-5 border-2 border-cyan-600 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Add account
              </button>
            </div>
            <div className="p-4"></div>
            <div className="p-4"></div>
          </div>
        )}

        {/* Empty state message */}
        {customAccounts.length === 0 && !showAddAccount && (
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50">
            <div className="col-span-3 p-8 text-center text-gray-500">
              <p className="text-sm">Click "Add account" above to start adding your investment accounts</p>
            </div>
          </div>
        )}

        {/* Total Row */}
        {customAccounts.length > 0 && (totalCurrentSavings > 0 || totalAnnualContributions > 0) && (
          <div className="grid grid-cols-3 bg-gray-50 border-t border-gray-200">
            <div className="p-4 font-semibold text-gray-900">Total</div>
            <div className="p-4 text-center font-semibold text-gray-900">
              ${totalCurrentSavings.toLocaleString()}
            </div>
            <div className="p-4 text-center font-semibold text-gray-900">
              ${totalAnnualContributions.toLocaleString()}/year
            </div>
          </div>
        )}

      </div>

      

      {/* Investment Approach - Shows below the table */}
      {showInvestmentApproach && (
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start md:items-center">
            <div>
              <h2 className="text-xl font-normal text-gray-700 mb-2">Investment approach</h2>
              <p className="text-gray-500 text-sm">Your risk tolerance and expected returns</p>
            </div>
            <div>
              {/* Mobile Dropdown */}
              <select
                className="block md:hidden w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
                value={formData.expectedReturnType || ''}
                onChange={(e) => handleInputChange('expectedReturnType', e.target.value)}
              >
                <option value="">Select investment approach</option>
                <option value="conservative">4-5% - Conservative</option>
                <option value="balanced">6-7% - Balanced</option>
                <option value="growth">8-9% - Growth</option>
              </select>

              {/* Desktop Buttons */}
              <div className="hidden md:grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.expectedReturnType === 'conservative'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('expectedReturnType', 'conservative')}
                >
                  <div className="font-semibold text-sm">4-5%</div>
                  <div className="text-xs">Conservative</div>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.expectedReturnType === 'balanced'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('expectedReturnType', 'balanced')}
                >
                  <div className="font-semibold text-sm">6-7%</div>
                  <div className="text-xs">Balanced</div>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.expectedReturnType === 'growth'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('expectedReturnType', 'growth')}
                >
                  <div className="font-semibold text-sm">8-9%</div>
                  <div className="text-xs">Growth</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CurrentSavingsStep; 