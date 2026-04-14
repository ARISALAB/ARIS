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

// Βοηθητική συνάρτηση μορφοποίησης ποσοστών (ίδια με weekly-report.js)
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

// Βοηθητική συνάρτηση για να πάρει όλες τις ημερομηνίες για έναν συγκεκριμένο μήνα (YYYY-MM).
const getDatesForMonth = (yearMonthString) => {
    const dates = [];
    const [year, month] = yearMonthString.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        console.error("Invalid year-month string:", yearMonthString);
        return [];
    }

    // Note: Month is 0-indexed in JavaScript Date object, so use month - 1
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Day 0 of the next month is the last day of the current month

    for (let day = startDate.getDate(); day <= endDate.getDate(); day++) {
        const currentDate = new Date(year, month - 1, day);
        const yearStr = currentDate.getFullYear();
        const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = currentDate.getDate().toString().padStart(2, '0');
        dates.push(`${yearStr}-${monthStr}-${dayStr}`);
    }
    return dates;
};

// --- ΒΟΗΘΗΤΙΚΗ ΣΥΝΑΡΤΗΣΗ: Υπολογισμός αρχής εβδομάδας (Κυριακή) ---
const getStartOfWeek = (dateString) => {
    const date = new Date(dateString + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const diff = date.getDate() - dayOfWeek; // Adjust date to Sunday
    const startOfWeek = new Date(date.setDate(diff));
    // Format back toYYYY-MM-DD string
    const year = startOfWeek.getFullYear();
    const month = (startOfWeek.getMonth() + 1).toString().padStart(2, '0');
    const day = startOfWeek.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- ΒΟΗΘΗΤΙΚΗ ΣΥΝΑΡΤΗΣΗ: Υπολογισμός τέλους εβδομάδας (Σάββατο) ---
const getEndOfWeek = (startOfWeekString) => {
     const date = new Date(startOfWeekString + 'T00:00:00');
     const endOfWeek = new Date(date.setDate(date.getDate() + 6)); // Add 6 days to Sunday (start of week)
     const year = endOfWeek.getFullYear();
     const month = (endOfWeek.getMonth() + 1).toString().padStart(2, '0');
     const day = endOfWeek.getDate().toString().padStart(2, '0');
     return `${year}-${month}-${day}`;
 };


document.addEventListener('DOMContentLoaded', () => {

    // Αναφορές σε στοιχεία της σελίδας
    const monthYearInput = document.getElementById('month-year-input');
    const selectedMonthDisplaySpan = document.getElementById('selected-month-display');
    const monthlySummaryTable = document.getElementById('monthly-summary-table');

    // --- Πίνακας Προμηθευτών ---
    const monthlySupplierCreditTable = document.getElementById('monthly-supplier-credit-table');
    const monthlySupplierCreditTableBody = document.querySelector('#monthly-supplier-credit-table tbody');
    const noMonthlyReportDataMessage = document.getElementById('no-monthly-report-data-message');
    const noMonthlySupplierCreditMessage = document.getElementById('no-monthly-supplier-credit-message');
    const monthlySupplierCreditTotalTd = document.getElementById('monthly-supplier-credit-total'); // Αναφορά στο κελί του footer

    // --- Κελιά του πίνακα σύνοψης (IDs from your HTML snippet) ---
    // Αυτές οι μεταβλητές δηλώνονται εδώ!
    const monthlyCashIncomeTd = document.getElementById('monthly-cash-income');
    const monthlyCardIncomeTd = document.getElementById('monthly-card-income');
    const monthlyTotalIncomeTd = document.getElementById('monthly-total-income');
    const monthlyCashExpensesTd = document.getElementById('monthly-cash-expenses');
    const monthlyCardExpensesTd = document.getElementById('monthly-card-expenses');
    const monthlyTotalExpensesCashCardTd = document.getElementById('monthly-total-expenses-cash-card');
    const monthlyCreditExpensesTd = document.getElementById('monthly-credit-expenses');
    const monthlyCashBalanceTd = document.getElementById('monthly-cash-balance');
    const monthlyCardBalanceTd = document.getElementById('monthly-card-balance');
    const monthlyTotalBalanceTd = document.getElementById('monthly-total-balance');


    // --- Πίνακας Εβδομαδιαίας Ανάλυσης ---
    const monthlyWeeklyBreakdownTable = document.getElementById('monthly-weekly-breakdown-table');
    const monthlyWeeklyBreakdownTableBody = document.querySelector('#monthly-weekly-breakdown-table tbody');
    const monthlyWeeklyBreakdownTableTfoot = document.querySelector('#monthly-weekly-breakdown-table tfoot');
    const noMonthlyWeeklyBreakdownMessage = document.getElementById('no-monthly-weekly-breakdown-message');

    // --- Κελιά footer πίνακα εβδομαδιαίας ανάλυσης (για τα μηνιαία σύνολα) ---
     const monthlyWeeklyTotalCashIncomeTd = document.getElementById('monthly-weekly-total-cash-income');
     const monthlyWeeklyTotalCardIncomeTd = document.getElementById('monthly-weekly-total-card-income');
     const monthlyWeeklyTotalIncomeSumTd = document.getElementById('monthly-weekly-total-income-sum');
     const monthlyWeeklyTotalCashExpensesTd = document.getElementById('monthly-weekly-total-cash-expenses');
     const monthlyWeeklyTotalCardExpensesTd = document.getElementById('monthly-weekly-total-card-expenses');
     const monthlyWeeklyTotalExpensesCashCardSumTd = document.getElementById('monthly-weekly-total-expenses-cash-card-sum');
     const monthlyWeeklyCashBalanceTd = document.getElementById('monthly-weekly-cash-balance');
     const monthlyWeeklyCardBalanceTd = document.getElementById('monthly-weekly-card-balance');
     const monthlyWeeklyTotalBalanceTd = document.getElementById('monthly-weekly-total-balance');

    // --- Food Cost Ενότητα ---
    const monthlyFoodCostContainer = document.getElementById('monthly-food-cost-container');
    const monthlyFoodCostValueSpan = document.getElementById('monthly-food-cost-value');
    const monthlyTotalFcExpensesSpan = document.getElementById('monthly-total-fc-expenses');
    const monthlyTotalIncomeForFcSpan = document.getElementById('monthly-total-income-for-fc');
    const monthlyFoodCostInterpretationDiv = document.getElementById('monthly-food-cost-interpretation');

    // --- Γραφήματα ---
    const monthlyTotalComparisonPieChartCanvasElement = document.getElementById('monthlyTotalComparisonPieChart');
    const monthlyWeeklyComparisonChartCanvasElement = document.getElementById('monthlyWeeklyComparisonChart'); // Canvas για το εβδομαδιαίο γράφημα
    const noMonthlyWeeklyChartMessage = document.getElementById('no-monthly-weekly-chart-message'); // Μήνυμα για το εβδομαδιαίο γράφημα


    // Κουμπί Εξαγωγής PDF
    const exportMonthlyPdfButton = document.getElementById('export-monthly-pdf-button');


    // Μεταβλητές για τα γραφήματα
    let monthlyTotalComparisonChart;
    let monthlyWeeklyComparisonChart; // Μεταβλητή για το εβδομαδιαίο γράφημα


    // Συνάρτηση για τον υπολογισμό των συνολικών και αναλυτικών δεδομένων για έναν μήνα
    const calculateMonthlyData = (yearMonthString) => {
        const datesInMonth = getDatesForMonth(yearMonthString);
        const allIncomeData = getAllIncomeData();
        const allExpensesData = getAllExpensesData();

        // Αρχικοποίηση μηνιαίων συνόλων
        let totalCashIncome = 0;
        let totalCardIncome = 0;
        let totalCashExpenses = 0;
        let totalCardExpenses = 0;
        let totalCreditExpenses = 0;
        let totalFcExpenses = 0; // Συνολικά έξοδα FC (Cash/Card + Credit)
        let totalFcExpensesCashCard = 0; // Έξοδα FC (Μετρητά/Κάρτα)
        let totalFcExpensesCredit = 0; // Έξοδα FC (Πίστωση)

        const supplierCredit = {}; // Για το σύνολο επί πιστώσει ανά προμηθευτή για τον μήνα

        // --- ΥΠΟΛΟΓΙΣΜΟΣ: Στατιστικά ανά Εβδομάδα ---
        const weeklyTotals = {};


        datesInMonth.forEach(date => {
            const incomeEntries = allIncomeData[date] || [];
            const expenseEntries = allExpensesData[date] || [];

            const startOfWeek = getStartOfWeek(date); // Βρες την αρχή της εβδομάδας για αυτή την ημερομηνία

            // Βεβαιώσου ότι υπάρχει μια εγγραφή για την αρχή της εβδομάδας στα weeklyTotals
            if (!weeklyTotals[startOfWeek]) {
                 weeklyTotals[startOfWeek] = {
                     cashIncome: 0,
                     cardIncome: 0,
                     cashExpenses: 0,
                     cardExpenses: 0,
                     creditExpenses: 0 // Αθροίζουμε και creditExpenses εδώ, αν και δεν εμφανίζονται στον εβδομαδιαίο πίνακα, τα χρειαζόμαστε για τον έλεχο ύπαρξης δεδομένων.
                 };
            }

            // Άθροιση ημερήσιων δεδομένων στα μηνιαία σύνολα
            incomeEntries.forEach(entry => {
                const cash = parseFloat(entry.cash) || 0;
                const card = parseFloat(entry.card) || 0;
                totalCashIncome += cash;
                totalCardIncome += card;
                 // Άθροιση και στα εβδομαδιαία σύνολα
                weeklyTotals[startOfWeek].cashIncome += cash;
                weeklyTotals[startOfWeek].cardIncome += card;
            });

            expenseEntries.forEach(entry => {
                 const amount = parseFloat(entry.amount) || 0;
                if (entry.paymentMethod === 'cash') {
                    totalCashExpenses += amount;
                     weeklyTotals[startOfWeek].cashExpenses += amount; // Άθροιση εβδομαδιαία
                } else if (entry.paymentMethod === 'card') {
                    totalCardExpenses += amount;
                     weeklyTotals[startOfWeek].cardExpenses += amount; // Άθροιση εβδομαδιαία
                } else if (entry.paymentMethod === 'credit') {
                    totalCreditExpenses += amount;
                     weeklyTotals[startOfWeek].creditExpenses += amount; // Άθροιση εβδομαδιαία

                    // Προσθήκη στο σύνολο επί πιστώσει ανά προμηθευτή για τον μήνα
                    const supplierName = entry.supplier || 'Άγνωστος Προμηθευτής';
                    if (!supplierCredit[supplierName]) {
                        supplierCredit[supplierName] = 0;
                    }
                    supplierCredit[supplierName] += amount;
                }

                 // Έλεγχος για έξοδα τύπου 'FC'
                 if (entry.expenseType && typeof entry.expenseType === 'string' && entry.expenseType.toUpperCase() === 'FC') {
                     totalFcExpenses += amount; // Αθροίζουμε στα συνολικά FC για τον μήνα
                      if (entry.paymentMethod === 'cash' || entry.paymentMethod === 'card') {
                          totalFcExpensesCashCard += amount;
                     } else if (entry.paymentMethod === 'credit') {
                          totalFcExpensesCredit += amount;
                     }
                 }
            });
        });

         // --- Ολοκλήρωση εβδομαδιαίων συνόλων (υπολογισμός συνολικών εσόδων/εξόδων εβδομάδας και υπολοίπων) ---
        const weeklyTotalsWithCalculations = {};
        const sortedWeeklyStarts = Object.keys(weeklyTotals).sort(); // Ταξινόμηση με βάση την αρχή της εβδομάδας

        sortedWeeklyStarts.forEach(startOfWeek => {
             const weekData = weeklyTotals[startOfWeek];
             const weeklyTotalIncome = weekData.cashIncome + weekData.cardIncome;
             const weeklyTotalExpensesCashCard = weekData.cashExpenses + weekData.cardExpenses;
             const weeklyCashBalance = weekData.cashIncome - weekData.cashExpenses;
             const weeklyCardBalance = weekData.cardIncome - weekData.cardExpenses;
             const weeklyTotalBalance = weeklyTotalIncome - weeklyTotalExpensesCashCard;

             weeklyTotalsWithCalculations[startOfWeek] = {
                 ...weekData, // Include original sums
                 totalIncome: weeklyTotalIncome,
                 totalExpensesCashCard: weeklyTotalExpensesCashCard,
                 cashBalance: weeklyCashBalance,
                 cardBalance: weeklyCardBalance,
                 totalBalance: weeklyTotalBalance
             };
         });


        // Υπολογισμός τελικών συνόλων και υπολοίπων μήνα (μόνο για τον πίνακα σύνοψης)
        const totalIncome = totalCashIncome + totalCardIncome; // Συνολικά έσοδα (για υπολογισμό FC και πίνακα σύνοψης)
        const totalExpensesCashCardForSummary = totalCashExpenses + totalCardExpenses; // Συνολικά έξοδα που επηρεάζουν το ταμείο (για πίνακα σύνοψης)
        const cashBalanceForSummary = totalCashIncome - totalCashExpenses;
        const cardBalanceForSummary = totalCardIncome - totalCardExpenses;
        const totalBalanceForSummary = totalIncome - totalExpensesCashCardForSummary; // Συνολικό υπόλοιπο ταμείου (για πίνακα σύνοψης)

         // Υπολογισμός Food Cost % (χρησιμοποιεί τα συνολικά μηνιαία FC και Έσοδα)
         const foodCostPercentage = (totalIncome > 0) ? (totalFcExpenses / totalIncome) * 100 : 0;


        return {
            yearMonthString,
            totalCashIncome, // Συνολικά μηνιαία
            totalCardIncome, // Συνολικά μηνιαία
            totalIncome, // Συνολικά μηνιαία (χρησιμοποιείται και για FC και για πίνακα σύνοψης)
            totalCashExpenses, // Συνολικά μηνιαία
            totalCardExpenses, // Συνολικά μηνιαία
            totalCreditExpenses, // Συνολικά μηνιαία
            totalFcExpenses, // Συνολικά μηνιαία FC (όλα)
            totalFcExpensesCashCard, // Συνολικά μηνιαία FC (Μετρητά/Κάρτα)
            totalFcExpensesCredit, // Συνολικά μηνιαία FC (Πίστωση)
            totalExpensesCashCard: totalExpensesCashCardForSummary, // Συνολικά μηνιαία (Μετρητά + Κάρτα) για πίνακα σύνοψης
            cashBalance: cashBalanceForSummary, // Συνολικό μηνιαίο
            cardBalance: cardBalanceForSummary, // Συνολικό μηνιαίο
            totalBalance: totalBalanceForSummary, // Συνολικό μηνιαίο
            foodCostPercentage, // Ποσοστό Food Cost
            supplierCredit, // Σύνολα επί πιστώσει ανά προμηθευτή για τον μήνα
            weeklyBreakdown: weeklyTotalsWithCalculations // Τα αναλυτικά εβδομαδιαία σύνολα
        };
    };

    // Συνάρτηση για την εμφάνιση των συνοπτικών δεδομένων στον πίνακα σύνοψης
    const displayMonthlySummary = (summaryData) => {
         // Εμφάνιση ή απόκρυψη του μηνύματος "Δεν βρέθηκαν δεδομένα"
         // Ελέγχουμε αν υπάρχουν καθόλου έσοδα, έξοδα (cash/card/credit), ή έξοδα FC
         // Note: Use the total monthly sums here to decide if the summary table should be shown
        if (summaryData.totalIncome > 0 || summaryData.totalCashExpenses > 0 || summaryData.totalCardExpenses > 0 || summaryData.totalCreditExpenses > 0 || summaryData.totalFcExpenses > 0) {
            if(noMonthlyReportDataMessage) noMonthlyReportDataMessage.style.display = 'none';
            if(monthlySummaryTable) monthlySummaryTable.style.display = 'table'; // Εμφάνιση του πίνακα αν υπάρχουν δεδομένα
        } else {
            if(noMonthlyReportDataMessage) noMonthlyReportDataMessage.style.display = 'block';
            if(monthlySummaryTable) monthlySummaryTable.style.display = 'none'; // Απόκρυψη του πίνακα αν δεν υπάρχουν δεδομένα
        }

        // Εφαρμογή μορφοποίησης σε όλα τα ποσά
        if(monthlyCashIncomeTd) monthlyCashIncomeTd.textContent = formatCurrency(summaryData.totalCashIncome);
        if(monthlyCardIncomeTd) monthlyCardIncomeTd.textContent = formatCurrency(summaryData.totalCardIncome);
        if(monthlyTotalIncomeTd) monthlyTotalIncomeTd.textContent = formatCurrency(summaryData.totalIncome);
        if(monthlyCashExpensesTd) monthlyCashExpensesTd.textContent = formatCurrency(summaryData.totalCashExpenses);
        if(monthlyCardExpensesTd) monthlyCardExpensesTd.textContent = formatCurrency(summaryData.totalCardExpenses);
        if(monthlyTotalExpensesCashCardTd) monthlyTotalExpensesCashCardTd.textContent = formatCurrency(summaryData.totalExpensesCashCard); // Εμφάνιση συνόλου Μετρητά+Κάρτα για σύνοψη
        if(monthlyCreditExpensesTd) monthlyCreditExpensesTd.textContent = formatCurrency(summaryData.totalCreditExpenses);
        if(monthlyCashBalanceTd) monthlyCashBalanceTd.textContent = formatCurrency(summaryData.cashBalance);
        if(monthlyCardBalanceTd) monthlyCardBalanceTd.textContent = formatCurrency(summaryData.cardBalance);
        if(monthlyTotalBalanceTd) monthlyTotalBalanceTd.textContent = formatCurrency(summaryData.totalBalance);

    };

     // Συνάρτηση για την εμφάνιση των εξόδων επί πιστώσει ανά προμηθευτή στον πίνακα και συμπλήρωση footer
    const displayMonthlySupplierCredit = (summaryData) => {
        if(!monthlySupplierCreditTableBody) return; // Έλεγχος αν υπάρχει το tbody

        monthlySupplierCreditTableBody.innerHTML = ''; // Καθαρισμός προηγούμενων γραμμών
        const sortedSuppliers = Object.entries(summaryData.supplierCredit).sort(([, amountA], [, amountB]) => amountB - amountA); // Ταξινόμηση φθίνουσα κατά ποσό
        const hasCreditDataToDisplay = sortedSuppliers.some(([supplier, amount]) => amount > 0);
        const monthlySupplierCreditTfoot = document.querySelector('#monthly-supplier-credit-table tfoot'); // Ξαναβρίσκουμε το footer εδώ


        if (!hasCreditDataToDisplay) {
             if(noMonthlySupplierCreditMessage) noMonthlySupplierCreditMessage.style.display = 'block';
             if (monthlySupplierCreditTable) { monthlySupplierCreditTable.style.display = 'none'; } // Κρύψε τον πίνακα
             if (monthlySupplierCreditTfoot) { monthlySupplierCreditTfoot.style.display = 'none'; } // Κρύψε το footer
        } else {
             if(noMonthlySupplierCreditMessage) noMonthlySupplierCreditMessage.style.display = 'none';
             if (monthlySupplierCreditTable) { monthlySupplierCreditTable.style.display = 'table'; } // Εμφάνισε τον πίνακα
             if (monthlySupplierCreditTfoot) { monthlySupplierCreditTfoot.style.display = 'table-footer-group'; } // Εμφάνισε το footer


            sortedSuppliers.forEach(([supplier, totalCredit]) => {
                if (totalCredit > 0) { // Εμφάνιση μόνο αν το σύνολο είναι > 0
                    const row = monthlySupplierCreditTableBody.insertRow();
                    row.insertCell(0).textContent = supplier;
                    row.insertCell(1).textContent = formatCurrency(totalCredit);
                }
            });

            // Συμπλήρωση του συνολικού στο footer του πίνακα προμηθευτών
             if (monthlySupplierCreditTotalTd) monthlySupplierCreditTotalTd.textContent = formatCurrency(summaryData.totalCreditExpenses);
        }
    };

     // --- ΣΥΝΑΡΤΗΣΗ: Εμφάνιση εβδομαδιαίας ανάλυσης ---
     const displayMonthlyWeeklyBreakdown = (monthlyData) => {
         if(!monthlyWeeklyBreakdownTableBody) return; // Έλεγχος αν υπάρχει το tbody
         monthlyWeeklyBreakdownTableBody.innerHTML = ''; // Καθαρισμός προηγούμενων γραμμών

         const weeklyTotals = monthlyData.weeklyBreakdown;
         const weeklyStarts = Object.keys(weeklyTotals).sort(); // Ταξινόμηση εβδομάδων

         // Check if there's any data in the weekly breakdown beyond initial 0s
         const hasWeeklyDataToDisplay = Object.values(weeklyTotals).some(week =>
              week.cashIncome > 0 || week.cardIncome > 0 || week.cashExpenses > 0 || week.cardExpenses > 0 || week.creditExpenses > 0
         );

         // Ελέγχουμε αν υπάρχει ο πίνακας, το μήνυμα και το footer
         if (!monthlyWeeklyBreakdownTable || !noMonthlyWeeklyBreakdownMessage || !monthlyWeeklyBreakdownTableTfoot) {
             console.error("Weekly breakdown table elements not found.");
             return; // Stop execution if essential elements are missing
         }


         if (!hasWeeklyDataToDisplay) {
             noMonthlyWeeklyBreakdownMessage.style.display = 'block';
             monthlyWeeklyBreakdownTable.style.display = 'none'; // Κρύψε τον πίνακα
             monthlyWeeklyBreakdownTableTfoot.style.display = 'none'; // Κρύψε το footer
         } else {
             noMonthlyWeeklyBreakdownMessage.style.display = 'none';
             monthlyWeeklyBreakdownTable.style.display = 'table'; // Εμφάνισε τον πίνακα
             monthlyWeeklyBreakdownTableTfoot.style.display = 'table-footer-group'; // Εμφάνισε το footer


             weeklyStarts.forEach(startOfWeekString => {
                 const weekData = weeklyTotals[startOfWeekString];
                 const endOfWeekString = getEndOfWeek(startOfWeekString);
                 const weekRange = `${startOfWeekString.substring(8, 10)}/${startOfWeekString.substring(5, 7)} - ${endOfWeekString.substring(8, 10)}/${endOfWeekString.substring(5, 7)}`; // π.χ. 06/05 - 12/05

                 const row = monthlyWeeklyBreakdownTableBody.insertRow();
                 row.insertCell(0).textContent = weekRange;
                 row.insertCell(1).textContent = formatCurrency(weekData.cashIncome);
                 row.insertCell(2).textContent = formatCurrency(weekData.cardIncome);
                 row.insertCell(3).textContent = formatCurrency(weekData.totalIncome); // Total Income for the week
                 row.insertCell(4).textContent = formatCurrency(weekData.cashExpenses);
                 row.insertCell(5).textContent = formatCurrency(weekData.cardExpenses);
                 row.insertCell(6).textContent = formatCurrency(weekData.totalExpensesCashCard); // Total Cash + Card Expenses for the week
                 row.insertCell(7).textContent = formatCurrency(weekData.cashBalance); // Cash Balance for the week
                 row.insertCell(8).textContent = formatCurrency(weekData.cardBalance); // Card Balance for the week
                 row.insertCell(9).textContent = formatCurrency(weekData.totalBalance); // Total Balance for the week (Cash+Card Income - Cash+Card Expenses)
             });

             // Συμπλήρωση του footer του πίνακα εβδομαδιαίας ανάλυσης με τα συνολικά μηνιαία
             if(monthlyWeeklyTotalCashIncomeTd) monthlyWeeklyTotalCashIncomeTd.textContent = formatCurrency(monthlyData.totalCashIncome);
             if(monthlyWeeklyTotalCardIncomeTd) monthlyWeeklyTotalCardIncomeTd.textContent = formatCurrency(monthlyData.totalCardIncome);
             if(monthlyWeeklyTotalIncomeSumTd) monthlyWeeklyTotalIncomeSumTd.textContent = formatCurrency(monthlyData.totalIncome);
             if(monthlyWeeklyTotalCashExpensesTd) monthlyWeeklyTotalCashExpensesTd.textContent = formatCurrency(monthlyData.totalCashExpenses);
             if(monthlyWeeklyTotalCardExpensesTd) monthlyWeeklyTotalCardExpensesTd.textContent = formatCurrency(monthlyData.totalCardExpenses);
              if(monthlyWeeklyTotalExpensesCashCardSumTd) monthlyWeeklyTotalExpensesCashCardSumTd.textContent = formatCurrency(monthlyData.totalExpensesCashCard);
             if(monthlyWeeklyCashBalanceTd) monthlyWeeklyCashBalanceTd.textContent = formatCurrency(monthlyData.cashBalance); // Display monthly cash balance
             if(monthlyWeeklyCardBalanceTd) monthlyWeeklyCardBalanceTd.textContent = formatCurrency(monthlyData.cardBalance); // Display monthly card balance
             if(monthlyWeeklyTotalBalanceTd) monthlyWeeklyTotalBalanceTd.textContent = formatCurrency(monthlyData.totalBalance); // Display monthly total balance
         }
     };


    // Συνάρτηση για την εμφάνιση του Food Cost με αναλυτικά δεδομένα
    const displayMonthlyFoodCost = (totalIncome, totalFcExpenses, foodCostPercentage) => {
         if (totalIncome > 0 || totalFcExpenses > 0) {
             if (monthlyFoodCostContainer) monthlyFoodCostContainer.style.display = 'block';
             if (monthlyTotalFcExpensesSpan) monthlyTotalFcExpensesSpan.textContent = formatCurrency(totalFcExpenses);
             if (monthlyTotalIncomeForFcSpan) monthlyTotalIncomeForFcSpan.textContent = formatCurrency(totalIncome);
             if (monthlyFoodCostValueSpan) monthlyFoodCostValueSpan.textContent = formatPercentage(foodCostPercentage);
         } else {
              if (monthlyFoodCostContainer) monthlyFoodCostContainer.style.display = 'none';
              if (monthlyTotalFcExpensesSpan) monthlyTotalFcExpensesSpan.textContent = formatCurrency(0);
              if (monthlyTotalIncomeForFcSpan) monthlyTotalIncomeForFcSpan.textContent = formatCurrency(0);
              if (monthlyFoodCostValueSpan) monthlyFoodCostValueSpan.textContent = 'N/A';
         }
     };

     // Συνάρτηση για τη δημιουργία του κειμένου ερμηνείας Food Cost (προσαρμοσμένη για μήνα)
     const getMonthlyFoodCostInterpretationText = (totalIncome, totalCashIncome, totalCardIncome, totalFcExpenses, totalFcExpensesCashCard, totalFcExpensesCredit, foodCostPercentage, monthYearString) => {
         if (isNaN(foodCostPercentage) || !isFinite(foodCostPercentage) || (totalIncome === 0 && totalFcExpenses === 0)) {
             if (monthlyFoodCostInterpretationDiv) monthlyFoodCostInterpretationDiv.style.display = 'none';
             return '';
         }

         if (monthlyFoodCostInterpretationDiv) monthlyFoodCostInterpretationDiv.style.display = 'block';

         const [year, month] = monthYearString.split('-');
         const monthNames = ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
                           "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"];
         const monthName = monthNames[parseInt(month, 10) - 1];

         let interpretation = `**Ανάλυση Food Cost (FC) για τον ${monthName} ${year}:**`;

         interpretation += ` Το Food Cost (FC) για τον ${monthName} ανέρχεται σε **${formatPercentage(foodCostPercentage)}**. `;

         interpretation += `Αυτό το ποσοστό προκύπτει από τη διαίρεση των συνολικών εξόδων FC (${formatCurrency(totalFcExpenses)}) με τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για τον συγκεκριμένο μήνα.`;

         // Προσθήκη ανάλυσης εξόδων FC
         if (totalFcExpensesCashCard > 0 && totalFcExpensesCredit > 0) {
              interpretation += ` Τα συνολικά έξοδα FC (${formatCurrency(totalFcExpenses)}) για τον ${monthName} αποτελούνται από έξοδα που πληρώθηκαν με Μετρητά/Κάρτα (${formatCurrency(totalFcExpensesCashCard)}) και έξοδα που καταγράφηκαν ως επί Πίστωση (${formatCurrency(totalFcExpensesCredit)}).`;
         } else if (totalFcExpensesCashCard > 0) {
              interpretation += ` Όλα τα έξοδα FC (${formatCurrency(totalFcExpenses)}) για τον ${monthName} πληρώθηκαν με Μετρητά/Κάρτα.`;
         } else if (totalFcExpensesCredit > 0) {
              interpretation += ` Όλα τα έξοδα FC (${formatCurrency(totalFcExpenses)}) για τον ${monthName} καταγράφηκαν ως επί Πίστωση.`;
         } else {
              interpretation += ` Δεν καταγράφηκαν αναλυτικά έξοδα FC για τον ${monthName}.`;
         }


          // Προσθήκη ανάλυσης εσόδων
         if (totalCashIncome > 0 && totalCardIncome > 0) {
              interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για τον ${monthName} προκύπτουν από έσοδα Μετρητά (${formatCurrency(totalCashIncome)}) και έσοδα Κάρτα (${formatCurrency(totalCardIncome)}).`;
         } else if (totalCashIncome > 0) {
              interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για τον ${monthName} προκύπτουν εξ ολοκλήρου από έσοδα Μετρητά.`;
         } else if (totalCardIncome > 0) {
             interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) για τον ${monthName} προκύπτουν εξ ολοκλήρου από έσοδα Κάρτα.`;
         } else {
              interpretation += ` Δεν καταγράφηκαν έσοδα για τον ${monthName}.`;
         }


         // Ερμηνεία βάση ποσοστού - Προσαρμογή για μήνα
         interpretation += `<br><br>Στην εστίαση, το Food Cost είναι η καρδιά της διαχείρισης κόστους και ένας κρίσιμος δείκτης για την οικονομική υγεία. Με μηνιαίο ποσοστό FC **${formatPercentage(foodCostPercentage)}**, παρατηρούμε τα εξής:`;

         if (foodCostPercentage < 28) {
             interpretation += `<br>- Αυτό το εξαιρετικά χαμηλό ποσοστό υποδηλώνει **υποδειγματική διαχείριση** των πρώτων υλών σας για τον ${monthName}. Είστε πολύ αποτελεσματικοί στις αγορές, την αποθήκευση, τον έλεγχο μερίδων και τη μείωση της σπατάλης. Αυτό συνεισφέρει άμεσα σε υψηλά μικτά κέρδη. Συνιστάται να επανεξετάσετε την τιμολόγηση ή/και το μείγμα πωλήσεων αν διαπιστώσετε ότι το FC είναι σταθερά πολύ χαμηλό.`;
         } else if (foodCostPercentage >= 28 && foodCostPercentage < 33) {
             interpretation += `<br>- Το ποσοστό **${formatPercentage(foodCostPercentage)}** για τον ${monthName} θεωρείται **πολύ καλό** για τα περισσότερα εστιατόρια, δείχνοντας υγιείς λειτουργίες στο κόστος των υλικών. Μπορείτε να εστιάσετε σε μικρές βελτιώσεις όπως διαπραγμάτευση τιμών ή περαιτέρω μείωση της σπατάλης.`;
         } else if (foodCostPercentage >= 33 && foodCostPercentage < 38) {
              interpretation += `<br>- Το Food Cost στο **${formatPercentage(foodCostPercentage)}** για τον ${monthName} βρίσκεται σε **αποδεκτά, αλλά οριακά επίπεδα**. Ένα σημαντικό μέρος των εσόδων απορροφάται από το κόστος υλικών. Απαιτείται **άμεση εστίαση** στον έλεγχο: προμηθευτές, παραλαβές, σπατάλη, μερίδες, και ανάλυση προϊόντων με υψηλό FC.`;
         } else if (foodCostPercentage >= 38 && foodCostPercentage < 45) {
             interpretation += `<br>- Το ποσοστό **${formatPercentage(foodCostPercentage)}** για τον ${monthName} θεωρείται **υψηλό** και αποτεύει **σοβαρό προειδοποιητικό σημάδι** για την κερδοφορία. Απαιτείται **επείγουσα και συστηματική διερεύνηση** σε όλα τα στάδια: αγορές, αποθήκευση, έλεγχος αποθεμάτων, σπατάλη, μερίδες, απώλειες και τιμολόγηση/μενού.`;
         } else { // foodCostPercentage >= 45
              interpretation += `<br>- Ένα Food Cost στο **${formatPercentage(foodCostPercentage)}** για τον ${monthName} είναι **πολύ υψηλό** και υποδηλώνει **σοβαρά προβλήματα** στη διαχείριση του κόστους υλικών, απειλώντας την οικονομική βιωσιμότητα. Απαιτείται **άμεση και ριζική επανεξέταση και βελτίωση** όλων των διαδικασιών διαχείρισης πρώτων υλών.`;
         }


         return interpretation;
     };


    // Συνάρτηση για την προετοιμασία και την ενημέρωση των γραφημάτων
    const updateMonthlyCharts = (monthlyData) => {
        // Καταστροφή προηγούμενων γραφημάτων αν υπάρχουν
        if (monthlyTotalComparisonChart) {
            monthlyTotalComparisonChart.destroy();
        }
        if (monthlyWeeklyComparisonChart) { // Καταστροφή εβδομαδιαίου γραφήματος
            monthlyWeeklyComparisonChart.destroy();
        }


        // --- Γράφημα Συνολικής Σύγκρισης Μήνα (Pie Chart) ---
        const monthlyTotalComparisonPieChartCanvas = monthlyTotalComparisonPieChartCanvasElement ? monthlyTotalComparisonPieChartCanvasElement.getContext('2d') : null;
        const monthlyTotalComparisonChartContainer = monthlyTotalComparisonPieChartCanvasElement ? monthlyTotalComparisonPieChartCanvasElement.closest('.chart-container') : null;


        if (monthlyTotalComparisonPieChartCanvas && (monthlyData.totalIncome > 0 || monthlyData.totalExpensesCashCard > 0)) {
             if (monthlyTotalComparisonChartContainer) monthlyTotalComparisonChartContainer.style.display = 'block';
             monthlyTotalComparisonChart = new Chart(monthlyTotalComparisonPieChartCanvas, {
                 type: 'pie',
                 data: {
                    labels: ['Συνολικά Έσοδα', 'Συνολικά Έξοδα (Μετρητά & Κάρτα)'],
                    datasets: [{
                        data: [monthlyData.totalIncome, monthlyData.totalExpensesCashCard], // Χρήση των συνόλων του πίνακα σύνοψης
                        backgroundColor: ['#28a745', '#dc3545'], // Πράσινο για έσοδα, Κόκκινο για έξοδα
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
             if (monthlyTotalComparisonChartContainer) monthlyTotalComparisonChartContainer.style.display = 'none';
        }


        // --- ΓΡΑΦΗΜΑ: Εβδομαδιαία Σύγκριση (Bar Chart) ---
         const monthlyWeeklyComparisonChartCanvas = monthlyWeeklyComparisonChartCanvasElement ? monthlyWeeklyComparisonChartCanvasElement.getContext('2d') : null;
         const monthlyWeeklyComparisonChartContainer = monthlyWeeklyComparisonChartCanvasElement ? monthlyWeeklyComparisonChartCanvasElement.closest('.chart-container') : null;

         const weeklyTotals = monthlyData.weeklyBreakdown;
         const weeklyStarts = Object.keys(weeklyTotals).sort(); // Ταξινόμηση εβδομάδων

         // Προετοιμασία δεδομένων για το γράφημα
         const weekLabels = weeklyStarts.map(startOfWeekString => {
              const endOfWeekString = getEndOfWeek(startOfWeekString);
              // Μορφοποίηση ημερομηνιών για εμφάνιση (π.χ. 06/05 - 12/05)
              const startDay = startOfWeekString.substring(8, 10);
              const startMonth = startOfWeekString.substring(5, 7);
              const endDay = endOfWeekString.substring(8, 10);
              const endMonth = endOfWeekString.substring(5, 7);
              return `${startDay}/${startMonth} - ${endDay}/${endMonth}`;
         });

         const weeklyIncomeData = weeklyStarts.map(startOfWeek => weeklyTotals[startOfWeek].totalIncome);
         const weeklyExpensesData = weeklyStarts.map(startOfWeek => weeklyTotals[startOfWeek].totalExpensesCashCard); // Έξοδα Μετρητά + Κάρτα
         const weeklyBalanceData = weeklyStarts.map(startOfWeek => weeklyTotals[startOfWeek].totalBalance); // Υπόλοιπο Μετρητά + Κάρτα


         // Ελέγχουμε αν υπάρχει έστω και μια εβδομάδα με δεδομένα για το γράφημα
         const hasWeeklyChartData = weeklyIncomeData.some(amount => amount > 0) ||
                                     weeklyExpensesData.some(amount => amount > 0) ||
                                     weeklyBalanceData.some(amount => amount !== 0); // Υπόλοιπο μπορεί να είναι και αρνητικό/μηδέν


         if (monthlyWeeklyComparisonChartCanvas && hasWeeklyChartData) {
              if (monthlyWeeklyComparisonChartContainer) monthlyWeeklyComparisonChartContainer.style.display = 'block';
              if (noMonthlyWeeklyChartMessage) noMonthlyWeeklyChartMessage.style.display = 'none';

             monthlyWeeklyComparisonChart = new Chart(monthlyWeeklyComparisonChartCanvas, {
                 type: 'bar', // Γράφημα μπάρας
                 data: {
                     labels: weekLabels,
                     datasets: [
                         {
                             label: 'Συνολικά Έσοδα',
                             data: weeklyIncomeData,
                             backgroundColor: '#28a745', // Πράσινο
                              borderColor: '#fff',
                              borderWidth: 1
                         },
                         {
                             label: 'Συνολικά Έξοδα (Μ+Κ)', // Σύντομη ετικέτα για τους άξονες
                             data: weeklyExpensesData,
                             backgroundColor: '#dc3545', // Κόκκινο
                              borderColor: '#fff',
                              borderWidth: 1
                         },
                         {
                             label: 'Συνολικό Υπόλοιπο',
                             data: weeklyBalanceData,
                             backgroundColor: '#007bff', // Μπλε
                              borderColor: '#fff',
                              borderWidth: 1
                         }
                     ]
                 },
                 options: {
                     responsive: true,
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
                         y: { // Άξονας Υ (Ποσά)
                             beginAtZero: false, // Τα υπόλοιπα μπορεί να είναι αρνητικά
                              ticks: {
                                  callback: function(value) {
                                       return formatCurrency(value).replace('€', ''); // Εμφάνιση μόνο του αριθμού (το € είναι στο tooltip)
                                  }
                              }
                         },
                          x: { // Άξονας Χ (Εβδομάδες)
                              // Καμία ειδική ρύθμιση για τώρα
                          }
                     }
                 },
             });

         } else {
              if (monthlyWeeklyComparisonChartContainer) monthlyWeeklyComparisonChartContainer.style.display = 'none';
              if (noMonthlyWeeklyChartMessage) noMonthlyWeeklyChartMessage.style.display = 'block'; // Εμφάνιση μηνύματος αν δεν υπάρχουν δεδομένα
         }
    };


    // Κύρια συνάρτηση για τη δημιουργία της μηνιαίας αναφοράς
    const generateMonthlyReport = (yearMonthString) => {
        if (!yearMonthString) {
             // Εμφάνιση άδειων δεδομένων και απόκρυψη τμημάτων
             const emptySummary = {
                 yearMonthString: '',
                 totalCashIncome: 0, totalCardIncome: 0, totalIncome: 0,
                 totalCashExpenses: 0, totalCardExpenses: 0, totalCreditExpenses: 0,
                 totalFcExpenses: 0, totalFcExpensesCashCard: 0, totalFcExpensesCredit: 0,
                 totalExpensesCashCard: 0, cashBalance: 0, cardBalance: 0, totalBalance: 0,
                 foodCostPercentage: 0, supplierCredit: {}, weeklyBreakdown: {} // Προσθήκη weeklyBreakdown
             };

             displayMonthlySummary(emptySummary);
             displayMonthlySupplierCredit(emptySummary); // Περνάμε τα άδεια δεδομένα
             displayMonthlyFoodCost(emptySummary.totalIncome, emptySummary.totalFcExpenses, emptySummary.foodCostPercentage);
             displayMonthlyWeeklyBreakdown(emptySummary); // Καθαρισμός και του εβδομαδιαίου πίνακα


             // Κρύβουμε και καθαρίζουμε το κείμενο ερμηνείας Food Cost
             if(monthlyFoodCostInterpretationDiv) {
                 monthlyFoodCostInterpretationDiv.style.display = 'none';
                 monthlyFoodCostInterpretationDiv.innerHTML = '';
             }

             updateMonthlyCharts(emptySummary); // Καταστροφή/Επαναφορά γραφημάτων (περιλαμβάνει και το εβδομαδιαίο)

             // Επαναφορά κειμένου μήνα
             if (selectedMonthDisplaySpan) selectedMonthDisplaySpan.textContent = 'τον επιλεγμένο μήνα';

             // Απόκρυψη κουμπιού εξαγωγής PDF
             if(exportMonthlyPdfButton) exportMonthlyPdfButton.style.display = 'none';

             return;
        }

        const monthlyData = calculateMonthlyData(yearMonthString); // Υπολογισμός όλων των δεδομένων

        displayMonthlySummary(monthlyData);
        displayMonthlySupplierCredit(monthlyData); // Εμφάνιση πίνακα προμηθευτών
        displayMonthlyFoodCost(monthlyData.totalIncome, monthlyData.totalFcExpenses, monthlyData.foodCostPercentage);
        displayMonthlyWeeklyBreakdown(monthlyData); // Εμφάνιση εβδομαδιαίου πίνακα


         // Εμφάνιση κειμένου ερμηνείας Food Cost
         if(monthlyFoodCostInterpretationDiv){
              monthlyFoodCostInterpretationDiv.innerHTML = getMonthlyFoodCostInterpretationText(
                  monthlyData.totalIncome,
                  monthlyData.totalCashIncome,
                  monthlyData.totalCardIncome,
                  monthlyData.totalFcExpenses,
                  monthlyData.totalFcExpensesCashCard,
                  monthlyData.totalFcExpensesCredit,
                  monthlyData.foodCostPercentage,
                  yearMonthString
              );
         }


        updateMonthlyCharts(monthlyData); // Ενημέρωση γραφημάτων (περιλαμβάνει και το εβδομαδιαίο)

        // Ενημέρωση της εμφάνισης του μήνα
        const [year, month] = yearMonthString.split('-');
         const monthNames = ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
                           "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"];
         const monthName = monthNames[parseInt(month, 10) - 1];
        if (selectedMonthDisplaySpan) selectedMonthDisplaySpan.textContent = `τον ${monthName} ${year}`;

         // Εμφάνιση κουμπιού εξαγωγής PDF
         // Εμφανίζεται μόνο αν υπάρχουν δεδομένα σε οποιονδήποτε πίνακα ή γράφημα
         const hasAnyData = (monthlySummaryTable && monthlySummaryTable.style.display !== 'none') ||
                            (monthlySupplierCreditTable && monthlySupplierCreditTable.style.display !== 'none') ||
                            (monthlyWeeklyBreakdownTable && monthlyWeeklyBreakdownTable.style.display !== 'none') ||
                             (monthlyFoodCostContainer && monthlyFoodCostContainer.style.display !== 'none') || // Check Food Cost visibility
                            (monthlyTotalComparisonPieChartCanvasElement && monthlyTotalComparisonPieChartCanvasElement.closest('.chart-container').style.display !== 'none') || // Check Pie Chart visibility
                            (monthlyWeeklyComparisonChartCanvasElement && monthlyWeeklyComparisonChartCanvasElement.closest('.chart-container').style.display !== 'none'); // Check Weekly Chart visibility


          if (hasAnyData) {
             if(exportMonthlyPdfButton) exportMonthlyPdfButton.style.display = 'block';
         } else {
             if(exportMonthlyPdfButton) exportMonthlyPdfButton.style.display = 'none';
         }
    };

    // --- Λειτουργία Εξαγωγής PDF για Μηνιαία Αναφορά ---

    const exportMonthlyReportToPdf = () => {
        const selectedMonthYear = monthYearInput.value;
        if (!selectedMonthYear) {
            alert('Παρακαλώ επιλέξτε μήνα και έτος για την αναφορά.');
            return;
        }

        const monthlyData = calculateMonthlyData(selectedMonthYear);

         // Ελέγχουμε αν υπάρχουν καθόλου δεδομένα για εξαγωγή
         if (monthlyData.totalIncome === 0 && monthlyData.totalCashExpenses === 0 && monthlyData.totalCardExpenses === 0 && monthlyData.totalCreditExpenses === 0 && monthlyData.totalFcExpenses === 0) {
              alert(`Δεν υπάρχουν καταχωρημένα έσοδα ή έξοδα για το μήνα ${selectedMonthYear} για εξαγωγή.`);
              return;
         }


         const [year, month] = selectedMonthYear.split('-');
         const monthNames = ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου",
                           "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"];
         const monthName = monthNames[parseInt(month, 10) - 1];
         const formattedMonthYear = `${monthName} ${year}`;


        // --- Περιεχόμενο PDF ---

        const pdfContent = [];

        pdfContent.push({ text: 'Μηνιαία Οικονομική Αναφορά', style: 'header' });
        pdfContent.push({ text: `Μήνας: ${formattedMonthYear}`, style: 'subheader' });

        // Πίνακας Σύνοψης (στο PDF)
        // Εμφανίζουμε τον πίνακα σύνοψης στο PDF μόνο αν υπάρχουν δεδομένα για αυτόν
        if (monthlyData.totalIncome > 0 || monthlyData.totalExpensesCashCard > 0 || monthlyData.totalCreditExpenses > 0) {
             pdfContent.push({ text: 'Σύνοψη Μήνα:', style: 'sectionHeader', margin: [0, 10, 0, 5] });
             pdfContent.push({
                  table: {
                      widths: ['*', 'auto'],
                      body: [
                          [{ text: 'Κατηγορία', style: 'tableHeaderSummary' }, { text: 'Ποσό (€)', style: 'tableHeaderSummary', alignment: 'right' }], // Custom style for summary header
                          ['Έσοδα Μετρητά:', { text: formatCurrency(monthlyData.totalCashIncome), alignment: 'right' }],
                          ['Έσοδα Κάρτα:', { text: formatCurrency(monthlyData.totalCardIncome), alignment: 'right' }],
                          [{ text: 'Συνολικά Έσοδα:', bold: true }, { text: formatCurrency(monthlyData.totalIncome), bold: true, alignment: 'right' }],
                          [{ text: '', colSpan: 2, border: [false, false, false, true], margin: [0, 5, 0, 5] }, ''],
                          ['Έξοδα Μετρητά:', { text: formatCurrency(monthlyData.totalCashExpenses), alignment: 'right' }],
                          ['Έξοδα Κάρτα:', { text: formatCurrency(monthlyData.totalCardExpenses), alignment: 'right' }],
                           [{ text: 'Συνολικά Έξοδα (Μετρητά & Κάρτα):', bold: true }, { text: formatCurrency(monthlyData.totalExpensesCashCard), bold: true, alignment: 'right' }],
                          ['Έξοδα Επί Πιστώσει:', { text: formatCurrency(monthlyData.totalCreditExpenses), alignment: 'right' }],
                          [{ text: '', colSpan: 2, border: [false, false, false, true], margin: [0, 5, 0, 5] }, ''],
                          ['Υπόλοιπο Μετρητών:', { text: formatCurrency(monthlyData.cashBalance), alignment: 'right' }],
                          ['Υπόλοιπο Καρτών:', { text: formatCurrency(monthlyData.cardBalance), alignment: 'right' }],
                          [{ text: 'Υπόλοιπο Συνολικού Ταμείου:', bold: true }, { text: formatCurrency(monthlyData.totalBalance), bold: true, alignment: 'right' }],
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


        // Πίνακας Εξόδων Επί Πιστώσει ανά Προμηθευτή (στο PDF)
         const sortedSuppliers = Object.entries(monthlyData.supplierCredit).filter(([supplier, amount]) => amount > 0).sort(([, amountA], [, amountB]) => amountB - amountA);

         if (sortedSuppliers.length > 0) {
              // Προσθέτουμε pageBreak: 'before' αν χρειάζεται να πάει σε νέα σελίδα
             pdfContent.push({ text: 'Συνολικά Έξοδα Επί Πιστώσει ανά Προμηθευτή (Μηνιαία):', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Add pageBreak if there was previous content


             const supplierCreditTableBodyPdf = [
                 // Επικεφαλίδα πίνακα
                 [{ text: 'Όνομα Προμηθευτή', style: 'tableHeaderSummary' }, { text: 'Σύνολο Επί Πίστωση (€)', style: 'tableHeaderSummary', alignment: 'right' }] // Custom style for supplier header
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
                 { text: formatCurrency(monthlyData.totalCreditExpenses), bold: true, alignment: 'right' } // Συνολικό ποσό επί πιστώσει
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

         // Εβδομαδιαία Ανάλυση (στο PDF)
         const weeklyStarts = Object.keys(monthlyData.weeklyBreakdown).sort();

         // Ελέγχουμε αν υπάρχει έστω και μια εβδομάδα με δεδομένα για να εμφανίσουμε τον πίνακα
          const hasWeeklyDataForPdf = Object.values(monthlyData.weeklyBreakdown).some(week =>
              week.cashIncome > 0 || week.cardIncome > 0 || week.cashExpenses > 0 || week.cardExpenses > 0 || week.creditExpenses > 0 // Ελέγχουμε για οποιοδήποτε ποσό > 0
         );


         if (hasWeeklyDataForPdf) {
             // Προσθέτουμε pageBreak: 'before' αν χρειάζεται να πάει σε νέα σελίδα
             pdfContent.push({ text: 'Ανάλυση Εβδομάδας ανά Μήνα:', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Add pageBreak if there was previous content

              // Προσαρμόζουμε τα πλάτη των στηλών για τον εβδομαδιαίο πίνακα PDF
              // Needs 10 columns: Week | CI | CardI | TotalI | CE | CardE | TotalE (C+C) | CB | CardB | TotalB
             const weeklyTableWidths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];


             const weeklyBreakdownTableBodyPdf = [
                 // Επικεφαλίδα πίνακα - ΠΡΟΣΟΧΗ: οι επικεφαλίδες πρέπει να ταιριάζουν με τον αριθμό των στηλών
                 [{ text: 'Εβδομάδα', style: 'tableHeaderBreakdown' }, // Custom style for breakdown header
                  { text: 'Ε. Μετρητά (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Ε. Κάρτα (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Συν. Έσοδα (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Συνολικά Έσοδα Εβδομάδας
                  { text: 'Εξ. Μετρητά (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Εξ. Κάρτα (€)', style: 'tableHeaderBreakdown', alignment: 'right' },
                  { text: 'Συν. Έξοδα (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Συνολικά Έξοδα Εβδομάδας (Μετρητά+Κάρτα)
                  { text: 'Υπ. Μετρητών (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Υπόλοιπο Μετρητών Εβδομάδας
                  { text: 'Υπ. Καρτών (€)', style: 'tableHeaderBreakdown', alignment: 'right' }, // Υπόλοιπο Καρτών Εβδομάδας
                  { text: 'Συν. Υπόλοιπο (€)', style: 'tableHeaderBreakdown', alignment: 'right' } // Συνολικό Υπόλοιπο Εβδομάδας
                  ]
             ];

             weeklyStarts.forEach(startOfWeekString => {
                 const weekData = monthlyData.weeklyBreakdown[startOfWeekString];
                 const endOfWeekString = getEndOfWeek(startOfWeekString);
                  // Μορφοποίηση ημερομηνιών για εμφάνιση (π.χ. 06/05 - 12/05)
                 const startDay = startOfWeekString.substring(8, 10);
                 const startMonth = startOfWeekString.substring(5, 7);
                 const endDay = endOfWeekString.substring(8, 10);
                 const endMonth = endOfWeekString.substring(5, 7);

                 const weekRange = `${startDay}/${startMonth} - ${endDay}/${endMonth}`;


                 weeklyBreakdownTableBodyPdf.push([
                     weekRange,
                     { text: formatCurrency(weekData.cashIncome), alignment: 'right' },
                     { text: formatCurrency(weekData.cardIncome), alignment: 'right' },
                     { text: formatCurrency(weekData.totalIncome), alignment: 'right' }, // Συνολικά Έσοδα Εβδομάδας
                     { text: formatCurrency(weekData.cashExpenses), alignment: 'right' },
                     { text: formatCurrency(weekData.cardExpenses), alignment: 'right' },
                     { text: formatCurrency(weekData.totalExpensesCashCard), alignment: 'right' }, // Συνολικά Έξοδα Εβδομάδας (Μετρητά+Κάρτα)
                     { text: formatCurrency(weekData.cashBalance), alignment: 'right' }, // Υπόλοιπο Μετρητών Εβδομάδας
                     { text: formatCurrency(weekData.cardBalance), alignment: 'right' }, // Υπόλοιπο Καρτών Εβδομάδας
                     { text: formatCurrency(weekData.totalBalance), alignment: 'right' } // Συνολικό Υπόλοιπο Εβδομάδας
                 ]);
             });

              // Προσθήκη γραμμής συνόλου στο footer του PDF πίνακα εβδομαδιαίας ανάλυσης
              // Χρησιμοποιούμε τα συνολικά μηνιαία δεδομένα για το footer
              weeklyBreakdownTableBodyPdf.push([
                 { text: 'Σύνολα Μήνα:', bold: true }, // Ετικέτα
                 { text: formatCurrency(monthlyData.totalCashIncome), bold: true, alignment: 'right' },
                 { text: formatCurrency(monthlyData.totalCardIncome), bold: true, alignment: 'right' },
                 { text: formatCurrency(monthlyData.totalIncome), bold: true, alignment: 'right' }, // Συνολικά Έσοδα Μήνα
                 { text: formatCurrency(monthlyData.totalCashExpenses), bold: true, alignment: 'right' },
                 { text: formatCurrency(monthlyData.totalCardExpenses), bold: true, alignment: 'right' },
                 { text: formatCurrency(monthlyData.totalExpensesCashCard), bold: true, alignment: 'right' }, // Συνολικά Έξοδα Μήνα (Μετρητά+Κάρτα)
                 { text: formatCurrency(monthlyData.cashBalance), bold: true, alignment: 'right' }, // Υπόλοιπο Μετρητών Μήνα
                 { text: formatCurrency(monthlyData.cardBalance), bold: true, alignment: 'right' }, // Υπόλοιπο Καρτών Μήνα
                 { text: formatCurrency(monthlyData.totalBalance), bold: true, alignment: 'right' } // Συνολικό Υπόλοιπο Μήνα
             ]);


             pdfContent.push({
                 table: {
                     widths: weeklyTableWidths, // Χρήση των ορισμένων widths
                     body: weeklyBreakdownTableBodyPdf,
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


         // Γράφημα Εβδομαδιαίας Σύγκρισης (στο PDF - ως εικόνα)
         const monthlyWeeklyComparisonChartContainer = monthlyWeeklyComparisonChartCanvasElement ? monthlyWeeklyComparisonChartCanvasElement.closest('.chart-container') : null;
         // Ελέγχουμε αν το γράφημα δημιουργήθηκε και είναι ορατό
         if (monthlyWeeklyComparisonChart && monthlyWeeklyComparisonChartContainer && monthlyWeeklyComparisonChartContainer.style.display !== 'none') {
             try {
                 // Προσθέτουμε pageBreak: 'before' αν χρειάζεται
                 pdfContent.push({ text: 'Εξέλιξη Εσόδων, Εξόδων και Υπολοίπου ανά Εβδομάδα:', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null }); // Add pageBreak if there was previous content

                 // Μετατροπή του γραφήματος σε εικόνα Base64
                 const chartImage = monthlyWeeklyComparisonChart.toBase64Image();

                 // Προσθήκη της εικόνας στο PDF
                 pdfContent.push({
                     image: chartImage,
                     width: 550, // Προσαρμόστε το πλάτος της εικόνας στο PDF
                     alignment: 'center',
                     margin: [0, 10, 0, 10]
                 });

             } catch (error) {
                 console.error("Error exporting weekly comparison chart to PDF:", error);
                 // Μπορείτε να προσθέσετε ένα μήνυμα στο PDF ότι το γράφημα δεν μπόρεσε να εξαχθεί
                  pdfContent.push({ text: 'Σημείωση: Το γράφημα εβδομαδιαίας εξέλιξης δεν μπόρεσε να εξαχθεί σε PDF.', italics: true, color: '#dc3545', margin: [0, 10, 0, 10] });
             }
         }


         // Εμφάνιση Food Cost αν υπολογίστηκε - Πιο αναλυτικό στο PDF
        if (monthlyData.totalIncome > 0 || monthlyData.totalFcExpenses > 0) {

             // Προσθήκη κειμένου ερμηνείας Food Cost στο PDF
             const interpretationText = getMonthlyFoodCostInterpretationText(
                 monthlyData.totalIncome,
                 monthlyData.totalCashIncome,
                 monthlyData.totalCardIncome,
                 monthlyData.totalFcExpenses,
                 monthlyData.totalFcExpensesCashCard,
                 monthlyData.totalFcExpensesCredit,
                 monthlyData.foodCostPercentage,
                 selectedMonthYear // Pass the month/year string for interpretation text
             );

             // Ελέγχουμε αν η getMonthlyFoodCostInterpretationText επέστρεψε κείμενο (δεν ήταν N/A)
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


        // --- Δημιουργία Λογιστικών Σχολίων (προσαρμοσμένα για μήνα) ---
         const comments = [];

        // Ελέγχουμε αν υπάρχει προηγούμενο περιεχόμενο πριν προσθέσουμε pageBreak
        comments.push({ text: 'Λογιστική Σύνοψη Μήνα:', style: 'commentsHeader', margin: [0, 20, 0, 5], pageBreak: (pdfContent.length > 2) ? 'before' : null });


        // Επανάληψη λογικής σχολίων για το PDF
        if (monthlyData.totalBalance > 0) {
             comments.push({ text: `Ο μήνας παρουσιάζει συνολικό πλεόνασμα ταμείου ${formatCurrency(monthlyData.totalBalance)} (Συνολικά Έσοδα μείον Συνολικά Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        } else if (monthlyData.totalBalance < 0) {
             comments.push({ text: `Ο μήνας παρουσιάζει συνολικό έλλειμμα ταμείου ${formatCurrency(Math.abs(monthlyData.totalBalance))} (Συνολικά Έσοδα μείον Συνολικά Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        } else {
             comments.push({ text: `Ο μήνας παρουσιάζει ισορροπία στο συνολικό ταμείο (τα συνολικά έσοδα Μετρητά + Κάρτα ισούνται με τα συνολικά έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        }
         if (monthlyData.cashBalance > 0) {
             comments.push({ text: `Το υπόλοιπο των μετρητών για τον μήνα είναι θετικό, ανέρχεται σε ${formatCurrency(monthlyData.cashBalance)}.`, margin: [0, 5] });
         } else if (monthlyData.cashBalance < 0) {
             comments.push({ text: `Το υπόλοιπο των μετρητών για τον μήνα είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(monthlyData.cashBalance))}.`, margin: [0, 5] });
         } else {
              comments.push({ text: `Το υπόλοιπο των μετρητών για τον μήνα είναι μηδενικό.`, margin: [0, 5] });
         }
         if (monthlyData.cardBalance > 0) {
             comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για τον μήνα είναι θετικό, ανέρχεται σε ${formatCurrency(monthlyData.cardBalance)}.`, margin: [0, 5] });
         } else if (monthlyData.cardBalance < 0) {
              comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για τον μήνα είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(monthlyData.cardBalance))}.`, margin: [0, 5] });
         } else {
              comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για τον μήνα είναι μηδενικό.`, margin: [0, 5] });
         }
        if (monthlyData.totalCreditExpenses > 0) {
             comments.push({ text: `Σημειώθηκαν έξοδα επί πιστώσει συνολικού ποσού ${formatCurrency(monthlyData.totalCreditExpenses)} για τον μήνα, τα οποία δεν επηρεάζουν το άμεσο ταμείο.`, margin: [0, 5] });
        } else {
             comments.push({ text: `Δεν σημειώθηκαν έξοδα επί πιστώσει για τον μήνα.`, margin: [0, 5] });
        }

        // Προσθήκη των σχολίων στο περιεχόμενο του PDF
        pdfContent.push(...comments);


// --- ΕΠΑΓΓΕΛΜΑΤΙΚΟ DARK THEME STYLING ---
        const darkTheme = {
            background: '#121212',
            text: '#e0e0e0',
            accent: '#3d5afe', // Modern Blue
            tableHeader: '#1e1e1e',
            tableBody: '#262626',
            border: '#333333'
        };

        const pdfStyles = {
            header: {
                fontSize: 22,
                bold: true,
                color: '#ffffff',
                margin: [0, 0, 0, 5],
                alignment: 'center'
            },
            subheader: {
                fontSize: 14,
                color: darkTheme.accent,
                margin: [0, 0, 0, 20],
                alignment: 'center',
                bold: true
            },
            sectionHeader: {
                fontSize: 14,
                bold: true,
                color: '#ffffff',
                fillColor: '#1a1a1a', // background highlight
                margin: [0, 15, 0, 8]
            },
            tableHeaderSummary: {
                bold: true,
                fontSize: 11,
                color: '#ffffff',
                fillColor: '#2c2c2c',
                alignment: 'left',
                padding: [8, 8, 8, 8]
            },
            tableHeaderBreakdown: {
                bold: true,
                fontSize: 9,
                color: '#ffffff',
                fillColor: '#2c2c2c',
                alignment: 'center',
                padding: [4, 8, 4, 8]
            },
            tableCell: {
                fontSize: 10,
                color: darkTheme.text,
                padding: [5, 5, 5, 5]
            },
            commentsHeader: {
                fontSize: 14,
                bold: true,
                color: darkTheme.accent,
                margin: [0, 20, 0, 10]
            }
        };

        const docDefinition = {
            // Προσθήκη Background σε κάθε σελίδα
            background: function(currentPage, pageSize) {
                return {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0, y: 0,
                            w: pageSize.width,
                            h: pageSize.height,
                            color: darkTheme.background
                        }
                    ]
                };
            },
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10,
                color: darkTheme.text
            },
            content: pdfContent,
            styles: pdfStyles,
            info: {
                title: `Μηνιαία Αναφορά ${formattedMonthYear}`,
                author: 'Finance Pro System',
            },
            pageOrientation: 'landscape',
            pageMargins: [30, 30, 30, 30]
        };

        // Ρύθμιση των layouts των πινάκων για Dark Mode
        const darkTableLayout = {
            hLineWidth: (i, node) => 1,
            vLineWidth: (i, node) => 0,
            hLineColor: (i, node) => darkTheme.border,
            paddingLeft: (i) => 8,
            paddingRight: (i) => 8,
            paddingTop: (i) => 6,
            paddingBottom: (i) => 6,
            fillColor: function (rowIndex, node, columnIndex) {
                return (rowIndex % 2 === 0) ? '#1a1a1a' : '#212121'; // Zebra striping
            }
        };

        // Εφάρμοσε το layout σε όλους τους πίνακες μέσα στο pdfContent
        pdfContent.forEach(item => {
            if (item.table) {
                item.layout = darkTableLayout;
            }
        });

        // Δημιουργία του PDF και εξαγωγή
        pdfMake.createPdf(docDefinition).getDataUrl(function(dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Μηνιαία_Αναφορα_${selectedMonthYear}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };


    // --- Event Listeners ---

    // Όταν αλλάζει ο μήνας στο date picker (type="month")
    if(monthYearInput) {
        monthYearInput.addEventListener('change', (event) => {
            const selectedMonthYear = event.target.value; // Έχει τη μορφή YYYY-MM
             if (selectedMonthYear) {
                  localStorage.setItem('lastSelectedMonthReport', selectedMonthYear); // Αποθήκευση της επιλογής
                  generateMonthlyReport(selectedMonthYear); // Δημιουργία αναφοράς για τον επιλεγμένο μήνα
             } else {
                  // Αν δεν υπάρχει επιλογή (π.χ. ο χρήστης την έσβησε), κρύψε τα πάντα
                  generateMonthlyReport(''); // Καθαρίζει την αναφορά περνώντας κενή ημερομηνία
             }
        });
    }


     // Event listener για το κουμπί εξαγωγής PDF
    if(exportMonthlyPdfButton) { // Έλεγχος αν υπάρχει το κουμπί πριν προσθέσουμε listener
        exportMonthlyPdfButton.addEventListener('click', exportMonthlyReportToPdf);
    }


    // --- Αρχικοποίηση κατά τη φόρτωση της σελίδας ---

    // Θέτουμε τον τρέχοντα μήνα/έτος ως προεπιλογή ή τον τελευταίο επιλεγμένο
    const savedMonthYear = localStorage.getItem('lastSelectedMonthReport');
    let monthYearToDisplay;

    if (savedMonthYear) {
        monthYearToDisplay = savedMonthYear;
        if(monthYearInput) monthYearInput.value = savedMonthYear; // Έλεγχος πριν την ανάθεση τιμής
    } else {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        monthYearToDisplay = `${currentYear}-${currentMonth}`;
        if(monthYearInput) monthYearInput.value = monthYearToDisplay; // Έλεγχος πριν την ανάθεση τιμής
        localStorage.setItem('lastSelectedMonthReport', monthYearToDisplay); // Αποθήκευση του τρέχοντος μήνα
    }

    // Δημιουργία αναφοράς για τον αρχικό μήνα μόνο αν βρέθηκε το input ημερομηνίας
    if(monthYearInput) {
        generateMonthlyReport(monthYearToDisplay);
    } else {
        console.error("Month/Year input element with ID 'month-year-input' not found.");
        // Μπορείτε να προσθέσετε κώδικα για να κρύψετε τα πάντα ή να δείξετε ένα μήνυμα λάθους εδώ
         if (noMonthlyReportDataMessage) noMonthlyReportDataMessage.style.display = 'block';
         if (noMonthlyReportDataMessage) noMonthlyReportDataMessage.textContent = "Σφάλμα: Δεν βρέθηκε το πεδίο επιλογής μήνα/έτους.";
         if (monthlySummaryTable) monthlySummaryTable.style.display = 'none';
         if (monthlySupplierCreditTable) monthlySupplierCreditTable.style.display = 'none';
         if (monthlyWeeklyBreakdownTable) monthlyWeeklyBreakdownTable.style.display = 'none'; // Κρύψε και τον εβδομαδιαίο πίνακα
         if (monthlyFoodCostContainer) monthlyFoodCostContainer.style.display = 'none';
         if (monthlyFoodCostInterpretationDiv) monthlyFoodCostInterpretationDiv.style.display = 'none';
         if (exportMonthlyPdfButton) exportMonthlyPdfButton.style.display = 'none';

         // Κρύψιμο των chart containers και εμφάνιση μηνύματος αν χρειάζεται
         const chartContainer = document.querySelector('.chart-container'); // Αναφέρεται στον container των συνολικών γραφημάτων
         if (chartContainer) chartContainer.style.display = 'none';
         const weeklyChartContainer = document.querySelector('#monthly-weekly-comparison-chart-container'); // Αναφέρεται στον container του εβδομαδιαίου γραφήματος
         if (weeklyChartContainer) weeklyChartContainer.style.display = 'none';
         if (noMonthlyWeeklyChartMessage) noMonthlyWeeklyChartMessage.style.display = 'block'; // Εμφάνιση μηνύματος για το εβδομαδιαίο γράφημα
         if (noMonthlyWeeklyChartMessage) noMonthlyWeeklyChartMessage.textContent = "Σφάλμα: Δεν βρέθηκαν στοιχεία γραφήματος στην σελίδα ή το πεδίο επιλογής μήνα."; // Πιο ακριβές μήνυμα

    }


    console.log("Το monthly-report.js φορτώθηκε επιτυχώς.");
});