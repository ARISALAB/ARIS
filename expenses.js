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

    const expenseForm = document.getElementById('expense-form');
    const editingExpenseIdInput = document.getElementById('editing-expense-id');
    const expenseDateInput = document.getElementById('expense-date');

    // --- Αλλαγές εδώ: αναφορά στο input field και το datalist ---
    const expenseSupplierInput = document.getElementById('expense-supplier-input');
    const supplierDatalist = document.getElementById('supplier-list');
    // const expenseSupplierSelect = document.getElementById('expense-supplier'); // Αυτή η αναφορά δεν χρειάζεται πλέον


    const expenseTypeSelect = document.getElementById('expense-type');
    const expensePaymentMethodSelect = document.getElementById('expense-payment-method');
    const expenseInvoiceNumberInput = document.getElementById('expense-invoice-number');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expensesTableBody = document.querySelector('#expenses-table tbody');

    // Νέες αναφορές στα κελιά των επιμέρους συνόλων
    const dailyTotalCashTd = document.getElementById('daily-total-cash');
    const dailyTotalCardTd = document.getElementById('daily-total-card');
    const dailyTotalCashCardTd = document.getElementById('daily-total-cash-card');
    const dailyTotalCreditTd = document.getElementById('daily-total-credit');


    const selectedExpenseDateDisplaySpan = document.getElementById('selected-expense-date-display');
    const noExpenseDataMessage = document.getElementById('no-expense-data-message');
    const submitExpenseButton = document.getElementById('submit-expense-button');
    const exportExpensesPdfButton = document.getElementById('export-expenses-pdf-button');


    // --- Λειτουργίες Local Storage για Προμηθευτές ---
     const getAllSuppliers = () => {
        const data = localStorage.getItem('suppliers');
        return data ? JSON.parse(data) : [];
    };

    // --- Λειτουργίες Local Storage για Έξοδα ---
    const getAllExpensesData = () => {
        const data = localStorage.getItem('expenseData');
        return data ? JSON.parse(data) : {};
    };

    const saveAllExpensesData = (data) => {
        localStorage.setItem('expenseData', JSON.stringify(data));
    };

    const getExpensesForDate = (date) => {
        const allData = getAllExpensesData();
        return allData[date] || [];
    };

    // Συνάρτηση για την προσθήκη νέας καταχώρησης εξόδου για συγκεκριμένη ημερομηνία
    const addExpenseEntry = (date, entry) => {
        const allData = getAllExpensesData();
        if (!allData[date]) {
            allData[date] = [];
        }
        allData[date].push(entry);
        saveAllExpensesData(allData);
    };

    // --- Νέα συνάρτηση για διαγραφή καταχώρησης εξόδου με ID ---
    const deleteExpenseEntry = (idToDelete) => {
        const selectedDate = expenseDateInput.value; // Παίρνουμε την τρέχουσα ημερομηνία
        const allData = getAllExpensesData();

        if (allData[selectedDate]) {
            allData[selectedDate] = allData[selectedDate].filter(entry => entry.id !== idToDelete);
            if (allData[selectedDate].length === 0) {
                 delete allData[selectedDate];
            }
            saveAllExpensesData(allData);
            console.log(`Διαγράφηκε καταχώρηση εξόδου με ID: ${idToDelete}`);
            displayExpensesForDate(selectedDate);
        }
    };

     // --- Νέα συνάρτηση για εύρεση καταχώρησης με ID ---
     const findExpenseEntryById = (id) => {
         const selectedDate = expenseDateInput.value;
         const entries = getExpensesForDate(selectedDate);
         return entries.find(entry => entry.id === id);
     };

     // --- Νέα συνάρτηση για επεξεργασία/ενημέρωσης καταχώρησης ---
     const updateExpenseEntry = (idToUpdate, updatedEntry) => {
         const selectedDate = expenseDateInput.value;
         const allData = getAllExpensesData();

         if (allData[selectedDate]) {
             const entryIndex = allData[selectedDate].findIndex(entry => entry.id === idToUpdate);

             if (entryIndex !== -1) {
                 allData[selectedDate][entryIndex] = updatedEntry;
                 saveAllExpensesData(allData);
                 console.log(`Ενημερώθηκε καταχώρηση εξόδου με ID: ${idToUpdate}`);
                 displayExpensesForDate(selectedDate);
             } else {
                 console.error(`Δεν βρέθηκε καταχώρηση εξόδου με ID: ${idToUpdate} για ενημέρωση.`);
             }
         }
     };


    // --- Λειτουργίες Εμφάνισης ---

     // --- Αλλαγή εδώ: Populate το datalist αντί του select ---
     const populateSupplierDatalist = () => {
        const suppliers = getAllSuppliers();
        supplierDatalist.innerHTML = ''; // Καθαρισμός προηγούμενων επιλογών
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            // Για το datalist, απλά ορίζουμε την τιμή (value) της επιλογής
            option.value = supplier.name;
            // Δεν χρειάζεται textContent για το datalist, το value εμφανίζεται ως πρόταση
            supplierDatalist.appendChild(option);
        });
     };

    // Συνάρτηση για την εμφάνιση των εξόδων στον πίνακα για την επιλεγμένη ημερομηνία
    const displayExpensesForDate = (date) => {
        const entries = getExpensesForDate(date);
        expensesTableBody.innerHTML = '';

        // Αρχικοποίηση των επιμέρους συνόλων
        let totalCash = 0;
        let totalCard = 0;
        let totalCredit = 0;

        if (entries.length === 0) {
            noExpenseDataMessage.style.display = 'block';
        } else {
             noExpenseDataMessage.style.display = 'none';
            entries.forEach(entry => {
                const row = expensesTableBody.insertRow();

                 row.dataset.id = entry.id;

                row.insertCell(0).textContent = entry.time || 'N/A';
                row.insertCell(1).textContent = entry.supplier || '-'; // Ο προμηθευτής είναι απλά κείμενο
                row.insertCell(2).textContent = entry.expenseType || '-';
                row.insertCell(3).textContent = entry.paymentMethod || '-';
                row.insertCell(4).textContent = entry.invoiceNumber || '-';
                row.insertCell(5).textContent = formatCurrency(entry.amount);

                const actionsCell = row.insertCell(6);
                actionsCell.classList.add('action-buttons');

                const editButton = document.createElement('button');
                editButton.textContent = 'Επεξεργασία';
                editButton.classList.add('edit-button');
                editButton.addEventListener('click', () => {
                    editExpense(entry.id);
                });
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Διαγραφή';
                deleteButton.classList.add('delete-button');
                 deleteButton.addEventListener('click', () => {
                    if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την καταχώρηση εξόδου (${formatCurrency(entry.amount)}) από τον προμηθευτή ${entry.supplier} για την ώρα ${entry.time};`)) {
                        deleteExpenseEntry(entry.id);
                    }
                });
                actionsCell.appendChild(deleteButton);

                // Υπολογισμός των επιμέρους συνόλων
                const amount = parseFloat(entry.amount) || 0; // Βεβαιωνόμαστε ότι είναι αριθμός
                if (entry.paymentMethod === 'cash') {
                    totalCash += amount;
                } else if (entry.paymentMethod === 'card') {
                    totalCard += amount;
                } else if (entry.paymentMethod === 'credit') {
                    totalCredit += amount;
                }
            });
        }

        // Υπολογισμός του συνόλου Μετρητά + Κάρτα
        const totalCashAndCard = totalCash + totalCard;

        // Εμφάνιση των επιμέρους συνόλων στα αντίστοιχα κελιά του footer
        dailyTotalCashTd.textContent = formatCurrency(totalCash);
        dailyTotalCardTd.textContent = formatCurrency(totalCard);
        dailyTotalCashCardTd.textContent = formatCurrency(totalCashAndCard);
        dailyTotalCreditTd.textContent = formatCurrency(totalCredit);


        // Ενημέρωση της εμφάνισης της ημερομηνίας πάνω από τον πίνακα
        const dateObj = new Date(date + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        selectedExpenseDateDisplaySpan.textContent = dateObj.toLocaleDateString('el-GR', options);
    };

    // --- Λειτουργία Επεξεργασίας Εξόδου ---
     const editExpense = (id) => {
         const entryToEdit = findExpenseEntryById(id);

         if (entryToEdit) {
             // --- Αλλαγή εδώ: Θέτουμε την τιμή στο input field ---
             expenseSupplierInput.value = entryToEdit.supplier;

             expenseTypeSelect.value = entryToEdit.expenseType;
             expensePaymentMethodSelect.value = entryToEdit.paymentMethod;
             expenseInvoiceNumberInput.value = entryToEdit.invoiceNumber;
             expenseAmountInput.value = entryToEdit.amount;

             editingExpenseIdInput.value = entryToEdit.id;
             submitExpenseButton.textContent = 'Ενημέρωση Εξόδου';
         } else {
             console.error(`Δεν βρέθηκε καταχώρηση εξόδου με ID: ${id} για επεξεργασία.`);
         }
     };


    // --- Λειτουργία Εξαγωγής Εξόδων σε PDF ---
    const exportExpensesToPdf = () => {
        const selectedDate = expenseDateInput.value;
        if (!selectedDate) {
            alert('Παρακαλώ επιλέξτε ημερομηνία με καταχωρήσεις εξόδων για εξαγωγή.');
            return;
        }

        const expensesForDate = getExpensesForDate(selectedDate);

        if (expensesForDate.length === 0) {
             alert(`Δεν υπάρχουν καταχωρήσεις εξόδων για την ημερομηνία ${selectedDate} για εξαγωγή.`);
             return;
        }

         const dateObj = new Date(selectedDate + 'T00:00:00');
         const formattedDate = dateObj.toLocaleDateString('el-GR', { year: 'numeric', month: 'long', day: 'numeric' });

        // Δημιουργία του πίνακα περιεχομένου για το PDF
        const tableBody = [
            // Επικεφαλίδα πίνακα
             [{ text: 'Ώρα', style: 'tableHeader' }, { text: 'Προμηθευτής', style: 'tableHeader' },
              { text: 'Είδος', style: 'tableHeader' }, { text: 'Τρόπος Πληρωμής', style: 'tableHeader' },
              { text: 'Αρ. Τιμολογίου', style: 'tableHeader' }, { text: 'Ποσό (€)', style: 'tableHeader', alignment: 'right' }]
        ];

        // Αρχικοποίηση των επιμέρους συνόλων για το PDF
        let totalCash = 0;
        let totalCard = 0;
        let totalCredit = 0;


        // Προσθήκη γραμμών για κάθε καταχώρηση εξόδου
        expensesForDate.forEach(entry => {
            tableBody.push([
                entry.time || '-',
                entry.supplier || '-',
                entry.expenseType || '-',
                entry.paymentMethod || '-',
                entry.invoiceNumber || '-',
                 { text: formatCurrency(entry.amount), alignment: 'right' }
            ]);
             // Υπολογισμός των επιμέρους συνόλων για το PDF
             const amount = parseFloat(entry.amount) || 0;
             if (entry.paymentMethod === 'cash') totalCash += amount;
             else if (entry.paymentMethod === 'card') totalCard += amount;
             else if (entry.paymentMethod === 'credit') totalCredit += amount;
        });

         // Υπολογισμός του συνόλου Μετρητά + Κάρτα για το PDF
         const totalCashAndCard = totalCash + totalCard;


         // Δημιουργία των γραμμών συνόλου για το footer του PDF πίνακα
         const pdfFooters = [];

         // Γραμμή: Σύνολο Μετρητά
         pdfFooters.push([
             { text: 'Σύνολο Μετρητά:', colSpan: 5, alignment: 'right', bold: true, margin: [0,5,0,5] },
             '', '', '', '',
              { text: formatCurrency(totalCash), alignment: 'right', bold: true, margin: [0,5,0,5] }
         ]);
          // Γραμμή: Σύνολο Κάρτα
         pdfFooters.push([
             { text: 'Σύνολο Κάρτα:', colSpan: 5, alignment: 'right', bold: true, margin: [0,5,0,5] },
             '', '', '', '',
              { text: formatCurrency(totalCard), alignment: 'right', bold: true, margin: [0,5,0,5] }
         ]);
          // Γραμμή: Σύνολο Μετρητά + Κάρτα
         pdfFooters.push([
             { text: 'Σύνολο Μετρητά + Κάρτα:', colSpan: 5, alignment: 'right', bold: true, margin: [0,5,0,5] },
             '', '', '', '',
              { text: formatCurrency(totalCashAndCard), alignment: 'right', bold: true, margin: [0,5,0,5] }
         ]);
          // Γραμμή: Σύνολο Επί Πιστώσει (ξεχωριστά)
         pdfFooters.push([
             { text: 'Σύνολο Επί Πιστώσει:', colSpan: 5, alignment: 'right', bold: true, margin: [0,5,0,5] },
             '', '', '', '',
              { text: formatCurrency(totalCredit), alignment: 'right', bold: true, margin: [0,5,0,5] }
         ]);


         // Προσθήκη των γραμμών συνόλου στο τέλος του πίνακα περιεχομένου του PDF
         tableBody.push(...pdfFooters);


        // Ορισμός του PDF document definition
        const docDefinition = {
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10
            },
            content: [
                { text: 'Καταχωρημένα Έξοδα Ημέρας', style: 'header' },
                { text: `Ημερομηνία: ${formattedDate}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                         // Προσαρμόζουμε τα πλάτη των στηλών
                         widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                         body: tableBody // Χρησιμοποιούμε τον πίνακα με τα νέα footers
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
                },
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
                    fontSize: 11,
                    color: 'white',
                    fillColor: '#007bff',
                    alignment: 'left',
                     padding: [5, 5, 5, 5]
                }
            },
             info: {
                 title: `Έξοδα Ημερας ${selectedDate}`,
                 author: 'Η Εφαρμογή μου',
             }
        };

        // Δημιουργία του PDF και εξαγωγή σε Base64 Data URL
        pdfMake.createPdf(docDefinition).getDataUrl(function(dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Εξοδα_Ημερας_${selectedDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };


    // --- Event Listeners ---

    // Όταν αλλάζει η ημερομηνία στο date picker
    expenseDateInput.addEventListener('change', (event) => {
        const selectedDate = event.target.value;
        if (selectedDate) {
             // Αποθηκεύουμε την επιλεγμένη ημερομηνία στο Local Storage
            localStorage.setItem('lastSelectedExpenseDate', selectedDate);
            displayExpensesForDate(selectedDate);
            // Όταν αλλάζει η ημερομηνία, βεβαιωνόμαστε ότι δεν είμαστε σε κατάσταση επεξεργασίας
            editingExpenseIdInput.value = ''; // Καθαρίζουμε το κρυφό πεδίο ID
            submitExpenseButton.textContent = 'Προσθήκη Εξόδου'; // Επαναφέρουμε το κείμενο του κουμπιού

            // Καθαρίζουμε μόνο τα πεδία εισαγωγής, αφήνοντας την ημερομηνία ως έχει
            // --- Αλλαγή εδώ: καθαρίζουμε το input field του προμηθευτή ---
            expenseSupplierInput.value = '';

            expenseTypeSelect.value = '';
            expensePaymentMethodSelect.value = '';
            expenseInvoiceNumberInput.value = '';
            expenseAmountInput.value = '0'; // Επαναφέρουμε το ποσό στο 0
        }
    });

    // Όταν υποβάλλεται η φόρμα
    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const date = expenseDateInput.value;
        // --- Αλλαγή εδώ: Παίρνουμε την τιμή από το input field ---
        const supplier = expenseSupplierInput.value.trim(); // Παίρνουμε την τιμή και αφαιρούμε κενά

        const expenseType = expenseTypeSelect.value;
        const paymentMethod = expensePaymentMethodSelect.value;
        const invoiceNumber = expenseInvoiceNumberInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value) || 0;

        // --- Αλλαγή εδώ: Ελέγχουμε αν το input field του προμηθευτή έχει τιμή ---
        if (!date || !supplier || !expenseType || !paymentMethod || amount <= 0) {
            alert("Παρακαλώ συμπληρώστε όλα τα απαραίτητα πεδία (Ημερομηνία, Προμηθευτή, Είδος, Τρόπο Πληρωμής) και έγκυρο Ποσό.");
            return;
        }

        const editingId = editingExpenseIdInput.value;

        const newOrUpdatedEntry = {
            id: editingId ? parseInt(editingId, 10) : Date.now(),
            time: editingId ? findExpenseEntryById(parseInt(editingId, 10)).time : new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }),
            date: date,
            supplier: supplier, // Αποθηκεύουμε την τιμή όπως την πληκτρολόγησε ο χρήστης
            expenseType: expenseType,
            paymentMethod: paymentMethod,
            invoiceNumber: invoiceNumber,
            amount: amount
        };


        if (editingId) {
            updateExpenseEntry(parseInt(editingId, 10), newOrUpdatedEntry);
        } else {
            addExpenseEntry(date, newOrUpdatedEntry);
        }

        displayExpensesForDate(date);

        // --- Αλλαγή εδώ: καθαρίζουμε το input field του προμηθευτή ---
        editingExpenseIdInput.value = '';
        submitExpenseButton.textContent = 'Προσθήκη Εξόδου';
        expenseSupplierInput.value = '';

        expenseTypeSelect.value = '';
        expensePaymentMethodSelect.value = '';
        expenseInvoiceNumberInput.value = '';
        expenseAmountInput.value = '0';
    });

    exportExpensesPdfButton.addEventListener('click', exportExpensesToPdf);


    // --- Αρχικοποίηση κατά τη φόρτωση της σελίδας ---

    // --- Αλλαγή εδώ: Καλούμε τη νέα συνάρτηση για το datalist ---
    populateSupplierDatalist();

    const savedDate = localStorage.getItem('lastSelectedExpenseDate');

    let dateToDisplay;
    if (savedDate) {
        dateToDisplay = savedDate;
        expenseDateInput.value = savedDate;
    } else {
        const today = new Date();
        dateToDisplay = today.toISOString().split('T')[0];
        expenseDateInput.value = dateToDisplay;
        localStorage.setItem('lastSelectedExpenseDate', dateToDisplay);
    }

    displayExpensesForDate(dateToDisplay);


    console.log("Το expenses.js φορτώθηκε επιτυχώς.");
});