// Βοηθητικές συναρτήσεις για Local Storage
const getAllIncomeData = () => {
    const data = localStorage.getItem('incomeData');
    return data ? JSON.parse(data) : {};
};

const getAllExpensesData = () => {
    const data = localStorage.getItem('expenseData');
    return data ? JSON.parse(data) : {};
};

document.addEventListener('DOMContentLoaded', () => {

    // --- Βοηθητική συνάρτηση μορφοποίησης νομισματικών τιμών ---
    const formatCurrency = (amount) => {
        const number = parseFloat(amount) || 0;
        return number.toLocaleString('el-GR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + '€';
    };
    // -----------------------------------------------------------

    const reportDateInput = document.getElementById('report-date');
    const reportDateDisplaySpan = document.getElementById('report-date-display'); // ID from your HTML snippet
    const noReportDataMessage = document.getElementById('no-report-data-message');
    const exportPdfButton = document.getElementById('export-pdf-button'); // ID from your HTML snippet

    // --- Αναφορά στον πίνακα σύνοψης ---
    const summaryTable = document.getElementById('summary-table'); // ID from your HTML snippet

    // Αναφορές στα κελιά του πίνακα σύνοψης (IDs from your HTML snippet)
    const reportCashIncomeTd = document.getElementById('report-cash-income');
    const reportCardIncomeTd = document.getElementById('report-card-income');
    const reportTotalIncomeTd = document.getElementById('report-total-income');
    const reportCashExpensesTd = document.getElementById('report-cash-expenses');
    const reportCardExpensesTd = document.getElementById('report-card-expenses');
    const reportTotalExpensesTd = document.getElementById('report-total-expenses'); // Matches your HTML snippet
    const reportCreditExpensesTd = document.getElementById('report-credit-expenses');
    const reportCashBalanceTd = document.getElementById('report-cash-balance');
    const reportCardBalanceTd = document.getElementById('report-card-balance');
    const reportTotalBalanceTd = document.getElementById('report-total-balance');

    // Αναφορές στα canvas για τα γραφήματα (IDs from your HTML snippet)
    const incomePieChartCanvasElement = document.getElementById('incomePieChart');
    const totalComparisonPieChartCanvasElement = document.getElementById('totalComparisonPieChart');

    // Μεταβλητές για τα γραφήματα
    let incomeChart;
    let totalComparisonChart;


    // Συνάρτηση για τον υπολογισμό των συνοπτικών δεδομένων για μια ημερομηνία
    const calculateDailySummary = (date) => {
        const incomeEntries = getAllIncomeData()[date] || [];
        const expenseEntries = getAllExpensesData()[date] || [];

        let cashIncome = 0;
        let cardIncome = 0;
        let cashExpenses = 0;
        let cardExpenses = 0;
        let creditExpenses = 0;

        incomeEntries.forEach(entry => {
            cashIncome += parseFloat(entry.cash) || 0; // Χρήση parseFloat
            cardIncome += parseFloat(entry.card) || 0; // Χρήση parseFloat
        });

        expenseEntries.forEach(entry => {
            const amount = parseFloat(entry.amount) || 0; // Χρήση parseFloat
             if (entry.paymentMethod === 'cash') {
                 cashExpenses += amount;
             } else if (entry.paymentMethod === 'card') {
                 cardExpenses += amount;
             } else if (entry.paymentMethod === 'credit') {
                 creditExpenses += amount;
             }
        });

        const totalIncome = cashIncome + cardIncome;
        const totalExpensesAffectingBalance = cashExpenses + cardExpenses; // Έξοδα που επηρεάζουν το ταμείο

        const cashBalance = cashIncome - cashExpenses;
        const cardBalance = cardIncome - cardExpenses;
        const totalBalance = totalIncome - totalExpensesAffectingBalance;

        return {
            cashIncome,
            cardIncome,
            totalIncome,
            cashExpenses,
            cardExpenses,
            creditExpenses,
            totalExpensesAffectingBalance,
            cashBalance,
            cardBalance,
            totalBalance
        };
    };

    // Συνάρτηση για την εμφάνιση των δεδομένων στον πίνακα
    const displayReportSummary = (summaryData) => {
        // Εφαρμογή μορφοποίησης σε όλα τα ποσά
        reportCashIncomeTd.textContent = formatCurrency(summaryData.cashIncome);
        reportCardIncomeTd.textContent = formatCurrency(summaryData.cardIncome);
        reportTotalIncomeTd.textContent = formatCurrency(summaryData.totalIncome);
        reportCashExpensesTd.textContent = formatCurrency(summaryData.cashExpenses);
        reportCardExpensesTd.textContent = formatCurrency(summaryData.cardExpenses);
        reportTotalExpensesTd.textContent = formatCurrency(summaryData.totalExpensesAffectingBalance); // Εμφάνιση συνόλου εξόδων Μετρητά + Κάρτα
        reportCreditExpensesTd.textContent = formatCurrency(summaryData.creditExpenses);
        reportCashBalanceTd.textContent = formatCurrency(summaryData.cashBalance);
        reportCardBalanceTd.textContent = formatCurrency(summaryData.cardBalance);
        reportTotalBalanceTd.textContent = formatCurrency(summaryData.totalBalance);

        // --- Διόρθωση: Εμφάνιση/Απόκρυψη πίνακα και μηνύματος ---
         if (summaryData.totalIncome > 0 || summaryData.cashExpenses > 0 || summaryData.cardExpenses > 0 || summaryData.creditExpenses > 0) {
             noReportDataMessage.style.display = 'none';
             summaryTable.style.display = 'table'; // Κάνε τον πίνακα ορατό
         } else {
             noReportDataMessage.style.display = 'block';
             summaryTable.style.display = 'none'; // Κρύψε τον πίνακα αν δεν υπάρχουν δεδομένα
         }
    };

    // Συνάρτηση για την προετοιμασία και την ενημέρωση των γραφημάτων
    const updateCharts = (summaryData) => {
        // Στα γραφήματα η Chart.js περιμένει αριθμούς, όχι μορφοποιημένες strings
        const incomeChartData = {
            labels: ['Έσοδα Μετρητά', 'Έσοδα Κάρτα'],
            datasets: [{
                data: [summaryData.cashIncome, summaryData.cardIncome],
                backgroundColor: ['#28a745', '#007bff'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        };

        const totalComparisonChartData = {
            labels: ['Συνολικά Έσοδα', 'Συνολικά Έξοδα (Μετρητά & Κάρτα)'],
            datasets: [{
                data: [summaryData.totalIncome, summaryData.totalExpensesAffectingBalance],
                backgroundColor: ['#28a745', '#dc3545'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        };

        // --- Διόρθωση: Έλεγχος πριν την αρχικοποίηση γραφημάτων ---
        if (incomeChart) {
            incomeChart.destroy();
        }
        if (incomePieChartCanvasElement) { // Έλεγχος αν βρέθηκε το canvas element
            incomeChart = new Chart(incomePieChartCanvasElement.getContext('2d'), {
                type: 'pie',
                data: incomeChartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: { display: false }
                    },
                },
            });
             // Εμφάνιση του chart container αν υπάρχουν δεδομένα για το γράφημα εσόδων
             const chartContainer = incomePieChartCanvasElement.closest('.chart-container'); // Βρες τον κοντινότερο container
             if (chartContainer) {
                  if (summaryData.cashIncome > 0 || summaryData.cardIncome > 0) {
                      // chartContainer.style.display = 'block'; // Η split-layout το ελέγχει
                  } else {
                       // chartContainer.style.display = 'none'; // Η split-layout το ελέγχει
                  }
             }

        } else {
             console.error("Canvas element with ID 'incomePieChart' not found.");
        }


        if (totalComparisonChart) {
            totalComparisonChart.destroy();
        }
         if (totalComparisonPieChartCanvasElement) { // Έλεγχος αν βρέθηκε το canvas element
            totalComparisonChart = new Chart(totalComparisonPieChartCanvasElement.getContext('2d'), {
                type: 'pie',
                data: totalComparisonChartData,
                 options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: { display: false }
                    },
                },
            });
             // Εμφάνιση του chart container αν υπάρχουν δεδομένα για το γράφημα σύγκρισης
             const chartContainer = totalComparisonPieChartCanvasElement.closest('.chart-container'); // Βρες τον κοντινότερο container
             if (chartContainer) {
                  if (summaryData.totalIncome > 0 || summaryData.totalExpensesAffectingBalance > 0) {
                      // chartContainer.style.display = 'block'; // Η split-layout το ελέγχει
                  } else {
                      // chartContainer.style.display = 'none'; // Η split-layout το ελέγχει
                  }
             }
         } else {
             console.error("Canvas element with ID 'totalComparisonPieChart' not found.");
         }

         // Συνολικός έλεγχος για το chart container
         const mainChartContainer = document.querySelector('.chart-container'); // Αναφορά στο κύριο container
         if (mainChartContainer) {
             if ((summaryData.cashIncome > 0 || summaryData.cardIncome > 0) || (summaryData.totalIncome > 0 || summaryData.totalExpensesAffectingBalance > 0)) {
                  mainChartContainer.style.display = 'block'; // Εμφάνισε το container αν οποιοδήποτε γράφημα έχει δεδομένα
             } else {
                  mainChartContainer.style.display = 'none'; // Κρύψε το container αν κανένα γράφημα δεν έχει δεδομένα
             }
         }


    };


    const generateReport = (date) => {
        const summaryData = calculateDailySummary(date);
        displayReportSummary(summaryData);
        updateCharts(summaryData);

        const dateObj = new Date(date + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        reportDateDisplaySpan.textContent = dateObj.toLocaleDateString('el-GR', options);
    };

    // --- Λειτουργία Εξαγωγής PDF ---

    const exportReportToPdf = () => {
        const selectedDate = reportDateInput.value;
        if (!selectedDate) {
            alert('Παρακαλώ επιλέξτε ημερομηνία για την αναφορά.');
            return;
        }

        const summaryData = calculateDailySummary(selectedDate); // Υπολογισμός δεδομένων

         // Ελέγχουμε αν υπάρχουν καθόλου δεδομένα για εξαγωγή
         if (summaryData.totalIncome === 0 && summaryData.cashExpenses === 0 && summaryData.cardExpenses === 0 && summaryData.creditExpenses === 0) {
              alert(`Δεν υπάρχουν καταχωρημένα έσοδα ή έξοδα για την ημερομηνία ${selectedDate} για εξαγωγή.`);
              return;
         }


        const dateObj = new Date(selectedDate + 'T00:00:00');
        const formattedDate = dateObj.toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' }); // Μορφοποιημένη ημερομηνία

        // --- Δημιουργία Λογιστικών Σχολίων ---
        const comments = [];

        comments.push({ text: 'Λογιστική Σύνοψη Ημέρας:', style: 'commentsHeader', margin: [0, 20, 0, 5] });

        // Σχόλιο για το Συνολικό Υπόλοιπο Ταμείου
        if (summaryData.totalBalance > 0) {
            comments.push({ text: `Η ημέρα παρουσιάζει συνολικό πλεόνασμα ταμείου ${formatCurrency(summaryData.totalBalance)} (Έσοδα Μετρητά + Κάρτα μείον Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        } else if (summaryData.totalBalance < 0) {
            comments.push({ text: `Η ημέρα παρουσιάζει συνολικό έλλειμμα ταμείου ${formatCurrency(Math.abs(summaryData.totalBalance))} (Έσοδα Μετρητά + Κάρτα μείον Έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        } else {
            comments.push({ text: `Η ημέρα παρουσιάζει ισορροπία στο συνολικό ταμείο (τα συνολικά έσοδα Μετρητά + Κάρτα ισούνται με τα συνολικά έξοδα Μετρητά + Κάρτα).`, margin: [0, 5] });
        }

        // Σχόλιο για το Υπόλοιπο Μετρητών
        if (summaryData.cashBalance > 0) {
            comments.push({ text: `Το υπόλοιπο των μετρητών για την ημέρα είναι θετικό, ανέρχεται σε ${formatCurrency(summaryData.cashBalance)}.`, margin: [0, 5] });
        } else if (summaryData.cashBalance < 0) {
            comments.push({ text: `Το υπόλοιπο των μετρητών για την ημέρα είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(summaryData.cashBalance))}.`, margin: [0, 5] });
        } else {
            comments.push({ text: `Το υπόλοιπο των μετρητών για την ημέρα είναι μηδενικό.`, margin: [0, 5] });
        }

        // Σχόλιο για το Υπόλοιπο Καρτών
        if (summaryData.cardBalance > 0) {
            comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για την ημέρα είναι θετικό, ανέρχεται σε ${formatCurrency(summaryData.cardBalance)}.`, margin: [0, 5] });
        } else if (summaryData.cardBalance < 0) {
            comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για την ημέρα είναι αρνητικό, ανέρχεται σε ${formatCurrency(Math.abs(summaryData.cardBalance))}.`, margin: [0, 5] });
        } else {
            comments.push({ text: `Το υπόλοιπο των εισπράξεων με κάρτα για την ημέρα είναι μηδενικό.`, margin: [0, 5] });
        }

        // Σχόλιο για τα Έξοδα Επί Πιστώσει
        if (summaryData.creditExpenses > 0) {
            comments.push({ text: `Σημειώθηκαν έξοδα επί πιστώσει συνολικού ποσού ${formatCurrency(summaryData.creditExpenses)} για την ημέρα, τα οποία δεν επηρεάζουν το άμεσο ταμείο.`, margin: [0, 5] });
        } else {
            comments.push({ text: `Δεν σημειώθηκαν έξοδα επί πιστώσει για την ημέρα.`, margin: [0, 5] });
        }

        // --- Ορισμός του PDF document definition ---
        const docDefinition = {
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            },
            content: [
                { text: 'Ημερήσια Οικονομική Αναφορά', style: 'header' },
                { text: `Ημερομηνία: ${formattedDate}`, style: 'subheader' },
                {
                    table: {
                        widths: ['*', 'auto'], // widths are defined correctly here
                        body: [
                            [{ text: 'Κατηγορία', style: 'tableHeader' }, { text: 'Ποσό (€)', style: 'tableHeader', alignment: 'right' }],

                            ['Έσοδα Μετρητά:', { text: formatCurrency(summaryData.cashIncome), alignment: 'right' }],
                            ['Έσοδα Κάρτα:', { text: formatCurrency(summaryData.cardIncome), alignment: 'right' }],
                            [{ text: 'Συνολικά Έσοδα:', bold: true }, { text: formatCurrency(summaryData.totalIncome), bold: true, alignment: 'right' }],
                            [{ text: '', colSpan: 2, border: [false, false, false, true], margin: [0, 5, 0, 5] }, ''],

                            ['Έξοδα Μετρητά:', { text: formatCurrency(summaryData.cashExpenses), alignment: 'right' }],
                            ['Έξοδα Κάρτα:', { text: formatCurrency(summaryData.cardExpenses), alignment: 'right' }],
                            [{ text: 'Συνολικά Έξοδα (Μετρητά & Κάρτα):', bold: true }, { text: formatCurrency(summaryData.totalExpensesAffectingBalance), bold: true, alignment: 'right' }],
                            ['Έξοδα Επί Πιστώσει:', { text: formatCurrency(summaryData.creditExpenses), alignment: 'right' }],
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
                    },
                },
                ...comments // Προσθήκη των λογιστικών σχολίων
            ],
            styles: {
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
                tableHeader: {
                    bold: true,
                    fontSize: 12, // Adjusted font size for header
                    color: 'white',
                    fillColor: '#007bff',
                    alignment: 'left',
                    padding: [5, 5, 5, 5]
                },
                commentsHeader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 20, 0, 5]
                }
            },
            info: {
                title: `Ημερήσια Αναφορά ${selectedDate}`,
                author: 'Η Εφαρμογή μου',
            }
        };

        // Δημιουργία του PDF και εξαγωγή σε Base64 Data URL
        pdfMake.createPdf(docDefinition).getDataUrl(function(dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Ημερήσια_Αναφορά_${selectedDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    // --- Event Listeners ---

    // Όταν αλλάζει η ημερομηνία στο date picker
    reportDateInput.addEventListener('change', (event) => {
        const selectedDate = event.target.value;
        if (selectedDate) {
            localStorage.setItem('lastSelectedDailyReportDate', selectedDate); // Αποθήκευση της ημερομηνίας
            generateReport(selectedDate); // Καλούμε τη συνάρτηση αναφοράς
        } else {
            // Αν δεν υπάρχει ημερομηνία (π.χ. ο χρήστης την έσβησε), κρύψε τα πάντα
            noReportDataMessage.style.display = 'block';
            summaryTable.style.display = 'none'; // Κρύψε τον πίνακα
            exportPdfButton.style.display = 'none'; // Κρύψε το κουμπί PDF

            // Καταστροφή γραφημάτων αν υπάρχουν
            if (incomeChart) {
                incomeChart.destroy();
                incomeChart = null; // Reset the chart variable
            }
             if (totalComparisonChart) {
                totalComparisonChart.destroy();
                 totalComparisonChart = null; // Reset the chart variable
            }

            // Κρύψε το container των γραφημάτων
             const chartContainer = document.querySelector('.chart-container');
             if (chartContainer) {
                  chartContainer.style.display = 'none';
             }

            // Επαναφορά κειμένου ημερομηνίας
            reportDateDisplaySpan.textContent = 'την επιλεγμένη ημερομηνία';
        }
    });

    // Όταν πατιέται το κουμπί εξαγωγής PDF
    exportPdfButton.addEventListener('click', exportReportToPdf);


    // --- Αρχικοποίηση κατά τη φόρτωση της σελίδας ---

    // Θέτουμε την τελευταία επιλεγμένη ημερομηνία ή τη σημερινή κατά την αρχικοποίηση
    const savedDate = localStorage.getItem('lastSelectedDailyReportDate');
    let dateToDisplay;

    if (savedDate) {
        dateToDisplay = savedDate;
        reportDateInput.value = savedDate;
    } else {
        const today = new Date();
        dateToDisplay = today.toISOString().split('T')[0];
        reportDateInput.value = dateToDisplay;
        localStorage.setItem('lastSelectedDailyReportDate', dateToDisplay); // Αποθήκευση της σημερινής ημερομηνίας
    }

    generateReport(dateToDisplay); // Δημιουργία αναφοράς για την αρχική ημερομηνία


    console.log("Το daily-report.js φορτώθηκε επιτυχώς.");
});