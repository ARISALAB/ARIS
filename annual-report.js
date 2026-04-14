// Βοηθητικές συναρτήσεις για Local Storage (ίδιες με τις άλλες σελίδες)
const getAllIncomeData = () => {
    const data = localStorage.getItem('incomeData');
    return data ? JSON.parse(data) : {};
};

const getAllExpensesData = () => {
    const data = localStorage.getItem('expenseData');
    return data ? JSON.parse(data) : {};
};

// Βοηθητική συνάρτηση μορφοποίησης νομισματικών τιμών (ίδια με τις άλλες σελίδες)
const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return number.toLocaleString('el-GR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
};

// Βοηθητική συνάρτηση μορφοποίησης ποσοστών (ίδια με weekly/monthly-report.js)
const formatPercentage = (percentage) => {
     const number = parseFloat(percentage) || 0;
     if (isNaN(number) || !isFinite(number)) {
         return 'N/A';
     }
     return number.toLocaleString('el-GR', {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2
     }) + '%';
 };

// --- ΝΕΑ ΒΟΗΘΗΤΙΚΗ ΣΥΝΑΡΤΗΣΗ: Υπολογισμός όλων των ημερομηνιών για ένα έτος (YYYY) ---
const getDatesForYear = (yearString) => {
    const dates = [];
    const year = parseInt(yearString, 10);

    if (isNaN(year)) {
        console.error("Invalid year string:", yearString);
        return [];
    }

    for (let month = 0; month < 12; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Last day of the current month

        for (let day = startDate.getDate(); day <= endDate.getDate(); day++) {
            const currentDate = new Date(year, month, day);
            const yearStr = currentDate.getFullYear();
            const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const dayStr = currentDate.getDate().toString().padStart(2, '0');
            dates.push(`${yearStr}-${monthStr}-${dayStr}`);
        }
    }
    return dates;
};


document.addEventListener('DOMContentLoaded', () => {

    // Αναφορές σε στοιχεία της σελίδας (Αλλάχτηκαν IDs σε 'annual' και 'year')
    const yearInput = document.getElementById('year-input'); // Changed ID
    const selectedYearDisplaySpan = document.getElementById('selected-year-display'); // Changed ID
    const annualSummaryTable = document.getElementById('annual-summary-table'); // Changed ID

    // --- Πίνακας Προμηθευτών ---
    const annualSupplierCreditTable = document.getElementById('annual-supplier-credit-table'); // Changed ID
    const annualSupplierCreditTableBody = document.querySelector('#annual-supplier-credit-table tbody'); // Changed ID
    const noAnnualReportDataMessage = document.getElementById('no-annual-report-data-message'); // Changed ID
    const noAnnualSupplierCreditMessage = document.getElementById('no-annual-supplier-credit-message'); // Changed ID
    const annualSupplierCreditTotalTd = document.getElementById('annual-supplier-credit-total'); // Changed ID - Αναφορά στο κελί του footer

    // --- Κελιά του πίνακα σύνοψης (Αλλάχτηκαν IDs) ---
    const annualCashIncomeTd = document.getElementById('annual-cash-income'); // Changed ID
    const annualCardIncomeTd = document.getElementById('annual-card-income'); // Changed ID
    const annualTotalIncomeTd = document.getElementById('annual-total-income'); // Changed ID
    const annualCashExpensesTd = document.getElementById('annual-cash-expenses'); // Changed ID
    const annualCardExpensesTd = document.getElementById('annual-card-expenses'); // Changed ID
    const annualTotalExpensesCashCardTd = document.getElementById('annual-total-expenses-cash-card'); // Changed ID
    const annualCreditExpensesTd = document.getElementById('annual-credit-expenses'); // Changed ID
    const annualCashBalanceTd = document.getElementById('annual-cash-balance'); // Changed ID
    const annualCardBalanceTd = document.getElementById('annual-card-balance'); // Changed ID
    const annualTotalBalanceTd = document.getElementById('annual-total-balance'); // Changed ID


    // --- Πίνακας Μηνιαίας Ανάλυσης (Αλλάχτηκαν IDs) ---
    const annualMonthlyBreakdownTable = document.getElementById('annual-monthly-breakdown-table'); // Changed ID
    const annualMonthlyBreakdownTableBody = document.querySelector('#annual-monthly-breakdown-table tbody'); // Changed ID
    const annualMonthlyBreakdownTableTfoot = document.querySelector('#annual-monthly-breakdown-table tfoot'); // Changed ID
    const noAnnualMonthlyBreakdownMessage = document.getElementById('no-annual-monthly-breakdown-message'); // Changed ID

    // --- Κελιά footer πίνακα μηνιαίας ανάλυσης (για τα ετήσια σύνολα - Αλλάχτηκαν IDs) ---
     const annualMonthlyTotalCashIncomeTd = document.getElementById('annual-monthly-total-cash-income'); // Changed ID
     const annualMonthlyTotalCardIncomeTd = document.getElementById('annual-monthly-total-card-income'); // Changed ID
     const annualMonthlyTotalIncomeSumTd = document.getElementById('annual-monthly-total-income-sum'); // Changed ID
     const annualMonthlyTotalCashExpensesTd = document.getElementById('annual-monthly-total-cash-expenses'); // Changed ID
     const annualMonthlyTotalCardExpensesTd = document.getElementById('annual-monthly-total-card-expenses'); // Changed ID
     const annualMonthlyTotalExpensesCashCardSumTd = document.getElementById('annual-monthly-total-expenses-cash-card-sum'); // Changed ID
     const annualMonthlyCashBalanceTd = document.getElementById('annual-monthly-cash-balance'); // Changed ID
     const annualMonthlyCardBalanceTd = document.getElementById('annual-monthly-card-balance'); // Changed ID
     const annualMonthlyTotalBalanceTd = document.getElementById('annual-monthly-total-balance'); // Changed ID

    // --- Food Cost Ενότητα (Αλλάχτηκαν IDs) ---
    const annualFoodCostContainer = document.getElementById('annual-food-cost-container'); // Changed ID
    const annualFoodCostValueSpan = document.getElementById('annual-food-cost-value'); // Changed ID
    const annualTotalFcExpensesSpan = document.getElementById('annual-total-fc-expenses'); // Changed ID
    const annualTotalIncomeForFcSpan = document.getElementById('annual-total-income-for-fc'); // Changed ID
    const annualFoodCostInterpretationDiv = document.getElementById('annual-food-cost-interpretation'); // Changed ID

    // --- Γραφήματα (Αλλάχτηκαν IDs) ---
    const annualTotalComparisonPieChartCanvasElement = document.getElementById('annualTotalComparisonPieChart'); // Changed ID
    const annualMonthlyComparisonChartCanvasElement = document.getElementById('annualMonthlyComparisonChart'); // Changed ID - Canvas για το μηνιαίο γράφημα
    const noAnnualMonthlyChartMessage = document.getElementById('no-annual-monthly-chart-message'); // Changed ID - Μήνυμα για το μηνιαίο γράφημα


    // Κουμπί Εξαγωγής PDF (Αλλάχτηκε ID)
    const exportAnnualPdfButton = document.getElementById('export-annual-pdf-button'); // Changed ID


    // Μεταβλητές για τα γραφήματα (Αλλάχτηκαν ονόματα)
    let annualTotalComparisonChart; // Changed name
    let annualMonthlyComparisonChart; // Changed name - Μεταβλητή για το μηνιαίο γράφημα


    // Συνάρτηση για τον υπολογισμό των συνολικών και αναλυτικών δεδομένων για ένα έτος (Αλλάχτηκε όνομα)
    const calculateAnnualData = (yearString) => {
        if (!yearString) return null; // Return null if year is empty

        const datesInYear = getDatesForYear(yearString); // Use the new function
        const allIncomeData = getAllIncomeData();
        const allExpensesData = getAllExpensesData();

        // Αρχικοποίηση ετήσιων συνόλων
        let totalCashIncome = 0;
        let totalCardIncome = 0;
        let totalCashExpenses = 0;
        let totalCardExpenses = 0;
        let totalCreditExpenses = 0;
        let totalFcExpenses = 0; // Συνολικά έξοδα FC (Cash/Card + Credit)
        let totalFcExpensesCashCard = 0; // Έξοδα FC (Μετρητά/Κάρτα)
        let totalFcExpensesCredit = 0; // Έξοδα FC (Πίστωση)

        const annualSupplierCredit = {}; // Changed name - Για το σύνολο επί πιστώσει ανά προμηθευτή για το έτος

        // --- ΥΠΟΛΟΓΙΣΜΟΣ: Στατιστικά ανά Μήνα μέσα στο έτος ---
        const monthlyTotals = {}; // Changed name


        datesInYear.forEach(date => {
            const incomeEntries = allIncomeData[date] || [];
            const expenseEntries = allExpensesData[date] || [];

            const yearMonth = date.substring(0, 7); // Get YYYY-MM for the month


            // Βεβαιώσου ότι υπάρχει μια εγγραφή για το μήνα στα monthlyTotals
            if (!monthlyTotals[yearMonth]) {
                 monthlyTotals[yearMonth] = {
                     cashIncome: 0,
                     cardIncome: 0,
                     cashExpenses: 0,
                     cardExpenses: 0,
                     creditExpenses: 0 // Αθροίζουμε και creditExpenses εδώ για τον έλεχο ύπαρξης δεδομένων.
                 };
            }

            // Άθροιση ημερήσιων δεδομένων στα ετήσια σύνολα
            incomeEntries.forEach(entry => {
                const cash = parseFloat(entry.cash) || 0;
                const card = parseFloat(entry.card) || 0;
                totalCashIncome += cash;
                totalCardIncome += card;
                 // Άθροιση και στα μηνιαία σύνολα
                monthlyTotals[yearMonth].cashIncome += cash;
                monthlyTotals[yearMonth].cardIncome += card;
            });

            expenseEntries.forEach(entry => {
                 const amount = parseFloat(entry.amount) || 0;
                if (entry.paymentMethod === 'cash') {
                    totalCashExpenses += amount;
                     monthlyTotals[yearMonth].cashExpenses += amount; // Άθροιση μηνιαία
                } else if (entry.paymentMethod === 'card') {
                    totalCardExpenses += amount;
                     monthlyTotals[yearMonth].cardExpenses += amount; // Άθροιση μηνιαία
                } else if (entry.paymentMethod === 'credit') {
                    totalCreditExpenses += amount;
                     monthlyTotals[yearMonth].creditExpenses += amount; // Άθροιση μηνιαία

                    // Προσθήκη στο σύνολο επί πιστώσει ανά προμηθευτή για το έτος
                    const supplierName = entry.supplier || 'Άγνωστος Προμηθευτής';
                    if (!annualSupplierCredit[supplierName]) { // Changed name
                        annualSupplierCredit[supplierName] = 0; // Changed name
                    }
                    annualSupplierCredit[supplierName] += amount; // Changed name
                }

                 // Έλεγχος για έξοδα τύπου 'FC'
                 if (entry.expenseType && typeof entry.expenseType === 'string' && entry.expenseType.toUpperCase() === 'FC') {
                     totalFcExpenses += amount; // Αθροίζουμε στα συνολικά FC για το έτος
                      if (entry.paymentMethod === 'cash' || entry.paymentMethod === 'card') {
                          totalFcExpensesCashCard += amount;
                     } else if (entry.paymentMethod === 'credit') {
                          totalFcExpensesCredit += amount;
                     }
                 }
            });
        });

         // --- Ολοκλήρωση μηνιαίων συνόλων (υπολογισμός συνολικών εσόδων/εξόδων μήνα και υπολοίπων) ---
        const monthlyTotalsWithCalculations = {};
        const sortedMonthlyKeys = Object.keys(monthlyTotals).sort(); // Ταξινόμηση με βάση το YYYY-MM

        sortedMonthlyKeys.forEach(yearMonth => {
             const monthData = monthlyTotals[yearMonth];
             const monthlyTotalIncome = monthData.cashIncome + monthData.cardIncome;
             const monthlyTotalExpensesCashCard = monthData.cashExpenses + monthData.cardExpenses;
             const monthlyCashBalance = monthData.cashIncome - monthData.cashExpenses;
             const monthlyCardBalance = monthData.cardIncome - monthData.cardExpenses;
             const monthlyTotalBalance = monthlyTotalIncome - monthlyTotalExpensesCashCard;

             monthlyTotalsWithCalculations[yearMonth] = {
                 ...monthData, // Include original sums
                 totalIncome: monthlyTotalIncome,
                 totalExpensesCashCard: monthlyTotalExpensesCashCard,
                 cashBalance: monthlyCashBalance,
                 cardBalance: monthlyCardBalance,
                 totalBalance: monthlyTotalBalance
             };
         });


        // Υπολογισμός τελικών ετήσιων συνόλων και υπολοίπων (μόνο για τον πίνακα σύνοψης)
        const totalAnnualIncome = totalCashIncome + totalCardIncome; // Συνολικά έσοδα έτους (για υπολογισμό FC και πίνακα σύνοψης)
        const totalAnnualExpensesCashCardForSummary = totalCashExpenses + totalCardExpenses; // Συνολικά έξοδα που επηρεάζουν το ταμείο (για πίνακα σύνοψης)
        const annualCashBalanceForSummary = totalCashIncome - totalCashExpenses;
        const annualCardBalanceForSummary = totalCardIncome - totalCardExpenses;
        const totalAnnualBalanceForSummary = totalAnnualIncome - totalAnnualExpensesCashCardForSummary; // Συνολικό υπόλοιπο ταμείου (για πίνακα σύνοψης)

         // Υπολογισμός Food Cost % (χρησιμοποιεί τα συνολικά ετήσια FC και Έσοδα)
         const annualFoodCostPercentage = (totalAnnualIncome > 0) ? (totalFcExpenses / totalAnnualIncome) * 100 : 0;


        return {
            yearString,
            totalCashIncome: totalCashIncome, // Συνολικά ετήσια
            totalCardIncome: totalCardIncome, // Συνολικά ετήσια
            totalIncome: totalAnnualIncome, // Συνολικά ετήσια (χρησιμοποιείται και για FC και για πίνακα σύνοψης)
            totalCashExpenses: totalCashExpenses, // Συνολικά ετήσια
            totalCardExpenses: totalCardExpenses, // Συνολικά ετήσια
            totalCreditExpenses: totalCreditExpenses, // Συνολικά ετήσια
            totalFcExpenses: totalFcExpenses, // Συνολικά ετήσια FC (όλα)
            totalFcExpensesCashCard: totalFcExpensesCashCard, // Συνολικά ετήσια FC (Μετρητά/Κάρτα)
            totalFcExpensesCredit: totalFcExpensesCredit, // Συνολικά ετήσια FC (Πίστωση)
            totalExpensesCashCard: totalAnnualExpensesCashCardForSummary, // Συνολικά ετήσια (Μετρητά + Κάρτα) για πίνακα σύνοψης
            cashBalance: annualCashBalanceForSummary, // Συνολικό ετήσιο
            cardBalance: annualCardBalanceForSummary, // Συνολικό ετήσιο
            totalBalance: totalAnnualBalanceForSummary, // Συνολικό ετήσιο
            foodCostPercentage: annualFoodCostPercentage, // Ποσοστό Food Cost Έτους
            supplierCredit: annualSupplierCredit, // Σύνολα επί πιστώσει ανά προμηθευτή για το έτος
            monthlyBreakdown: monthlyTotalsWithCalculations // Τα αναλυτικά μηνιαία σύνολα
        };
    };

    // Συνάρτηση για την εμφάνιση των συνοπτικών δεδομένων στον πίνακα σύνοψης (Αλλάχτηκε όνομα και IDs)
    const displayAnnualSummary = (summaryData) => {
        // Ελέγχουμε αν τα στοιχεία υπάρχουν στην HTML
        if (!annualSummaryTable || !noAnnualReportDataMessage || !annualCashIncomeTd || !annualCardIncomeTd || !annualTotalIncomeTd ||
            !annualCashExpensesTd || !annualCardExpensesTd || !annualTotalExpensesCashCardTd || !annualCreditExpensesTd ||
            !annualCashBalanceTd || !annualCardBalanceTd || !annualTotalBalanceTd) {
            console.error("Annual summary table elements not found.");
            return; // Stop execution if essential elements are missing
        }


         // Εμφάνιση ή απόκρυψη του μηνύματος "Δεν βρέθηκαν δεδομένα"
         // Ελέγχουμε αν υπάρχουν καθόλου έσοδα, έξοδα (cash/card/credit), ή έξοδα FC
        if (summaryData && (summaryData.totalIncome > 0 || summaryData.totalCashExpenses > 0 || summaryData.totalCardExpenses > 0 || summaryData.totalCreditExpenses > 0 || summaryData.totalFcExpenses > 0)) {
            noAnnualReportDataMessage.style.display = 'none';
            annualSummaryTable.style.display = 'table'; // Εμφάνιση του πίνακα αν υπάρχουν δεδομένα
        } else {
            noAnnualReportDataMessage.style.display = 'block';
            annualSummaryTable.style.display = 'none'; // Απόκρυψη του πίνακα αν δεν υπάρχουν δεδομένα
        }

         if (summaryData) {
             // Εφαρμογή μορφοποίησης σε όλα τα ποσά
             annualCashIncomeTd.textContent = formatCurrency(summaryData.totalCashIncome);
             annualCardIncomeTd.textContent = formatCurrency(summaryData.totalCardIncome);
             annualTotalIncomeTd.textContent = formatCurrency(summaryData.totalIncome);
             annualCashExpensesTd.textContent = formatCurrency(summaryData.totalCashExpenses);
             annualCardExpensesTd.textContent = formatCurrency(summaryData.totalCardExpenses);
             annualTotalExpensesCashCardTd.textContent = formatCurrency(summaryData.totalExpensesCashCard); // Εμφάνιση συνόλου Μετρητά+Κάρτα για σύνοψη
             annualCreditExpensesTd.textContent = formatCurrency(summaryData.totalCreditExpenses);
             annualCashBalanceTd.textContent = formatCurrency(summaryData.cashBalance);
             annualCardBalanceTd.textContent = formatCurrency(summaryData.cardBalance);
             annualTotalBalanceTd.textContent = formatCurrency(summaryData.totalBalance);
         } else {
              // Clear values if no data
              annualCashIncomeTd.textContent = formatCurrency(0);
              annualCardIncomeTd.textContent = formatCurrency(0);
              annualTotalIncomeTd.textContent = formatCurrency(0);
              annualCashExpensesTd.textContent = formatCurrency(0);
              annualCardExpensesTd.textContent = formatCurrency(0);
              annualTotalExpensesCashCardTd.textContent = formatCurrency(0);
              annualCreditExpensesTd.textContent = formatCurrency(0);
              annualCashBalanceTd.textContent = formatCurrency(0);
              annualCardBalanceTd.textContent = formatCurrency(0);
              annualTotalBalanceTd.textContent = formatCurrency(0);
         }

    };

     // Συνάρτηση για την εμφάνιση των εξόδων επί πιστώσει ανά προμηθευτή στον πίνακα και συμπλήρωση footer (Αλλάχτηκε όνομα και IDs)
    const displayAnnualSupplierCredit = (summaryData) => {
        if(!annualSupplierCreditTableBody || !noAnnualSupplierCreditMessage || !annualSupplierCreditTotalTd || !annualSupplierCreditTable) return; // Έλεγχος αν υπάρχουν τα στοιχεία

        annualSupplierCreditTableBody.innerHTML = ''; // Καθαρισμός προηγούμενων γραμμών

        const supplierCredit = summaryData ? summaryData.supplierCredit : {}; // Use data if available
        const sortedSuppliers = Object.entries(supplierCredit).sort(([, amountA], [, amountB]) => amountB - amountA); // Ταξινόμηση φθίνουσα κατά ποσό
        const hasCreditDataToDisplay = sortedSuppliers.some(([supplier, amount]) => amount > 0);
        const annualSupplierCreditTfoot = document.querySelector('#annual-supplier-credit-table tfoot'); // Ξαναβρίσκουμε το footer εδώ


        if (!hasCreditDataToDisplay) {
             noAnnualSupplierCreditMessage.style.display = 'block';
             if (annualSupplierCreditTable) annualSupplierCreditTable.style.display = 'none'; // Κρύψε τον πίνακα
             if (annualSupplierCreditTfoot) annualSupplierCreditTfoot.style.display = 'none'; // Κρύψε το footer
        } else {
             noAnnualSupplierCreditMessage.style.display = 'none';
             if (annualSupplierCreditTable) annualSupplierCreditTable.style.display = 'table'; // Εμφάνισε τον πίνακα
             if (annualSupplierCreditTfoot) annualSupplierCreditTfoot.style.display = 'table-footer-group'; // Εμφάνισε το footer


            sortedSuppliers.forEach(([supplier, totalCredit]) => {
                if (totalCredit > 0) { // Εμφάνιση μόνο αν το σύνολο είναι > 0
                    const row = annualSupplierCreditTableBody.insertRow();
                    row.insertCell(0).textContent = supplier;
                    row.insertCell(1).textContent = formatCurrency(totalCredit);
                }
            });

            // Συμπλήρωση του συνολικού στο footer του πίνακα προμηθευτών
             annualSupplierCreditTotalTd.textContent = formatCurrency(summaryData.totalCreditExpenses); // Use data if available
        }
    };

     // --- ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Εμφάνιση μηνιαίας ανάλυσης ανά έτος ---
     const displayAnnualMonthlyBreakdown = (annualData) => {
         // Check if essential elements exist
         if(!annualMonthlyBreakdownTableBody || !noAnnualMonthlyBreakdownMessage || !annualMonthlyBreakdownTableTfoot || !annualMonthlyBreakdownTable ||
            !annualMonthlyTotalCashIncomeTd || !annualMonthlyTotalCardIncomeTd || !annualMonthlyTotalIncomeSumTd ||
            !annualMonthlyTotalCashExpensesTd || !annualMonthlyTotalCardExpensesTd || !annualMonthlyTotalExpensesCashCardSumTd ||
            !annualMonthlyCashBalanceTd || !annualMonthlyCardBalanceTd || !annualMonthlyTotalBalanceTd) {
             console.error("Annual monthly breakdown table elements not found.");
             return;
         }


         annualMonthlyBreakdownTableBody.innerHTML = ''; // Καθαρισμός προηγούμενων γραμμών

         const monthlyTotals = annualData ? annualData.monthlyBreakdown : {};
         const monthlyKeys = Object.keys(monthlyTotals).sort(); // Ταξινόμηση μηνών (YYYY-MM)

         // Check if there's any data in the monthly breakdown beyond initial 0s
         const hasMonthlyDataToDisplay = Object.values(monthlyTotals).some(month =>
              month.cashIncome > 0 || month.cardIncome > 0 || month.cashExpenses > 0 || month.cardExpenses > 0 || month.creditExpenses > 0
         );


         if (!hasMonthlyDataToDisplay) {
             noAnnualMonthlyBreakdownMessage.style.display = 'block';
             annualMonthlyBreakdownTable.style.display = 'none'; // Κρύψε τον πίνακα
             annualMonthlyBreakdownTableTfoot.style.display = 'none'; // Κρύψε το footer
         } else {
             noAnnualMonthlyBreakdownMessage.style.display = 'none';
             annualMonthlyBreakdownTable.style.display = 'table'; // Εμφάνισε τον πίνακα
             annualMonthlyBreakdownTableTfoot.style.display = 'table-footer-group'; // Εμφάνισε το footer


             const monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
                               "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];


             monthlyKeys.forEach(yearMonthString => {
                 const monthData = monthlyTotals[yearMonthString];
                 const monthIndex = parseInt(yearMonthString.substring(5, 7), 10) - 1; // Get 0-indexed month
                 const monthName = monthNames[monthIndex];


                 const row = annualMonthlyBreakdownTableBody.insertRow();
                 row.insertCell(0).textContent = monthName; // Display month name
                 row.insertCell(1).textContent = formatCurrency(monthData.cashIncome);
                 row.insertCell(2).textContent = formatCurrency(monthData.cardIncome);
                 row.insertCell(3).textContent = formatCurrency(monthData.totalIncome); // Total Income for the month
                 row.insertCell(4).textContent = formatCurrency(monthData.cashExpenses);
                 row.insertCell(5).textContent = formatCurrency(monthData.cardExpenses);
                 row.insertCell(6).textContent = formatCurrency(monthData.totalExpensesCashCard); // Total Cash + Card Expenses for the month
                 row.insertCell(7).textContent = formatCurrency(monthData.cashBalance); // Cash Balance for the month
                 row.insertCell(8).textContent = formatCurrency(monthData.cardBalance); // Card Balance for the month
                 row.insertCell(9).textContent = formatCurrency(monthData.totalBalance); // Total Balance for the month (Cash+Card Income - Cash+Card Expenses)
             });

             // Συμπλήρωση του footer του πίνακα μηνιαίας ανάλυσης με τα συνολικά ετήσια (χρησιμοποιούμε τα συνολικά από το annualData)
             annualMonthlyTotalCashIncomeTd.textContent = formatCurrency(annualData.totalCashIncome);
             annualMonthlyTotalCardIncomeTd.textContent = formatCurrency(annualData.totalCardIncome);
             annualMonthlyTotalIncomeSumTd.textContent = formatCurrency(annualData.totalIncome);
             annualMonthlyTotalCashExpensesTd.textContent = formatCurrency(annualData.totalCashExpenses);
             annualMonthlyTotalCardExpensesTd.textContent = formatCurrency(annualData.totalCardExpenses);
             annualMonthlyTotalExpensesCashCardSumTd.textContent = formatCurrency(annualData.totalExpensesCashCard);
             annualMonthlyCashBalanceTd.textContent = formatCurrency(annualData.cashBalance);
             annualMonthlyCardBalanceTd.textContent = formatCurrency(annualData.cardBalance);
             annualMonthlyTotalBalanceTd.textContent = formatCurrency(annualData.totalBalance);
         }
     };


    // Συνάρτηση για την εμφάνιση του Food Cost με αναλυτικά δεδομένα (Αλλάχτηκε όνομα και IDs)
    const displayAnnualFoodCost = (summaryData) => {
        // Check if essential elements exist
        if(!annualFoodCostContainer || !annualTotalFcExpensesSpan || !annualTotalIncomeForFcSpan || !annualFoodCostValueSpan) {
             console.error("Annual food cost elements not found.");
             return;
         }

         if (summaryData && (summaryData.totalIncome > 0 || summaryData.totalFcExpenses > 0)) {
             annualFoodCostContainer.style.display = 'block';
             annualTotalFcExpensesSpan.textContent = formatCurrency(summaryData.totalFcExpenses);
             annualTotalIncomeForFcSpan.textContent = formatCurrency(summaryData.totalIncome);
             annualFoodCostValueSpan.textContent = formatPercentage(summaryData.foodCostPercentage);
         } else {
              annualFoodCostContainer.style.display = 'none';
              annualTotalFcExpensesSpan.textContent = formatCurrency(0);
              annualTotalIncomeForFcSpan.textContent = formatCurrency(0);
              annualFoodCostValueSpan.textContent = 'N/A';
         }
     };

     // Συνάρτηση για τη δημιουργία του κειμένου ερμηνείας Food Cost (προσαρμοσμένη για έτος - Αλλάχτηκε όνομα)
     const getAnnualFoodCostInterpretationText = (totalIncome, totalCashIncome, totalCardIncome, totalFcExpenses, totalFcExpensesCashCard, totalFcExpensesCredit, foodCostPercentage, yearString) => {
         if (isNaN(foodCostPercentage) || !isFinite(foodCostPercentage) || (totalIncome === 0 && totalFcExpenses === 0)) {
             if (annualFoodCostInterpretationDiv) annualFoodCostInterpretationDiv.style.display = 'none';
             return '';
         }
         // Check if interpretation div exists
         if (!annualFoodCostInterpretationDiv) {
             console.error("Annual food cost interpretation div not found.");
             return '';
         }

         annualFoodCostInterpretationDiv.style.display = 'block';

         let interpretation = `**Ανάλυση Food Cost (FC) για το έτος ${yearString}:**`; // Changed text for year

         interpretation += ` Το Food Cost (FC) για το ${yearString} ανέρχεται σε **${formatPercentage(foodCostPercentage)}**. `;

         interpretation += `Αυτό το ποσοστό προκύπτει από τη διαίρεση των συνολικών εξόδων FC (${formatCurrency(totalFcExpenses)}) με τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για το συγκεκριμένο έτος.`; // Changed text for year

         // Προσθήκη ανάλυσης εξόδων FC
         if (totalFcExpensesCashCard > 0 && totalFcExpensesCredit > 0) {
              interpretation += ` Τα συνολικά έξοδα FC (${formatCurrency(totalFcExpenses)}) για το ${yearString} αποτελούνται από έξοδα που πληρώθηκαν με Μετρητά/Κάρτα (${formatCurrency(totalFcExpensesCashCard)}) και έξοδα που καταγράφηκαν ως επί Πίστωση (${formatCurrency(totalFcExpensesCredit)}).`; // Changed text for year
         } else if (totalFcExpensesCashCard > 0) {
              interpretation += ` Όλα τα έξοδα FC (${formatCurrency(totalFcExpenses)}) για το ${yearString} πληρώθηκαν με Μετρητά/Κάρτα.`; // Changed text for year
         } else if (totalFcExpensesCredit > 0) {
              interpretation += ` Όλα τα έξοδα FC (${formatCurrency(totalFcExpenses)}) για το ${yearString} καταγράφηκαν ως επί Πίστωση.`; // Changed text for year
         } else {
              interpretation += ` Δεν καταγράφηκαν αναλυτικά έξοδα FC για το ${yearString}.`; // Changed text for year
         }


          // Προσθήκη ανάλυσης εσόδων
         if (totalCashIncome > 0 && totalCardIncome > 0) {
              interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για το ${yearString} προκύπτουν από έσοδα Μετρητά (${formatCurrency(totalCashIncome)}) και έσοδα Κάρτα (${formatCurrency(totalCardIncome)}).`; // Changed text for year
         } else if (totalCashIncome > 0) {
              interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για το ${yearString} προκύπτουν εξ ολοκλήρου από έσοδα Μετρητά.`; // Changed text for year
         } else if (totalCardIncome > 0) {
             interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για το ${yearString} προκύπτουν εξ ολοκλήρου από έσοδα Κάρτα.`; // Changed text for year
         } else {
              interpretation += ` Δεν καταγράφηκαν έσοδα για το ${yearString}.`; // Changed text for year
         }


         // Ερμηνεία βάση ποσοστού - Προσαρμογή για έτος
         interpretation += `<br><br>Στην εστίαση, το Food Cost είναι η καρδιά της διαχείρισης κόστους και ένας κρίσιμος δείκτης για την οικονομική υγεία. Με ετήσιο ποσοστό FC **${formatPercentage(foodCostPercentage)}**, παρατηρούμε τα εξής:`; // Changed text for year

         if (foodCostPercentage < 28) {
             interpretation += `<br>- Αυτό το εξαιρετικά χαμηλό ποσοστό υποδηλώνει **υποδειγματική διαχείριση** των πρώτων υλών σας για το έτος ${yearString}. Είστε πολύ αποτελεσματικοί στις αγορές, την αποθήκευση, τον έλεγχο μερίδων και τη μείωση της σπατάλης. Αυτό συνεισφέρει άμεσα σε υψηλά μικτά κέρδη. Συνιστάται να επανεξετάσετε την τιμολόγηση ή/και το μείγμα πωλήσεων αν διαπιστώσετε ότι το FC είναι σταθερά πολύ χαμηλό.`; // Changed text for year
         } else if (foodCostPercentage >= 28 && foodCostPercentage < 33) {
             interpretation += `<br>- Το ποσοστό **${formatPercentage(foodCostPercentage)}** για το έτος ${yearString} θεωρείται **πολύ καλό** για τα περισσότερα εστιατόρια, δείχνοντας υγιείς λειτουργίες στο κόστος των υλικών. Μπορείτε να εστιάσετε σε μικρές βελτιώσεις όπως διαπραγμάτευση τιμών ή περαιτέρω μείωση της σπατάλης.`; // Changed text for year
         } else if (foodCostPercentage >= 33 && foodCostPercentage < 38) {
              interpretation += `<br>- Το Food Cost στο **${formatPercentage(foodCostPercentage)}** για το έτος ${yearString} βρίσκεται σε **αποδεκτά, αλλά οριακά επίπεδα**. Ένα σημαντικό μέρος των εσόδων απορροφάται από το κόστος υλικών. Απαιτείται **άμεση εστίαση** στον έλεχο: προμηθευτές, παραλαβές, σπατάλη, μερίδες, και ανάλυση προϊόντων με υψηλό FC.`; // Changed text for year
         } else if (foodCostPercentage >= 38 && foodCostPercentage < 45) {
             interpretation += `<br>- Το ποσοστό **${formatPercentage(foodCostPercentage)}** για το έτος ${yearString} θεωρείται **υψηλό** και αποτεύει **σοβαρό προειδοποιητικό σημάδι** για την κερδοφορία. Απαιτείται **επείγουσα και συστηματική διερεύνηση** σε όλα τα στάδια: αγορές, αποθήκευση, έλεγχος αποθεμάτων, σπατάλη, μερίδες, απώλειες και τιμολόγηση/μενού.`; // Changed text for year
         } else { // foodCostPercentage >= 45
              interpretation += `<br>- Ένα Food Cost στο **${formatPercentage(foodCostPercentage)}** για το έτος ${yearString} είναι **πολύ υψηλό** και υποδηλώνει **σοβαρά προβλήματα** στη διαχείριση του κόστους υλικών, απειλώντας την οικονομική βιωσιμότητα. Απαιτείται **άμεση και ριζική επανεξέταση και βελτίωση** όλων των διαδικασιών διαχείρισης πρώτων υλών.`; // Changed text for year
         }


         return interpretation;
     };


    // Συνάρτηση για την προετοιμασία και την ενημέρωση των γραφημάτων (Αλλάχτηκε όνομα και IDs)
    const updateAnnualCharts = (annualData) => {
        // Καταστροφή προηγούμενων γραφημάτων αν υπάρχουν
        if (annualTotalComparisonChart) { // Changed name
            annualTotalComparisonChart.destroy(); // Changed name
        }
        if (annualMonthlyComparisonChart) { // Changed name
            annualMonthlyComparisonChart.destroy(); // Changed name
        }


        // --- Γράφημα Συνολικής Σύγκρισης Έτους (Pie Chart - Αλλάχτηκε ID) ---
        const annualTotalComparisonPieChartCanvas = annualTotalComparisonPieChartCanvasElement ? annualTotalComparisonPieChartCanvasElement.getContext('2d') : null; // Changed ID
        const annualTotalComparisonChartContainer = annualTotalComparisonPieChartCanvasElement ? annualTotalComparisonPieChartCanvasElement.closest('.chart-container') : null; // Changed ID


        if (annualTotalComparisonPieChartCanvas && annualData && (annualData.totalIncome > 0 || annualData.totalExpensesCashCard > 0)) {
             if (annualTotalComparisonChartContainer) annualTotalComparisonChartContainer.style.display = 'block';
             annualTotalComparisonChart = new Chart(annualTotalComparisonPieChartCanvas, { // Changed name
                 type: 'pie',
                 data: {
                    labels: ['Συνολικά Έσοδα', 'Συνολικά Έξοδα (Μετρητά & Κάρτα)'],
                    datasets: [{
                        data: [annualData.totalIncome, annualData.totalExpensesCashCard], // Χρήση των ετήσιων συνόλων
                        backgroundColor: ['#28a745', '#dc3545'],
                        borderColor: '#fff',
                        borderWidth: 1
                    }]
                 },
                 options: {
                     responsive: true,
                     plugins: {
                         legend: { position: 'top' },
                         title: { display: false }
                     },
                 },
             });
        } else {
             if (annualTotalComparisonChartContainer) annualTotalComparisonChartContainer.style.display = 'none';
        }


        // --- ΓΡΑΦΗΜΑ: Μηνιαία Σύγκριση (Bar Chart - Αλλάχτηκαν IDs και ονόματα) ---
         const annualMonthlyComparisonChartCanvas = annualMonthlyComparisonChartCanvasElement ? annualMonthlyComparisonChartCanvasElement.getContext('2d') : null; // Changed ID
         const annualMonthlyComparisonChartContainer = annualMonthlyComparisonChartCanvasElement ? annualMonthlyComparisonChartCanvasElement.closest('.chart-container') : null; // Changed ID

         const monthlyTotals = annualData ? annualData.monthlyBreakdown : {}; // Use data if available
         const monthlyKeys = Object.keys(monthlyTotals).sort(); // Ταξινόμηση μηνών (YYYY-MM)

         // Προετοιμασία δεδομένων για το γράφημα
         const monthLabels = monthlyKeys.map(yearMonthString => {
              const monthNames = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαϊ", "Ιουν",
                                "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"]; // Σύντομα ονόματα μηνών
              const monthIndex = parseInt(yearMonthString.substring(5, 7), 10) - 1;
              return monthNames[monthIndex]; // Display abbreviated month name
         });

         const monthlyIncomeData = monthlyKeys.map(monthKey => monthlyTotals[monthKey].totalIncome);
         const monthlyExpensesData = monthlyKeys.map(monthKey => monthlyTotals[monthKey].totalExpensesCashCard); // Έξοδα Μετρητά + Κάρτα
         const monthlyBalanceData = monthlyKeys.map(monthKey => monthlyTotals[monthKey].totalBalance); // Υπόλοιπο Μετρητά + Κάρτα


         // Ελέγχουμε αν υπάρχει έστω και ένας μήνας με δεδομένα για το γράφημα
         const hasMonthlyChartData = monthlyIncomeData.some(amount => amount > 0) ||
                                     monthlyExpensesData.some(amount => amount > 0) ||
                                     monthlyBalanceData.some(amount => amount !== 0); // Υπόλοιπο μπορεί να είναι και αρνητικό/μηδέν


         if (annualMonthlyComparisonChartCanvas && hasMonthlyChartData) { // Changed ID
              if (annualMonthlyComparisonChartContainer) annualMonthlyComparisonChartContainer.style.display = 'block'; // Changed ID
              if (noAnnualMonthlyChartMessage) noAnnualMonthlyChartMessage.style.display = 'none'; // Changed ID

             annualMonthlyComparisonChart = new Chart(annualMonthlyComparisonChartCanvas, { // Changed name and ID
                 type: 'bar',
                 data: {
                     labels: monthLabels,
                     datasets: [
                         {
                             label: 'Συνολικά Έσοδα',
                             data: monthlyIncomeData,
                             backgroundColor: '#28a745',
                              borderColor: '#fff',
                              borderWidth: 1
                         },
                         {
                             label: 'Συνολικά Έξοδα (Μ+Κ)',
                             data: monthlyExpensesData,
                             backgroundColor: '#dc3545',
                              borderColor: '#fff',
                              borderWidth: 1
                         },
                         {
                             label: 'Συνολικό Υπόλοιπο',
                             data: monthlyBalanceData,
                             backgroundColor: '#007bff',
                              borderColor: '#fff',
                              borderWidth: 1
                         }
                     ]
                 },
                 options: {
                     responsive: true,
                      maintainAspectRatio: false, // Allow height to be controlled by container
                     plugins: {
                         legend: { position: 'top' },
                         title: { display: false },
                         tooltip: {
                             callbacks: {
                                 label: function(context) {
                                     const label = context.dataset.label || '';
                                     const value = context.raw || 0;
                                     return `${label}: ${formatCurrency(value)}`; // Μορφοποίηση ποσού στο tooltip
                                 }
                             }
                         }
                     },
                      scales: {
                         y: {
                             beginAtZero: false,
                              ticks: {
                                  callback: function(value) {
                                       return formatCurrency(value).replace('€', ''); // Εμφάνιση μόνο του αριθμού
                                  }
                              }
                         },
                          x: {
                              // Καμία ειδική ρύθμιση για τώρα
                          }
                     }
                 },
             });
              // Set height of chart container after chart creation for better rendering
              if (annualMonthlyComparisonChartContainer) {
                  annualMonthlyComparisonChartContainer.style.height = '400px'; // Example height
              }


         } else {
              if (annualMonthlyComparisonChartContainer) annualMonthlyComparisonChartContainer.style.display = 'none'; // Changed ID
              if (noAnnualMonthlyChartMessage) noAnnualMonthlyChartMessage.style.display = 'block'; // Changed ID - Εμφάνιση μηνύματος αν δεν υπάρχουν δεδομένα
         }
    };


    // Κύρια συνάρτηση για τη δημιουργία της ετήσιας αναφοράς (Αλλάχτηκε όνομα)
    const generateAnnualReport = (yearString) => {
        if (!yearString) {
             // Εμφάνιση άδειων δεδομένων και απόκρυψη τμημάτων
             const emptySummary = {
                 yearString: '',
                 totalCashIncome: 0, totalCardIncome: 0, totalIncome: 0,
                 totalCashExpenses: 0, totalCardExpenses: 0, totalCreditExpenses: 0,
                 totalFcExpenses: 0, totalFcExpensesCashCard: 0, totalFcExpensesCredit: 0,
                 totalExpensesCashCard: 0, cashBalance: 0, cardBalance: 0, totalBalance: 0,
                 foodCostPercentage: 0, supplierCredit: {}, monthlyBreakdown: {} // Changed name
             };

             displayAnnualSummary(emptySummary); // Changed name
             displayAnnualSupplierCredit(emptySummary); // Changed name
             displayAnnualFoodCost(emptySummary); // Changed name - pass full data
             displayAnnualMonthlyBreakdown(emptySummary); // Changed name - pass full data


             // Κρύβουμε και καθαρίζουμε το κείμενο ερμηνείας Food Cost
             if(annualFoodCostInterpretationDiv) { // Changed ID
                 annualFoodCostInterpretationDiv.style.display = 'none';
                 annualFoodCostInterpretationDiv.innerHTML = '';
             }

             updateAnnualCharts(emptySummary); // Changed name - Καταστροφή/Επαναφορά γραφημάτων

             // Επαναφορά κειμένου έτους
             if (selectedYearDisplaySpan) selectedYearDisplaySpan.textContent = 'το επιλεγμένο έτος'; // Changed ID and text

             // Απόκρυψη κουμπιού εξαγωγής PDF
             if(exportAnnualPdfButton) exportAnnualPdfButton.style.display = 'none'; // Changed ID

             return;
        }

        const annualData = calculateAnnualData(yearString); // Changed name - Υπολογισμός όλων των δεδομένων

         // Check if annualData is null (invalid year)
         if (!annualData) {
              // Treat as empty data
              generateAnnualReport(''); // Call with empty string to clear the report
              if (selectedYearDisplaySpan) selectedYearDisplaySpan.textContent = `το μη έγκυρο έτος ${yearString}`; // Indicate invalid year
              return;
         }


        displayAnnualSummary(annualData); // Changed name
        displayAnnualSupplierCredit(annualData); // Changed name - Εμφάνιση πίνακα προμηθευτών
        displayAnnualFoodCost(annualData); // Changed name - pass full data
        displayAnnualMonthlyBreakdown(annualData); // Changed name - Εμφάνιση μηνιαίου πίνακα


         // Εμφάνιση κειμένου ερμηνείας Food Cost
         if(annualFoodCostInterpretationDiv){ // Changed ID
              annualFoodCostInterpretationDiv.innerHTML = getAnnualFoodCostInterpretationText( // Changed name
                  annualData.totalIncome,
                  annualData.totalCashIncome,
                  annualData.totalCardIncome,
                  annualData.totalFcExpenses,
                  annualData.totalFcExpensesCashCard,
                  annualData.totalFcExpensesCredit,
                  annualData.foodCostPercentage,
                  yearString // Pass year string
              );
         }


        updateAnnualCharts(annualData); // Changed name - Ενημέρωση γραφημάτων

        // Ενημέρωση της εμφάνισης του έτους
        if (selectedYearDisplaySpan) selectedYearDisplaySpan.textContent = `το έτος ${yearString}`; // Changed ID and text

         // Εμφάνιση κουμπιού εξαγωγής PDF
         // Εμφανίζεται μόνο αν υπάρχουν δεδομένα σε οποιονδήποτε πίνακα ή γράφημα
         const annualSummaryTableVisible = annualSummaryTable && annualSummaryTable.style.display !== 'none'; // Check visibility
         const annualSupplierCreditTableVisible = annualSupplierCreditTable && annualSupplierCreditTable.style.display !== 'none'; // Check visibility
         const annualMonthlyBreakdownTableVisible = annualMonthlyBreakdownTable && annualMonthlyBreakdownTable.style.display !== 'none'; // Check visibility
         const annualFoodCostContainerVisible = annualFoodCostContainer && annualFoodCostContainer.style.display !== 'none'; // Check visibility
         const annualTotalComparisonChartVisible = annualTotalComparisonPieChartCanvasElement && annualTotalComparisonPieChartCanvasElement.closest('.chart-container') && annualTotalComparisonPieChartCanvasElement.closest('.chart-container').style.display !== 'none'; // Check visibility
         const annualMonthlyComparisonChartVisible = annualMonthlyComparisonChartCanvasElement && annualMonthlyComparisonChartCanvasElement.closest('.chart-container') && annualMonthlyComparisonChartCanvasElement.closest('.chart-container').style.display !== 'none'; // Check visibility


         const hasAnyData = annualSummaryTableVisible || annualSupplierCreditTableVisible || annualMonthlyBreakdownTableVisible || annualFoodCostContainerVisible || annualTotalComparisonChartVisible || annualMonthlyComparisonChartVisible;

          if (hasAnyData) {
             if(exportAnnualPdfButton) exportAnnualPdfButton.style.display = 'block'; // Changed ID
         } else {
             if(exportAnnualPdfButton) exportAnnualPdfButton.style.display = 'none'; // Changed ID
         }
    };

    // --- Λειτουργία Εξαγωγής PDF για Ετήσια Αναφορά (Αλλάχτηκε όνομα) ---

    const exportAnnualReportToPdf = () => {
        const yearInput = document.getElementById('year-input'); // Get it again for safety
        const selectedYearString = yearInput ? yearInput.value : '';

        if (!selectedYearString) {
            alert('Παρακαλώ επιλέξτε έτος για την αναφορά.');
            return;
        }

        const annualData = calculateAnnualData(selectedYearString); // Changed name

         // Ελέγχουμε αν υπάρχουν καθόλου δεδομένα για εξαγωγή
         if (!annualData || (annualData.totalIncome === 0 && annualData.totalCashExpenses === 0 && annualData.totalCardExpenses === 0 && annualData.totalCreditExpenses === 0 && annualData.totalFcExpenses === 0)) {
              alert(`Δεν υπάρχουν καταχωρημένα έσοδα ή έξοδα για το έτος ${selectedYearString} για εξαγωγή.`);
              return;
         }

        const formattedYear = selectedYearString; // Year is already formatted

        // --- Περιεχόμενο PDF ---

        const pdfContent = [];

        pdfContent.push({ text: 'Ετήσια Οικονομική Αναφορά', style: 'header' }); // Changed text
        pdfContent.push({ text: `Έτος: ${formattedYear}`, style: 'subheader' }); // Changed text

        // Πίνακας Σύνοψης (στο PDF)
        // Εμφανίζουμε τον πίνακα σύνοψης στο PDF μόνο αν υπάρχουν δεδομένα για αυτόν
        if (annualData.totalIncome > 0 || annualData.totalExpensesCashCard > 0 || annualData.totalCreditExpenses > 0) {
             pdfContent.push({ text: 'Σύνοψη Έτους:', style: 'sectionHeader', margin: [0, 10, 0, 5] }); // Changed text
             pdfContent.push({
                  table: {
                      widths: ['*', 'auto'],
                      body: [
                          [{ text: 'Κατηγορία', style: 'tableHeaderSummary' }, { text: 'Ποσό (€)', style: 'tableHeaderSummary', alignment: 'right' }],
                          ['Έσοδα Μετρητά:', { text: formatCurrency(annualData.totalCashIncome), alignment: 'right' }],
                          ['Έσοδα Κάρτα:', { text: formatCurrency(annualData.totalCardIncome), alignment: 'right' }],
                          [{ text: 'Συνολικά Έσοδα:', bold: true }, { text: formatCurrency(annualData.totalIncome), bold: true, alignment: 'right' }],
                          [{ text: '', colSpan: 2, border: [false, false, false, true], margin: [0, 5, 0, 5] }, ''],
                          ['Έξοδα Μετρητά:', { text: formatCurrency(annualData.totalCashExpenses), alignment: 'right' }],
                          ['Έξοδα Κάρτα:', { text: formatCurrency(annualData.totalCardExpenses), alignment: 'right' }],
                           [{ text: 'Συνολικά Έξοδα (Μετρητά & Κάρτα):', bold: true }, { text: formatCurrency(annualData.totalExpensesCashCard), bold: true, alignment: 'right' }],
                          ['Έξοδα Επί Πιστώσει:', { text: formatCurrency(annualData.totalCreditExpenses), alignment: 'right' }],
                          [{ text: '', colSpan: 2, border: [false, false, false, true], margin: [0, 5, 0, 5] }, ''],
                          ['Υπόλοιπο Μετρητών:', { text: formatCurrency(annualData.cashBalance), alignment: 'right' }],
                          ['Υπόλοιπο Καρτών:', { text: formatCurrency(annualData.cardBalance), alignment: 'right' }],
                          [{ text: 'Υπόλοιπο Συνολικού Ταμείου:', bold: true }, { text: formatCurrency(annualData.totalBalance), bold: true, alignment: 'right' }],
                      ],
                       headerRows: 1,
                      layout: {
                           hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 1; },
                           vLineWidth: function(i, node) { return 0; },
                           hLineColor: function(i, node) { return (i === 0 || i === node.table.body.length) ? '#000' : '#ddd'; },
                           vLineColor: function(i, node) { return '#000'; },
                           paddingLeft: function(i, node) { return 5; },
                           paddingRight: function(i, node) { return 5; },
                           paddingTop: function(i, node) { return 5; },
                           paddingBottom: function(i, node) { return 5; }
                      }
                  }
             });
         }

         // Γράφημα Συνολικής Σύγκρισης Έτους (στο PDF - ως εικόνα)
         const annualTotalComparisonChartContainer = annualTotalComparisonPieChartCanvasElement ? annualTotalComparisonPieChartCanvasElement.closest('.chart-container') : null;
         // Ελέγχουμε αν το γράφημα δημιουργήθηκε και είναι ορατό
         if (annualTotalComparisonChart && annualTotalComparisonChartContainer && annualTotalComparisonChartContainer.style.display !== 'none') { // Changed names
             try {
                 // Προσθέτουμε pageBreak: 'before' αν χρειάζεται
                 pdfContent.push({ text: 'Σύγκριση Συνολικών Εσόδων vs Εξόδων (Μετρητά & Κάρτα):', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Changed text, Add pageBreak if there was previous content

                 // Μετατροπή του γραφήματος σε εικόνα Base64
                 const chartImage = annualTotalComparisonChart.toBase64Image(); // Changed name

                 // Προσθήκη της εικόνας στο PDF
                 pdfContent.push({
                     image: chartImage,
                     width: 300, // Keep pie chart smaller
                     alignment: 'center',
                     margin: [0, 10, 0, 10]
                 });

             } catch (error) {
                 console.error("Error exporting annual total comparison chart to PDF:", error);
                  pdfContent.push({ text: 'Σημείωση: Το γράφημα συνολικής σύγκρισης δεν μπόρεσε να εξαχθεί σε PDF.', italics: true, color: '#dc3545', margin: [0, 10, 0, 10] });
             }
         }


        // Πίνακας Εξόδων Επί Πιστώσει ανά Προμηθευτή (στο PDF)
         const sortedSuppliers = Object.entries(annualData.supplierCredit).filter(([supplier, amount]) => amount > 0).sort(([, amountA], [, amountB]) => amountB - amountA); // Use annualData.supplierCredit

         if (sortedSuppliers.length > 0) {
              // Προσθέτουμε pageBreak: 'before' αν χρειάζεται να πάει σε νέα σελίδα
             pdfContent.push({ text: 'Συνολικά Έξοδα Επί Πιστώσει ανά Προμηθευτή (Ετήσια):', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Changed text, Add pageBreak if there was previous content


             const supplierCreditTableBodyPdf = [
                 // Επικεφαλίδα πίνακα
                 [{ text: 'Όνομα Προμηθευτή', style: 'tableHeaderSummary' }, { text: 'Σύνολο Επί Πίστωση (€)', style: 'tableHeaderSummary', alignment: 'right' }]
             ];

             sortedSuppliers.forEach(([supplier, totalCredit]) => {
                 supplierCreditTableBodyPdf.push([
                     supplier,
                     { text: formatCurrency(totalCredit), alignment: 'right' }
                 ]);
             });

             // Προσθήκη γραμμής συνόλου στο footer του PDF πίνακα προμηθευτών
             supplierCreditTableBodyPdf.push([
                 { text: 'Σύνολο Επί Πίστωση:', bold: true }, // Ετικέτα
                 { text: formatCurrency(annualData.totalCreditExpenses), bold: true, alignment: 'right' } // Συνολικό ποσό επί πιστώσει
             ]);


             pdfContent.push({
                 table: {
                     widths: ['*', 'auto'],
                     body: supplierCreditTableBodyPdf,
                 },
                 layout: {
                     hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 0.5; },
                     vLineWidth: function(i, node) { return 0.5; },
                     hLineColor: function(i, node) { return (i === 0 || i === node.table.body.length) ? '#000' : '#ddd'; },
                     vLineColor: function(i, node) { return '#ddd'; },
                     paddingLeft: function(i, node) { return 5; },
                     paddingRight: function(i, node) { return 5; },
                     paddingTop: function(i, node) { return 5; },
                     paddingBottom: function(i, node) { return 5; }
                 }
             });
         }

         // Μηνιαία Ανάλυση (στο PDF)
         const monthlyKeys = Object.keys(annualData.monthlyBreakdown).sort(); // Use annualData.monthlyBreakdown

         // Ελέγχουμε αν υπάρχει έστω και ένας μήνας με δεδομένα για να εμφανίσουμε τον πίνακα
          const hasMonthlyBreakdownDataForPdf = Object.values(annualData.monthlyBreakdown).some(month =>
              month.cashIncome > 0 || month.cardIncome > 0 || month.cashExpenses > 0 || month.cardExpenses > 0 || month.creditExpenses > 0 // Ελέγχουμε για οποιοδήποτε ποσό > 0
         );


         if (hasMonthlyBreakdownDataForPdf) {
             // Προσθέτουμε pageBreak: 'before' αν χρειάζεται να πάει σε νέα σελίδα
             pdfContent.push({ text: 'Ανάλυση Μήνα ανά Έτος:', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Changed text, Add pageBreak if there was previous content

              // Προσαρμόζουμε τα πλάτη των στηλών για τον μηνιαίο πίνακα PDF
              // Needs 10 columns: Month | CI | CardI | TotalI | CE | CardE | TotalE (C+C) | CB | CardB | TotalB
             const monthlyTableWidths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];


             const monthlyBreakdownTableBodyPdf = [
                 // Επικεφαλίδα πίνακα - ΠΡΟΣΟΧΗ: οι επικεφαλίδες πρέπει να ταιριάζουν με τον αριθμό των στηλών
                 [{ text: 'Μήνας', style: 'tableHeaderBreakdown' }, // Changed text
                  { text: 'Ε. Μετρητά (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Ε. Κάρτα (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Συν. Έσοδα (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Συνολικά Έσοδα Μήνα
                  { text: 'Εξ. Μετρητά (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Εξ. Κάρτα (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Συν. Έξοδα (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Συνολικά Έξοδα Μήνα (Μετρητά+Κάρτα)
                  { text: 'Υπ. Μετρητών (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Υπόλοιπο Μετρητών Μήνα
                  { text: 'Υπ. Καρτών (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Υπόλοιπο Καρτών Μήνα
                  { text: 'Συν. Υπόλοιπο (€)', style: 'tableHeaderBreakdown', alignment: 'right' } // Συνολικό Υπόλοιπο Μήνα
                  ]
             ];

              const monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος",
                               "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"]; // Full month names for table


             monthlyKeys.forEach(yearMonthString => {
                 const monthData = annualData.monthlyBreakdown[yearMonthString]; // Use annualData.monthlyBreakdown
                 const monthIndex = parseInt(yearMonthString.substring(5, 7), 10) - 1; // Get 0-indexed month
                 const monthName = monthNames[monthIndex]; // Use full month name


                 monthlyBreakdownTableBodyPdf.push([
                     monthName, // Display month name
                     { text: formatCurrency(monthData.cashIncome), alignment: 'right' },
                     { text: formatCurrency(monthData.cardIncome), alignment: 'right' },
                     { text: formatCurrency(monthData.totalIncome), alignment: 'right' }, // Συνολικά Έσοδα Μήνα
                     { text: formatCurrency(monthData.cashExpenses), alignment: 'right' },
                     { text: formatCurrency(monthData.cardExpenses), alignment: 'right' },
                     { text: formatCurrency(monthData.totalExpensesCashCard), alignment: 'right' }, // Συνολικά Έξοδα Μήνα (Μετρητά+Κάρτα)
                     { text: formatCurrency(monthData.cashBalance), alignment: 'right' }, // Υπόλοιπο Μετρητών Μήνα
                     { text: formatCurrency(monthData.cardBalance), alignment: 'right' }, // Υπόλοιπο Καρτών Μήνα
                     { text: formatCurrency(monthData.totalBalance), alignment: 'right' } // Συνολικό Υπόλοιπο Μήνα
                 ]);
             });

              // Προσθήκη γραμμής συνόλου στο footer του PDF πίνακα μηνιαίας ανάλυσης
              // Χρησιμοποιούμε τα συνολικά ετήσια δεδομένα για το footer
              monthlyBreakdownTableBodyPdf.push([
                 { text: 'Σύνολα Έτους:', bold: true }, // Changed text
                 { text: formatCurrency(annualData.totalCashIncome), bold: true, alignment: 'right' },
                 { text: formatCurrency(annualData.totalCardIncome), bold: true, alignment: 'right' },
                 { text: formatCurrency(annualData.totalIncome), bold: true, alignment: 'right' }, // Συνολικά Έσοδα Έτους
                 { text: formatCurrency(annualData.totalCashExpenses), bold: true, alignment: 'right' },
                 { text: formatCurrency(annualData.totalCardExpenses), bold: true, alignment: 'right' },
                 { text: formatCurrency(annualData.totalExpensesCashCard), bold: true, alignment: 'right' }, // Συνολικά Έξοδα Έτους (Μετρητά+Κάρτα)
                 { text: formatCurrency(annualData.cashBalance), bold: true, alignment: 'right' }, // Υπόλοιπο Μετρητών Έτους
                 { text: formatCurrency(annualData.cardBalance), bold: true, alignment: 'right' }, // Υπόλοιπο Καρτών Έτους
                 { text: formatCurrency(annualData.totalBalance), bold: true, alignment: 'right' } // Συνολικό Υπόλοιπο Έτους
             ]);


             pdfContent.push({
                 table: {
                     widths: monthlyTableWidths, // Χρήση των ορισμένων widths
                     body: monthlyBreakdownTableBodyPdf,
                 },
                 layout: {
                     hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 0.5; },
                     vLineWidth: function(i, node) { return 0.5; },
                     hLineColor: function(i, node) { return (i === 0 || i === node.table.body.length) ? '#000' : '#ddd'; },
                     vLineColor: function(i, node) { return '#ddd'; },
                     paddingLeft: function(i, node) { return 5; },
                     paddingRight: function(i, node) { return 5; },
                     paddingTop: function(i, node) { return 5; },
                     paddingBottom: function(i, node) { return 5; }
                 }
             });
         }


         // Γράφημα Μηνιαίας Σύγκρισης (στο PDF - ως εικόνα)
         const annualMonthlyComparisonChartContainer = annualMonthlyComparisonChartCanvasElement ? annualMonthlyComparisonChartCanvasElement.closest('.chart-container') : null; // Changed name
         // Ελέγχουμε αν το γράφημα δημιουργήθηκε και είναι ορατό
         if (annualMonthlyComparisonChart && annualMonthlyComparisonChartContainer && annualMonthlyComparisonChartContainer.style.display !== 'none') { // Changed names
             try {
                 // Προσθέτουμε pageBreak: 'before' αν χρειάζεται
                 pdfContent.push({ text: 'Εξέλιξη Εσόδων, Εξόδων και Υπολοίπου ανά Μήνα:', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Changed text, Add pageBreak if there was previous content

                 // Μετατροπή του γραφήματος σε εικόνα Base64
                 const chartImage = annualMonthlyComparisonChart.toBase64Image(); // Changed name

                 // Προσθήκη της εικόνας στο PDF
                 pdfContent.push({
                     image: chartImage,
                     width: 550, // Keep consistent width for comparison charts
                     alignment: 'center',
                     margin: [0, 10, 0, 10]
                 });

             } catch (error) {
                 console.error("Error exporting annual monthly comparison chart to PDF:", error);
                  pdfContent.push({ text: 'Σημείωση: Το γράφημα μηνιαίας εξέλιξης δεν μπόρεσε να εξαχθεί σε PDF.', italics: true, color: '#dc3545', margin: [0, 10, 0, 10] }); // Changed text
             }
         }


         // Εμφάνιση Food Cost αν υπολογίστηκε - Πιο αναλυτικό στο PDF
        if (annualData.totalIncome > 0 || annualData.totalFcExpenses > 0) {

             // Προσθήκη κειμένου ερμηνείας Food Cost στο PDF
             const interpretationText = getAnnualFoodCostInterpretationText( // Changed name
                 annualData.totalIncome,
                 annualData.totalCashIncome,
                 annualData.totalCardIncome,
                 annualData.totalFcExpenses,
                 annualData.totalFcExpensesCashCard,
                 annualData.totalFcExpensesCredit,
                 annualData.foodCostPercentage,
                 selectedYearString // Pass year string
             );

             // Ελέγχουμε αν η getAnnualFoodCostInterpretationText επέστρεψε κείμενο (δεν ήταν N/A)
             if (interpretationText) {
                 // Χρησιμοποιούμε την προσέγγιση με segments για να διατηρήσουμε τα bold tags και να διαχειριστούμε τις αλλαγές γραμμής
                 const segments = interpretationText.split(/(<\/?strong>|<br\s*\/?>)/); // Split by bold tags AND <br> tags
                 const pdfInterpretationContent = [];
                 let isBold = false;

                 segments.forEach(segment => {
                      if (segment === '<strong>') {
                          isBold = true;
                      } else if (segment === '</strong>') {
                          isBold = false;
                      } else if (segment.match(/<br\s*\/?>/)) { // Check if it's a <br> tag
                          pdfInterpretationContent.push({ text: '\n' }); // Add a newline for <br>
                      }
                      else if (segment) { // Add non-empty text segments
                         pdfInterpretationContent.push({ text: segment, bold: isBold });
                     }
                 });

                 // Προσθέτουμε pageBreak: 'before' αν χρειάζεται να ξεκινάει σε νέα σελίδα
                 pdfContent.push({
                      text: pdfInterpretationContent,
                      margin: [0, 20, 0, 15],
                      alignment: 'left',
                      pageBreak: (pdfContent.length > 2) ? 'before' : null // Add pageBreak if there was previous content
                 });
             }
         }


        // --- Δημιουργία Λογιστικών Σχολίων (προσαρμοσμένα για έτος - Αλλάχτηκε όνομα) ---
         const comments = [];

        // Ελέγχουμε αν υπάρχει προηγούμενο περιεχόμενο πριν προσθέσουμε pageBreak
        comments.push({ text: 'Λογιστική Σύνοψη Έτους:', style: 'commentsHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Changed text


        // Επανάληψη λογικής σχολίων για το PDF
        if (annualData.totalBalance > 0) {
             comments.push({ text: `Το έτος παρουσιάζει συνολικό πλεόνασμα ταμείου ${formatCurrency(annualData.totalBalance)} (Συνολικά Έσοδα μείον Συνολικά Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] }); // Changed text
        } else if (annualData.totalBalance < 0) {
             comments.push({ text: `Το έτος παρουσιάζει συνολικό έλλειμμα ταμείου ${formatCurrency(Math.abs(annualData.totalBalance))} (Συνολικά Έσοδα μείον Συνολικά Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] }); // Changed text
        } else {
             comments.push({ text: `Το έτος παρουσιάζει ισορροπία στο συνολικό ταμείο (τα συνολικά έσοδα Μετρητά + Κάρτα ισούνται με τα συνολικά έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] }); // Changed text
        }
         if (annualData.cashBalance > 0) {
             comments.push({ text: `Το υπόλοιπο των μετρητών για το έτος είναι θετικό, ανέρχεται σε ${formatCurrency(annualData.cashBalance)}.`, margin: [0, 5] }); // Changed text
         } else if (annualData.cashBalance < 0) {
             comments.push({ text: `Το υπόλοιπο των μετρητών για το έτος είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(annualData.cashBalance))}.`, margin: [0, 5] }); // Changed text
         } else {
              comments.push({ text: `Το υπόλοιπο των μετρητών για το έτος είναι μηδενικό.`, margin: [0, 5] }); // Changed text
         }
         if (annualData.cardBalance > 0) {
             comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για το έτος είναι θετικό, ανέρχεται σε ${formatCurrency(annualData.cardBalance)}.`, margin: [0, 5] }); // Changed text
         } else if (annualData.cardBalance < 0) {
              comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για το έτος είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(annualData.cardBalance))}.`, margin: [0, 5] }); // Changed text
         } else {
              comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για το έτος είναι μηδενικό.`, margin: [0, 5] }); // Changed text
         }
        if (annualData.totalCreditExpenses > 0) {
             comments.push({ text: `Σημειώθηκαν έξοδα επί πιστώσει συνολικού ποσού ${formatCurrency(annualData.totalCreditExpenses)} για το έτος, τα οποία δεν επηρεάζουν το άμεσο ταμείο.`, margin: [0, 5] }); // Changed text
        } else {
             comments.push({ text: `Δεν σημειώθηκαν έξοδα επί πιστώσει για το έτος.`, margin: [0, 5] }); // Changed text
        }

        // Προσθήκη των σχολίων στο περιεχόμενο του PDF
        pdfContent.push(...comments);


        // Ορισμός των styles για το PDF
        const pdfStyles = {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 20],
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                margin: [0, 10, 0, 10],
                alignment: 'center'
            },
             sectionHeader: {
                 fontSize: 14,
                 bold: true,
             },
            tableHeaderSummary: { // Custom style for Summary and Supplier tables
                bold: true,
                fontSize: 11,
                color: 'white',
                fillColor: '#007bff',
                alignment: 'left',
                 padding: [5, 5, 5, 5]
            },
             tableHeaderBreakdown: { // Custom style for Monthly Breakdown table
                 bold: true,
                 fontSize: 10, // Adjusted font size to fit more columns
                 color: 'white',
                 fillColor: '#007bff',
                 alignment: 'center', // Center table headers for breakdown table
                  padding: [3, 5, 3, 5] // Reduced padding
             },
             commentsHeader: {
                  fontSize: 14,
                  bold: true,
              }
        };


        // Ορισμός του PDF document definition
        const docDefinition = {
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            },
            content: pdfContent,
            styles: pdfStyles, // Χρησιμοποιούμε το βασικό style object
            info: {
                title: `Ετήσια Αναφορά ${formattedYear}`, // Changed text
                author: 'Η Εφαρμογή μου',
            },
             pageOrientation: 'landscape', // Χρησιμοποιούμε landscape για να χωράει ο μηνιαίος πίνακας
             pageMargins: [ 20, 20, 20, 20 ] // Μικρότερα margins
        };


        // Δημιουργία του PDF και εξαγωγή
        pdfMake.createPdf(docDefinition).getDataUrl(function(dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Ετήσια_Αναφορα_${selectedYearString}.pdf`; // Changed filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };


    // --- Event Listeners ---

    // Όταν αλλάζει το έτος στο number input (Αλλάχτηκε ID)
    if(yearInput) {
        yearInput.addEventListener('change', (event) => {
            const selectedYearString = event.target.value; // Gets the year as a string
             // Simple validation for year (allow empty to clear report)
             if (selectedYearString === '' || (parseInt(selectedYearString, 10) >= 1900 && parseInt(selectedYearString, 10) <= 2100)) { // Basic year range validation
                  localStorage.setItem('lastSelectedYearReport', selectedYearString); // Changed key
                  generateAnnualReport(selectedYearString); // Δημιουργία αναφοράς για το επιλεγμένο έτος
             } else {
                  alert('Παρακαλώ εισάγετε ένα έγκυρο έτος (π.χ. 2023).');
                   // Optionally reset the input or clear the report
                  event.target.value = localStorage.getItem('lastSelectedYearReport') || ''; // Revert to last valid or empty
                  generateAnnualReport(localStorage.getItem('lastSelectedYearReport') || ''); // Regenerate for last valid or empty
             }
        });
         // Listen for 'input' as well for immediate feedback if needed, but 'change' is sufficient for triggering report
         // yearInput.addEventListener('input', (event) => { ... validation logic here too ... });
    }


     // Event listener για το κουμπί εξαγωγής PDF (Αλλάχτηκε ID)
    if(exportAnnualPdfButton) {
        exportAnnualPdfButton.addEventListener('click', exportAnnualReportToPdf); // Changed name
    }


    // --- Αρχικοποίηση κατά τη φόρτωση της σελίδας ---

    // Θέτουμε το τρέχον έτος ως προεπιλογή ή το τελευταίο επιλεγμένο (Αλλάχτηκε λογική και keys)
    const savedYearString = localStorage.getItem('lastSelectedYearReport'); // Changed key
    let yearToDisplay;

    if (savedYearString && parseInt(savedYearString, 10) >= 1900 && parseInt(savedYearString, 10) <= 2100) { // Validate saved year
        yearToDisplay = savedYearString;
        if(yearInput) yearInput.value = savedYearString; // Changed ID
    } else {
        const today = new Date();
        const currentYear = today.getFullYear();
        yearToDisplay = currentYear.toString();
        if(yearInput) yearInput.value = yearToDisplay; // Changed ID
        localStorage.setItem('lastSelectedYearReport', yearToDisplay); // Changed key - Αποθήκευση του τρέχοντος έτους
    }

    // Δημιουργία αναφοράς για το αρχικό έτος μόνο αν βρέθηκε το input έτους
    if(yearInput) { // Changed ID
        generateAnnualReport(yearToDisplay); // Changed name
    } else {
        console.error("Year input element with ID 'year-input' not found."); // Changed text
        // Μπορείτε να προσθέσετε κώδικα για να κρύψετε τα πάντα ή να δείξετε ένα μήνυμα λάθους εδώ
         if (noAnnualReportDataMessage) noAnnualReportDataMessage.style.display = 'block'; // Changed ID
         if (noAnnualReportDataMessage) noAnnualReportDataMessage.textContent = "Σφάλμα: Δεν βρέθηκε το πεδίο επιλογής έτους."; // Changed ID and text
         if (annualSummaryTable) annualSummaryTable.style.display = 'none'; // Changed ID
         if (annualSupplierCreditTable) annualSupplierCreditTable.style.display = 'none'; // Changed ID
         if (annualMonthlyBreakdownTable) annualMonthlyBreakdownTable.style.display = 'none'; // Changed ID - Κρύψε και τον μηνιαίο πίνακα
         if (annualFoodCostContainer) annualFoodCostContainer.style.display = 'none'; // Changed ID
         if (annualFoodCostInterpretationDiv) annualFoodCostInterpretationDiv.style.display = 'none'; // Changed ID
         if (exportAnnualPdfButton) exportAnnualPdfButton.style.display = 'none'; // Changed ID

         // Κρύψιμο των chart containers και εμφάνιση μηνύματος αν χρειάζεται
         // Note: We only have one main chart container type now, check both specific IDs or parent classes
         const annualTotalComparisonChartContainer = document.getElementById('annualTotalComparisonPieChart') ? document.getElementById('annualTotalComparisonPieChart').closest('.chart-container') : null; // Changed ID
         if (annualTotalComparisonChartContainer) annualTotalComparisonChartContainer.style.display = 'none';

         const annualMonthlyComparisonChartContainer = document.getElementById('annual-monthly-comparison-chart-container'); // Changed ID
         if (annualMonthlyComparisonChartContainer) annualMonthlyComparisonChartContainer.style.display = 'none';

         if (noAnnualMonthlyChartMessage) noAnnualMonthlyChartMessage.style.display = 'block'; // Changed ID - Εμφάνιση μηνύματος για το μηνιαίο γράφημα
         if (noAnnualMonthlyChartMessage) noAnnualMonthlyChartMessage.textContent = "Σφάλμα: Δεν βρέθηκαν στοιχεία γραφήματος στην σελίδα ή το πεδίο επιλογής έτους."; // Changed ID and text

    }


    console.log("Το annual-report.js φορτώθηκε επιτυχώς."); // Changed text
});