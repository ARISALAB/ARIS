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


    const incomeForm = document.getElementById('income-form');
    const incomeDateInput = document.getElementById('income-date');
    const incomeDescriptionInput = document.getElementById('income-description');
    const cashAmountInput = document.getElementById('income-cash-amount');
    const cardAmountInput = document.getElementById('income-card-amount');
    const currentEntryTotalSpan = document.getElementById('current-entry-total');
    const incomeTableBody = document.querySelector('#income-table tbody');
    const dailyTotalIncomeTd = document.getElementById('daily-total-income');
    const selectedDateDisplaySpan = document.getElementById('selected-date-display');
    const noDataMessage = document.getElementById('no-data-message');

    // --- Λειτουργίες Local Storage ---
    const getAllIncomeData = () => {
        const data = localStorage.getItem('incomeData');
        return data ? JSON.parse(data) : {};
    };

    const saveAllIncomeData = (data) => {
        localStorage.setItem('incomeData', JSON.stringify(data));
    };

    const getIncomeForDate = (date) => {
        const allData = getAllIncomeData();
        return allData[date] || [];
    };

    const addIncomeEntry = (date, entry) => {
        const allData = getAllIncomeData();
        if (!allData[date]) {
            allData[date] = [];
        }
        allData[date].push(entry);
        saveAllIncomeData(allData);
    };

    // --- Νέα συνάρτηση για διαγραφή εσόδων για συγκεκριμένη ημερομηνία ---
    const deleteIncomeForDate = (date) => {
        const allData = getAllIncomeData();
        if (allData[date]) {
            delete allData[date]; // Διαγράφουμε την ιδιότητα με την ημερομηνία
            saveAllIncomeData(allData); // Αποθηκεύουμε τα ενημερωμένα δεδομένα
            console.log(`Διαγράφηκαν καταχωρήσεις εσόδων για την ημερομηνία: ${date}`);
        }
    };
    // -------------------------------------------------------------------


    // --- Λειτουργίες Εμφάνισης ---

    const displayIncomeForDate = (date) => {
        const entries = getIncomeForDate(date);
        incomeTableBody.innerHTML = '';
        let dailyTotal = 0;

        if (entries.length === 0) {
            noDataMessage.style.display = 'block';
        } else {
             noDataMessage.style.display = 'none';
            entries.forEach(entry => {
                const row = incomeTableBody.insertRow();
                row.insertCell(0).textContent = entry.time || 'N/A';
                row.insertCell(1).textContent = entry.description || '-';
                row.insertCell(2).textContent = formatCurrency(entry.cash);
                row.insertCell(3).textContent = formatCurrency(entry.card);
                row.insertCell(4).textContent = formatCurrency(entry.total);

                dailyTotal += entry.total;
            });
        }

        dailyTotalIncomeTd.textContent = formatCurrency(dailyTotal);

        const dateObj = new Date(date + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        selectedDateDisplaySpan.textContent = dateObj.toLocaleDateString('el-GR', options);
    };

    // --- Λειτουργίες Φόρμας και Υπολογισμού ---

    const calculateAndDisplayCurrentTotal = () => {
        const cash = parseFloat(cashAmountInput.value) || 0;
        const card = parseFloat(cardAmountInput.value) || 0;
        const total = cash + card;
        currentEntryTotalSpan.textContent = formatCurrency(total);
    };

    // --- Event Listeners ---

    cashAmountInput.addEventListener('input', calculateAndDisplayCurrentTotal);
    cardAmountInput.addEventListener('input', calculateAndDisplayCurrentTotal);

    // Όταν αλλάζει η ημερομηνία στο date picker
    incomeDateInput.addEventListener('change', (event) => {
        const selectedDate = event.target.value;
        const existingEntries = getIncomeForDate(selectedDate); // Παίρνουμε τις υπάρχουσες καταχωρήσεις

        // Μορφοποίηση της ημερομηνίας για το μήνυμα
        const dateObj = new Date(selectedDate + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('el-GR', options);


        if (existingEntries.length > 0) {
            // Υπάρχουν ήδη καταχωρήσεις
            const confirmReplace = confirm(`Υπάρχουν ήδη ${existingEntries.length} καταχωρήσεις εσόδων για την ημερομηνία ${formattedDate}.\n\nΘέλετε να αντικαταστήσετε αυτές τις καταχωρήσεις με νέες από τη φόρμα όταν υποβάλετε; (Πατήστε ΟΚ για αντικατάσταση / Άκυρο για προσθήκη στις υπάρχουσες)`);

            if (confirmReplace) {
                // Ο χρήστης επέλεξε αντικατάσταση
                deleteIncomeForDate(selectedDate); // Διαγραφή των παλιών καταχωρήσεων
                alert(`Οι υπάρχουσες ${existingEntries.length} καταχωρήσεις για την ημερομηνία ${formattedDate} διαγράφηκαν.\nΗ επόμενη υποβολή θα είναι η πρώτη για αυτή την ημερομηνία.`);
            } else {
                // Ο χρήστης επέλεξε προσθήκη στις υπάρχουσες
                 alert(`Οι νέες καταχωρήσεις για την ημερομηνία ${formattedDate} θα προστεθούν στις υπάρχουσες.`);
            }
        }
        // Εμφάνιση των καταχωρήσεων για την επιλεγμένη ημερομηνία (είτε τις παλιές αν δεν έγινε replace, είτε τώρα είναι κενό αν έγινε replace)
        displayIncomeForDate(selectedDate);
    });

    incomeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const date = incomeDateInput.value;
        const description = incomeDescriptionInput.value.trim();
        const cash = parseFloat(cashAmountInput.value) || 0;
        const card = parseFloat(cardAmountInput.value) || 0;
         const total = cash + card;

        if (cash === 0 && card === 0) {
            alert("Παρακαλώ εισάγετε ένα ποσό για Μετρητά ή Κάρτα.");
            return;
        }

         const now = new Date();
         const timeString = now.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

        const newEntry = {
            id: Date.now(),
            time: timeString,
            description: description,
            cash: cash,
            card: card,
            total: total
        };

        // Η συνάρτηση addIncomeEntry πάντα προσθέτει.
        // Αν ο χρήστης επέλεξε replace πριν αλλάζοντας την ημερομηνία,
        // οι παλιές καταχωρήσεις έχουν ήδη διαγραφεί.
        addIncomeEntry(date, newEntry);

        displayIncomeForDate(date); // Εμφάνιση των ενημερωμένων (ή νέων) καταχωρήσεων

        incomeForm.reset();
        calculateAndDisplayCurrentTotal();
    });


    // --- Αρχικοποίηση κατά τη φόρτωση της σελίδας ---

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    incomeDateInput.value = todayString;

    displayIncomeForDate(todayString);


    console.log("Το income.js φορτώθηκε επιτυχώς.");
});