// Βοηθητικές συναρτήσεις για Local Storage (ίδιες με daily-report.js και expenses.js)
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

// Βοηθητική συνάρτηση μορφοποίησης ποσοστών
const formatPercentage = (percentage) => {
     const number = parseFloat(percentage) || 0;
     // Ελέγχουμε για NaN ή Infinity που μπορεί να προκύψουν από διαίρεση με το μηδέν
     if (isNaN(number) || !isFinite(number)) {
         return 'N/A';
     }
     return number.toLocaleString('el-GR', {
         minimumFractionDigits: 2,
         maximumFractionDigits: 2
     }) + '%';
 };


// Βοηθητική συνάρτηση για να πάρει 7 συνεχόμενες ημερομηνίες ξεκινώντας από μια ημερομηνία (YYYY-MM-DD).
// Αυτή η έκδοση βασίζεται σε τοπικές ημερομηνίες για να αποφύγει προβλήματα ζώνης ώρας.
const getSevenDatesStartingFrom = (startDateString) => {
    const dates = [];
    // Δημιουργούμε ένα αντικείμενο Date. Όταν δίνεται μόνο 'YYYY-MM-DD',
    // η JavaScript το ερμηνεύει συνήθως ως μεσάνυχτα στην τοπική ζώνη ώρας.
    const startDate = new Date(startDateString);

    // Έλεγχος για μη έγκυρη ημερομηνία
    if (isNaN(startDate.getTime())) {
        console.error("Invalid start date:", startDateString);
        return [];
    }

    for (let i = 0; i < 7; i++) {
        const nextDay = new Date(startDate); // Αντιγράφουμε την αρχική ημερομηνία
        // Χρησιμοποιούμε setDate για να προσθέσουμε 'i' ημέρες. Το setDate προσαρμόζει αυτόματα τον μήνα/έτος.
        // Αυτός ο υπολογισμός γίνεται με βάση την τοπική ώρα.
        nextDay.setDate(startDate.getDate() + i);

        // Μορφοποιούμε χειροκίνητα την ημερομηνία πίσω σε 'YYYY-MM-DD' από το αντικείμενο Date
        // που τώρα αντιπροσωπεύει τη σωστή "τοπική" ημερολογιακή ημέρα.
        const year = nextDay.getFullYear();
        // getMonth() είναι 0-indexed, προσθέτουμε 1 και συμπληρώνουμε με 0 μπροστά αν χρειάζεται
        const month = (nextDay.getMonth() + 1).toString().padStart(2, '0');
        // getDate() δίνει την ημέρα του μήχα, συμπληρώνουμε με 0 μπροστά αν χρειάζεται
        const day = nextDay.getDate().toString().padStart(2, '0');

        dates.push(`${year}-${month}-${day}`);
    }
    return dates;
};


document.addEventListener('DOMContentLoaded', () => {

    // Αναφορές σε στοιχεία της σελίδας
    const weeklyReportDateInput = document.getElementById('weekly-report-date');
    const weeklyReportDateDisplaySpan = document.getElementById('weekly-report-date-display');
    const weeklySummaryTable = document.getElementById('weekly-summary-table');
    const dailyBreakdownTableBody = document.querySelector('#daily-breakdown-table tbody');
    const supplierCreditTableBody = document.querySelector('#supplier-credit-table tbody');
    const noWeeklyReportDataMessage = document.getElementById('no-weekly-report-data-message');
    const noDailyBreakdownMessage = document.getElementById('no-daily-breakdown-message');
    const noSupplierCreditMessage = document.getElementById('no-supplier-credit-message');
    const exportWeeklyPdfButtonBottom = document.getElementById('export-weekly-pdf-button-bottom'); // Μόνο το κουμπί κάτω υπάρχει πλέον
     const weeklyFoodCostContainer = document.getElementById('weekly-food-cost-container'); // Αναφορά στο container Food Cost
    const weeklyFoodCostValueSpan = document.getElementById('weekly-food-cost-value'); // Αναφορά στην τιμή Food Cost
     const weeklyTotalFcExpensesSpan = document.getElementById('weekly-total-fc-expenses'); // Νέα αναφορά για έξοδα FC
    const weeklyTotalIncomeForFcSpan = document.getElementById('weekly-total-income-for-fc'); // Νέα αναφορά για έσοδα (για FC)
     const weeklyFoodCostInterpretationDiv = document.getElementById('weekly-food-cost-interpretation'); // Νέα αναφορά για το κείμενο ερμηνείας FC


    // Αναφορές στα κελιά του πίνακα σύνοψης
    const weeklyCashIncomeTd = document.getElementById('weekly-cash-income');
    const weeklyCardIncomeTd = document.getElementById('weekly-card-income');
    const weeklyTotalIncomeTd = document.getElementById('weekly-total-income');
    const weeklyCashExpensesTd = document.getElementById('weekly-cash-expenses');
    const weeklyCardExpensesTd = document.getElementById('weekly-card-expenses');
    const weeklyTotalExpensesCashCardTd = document.getElementById('weekly-total-expenses-cash-card');
    const weeklyCreditExpensesTd = document.getElementById('weekly-credit-expenses');
    const weeklyCashBalanceTd = document.getElementById('weekly-cash-balance');
    const weeklyCardBalanceTd = document.getElementById('weekly-card-balance');
    const weeklyTotalBalanceTd = document.getElementById('weekly-total-balance');

     // --- Νέες αναφορές στα κελιά του footer του πίνακα ανάλυσης ημέρας ---
    const dailyBreakdownTotalCashIncomeTd = document.getElementById('daily-breakdown-total-cash-income');
    const dailyBreakdownTotalCardIncomeTd = document.getElementById('daily-breakdown-total-card-income');
    const dailyBreakdownTotalIncomeSumTd = document.getElementById('daily-breakdown-total-income-sum');
    const dailyBreakdownTotalCashExpensesTd = document.getElementById('daily-breakdown-total-cash-expenses');
    const dailyBreakdownTotalCardExpensesTd = document.getElementById('daily-breakdown-total-card-expenses');
     const dailyBreakdownTotalExpensesCashCardSumTd = document.getElementById('daily-breakdown-total-expenses-cash-card-sum');
    const dailyBreakdownCashBalanceTd = document.getElementById('daily-breakdown-cash-balance');
    const dailyBreakdownCardBalanceTd = document.getElementById('daily-breakdown-card-balance');
    const dailyBreakdownTotalBalanceTd = document.getElementById('daily-breakdown-total-balance');

     // --- Νέα αναφορά στο κελί του footer του πίνακα προμηθευτών ---
     const supplierCreditTotalTd = document.getElementById('supplier-credit-total');


    // Αναφορές στο canvas για το γράφημα (μόνο ένα πλέον)
    const weeklyTotalComparisonPieChartCanvas = document.getElementById('weeklyTotalComparisonPieChart').getContext('2d');

    // Μεταβλητές για τα γραφήματα (μία πλέον)
    let weeklyTotalComparisonChart;


    // Συνάρτηση για τον υπολογισμό των συνοπτικών και αναλυτικών δεδομένων για ένα διάστημα 7 ημερών
    const calculateSevenDayData = (startDateString) => {
        const sevenDates = getSevenDatesStartingFrom(startDateString);
        const allIncomeData = getAllIncomeData();
        const allExpensesData = getAllExpensesData();

        // Αρχικοποίηση συνόλων 7 ημερών
        let totalCashIncome = 0;
        let totalCardIncome = 0;
        let totalCashExpenses = 0;
        let totalCardExpenses = 0;
        let totalCreditExpenses = 0;
        let totalFcExpenses = 0; // Συνολικά έξοδα FC (Cash/Card + Credit)
        let totalFcExpensesCashCard = 0; // Νέα μεταβλητή για έξοδα FC (Μετρητά/Κάρτα)
        let totalFcExpensesCredit = 0; // Νέα μεταβλητή για έξοδα FC (Πίστωση)

        const supplierCredit = {}; // Για το σύνολο επί πιστώσει ανά προμηθευτή

        const dailyData = []; // Για την ανάλυση ημέρας ανά διάστημα

        sevenDates.forEach(date => {
            const incomeEntries = allIncomeData[date] || [];
            const expenseEntries = allExpensesData[date] || [];

            let dailyCashIncome = 0;
            let dailyCardIncome = 0;
            let dailyCashExpenses = 0;
            let dailyCardExpenses = 0;
            let dailyCreditExpenses = 0; // Προσθήκη για ημερήσια πίστωση
            let dailyFcExpenses = 0; // Προσθήγη για ημερήσια FC έξοδα (συνολικά FC της ημέρας)
            let dailyFcExpensesCashCard = 0; // Ημερήσια FC έξοδα (Μετρητά/Κάρτα)
            let dailyFcExpensesCredit = 0; // Ημερήσια FC έξοδα (Πίστωση)


            incomeEntries.forEach(entry => {
                dailyCashIncome += parseFloat(entry.cash) || 0; // Χρήση parseFloat
                dailyCardIncome += parseFloat(entry.card) || 0; // Χρήση parseFloat
            });

            expenseEntries.forEach(entry => {
                 const amount = parseFloat(entry.amount) || 0; // Χρήση parseFloat
                if (entry.paymentMethod === 'cash') {
                    dailyCashExpenses += amount;
                } else if (entry.paymentMethod === 'card') {
                    dailyCardExpenses += amount;
                } else if (entry.paymentMethod === 'credit') {
                    dailyCreditExpenses += amount;

                    // Προσθήκη στο σύνολο επί πιστώσει ανά προμηθευτή για το διάστημα 7 ημερών
                    const supplierName = entry.supplier || 'Άγνωστος Προμηθευτής';
                    if (!supplierCredit[supplierName]) {
                        supplierCredit[supplierName] = 0;
                    }
                    supplierCredit[supplierName] += amount;
                }

                 // Έλεγχος για έξοδα τύπου 'FC'
                 // Ελέγχουμε αν το expenseType υπάρχει και είναι 'FC' (ανεξαρτήτως κεφαλαίων/πεζών)
                 if (entry.expenseType && typeof entry.expenseType === 'string' && entry.expenseType.toUpperCase() === 'FC') {
                     dailyFcExpenses += amount; // Αθροίζουμε στα συνολικά FC για τη μέρα
                     if (entry.paymentMethod === 'cash' || entry.paymentMethod === 'card') {
                          dailyFcExpensesCashCard += amount;
                     } else if (entry.paymentMethod === 'credit') {
                          dailyFcExpensesCredit += amount;
                     }
                 }
            });

             // Υπολογισμός ημερήσιων υπολοίπων
            const dailyTotalIncome = dailyCashIncome + dailyCardIncome;
            const dailyTotalExpensesCashCard = dailyCashExpenses + dailyCardExpenses;
            const dailyCashBalance = dailyCashIncome - dailyCashExpenses;
            const dailyCardBalance = dailyCardIncome - dailyCardExpenses;
            const dailyTotalBalance = dailyTotalIncome - dailyTotalExpensesCashCard;


            // Αποθήκευση ημερήσιων δεδομένων για τον πίνακα ανάλυσης (μπορείς να προσθέσεις FC breakdown αν θες να φαίνεται ανά μέρα)
            dailyData.push({
                date: date,
                cashIncome: dailyCashIncome,
                cardIncome: dailyCardIncome,
                totalIncome: dailyTotalIncome,
                cashExpenses: dailyCashExpenses,
                cardExpenses: dailyCardExpenses,
                 totalExpensesCashCard: dailyTotalExpensesCashCard, // Προσθήγη συνόλου εξόδων Μετρητά + Κάρτα για τη μέρα
                creditExpenses: dailyCreditExpenses,
                dailyFcExpenses: dailyFcExpenses, // Συνολικά FC της ημέρας
                // dailyFcExpensesCashCard: dailyFcExpensesCashCard, // Αν θες να τα εμφανίσεις στον πίνακα
                // dailyFcExpensesCredit: dailyFcExpensesCredit, // Αν θες να τα εμφανίσεις στον πίνακα
                cashBalance: dailyCashBalance,
                cardBalance: dailyCardBalance,
                totalBalance: dailyTotalBalance
            });


            // Άθροιση στα συνολικά 7 ημερών
            totalCashIncome += dailyCashIncome;
            totalCardIncome += dailyCardIncome;
            totalCashExpenses += dailyCashExpenses;
            totalCardExpenses += dailyCardExpenses;
            totalCreditExpenses += dailyCreditExpenses;
            totalFcExpenses += dailyFcExpenses; // Άθροιση στα συνολικά FC εξόδα (συνολικά)
            totalFcExpensesCashCard += dailyFcExpensesCashCard; // Άθροιση στα συνολικά FC έξοδα (Μετρητά/Κάρτα)
            totalFcExpensesCredit += dailyFcExpensesCredit; // Άθροιση στα συνολικά FC έξοδα (Πίστωση)


        });

        // Υπολογισμός τελικών συνόλων και υπολοίπων 7 ημερών
        const totalIncome = totalCashIncome + totalCardIncome; // Συνολικά έσοδα (για υπολογισμό FC)
        const totalExpensesCashCard = totalCashExpenses + totalCardExpenses; // Συνολικά έξοδα που επηρεάζουν το ταμείο
        const cashBalance = totalCashIncome - totalCashExpenses;
        const cardBalance = totalCardIncome - totalCardExpenses;
        const totalBalance = totalIncome - totalExpensesCashCard; // Συνολικό υπόλοιπο ταμείου

         // Υπολογισμός Food Cost %
         const foodCostPercentage = (totalIncome > 0) ? (totalFcExpenses / totalIncome) * 100 : 0;


        return {
            sevenDates,
            totalCashIncome,
            totalCardIncome,
            totalIncome, // Συνολικά έσοδα
            totalCashExpenses,
            totalCardExpenses,
            totalCreditExpenses, // Συνολικά έξοδα επί πιστώσει
            totalFcExpenses, // Συνολικά έξοδα FC (όλα)
            totalFcExpensesCashCard, // Συνολικά έξοδα FC (Μετρητά/Κάρτα)
            totalFcExpensesCredit, // Συνολικά έξοδα FC (Πίστωση)
            totalExpensesCashCard, // Συνολικά έξοδα (Μετρητά + Κάρτα)
            cashBalance,
            cardBalance,
            totalBalance, // Συνολικό υπόλοιπο
            foodCostPercentage, // Ποσοστό Food Cost
            dailyData, // Αναλυτικά δεδομένα ημέρας
            supplierCredit // Σύνολα επί πιστώσει ανά προμηθευτή
        };
    };

    // Συνάρτηση για την εμφάνιση των συνοπτικών δεδομένων στον πίνακα σύνοψης
    const displaySevenDaySummary = (summaryData) => {
         // Εμφάνιση ή απόκρυψη του μηνύματος "Δεν βρέθηκαν δεδομένα"
        if (summaryData.totalIncome > 0 || summaryData.totalCashExpenses > 0 || summaryData.totalCardExpenses > 0 || summaryData.totalCreditExpenses > 0 || summaryData.totalFcExpenses > 0) { // Ελέγχουμε και για FC
            noWeeklyReportDataMessage.style.display = 'none';
            weeklySummaryTable.style.display = 'table'; // Εμφάνιση του πίνακα αν υπάρχουν δεδομένα
        } else {
            noWeeklyReportDataMessage.style.display = 'block';
            weeklySummaryTable.style.display = 'none'; // Απόκρυψη του πίνακα αν δεν υπάρχουν δεδομένα
        }

        // Εφαρμογή μορφοποίησης σε όλα τα ποσά
        weeklyCashIncomeTd.textContent = formatCurrency(summaryData.totalCashIncome);
        weeklyCardIncomeTd.textContent = formatCurrency(summaryData.totalCardIncome);
        weeklyTotalIncomeTd.textContent = formatCurrency(summaryData.totalIncome);
        weeklyCashExpensesTd.textContent = formatCurrency(summaryData.totalCashExpenses);
        weeklyCardExpensesTd.textContent = formatCurrency(summaryData.totalCardExpenses);
        weeklyTotalExpensesCashCardTd.textContent = formatCurrency(summaryData.totalExpensesCashCard); // Εμφάνιση νέου συνόλου
        weeklyCreditExpensesTd.textContent = formatCurrency(summaryData.totalCreditExpenses);
        weeklyCashBalanceTd.textContent = formatCurrency(summaryData.cashBalance);
        weeklyCardBalanceTd.textContent = formatCurrency(summaryData.cardBalance);
        weeklyTotalBalanceTd.textContent = formatCurrency(summaryData.totalBalance);

    };

     // Συνάρτηση για την εμφάνιση της ημερήσιας ανάλυσης στον πίνακα και συμπλήρωση footer
    const displayDailyBreakdown = (summaryData) => { // Παίρνουμε όλο το summaryData τώρα
        dailyBreakdownTableBody.innerHTML = ''; // Καθαρισμός προηγούμενων γραμμών

        // Εμφάνιση/Απόκρυψη του πίνακα και του μηνύματος
        const hasDailyDataToDisplay = summaryData.dailyData.some(day => day.totalIncome > 0 || day.totalExpensesCashCard > 0 || day.creditExpenses > 0 || day.dailyFcExpenses > 0); // Ελέγχουμε και για FC έξοδα
        const dailyBreakdownTfoot = document.querySelector('#daily-breakdown-table tfoot');

        if (!hasDailyDataToDisplay) {
             noDailyBreakdownMessage.style.display = 'block';
             // Κρύβουμε το footer αν δεν υπάρχουν δεδομένα στον tbody
             dailyBreakdownTfoot.style.display = 'none';

        } else {
            noDailyBreakdownMessage.style.display = 'none';
             // Εμφανίζουμε το footer
             dailyBreakdownTfoot.style.display = 'table-footer-group'; // ή απλά 'block'


            summaryData.dailyData.forEach(day => {
                 const row = dailyBreakdownTableBody.insertRow();
                 const dateObj = new Date(day.date + 'T00:00:00');
                 const options = { weekday: 'long', day: 'numeric', month: 'numeric' }; // Εμφάνιση ημέρας και ημερομηνίας (π.χ. Δευτέρα, 01/01)
                 const formattedDate = dateObj.toLocaleDateString('el-GR', options);


                row.insertCell(0).textContent = formattedDate;
                row.insertCell(1).textContent = formatCurrency(day.cashIncome);
                row.insertCell(2).textContent = formatCurrency(day.cardIncome);
                row.insertCell(3).textContent = formatCurrency(day.totalIncome);
                row.insertCell(4).textContent = formatCurrency(day.cashExpenses);
                row.insertCell(5).textContent = formatCurrency(day.cardExpenses);
                row.insertCell(6).textContent = formatCurrency(day.totalExpensesCashCard); // Εμφάνιση συνόλου Μετρητά + Κάρτα για τη μέρα
                row.insertCell(7).textContent = formatCurrency(day.cashBalance);
                row.insertCell(8).textContent = formatCurrency(day.cardBalance);
                row.insertCell(9).textContent = formatCurrency(day.totalBalance);
            });

             // --- Συμπλήρωση των συνολικών στο footer ---
             dailyBreakdownTotalCashIncomeTd.textContent = formatCurrency(summaryData.totalCashIncome);
             dailyBreakdownTotalCardIncomeTd.textContent = formatCurrency(summaryData.totalCardIncome);
             dailyBreakdownTotalIncomeSumTd.textContent = formatCurrency(summaryData.totalIncome);
             dailyBreakdownTotalCashExpensesTd.textContent = formatCurrency(summaryData.totalCashExpenses);
             dailyBreakdownTotalCardExpensesTd.textContent = formatCurrency(summaryData.totalCardExpenses);
             dailyBreakdownTotalExpensesCashCardSumTd.textContent = formatCurrency(summaryData.totalExpensesCashCard);
             dailyBreakdownCashBalanceTd.textContent = formatCurrency(summaryData.cashBalance); // Εμφάνιση τελικού υπολοίπου
             dailyBreakdownCardBalanceTd.textContent = formatCurrency(summaryData.cardBalance); // Εμφάνιση τελικού υπολοίπου
             dailyBreakdownTotalBalanceTd.textContent = formatCurrency(summaryData.totalBalance); // Εμφάνιση τελικού συνολικού υπολοίπου
        }
    };

    // Συνάρτηση για την εμφάνιση των εξόδων επί πιστώσει ανά προμηθευτή στον πίνακα και συμπλήρωση footer
    const displaySupplierCredit = (summaryData) => { // Παίρνουμε όλο το summaryData
        supplierCreditTableBody.innerHTML = ''; // Καθαρισμός προηγούμενων γραμμών
        const sortedSuppliers = Object.entries(summaryData.supplierCredit).sort(([, amountA], [, amountB]) => amountB - amountA); // Ταξινόμηση φθίνουσα κατά ποσό
        const hasCreditDataToDisplay = sortedSuppliers.some(([supplier, amount]) => amount > 0);
        const supplierCreditTfoot = document.querySelector('#supplier-credit-table tfoot'); // Αναφορά στο footer του πίνακα προμηθευτών


        if (!hasCreditDataToDisplay) {
             noSupplierCreditMessage.style.display = 'block';
             // Κρύβουμε το footer αν δεν υπάρχουν δεδομένα
             supplierCreditTfoot.style.display = 'none';
        } else {
             noSupplierCreditMessage.style.display = 'none';
             // Εμφανίζουμε το footer
             supplierCreditTfoot.style.display = 'table-footer-group'; // ή απλά 'block'

            sortedSuppliers.forEach(([supplier, totalCredit]) => {
                if (totalCredit > 0) { // Εμφάνιση μόνο αν το σύνολο είναι > 0
                    const row = supplierCreditTableBody.insertRow();
                    row.insertCell(0).textContent = supplier;
                    row.insertCell(1).textContent = formatCurrency(totalCredit);
                }
            });

            // --- Συμπλήρωση του συνολικού στο footer του πίνακα προμηθευτών ---
            supplierCreditTotalTd.textContent = formatCurrency(summaryData.totalCreditExpenses); // Συμπληρώνουμε το κελί του footer
        }
    };

    // Συνάρτηση για την εμφάνιση του Food Cost με αναλυτικά δεδομένα
    const displayFoodCost = (totalIncome, totalFcExpenses, foodCostPercentage) => {
         // Ελέγχουμε αν υπάρχουν έσοδα ή έξοδα FC για να αποφασίσουμε την εμφάνιση
         if (totalIncome > 0 || totalFcExpenses > 0) {
             weeklyFoodCostContainer.style.display = 'block';
             weeklyTotalFcExpensesSpan.textContent = formatCurrency(totalFcExpenses); // Εμφάνιση συνολικών εξόδων FC
             weeklyTotalIncomeForFcSpan.textContent = formatCurrency(totalIncome); // Εμφάνιση συνολικών εσόδων
             weeklyFoodCostValueSpan.textContent = formatPercentage(foodCostPercentage); // Εμφάνιση ποσοστού
         } else {
             // Αν δεν υπάρχουν καθόλου έσοδα και καθόλου έξοδα FC, κρύβουμε το container
             weeklyFoodCostContainer.style.display = 'none';
             weeklyTotalFcExpensesSpan.textContent = formatCurrency(0); // Επαναφορά σε 0.00€
             weeklyTotalIncomeForFcSpan.textContent = formatCurrency(0); // Επαναφορά σε 0.00€
             weeklyFoodCostValueSpan.textContent = 'N/A'; // Επαναφορά σε N/A
         }
     };

     // Συνάρτηση για τη δημιουργία του κειμένου ερμηνείας Food Cost
     // Τώρα παίρνει και τα αναλυτικά στοιχεία των εσόδων/εξόδων FC
     const getFoodCostInterpretationText = (totalIncome, totalCashIncome, totalCardIncome, totalFcExpenses, totalFcExpensesCashCard, totalFcExpensesCredit, foodCostPercentage) => {
         // Ελέγχουμε αν το Food Cost είναι NaN ή N/A (π.χ. έσοδα 0)
         if (isNaN(foodCostPercentage) || !isFinite(foodCostPercentage) || (totalIncome === 0 && totalFcExpenses === 0)) {
             weeklyFoodCostInterpretationDiv.style.display = 'none'; // Κρύβουμε αν δεν μπορεί να υπολογιστεί
             return ''; // Επιστρέφουμε κενό κείμενο
         }

         weeklyFoodCostInterpretationDiv.style.display = 'block'; // Εμφανίζουμε το div αν υπολογίστηκε FC

         let interpretation = `**Ανάλυση Food Cost (FC) για το διάστημα:**`;

         interpretation += ` Το Food Cost (FC) για το επιλεγμένο διάστημα ανέρχεται σε **${formatPercentage(foodCostPercentage)}**. `;

         interpretation += `Αυτό το ποσοστό προκύπτει από τη διαίρεση των συνολικών εξόδων FC (${formatCurrency(totalFcExpenses)}) με τα συνολικά έσοδα (${formatCurrency(totalIncome)}).`;

         // Προσθήκη ανάλυσης εξόδων FC
         if (totalFcExpensesCashCard > 0 && totalFcExpensesCredit > 0) {
              interpretation += ` Τα συνολικά έξοδα FC (${formatCurrency(totalFcExpenses)}) αποτελούνται από έξοδα που πληρώθηκαν με Μετρητά/Κάρτα (${formatCurrency(totalFcExpensesCashCard)}) και έξοδα που καταγράφηκαν ως επί Πίστωση (${formatCurrency(totalFcExpensesCredit)}).`;
         } else if (totalFcExpensesCashCard > 0) {
              interpretation += ` Όλα τα έξοδα FC (${formatCurrency(totalFcExpenses)}) πληρώθηκαν με Μετρητά/Κάρτα.`;
         } else if (totalFcExpensesCredit > 0) {
              interpretation += ` Όλα τα έξοδα FC (${formatCurrency(totalFcExpenses)}) καταγράφηκαν ως επί Πίστωση.`;
         } else {
              interpretation += ` Δεν καταγράφηκαν αναλυτικά έξοδα FC για αυτό το διάστημα.`; // Θα πρέπει να μην εμφανίζεται το container FC σε αυτή την περίπτωση, αλλά ας υπάρχει ένα fallback κείμενο.
         }


          // Προσθήκη ανάλυσης εσόδων
         if (totalCashIncome > 0 && totalCardIncome > 0) {
              interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) προκύπτουν από έσοδα Μετρητά (${formatCurrency(totalCashIncome)}) και έσοδα Κάρτα (${formatCurrency(totalCardIncome)}).`;
         } else if (totalCashIncome > 0) {
              interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) προκύπτουν εξ ολοκλήρου από έσοδα Μετρητά.`;
         } else if (totalCardIncome > 0) {
             interpretation += ` Τα συνολικά έσοδα (${formatCurrency(totalIncome)}) προκύπτουν εξ ολοκλήρου από έσοδα Κάρτα.`;
         } else {
              interpretation += ` Δεν καταγράφησαν έσοδα για αυτό το διάστημα.`; // Σε αυτή την περίπτωση, το FC θα είναι N/A.
         }


         // Ερμηνεία βάσει ποσοστού - Πιο επαγγελματική και συγκεκριμένη
         interpretation += `<br><br>Στην εστίαση, το Food Cost είναι η καρδιά της διαχείρισης κόστους και ένας κρίσιμος δείκτης για την οικονομική υγεία. Με ποσοστό FC **${formatPercentage(foodCostPercentage)}** για το επιλεγμένο διάστημα, παρατηρούμε τα εξής:`;

         if (foodCostPercentage < 28) {
             interpretation += `<br>- Αυτό το εξαιρετικά χαμηλό ποσοστό υποδηλώνει **υποδειγματική διαχείριση** των πρώτων υλών σας. Είναι ένδειξη αποτελεσματικών διαδικασιών αγοράς, παραλαβής, αποθήκευσης, ελέγχου μερίδων και ελαχιστοποίησης της σπατάλης. Ένα τόσο χαμηλό FC συνεισφέρει άμεσα σε υψηλότερα μικτά κέρδη (Gross Profit). Συνεχίστε την αυστηρή παρακολούθηση. Αξίζει να επανεξετάσετε την τιμολόγηση ορισμένων προϊόντων σας ή/και το μείγμα πωλήσεων, ώστε να διασφαλίσετε ότι δεν "αφήνετε χρήματα στο τραπέζι" αν οι τιμές σας είναι πολύ χαμηλές σε σχέση με την αξία ή αν οι πωλήσεις σας επικεντρώνονται υπερβολικά σε είδη με πολύ χαμηλό FC ενώ θα μπορούσατε να αυξήσετε τις πωλήσεις σε είδια με υψηλότερο περιθώριο κέρδους.`;
         } else if (foodCostPercentage >= 28 && foodCostPercentage < 33) {
             interpretation += `<br>- Το ποσοστό **${formatPercentage(foodCostPercentage)}** θεωρείται **πολύ καλό** για τα περισσότερα εστιατόρια. Αντικατοπτρίζει υγιείς λειτουργίες όσον αφορά το κόστος των πρώτων υλών. Έχετε καλό έλεγχο στις αγορές και τη χρήση. Για περαιτέρω βελτίωση, μπορείτε να εστιάσετε σε λεπτομέρειες όπως διαπραγμάτευση για ελαφρώς καλύτερες τιμές προμηθευτών, περαιτέρω μείωση της ανεπαίσθητης σπατάλης στην κουζίνα, ή βελτιστοποίηση των μερίδων σε συγκεκριμένα είδη με υψηλό όγκο πωλήσεων.`;
         } else if (foodCostPercentage >= 33 && foodCostPercentage < 38) {
              interpretation += `<br>- Το Food Cost στο **${formatPercentage(foodCostPercentage)}** βρίσκεται σε **αποδεκτά, αλλά οριακά επίπεδα** για ένα εστιατόριο. Αυτό σημαίνει ότι ένα σημαντικό μέρος των εσόδων σας απορροφάται από το κόστος των υλικών, κάτι που μπορεί να επηρεάζει τα καθαρά κέρδη. Συνιστάται **άμεση εστίαση** στην παρακολούθηση. Ελέγξτε τις τιμές που σας χρεώνουν οι προμηθευτές, βεβαιωθείτε ότι οι παραλαβές είναι ακριβείς, εφαρμόστε αυστηρό έλεγχο μερίδων, παρακολουθήστε τη σπατάλη (είτε καταγεγραμμένη είτε ανεπαίσθητη) και αναλύστε ποια προϊόντα έχουν το μεγαλύτερο FC σε σχέση με την τιμή πώλησης. Μπορεί να χρειαστούν μικρές προσαρμογές στο μενού ή την τιμολόγηση.`;
         } else if (foodCostPercentage >= 38 && foodCostPercentage < 45) {
             interpretation += `<br>- Το ποσοστό **${formatPercentage(foodCostPercentage)}** θεωρείται **υψηλό** και αποτελεί ένα **σοβαρό προειδοποιητικό σημάδι** για την κερδοφορία. Ένα τόσο υψηλό FC υποδηλώνει ότι το κόστος των πρώτων υλών είναι δυσανάλογο σε σχέση με τα έσοδα. Απαιτείται **επείγουσα και συστηματική διερεύνηση** των αιτιών. Ελέγξτε λεπτομερώς κάθε στάδιο: διαπραγματεύσεις προμηθευτών, ακρίβεια παραλαβών, συνθήκες αποθήκευσης, έλεγχος αποθεμάτων, σπατάλη στην κουζίνα (λάθη, αλλοιώσεις, υπερπαραγωγή), εφαρμογή σωστών μερίδων και πιθανές απώλειες (κλοπή). Αναλύστε επίσης εάν η τιμολόγηση των προϊόντων σας είναι σωστή ή αν το μείγμα πωλήσεων (πώληση προϊόντων με πολύ υψηλό FC) είναι υπεύθυνο.`;
         } else { // foodCostPercentage >= 45
              interpretation += `<br>- Ένα Food Cost στο **${formatPercentage(foodCostPercentage)}** είναι **πολύ υψηλό** και υποδηλώνει ότι η διαχείριση του κόστους των πρώτων υλών έχει **σοβαρά προβλήματα**. Αυτό το ποσοστό μειώνει δραματικά τα περιθώρια κέρδους και απειλεί την οικονομική βιωσιμότητα. Απαιτείται **άμεση και ριζική επανεξέταση** όλων των διαδικασιών. Πρέπει να εστιάσετε σε: επαναδιαπραγμάτευση συμβάσεων με προμηθευτές, αυστηρότατο έλεγχο παραλαβών και αποθεμάτων, μηδενισμό της σπατάλης (μέσω εκπαίδευσης, σωστής αποθήκευσης, χρήσης υπολειμμάτων), αυστηρό έλεγχο μερίδων, επανεξέταση του μενού και της τιμολόγησης. Κάθε ευρώ μετράει σε αυτό το επίπεδο FC.`;
         }

         return interpretation;
     };


    // Συνάρτηση για την προετοιμασία και την ενημέρωση των γραφημάτων (προσαρμοσμένη για 7ήμερο διάστημα)
    const updateSevenDayCharts = (summaryData) => {
        // Στα γραφήματα η Chart.js περιμένει αριθμούς, όχι μορφοποιημένες strings

        // Γράφημα Σύγκρισης Εσόδων vs Έξοδα (Μετρητά & Κάρτα) 7 Ημερών
        const totalComparisonChartData = {
             labels: ['Συνολικά Έσοδα', 'Συνολικά Έξοδα (Μετρητά & Κάρτα)'],
             datasets: [{
                 data: [summaryData.totalIncome, summaryData.totalExpensesCashCard],
                 backgroundColor: ['#28a745', '#dc3545'], // Πράσινο για έσοδα, Κόκκινο για έξοδα
                 borderColor: '#fff',
                 borderWidth: 1
             }]
        };


        // Καταστροφή προηγούμενου γραφήματος αν υπάρχει
        if (weeklyTotalComparisonChart) {
            weeklyTotalComparisonChart.destroy();
        }

        // Δημιουργία νέου γραφήματος μόνο αν υπάρχουν συνολικά έσοδα ή έξοδα (που επηρεάζουν το ταμείο)
        if (summaryData.totalIncome > 0 || summaryData.totalExpensesCashCard > 0) {
             weeklyTotalComparisonChart = new Chart(weeklyTotalComparisonPieChartCanvas, {
                 type: 'pie',
                 data: totalComparisonChartData,
                 options: {
                     responsive: true,
                     plugins: {
                         legend: { position: 'top' },
                         title: { display: false }
                     },
                     // Tooltip: Μπορούμε να μορφοποιήσουμε τα tooltips αν χρειαστεί
                     // tooltip: {
                     //      callbacks: {
                     //           label: function(context) {
                     //                const label = context.label || '';
                     //                const value = context.raw || 0;
                     //                return `${label}: ${formatCurrency(value)`;
                     //           }
                     //      }
                     // }
                 },
             });
        }
    };


    // Κύρια συνάρτηση για τη δημιουργία της αναφοράς 7 ημερών
    const generateSevenDayReport = (startDateString) => {
        if (!startDateString) {
             // Εμφάνιση άδειων δεδομένων και απόκρυψη τμημάτων
             const emptySummary = { totalCashIncome: 0, totalCardIncome: 0, totalIncome: 0, totalCashExpenses: 0, totalCardExpenses: 0, totalCreditExpenses: 0, totalFcExpenses: 0, totalFcExpensesCashCard: 0, totalFcExpensesCredit: 0, totalExpensesCashCard: 0, cashBalance: 0, cardBalance: 0, totalBalance: 0, foodCostPercentage: 0, dailyData: [], supplierCredit: {} };

             displaySevenDaySummary(emptySummary);
             displayDailyBreakdown(emptySummary); // Εμφάνιση άδειου πίνακα ανάλυσης και απόκρυψη footer
             displaySupplierCredit(emptySummary); // Εμφάνιση άδειου πίνακα πιστώσεων και απόκρυψη footer
             displayFoodCost(emptySummary.totalIncome, emptySummary.totalFcExpenses, emptySummary.foodCostPercentage); // Απόκρυψη Food Cost

             // Κρύβουμε και καθαρίζουμε το κείμενο ερμηνείας
             weeklyFoodCostInterpretationDiv.style.display = 'none';
             weeklyFoodCostInterpretationDiv.innerHTML = '';


             updateSevenDayCharts(emptySummary); // Καταστροφή/Επαναφορά γραφημάτων
             weeklyReportDateDisplaySpan.textContent = 'το επιλεγμένο διάστημα'; // Επαναφορά κειμένου

             // Απόκρυψη κουμπιού εξαγωγής PDF αν δεν υπάρχει ημερομηνία
             exportWeeklyPdfButtonBottom.style.display = 'none';
             return;
        }

        // Η επιλεγμένη ημερομηνία είναι η ημερομηνία έναρξης
        const sevenDates = getSevenDatesStartingFrom(startDateString); // Παίρνουμε τις 7 ημερομηνίες

        const summaryData = calculateSevenDayData(startDateString); // Υπολογισμός όλων των δεδομένων

        displaySevenDaySummary(summaryData); // Εμφάνιση συνόψεων
        displayDailyBreakdown(summaryData); // Εμφάνιση ανάλυσης ημέρας και συμπλήρωση footer
        displaySupplierCredit(summaryData); // Εμφάνιση πιστώσεων προμηθευτών και συμπλήρωση footer
        displayFoodCost(summaryData.totalIncome, summaryData.totalFcExpenses, summaryData.foodCostPercentage); // Εμφάνιση Food Cost

         // Εμφάνιση κειμένου ερμηνείας Food Cost με αναλυτικά δεδομένα
         weeklyFoodCostInterpretationDiv.innerHTML = getFoodCostInterpretationText(
             summaryData.totalIncome,
             summaryData.totalCashIncome,
             summaryData.totalCardIncome,
             summaryData.totalFcExpenses,
             summaryData.totalFcExpensesCashCard,
             summaryData.totalFcExpensesCredit,
             summaryData.foodCostPercentage
         );


        updateSevenDayCharts(summaryData); // Ενημέρωση γραφημάτων

        // Ενημέρωση της εμφάνισης του εύρους ημερομηνιών
        const startDateObj = new Date(sevenDates[0] + 'T00:00:00'); // Χρησιμοποιούμε T00:00:00 εδώ για σωστή εμφάνιση του εύρους
        const endDateObj = new Date(sevenDates[6] + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        weeklyReportDateDisplaySpan.textContent = `το διάστημα από ${startDateObj.toLocaleDateString('el-GR', options)} έως ${endDateObj.toLocaleDateString('el-GR', options)}`;

         // Εμφάνιση κουμπιού εξαγωγής PDF
         exportWeeklyPdfButtonBottom.style.display = 'block';
    };

    // --- Λειτουργία Εξαγωγής PDF για Αναφορά 7 Ημερών ---

    const exportSevenDayReportToPdf = () => {
        const selectedDate = weeklyReportDateInput.value; // Η επιλεγμένη ημερομηνία
        if (!selectedDate) {
            alert('Παρακαλώ επιλέξτε ημερομηνία έναρξης για την αναφορά.');
            return;
        }

        const startDateString = selectedDate; // Η επιλεγμένη ημερομηνία είναι η έναρξη
        const sevenDates = getSevenDatesStartingFrom(startDateString);
        const summaryData = calculateSevenDayData(startDateString);

        // Ελέγχουμε αν υπάρχουν δεδομένα πριν δημιουργήσουμε το PDF
        const hasDataForPdf = summaryData.totalIncome > 0 || summaryData.totalExpensesCashCard > 0 || summaryData.totalCreditExpenses > 0 || summaryData.totalFcExpenses > 0;

        if (!hasDataForPdf) {
            alert(`Δεν υπάρχουν καταχωρημένα έσοδα ή έξοδα για το διάστημα που ξεκινά την ${selectedDate} για εξαγωγή.`);
            return;
        }

        // Χρησιμοποιούμε τις ημερομηνίες από την getSevenDatesStartingFrom για το εύρος του PDF
        const startDateObj = new Date(sevenDates[0] + 'T00:00:00');
        const endDateObj = new Date(sevenDates[6] + 'T00:00:00');
        const formattedDateRange = `${startDateObj.toLocaleDateString('el-GR', { day: 'numeric', month: 'numeric', year: 'numeric' })} - ${endDateObj.toLocaleDateString('el-GR', { day: 'numeric', month: 'numeric', year: 'numeric' })}`;


        // --- Περιεχόμενο PDF ---

        const pdfContent = [];

        pdfContent.push({ text: 'Αναφορά 7 Ημερών', style: 'header' });
        pdfContent.push({ text: `Διάστημα: ${formattedDateRange}`, style: 'subheader' });

        // Πίνακας Σύνοψης (Σελίδα 1)
        pdfContent.push({ text: 'Σύνοψη Διαστήματος:', style: 'sectionHeader', margin: [0, 10, 0, 5] });
        pdfContent.push({
             table: {
                 widths: ['*', 'auto'],
                 body: [
                     [{ text: 'Κατηγορία', style: 'tableHeader' }, { text: 'Ποσό (€)', style: 'tableHeader', alignment: 'right' }],
                     ['Έσοδα Μετρητά:', { text: formatCurrency(summaryData.totalCashIncome), alignment: 'right' }],
                     ['Έσοδα Κάρτα:', { text: formatCurrency(summaryData.totalCardIncome), alignment: 'right' }],
                     [{ text: 'Συνολικά Έσοδα:', bold: true }, { text: formatCurrency(summaryData.totalIncome), bold: true, alignment: 'right' }],
                     [{ text: '', colSpan: 2, border: [false, false, false, true], margin: [0, 5, 0, 5] }, ''],
                     ['Έξοδα Μετρητά:', { text: formatCurrency(summaryData.totalCashExpenses), alignment: 'right' }],
                     ['Έξοδα Κάρτα:', { text: formatCurrency(summaryData.totalCardExpenses), alignment: 'right' }],
                      [{ text: 'Συνολικά Έξοδα (Μετρητά & Κάρτα):', bold: true }, { text: formatCurrency(summaryData.totalExpensesCashCard), bold: true, alignment: 'right' }],
                     ['Έξοδα Επί Πιστώσει:', { text: formatCurrency(summaryData.totalCreditExpenses), alignment: 'right' }],
                     [{ text: '', colSpan: 2, border: [false, false, false, true], margin: [0, 5, 0, 5] }, ''],
                     ['Υπόλοιπο Μετρητών:', { text: formatCurrency(summaryData.cashBalance), alignment: 'right' }],
                     ['Υπόλοιπο Καρτών:', { text: formatCurrency(summaryData.cardBalance), alignment: 'right' }],
                     [{ text: 'Υπόλοιπο Συνολικού Ταμείου:', bold: true }, { text: formatCurrency(summaryData.totalBalance), bold: true, alignment: 'right' }],
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

        // Πίνακας Ημερήσιας Ανάλυσης (στο PDF) - Ξεκινάει στη 2η σελίδα
        if (summaryData.dailyData.length > 0 && summaryData.dailyData.some(day => day.totalIncome > 0 || day.totalExpensesCashCard > 0 || day.creditExpenses > 0 || day.dailyFcExpenses > 0)) {
             // Προσθέτουμε pageBreak: 'before' στον τίτλο για να ξεκινάει σε νέα σελίδα (τη δεύτερη)
            pdfContent.push({ text: 'Ανάλυση Ημέρας ανά Διάστημα:', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: 'before' });


            const dailyBreakdownTableBodyPdf = [
                 // Επικεφαλίδα πίνακα
                [{ text: 'Ημέρα', style: 'tableHeader' },
                 { text: 'Έσοδα Μετρητά (€)', style: 'tableHeader', alignment: 'right' },
                 { text: 'Έσοδα Κάρτα (€)', style: 'tableHeader', alignment: 'right' },
                 { text: 'Συνολικά Έσοδα (€)', style: 'tableHeader', alignment: 'right' },
                 { text: 'Έξοδα Μετρητά (€)', style: 'tableHeader', alignment: 'right' },
                 { text: 'Έξοδα Κάρτα (€)', style: 'tableHeader', alignment: 'right' },
                 { text: 'Συνολικά Έξοδα (€)', style: 'tableHeader', alignment: 'right' }, // Σύνολο Μετρητά + Κάρτα για τη μέρα
                 { text: 'Υπόλοιπο Μετρητών (€)', style: 'tableHeader', alignment: 'right' },
                 { text: 'Υπόλοιπο Καρτών (€)', style: 'tableHeader', alignment: 'right' },
                 { text: 'Συνολικό Υπόλοιπο (€)', style: 'tableHeader', alignment: 'right' }]
            ];

            summaryData.dailyData.forEach(day => {
                 const dateObj = new Date(day.date + 'T00:00:00');
                 const options = { weekday: 'short', day: 'numeric', month: 'numeric' }; // Μικρή μορφή για την ημέρα (π.χ. Δευ, 01/01)
                 const formattedDate = dateObj.toLocaleDateString('el-GR', options);

                dailyBreakdownTableBodyPdf.push([
                    formattedDate,
                    { text: formatCurrency(day.cashIncome), alignment: 'right' },
                    { text: formatCurrency(day.cardIncome), alignment: 'right' },
                    { text: formatCurrency(day.totalIncome), alignment: 'right' },
                    { text: formatCurrency(day.cashExpenses), alignment: 'right' },
                    { text: formatCurrency(day.cardExpenses), alignment: 'right' },
                     { text: formatCurrency(day.totalExpensesCashCard), alignment: 'right' }, // Σύνολο Μετρητά + Κάρτα
                    { text: formatCurrency(day.cashBalance), alignment: 'right' },
                    { text: formatCurrency(day.cardBalance), alignment: 'right' },
                    { text: formatCurrency(day.totalBalance), alignment: 'right' },
                ]);
            });

             // --- Προσθήκη γραμμής συνόλων στο footer του PDF πίνακα ανάλυσης ---
             dailyBreakdownTableBodyPdf.push([
                  { text: 'Σύνολα:', bold: true }, // Ετικέτα
                  { text: formatCurrency(summaryData.totalCashIncome), bold: true, alignment: 'right' },
                  { text: formatCurrency(summaryData.totalCardIncome), bold: true, alignment: 'right' },
                  { text: formatCurrency(summaryData.totalIncome), bold: true, alignment: 'right' },
                  { text: formatCurrency(summaryData.totalCashExpenses), bold: true, alignment: 'right' },
                  { text: formatCurrency(summaryData.totalCardExpenses), bold: true, alignment: 'right' },
                  { text: formatCurrency(summaryData.totalExpensesCashCard), bold: true, alignment: 'right' },
                  { text: formatCurrency(summaryData.cashBalance), bold: true, alignment: 'right' }, // Τελικό Υπόλοιπο Μετρητών
                  { text: formatCurrency(summaryData.cardBalance), bold: true, alignment: 'right' }, // Τελικό Υπόλοιπο Καρτών
                  { text: formatCurrency(summaryData.totalBalance), bold: true, alignment: 'right' } // Τελικό Συνολικό Υπόλοιπο
             ]);


            pdfContent.push({
                table: {
                     widths: ['auto', '*', '*', '*', '*', '*', '*', '*', '*', '*'], // Αυτόματο για την ημέρα, υπόλοιπο μοιράζεται
                    body: dailyBreakdownTableBodyPdf,
                     // Αφαιρέθηκαν unbreakable και dontBreakRows / keepWithHeaderRows
                },
                 layout: {
                     hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 1 : 0.5; },
                     vLineWidth: function(i, node) { return 0.5; },
                     hLineColor: function(i, node) { return (i === 0 || i === node.table.body.length) ? '#000' : '#ddd'; },
                     vLineColor: function(i, node) { return '#ddd'; },
                     paddingLeft: function(i, node) { return 3; },
                     paddingRight: function(i, node) { return 3; },
                     paddingTop: function(i, node) { return 4; },
                     paddingBottom: function(i, node) { return 4; }
                 }
            });
        }


        // Πίνακας Εξόδων Επί Πιστώσει ανά Προμηθευτή (στο PDF) - Ξεκινάει στη 3η σελίδα
         const sortedSuppliers = Object.entries(summaryData.supplierCredit).filter(([supplier, amount]) => amount > 0).sort(([, amountA], [, amountB]) => amountB - amountA);

         if (sortedSuppliers.length > 0) {
              // Προσθέτουμε pageBreak: 'before' στον τίτλο για να ξεκινάει σε νέα σελίδα (την τρίτη)
             pdfContent.push({ text: 'Συνολικά Έξοδα Επί Πιστώσει ανά Προμηθευτή (7 Ημερών):', style: 'sectionHeader', margin: [0, 20, 0, 5], pageBreak: 'before' });


             const supplierCreditTableBodyPdf = [
                 // Επικεφαλίδα πίνακα
                 [{ text: 'Όνομα Προμηθευτή', style: 'tableHeader' }, { text: 'Σύνολο Επί Πίστωση (€)', style: 'tableHeader', alignment: 'right' }]
             ];

             sortedSuppliers.forEach(([supplier, totalCredit]) => {
                 supplierCreditTableBodyPdf.push([
                     supplier,
                     { text: formatCurrency(totalCredit), alignment: 'right' }
                 ]);
             });

             // --- Προσθήκη γραμμής συνόλου στο footer του PDF πίνακα προμηθευτών ---
             supplierCreditTableBodyPdf.push([
                 { text: 'Σύνολο Επί Πίστωση:', bold: true }, // Ετικέτα
                 { text: formatCurrency(summaryData.totalCreditExpenses), bold: true, alignment: 'right' } // Συνολικό ποσό επί πιστώσει
             ]);


             pdfContent.push({
                 table: {
                     widths: ['*', 'auto'],
                     body: supplierCreditTableBodyPdf,
                      // Αφαιρέθηκαν unbreakable και dontBreakRows / keepWithHeaderRows
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

         // Εμφάνιση Food Cost αν υπολογίστηκε - Πιο αναλυτικό στο PDF - Ξεκινάει στη 4η σελίδα
        if (summaryData.totalIncome > 0 || summaryData.totalFcExpenses > 0) { // Εμφανίζουμε αν υπάρχουν έσοδα Ή έξοδα FC

             // Προσθήκη κειμένου ερμηνείας Food Cost στο PDF
             const interpretationText = getFoodCostInterpretationText(
                 summaryData.totalIncome,
                 summaryData.totalCashIncome,
                 summaryData.totalCardIncome,
                 summaryData.totalFcExpenses,
                 summaryData.totalFcExpensesCashCard,
                 summaryData.totalFcExpensesCredit,
                 summaryData.foodCostPercentage
             );

             // Ελέγχουμε αν η getFoodCostInterpretationText επέστρεψε κείμενο (δεν ήταν N/A)
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


                 pdfContent.push({
                      text: pdfInterpretationContent, // Προσθήκη του αναλυτικού περιεχομένου με bold
                      margin: [0, 20, 0, 15], // Δώσε λίγο χώρο από πάνω και κάτω
                      alignment: 'left',
                      pageBreak: 'before' // *** Force page break BEFORE this element (Page 4) ***
                 });

             }
         }


        // --- Δημιουργία Λογιστικών Σχολίων (προσαρμοσμένα για 7ήμερο) ---
         const comments = []; // Δήλωση ΕΔΩ

        comments.push({ text: 'Λογιστική Σύνοψη Διαστήματος:', style: 'commentsHeader', margin: [0, 20, 0, 5], pageBreak: 'before' }); // *** Force page break BEFORE comments ***


        // Επανάληψη λογικής σχολίων για το PDF
        if (summaryData.totalBalance > 0) {
             comments.push({ text: `Το διάστημα παρουσιάζει συνολικό πλεόνασμα ταμείου ${formatCurrency(summaryData.totalBalance)} (Συνολικά Έσοδα μείον Συνολικά Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        } else if (summaryData.totalBalance < 0) {
             comments.push({ text: `Το διάστημα παρουσιάζει συνολικό έλλειμμα ταμείου ${formatCurrency(Math.abs(summaryData.totalBalance))} (Συνολικά Έσοδα μείον Συνολικά Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        } else {
             comments.push({ text: `Το διάστημα παρουσιάζει ισορροπία στο συνολικό ταμείο (τα συνολικά έσοδα Μετρητά + Κάρτα ισούνται με τα συνολικά έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        }
         if (summaryData.cashBalance > 0) {
             comments.push({ text: `Το υπόλοιπο των μετρητών για το διάστημα είναι θετικό, ανέρχεται σε ${formatCurrency(summaryData.cashBalance)}.`, margin: [0, 5] });
         } else if (summaryData.cashBalance < 0) {
             comments.push({ text: `Το υπόλοιπο των μετρητών για το διάστημα είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(summaryData.cashBalance))}.`, margin: [0, 5] });
         } else {
              comments.push({ text: `Το υπόλοιπο των μετρητών για το διάστημα είναι μηδενικό.`, margin: [0, 5] });
         }
         if (summaryData.cardBalance > 0) {
             comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για το διάστημα είναι θετικό, ανέρχεται σε ${formatCurrency(summaryData.cardBalance)}.`, margin: [0, 5] });
         } else if (summaryData.cardBalance < 0) {
              comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για το διάστημα είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(summaryData.cardBalance))}.`, margin: [0, 5] });
         } else {
              comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για το διάστημα είναι μηδενικό.`, margin: [0, 5] });
         }
        if (summaryData.totalCreditExpenses > 0) {
             comments.push({ text: `Σημειώθηκαν έξοδα επί πιστώσει συνολικού ποσού ${formatCurrency(summaryData.totalCreditExpenses)} για το διάστημα, τα οποία δεν επηρεάζουν το άμεσο ταμείο.`, margin: [0, 5] });
        } else {
             comments.push({ text: `Δεν σημειώθηκαν έξοδα επί πιστώσει για το διάστημα.`, margin: [0, 5] });
        }

        // Προσθήκη των σχολίων στο περιεχόμενο του PDF ως διαδοχικά text blocks
        // Το pageBreak: 'before' είναι ήδη στην επικεφαλίδα των σχολίων
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
             sectionHeader: { // Style για τους τίτλους των τμημάτων
                 fontSize: 14,
                 bold: true,
                 /* margin: [0, 15, 0, 5] */ // Margin handled inline or by pageBreak
             },
            tableHeader: {
                bold: true,
                fontSize: 11,
                color: 'white',
                fillColor: '#007bff',
                alignment: 'left', // Κεντράρισμα των επικεφαλίδων
                 padding: [5, 5, 5, 5]
            },
             commentsHeader: { // Style για την επικεφαλίδα των σχολίων
                  fontSize: 14,
                  bold: true,
                  /* margin: [0, 20, 0, 5] */ // Margin handled inline
              }
        };


        // Ορισμός του PDF document definition
        const docDefinition = {
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            },
            content: pdfContent, // Το περιεχόμενο που δημιουργήσαμε παραπάνω
            styles: pdfStyles, // Τα styles που δημιουργήσαμε
            info: {
                title: `Αναφορά 7 Ημερών ${formattedDateRange}`,
                author: 'Η Εφαρμογή μου',
            },
             // Ενεργοποίηση Landscape προσανατολισμού αν ο πίνακας ανάλυσης είναι πολύ φαρδύς
             pageOrientation: 'landscape', // Χρησιμοποιούμε πάντα landscape για να χωράει ο ημερήσιος πίνακας
             pageMargins: [ 40, 40, 40, 40 ] // Περιθώρια σελίδας
        };

        // Δημιουργία του PDF και εξαγωγή
        pdfMake.createPdf(docDefinition).getDataUrl(function(dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            // Χρησιμοποιούμε τις ημερομηνίες από την getSevenDatesStartingFrom για το όνομα του αρχείου
            link.download = `Αναφορα_7_Ημερων_${sevenDates[0]}_${sevenDates[6]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };


    // --- Event Listeners ---

    // Όταν αλλάζει η ημερομηνία στο date picker
    weeklyReportDateInput.addEventListener('change', (event) => {
        const selectedDate = event.target.value;
         if (!selectedDate) {
             generateSevenDayReport(''); // Καθαρίζει την αναφορά αν δεν υπάρχει επιλεγμένη ημερομηνία
             return;
         }

        // Καλούμε τη συνάρτηση αναφοράς με την επιλεγμένη ημερομηνία ως ημερομηνία έναρξης
        generateSevenDayReport(selectedDate);
    });


     // Event listener για το κουμπί εξαγωγής PDF (μόνο το κάτω)
    exportWeeklyPdfButtonBottom.addEventListener('click', exportSevenDayReportToPdf);


    // --- Αρχικοποίηση κατά τη φόρτωσης της σελίδας ---

    // Θέτουμε τη σημερινή ημερομηνία ως προεπιλογή και δημιουργούμε την αναφορά
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    weeklyReportDateInput.value = todayString; // Θέτουμε τη σημερινή ημερομηνία ως προεπιλογή
    generateSevenDayReport(todayString); // Δημιουργία αναφοράς για το διάστημα που ξεκινά από σήμερα

    // Εμφάνιση κουμπιού εξαγωγής PDF κατά την αρχικοποίησης (εφόσον υπάρχει προεπιλεγμένη ημερομηνία)
    exportWeeklyPdfButtonBottom.style.display = 'block';


    console.log("Το weekly-report.js φορτώθηκε επιτυχώς.");
});