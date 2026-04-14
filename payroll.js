document.addEventListener('DOMContentLoaded', () => {

    // --- Βοηθητική συνάρτηση μορφοποίησης νομισματικών τιμών ---
    const formatCurrency = (amount) => {
        const number = parseFloat(amount) || 0;
        return number.toLocaleString('el-GR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + '€';
    };
    // ----------------------------------------------------------

    // --- Αναφορές στα στοιχεία της φόρμας και του πίνακα (μισθοδοσίας εύρους) ---
    const rangeFromDateInput = document.getElementById('range-from-date');
    const loadEmployeesForRangeButton = document.getElementById('load-employees-for-range-button');
    const rangePayrollTableHead = document.querySelector('#range-payroll-table thead');
    const rangePayrollTableBody = document.querySelector('#range-payroll-table tbody');
    const rangeTotalPayrollAmountTd = document.getElementById('range-total-payroll-amount');
    const noEmployeesForRangeMessage = document.getElementById('no-employees-for-range-message');
    const saveRangePayrollButton = document.getElementById('save-range-payroll-button');
    const rangePayrollTableContainer = document.getElementById('range-payroll-table-container');
    const grandTotalLabelCell = document.querySelector('#range-payroll-table tfoot .grand-total-label');

    // --- Αναφορές για τη σύνοψη μισθοδοσίας (δεξιά στήλη) ---
    const summaryFromDateInput = document.getElementById('summary-from-date'); // Νέο date picker
    const summaryToDateInput = document.getElementById('summary-to-date');   // Νέο date picker
    const loadSummaryButton = document.getElementById('load-summary-button'); // Νέο κουμπί
    const payrollSummaryContainer = document.getElementById('payroll-summary-container');
    const payrollSummaryTableBody = document.querySelector('#payroll-summary-table tbody');
    const summaryGrandTotalTd = document.getElementById('summary-grand-total');
    const noSummaryDataMessage = document.getElementById('no-summary-data-message');
    const exportDetailedPayrollPdfButton = document.getElementById('export-detailed-payroll-pdf-button'); // Μετονομάστηκε
    const clearPayrollDataButton = document.getElementById('clear-payroll-data-button'); // ΝΕΑ ΑΝΑΦΟΡΑ

    // --- Λειτουργίες Local Storage (Για Μισθοδοσία Εύρους) ---
    // Η δομή αποθήκευσης θα είναι:
    // payrollData: { rangeEntries: { "YYYY-MM-DD_YYYY-MM-DD": { employeeId: { "YYYY-MM-DD": hours, "YYYY-MM-DD": hours, ... } } } }
    const getPayrollData = () => {
        const data = localStorage.getItem('payrollData');
        let parsedData = {};
        try {
            parsedData = data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Error parsing payrollData from localStorage:", e);
            parsedData = {};
        }

        if (typeof parsedData.rangeEntries !== 'object' || parsedData.rangeEntries === null) {
            parsedData.rangeEntries = {};
        }
        return parsedData;
    };

    const savePayrollData = (payrollData) => {
        localStorage.setItem('payrollData', JSON.stringify(payrollData));
    };

    // ΝΕΑ ΣΥΝΑΡΤΗΣΗ: Διαγραφή Όλων των Δεδομένων Μισθοδοσίας
    const clearAllPayrollData = () => {
        if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε ΟΛΑ τα αποθηκευμένα δεδομένα μισθοδοσίας; Αυτή η ενέργεια δεν αναιρείται.')) {
            localStorage.removeItem('payrollData');
            alert('Όλα τα δεδομένα μισθοδοσίας διαγράφηκαν επιτυχώς.');
            // Επαναφόρτωση των πινάκων για να αντικατοπτρίζει τη διαγραφή
            loadEmployeesForRangePayroll(); // Επαναφόρτωση του αριστερού πίνακα
            loadSummaryForRange(); // Επαναφόρτωση του δεξιού πίνακα
        }
    };

    // --- Λειτουργίες Local Storage (Για Υπαλλήλους) ---
    const getAllEmployees = () => {
        const data = localStorage.getItem('employees');
        return data ? JSON.parse(data) : [];
    };

    // --- Βοηθητική συνάρτηση για τη μορφοφόρτωση ημερομηνίας σε YYYY-MM-DD ---
    const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    // --- Συνάρτηση για τον υπολογισμό της αρχής (Δευτέρα) και του τέλους (Κυριακή) της εβδομάδας ---
    const getWeekRange = (dateString) => {
        const selectedDate = new Date(dateString);
        const dayOfWeek = selectedDate.getDay(); // 0 = Κυριακή, 1 = Δευτέρα, ..., 6 = Σάββατο

        const monday = new Date(selectedDate);
        monday.setDate(selectedDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return {
            monday: formatDate(monday),
            sunday: formatDate(sunday)
        };
    };

    // --- Συνάρτηση για τη φόρτωση και εμφάνιση των υπαλλήλων στον πίνακα εύρους (αριστερή στήλη) ---
    const loadEmployeesForRangePayroll = () => {
        const selectedDateStr = rangeFromDateInput.value;

        if (!selectedDateStr) {
            alert('Παρακαλώ επιλέξτε μια ημερομηνία για να καθορίσετε την εβδομάδα.');
            return;
        }

        const { monday, sunday } = getWeekRange(selectedDateStr);
        const fromDateStr = monday;
        const toDateStr = sunday;

        const employees = getAllEmployees();
        rangePayrollTableHead.innerHTML = '';
        rangePayrollTableBody.innerHTML = '';

        noEmployeesForRangeMessage.style.display = 'none';
        rangePayrollTableContainer.style.display = 'block';
        saveRangePayrollButton.style.display = 'block';


        if (employees.length === 0) {
            noEmployeesForRangeMessage.style.display = 'block';
            rangePayrollTableContainer.style.display = 'block';
            saveRangePayrollButton.style.display = 'none';
            rangeTotalPayrollAmountTd.textContent = formatCurrency(0);
            return;
        }

        const datesInRange = [];
        let currentDate = new Date(monday);
        while (currentDate <= new Date(sunday)) {
            datesInRange.push(formatDate(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const headerRow = rangePayrollTableHead.insertRow();
        headerRow.insertCell().textContent = 'Ονοματεπώνυμο';
        headerRow.insertCell().textContent = 'Ειδικότητα';
        headerRow.insertCell().textContent = 'Ημερομίσθιο (€)';
        headerRow.insertCell().textContent = 'Ωρομίσθιο (€)';

        datesInRange.forEach(date => {
            const th = headerRow.insertCell();
            th.textContent = date.substring(5);
            th.title = date;
        });

        headerRow.insertCell().textContent = 'Συνολικές Ώρες';
        headerRow.insertCell().textContent = 'Συνολικός Μισθός (€)';

        grandTotalLabelCell.colSpan = 4 + 7 + 1; // 4 σταθερές + 7 ημερομηνίες + 1 συνολικές ώρες

        const payrollData = getPayrollData();
        const rangeKey = `${fromDateStr}_${toDateStr}`;
        const savedRangeData = payrollData.rangeEntries[rangeKey] || {};

        let totalGrandPayroll = 0;

        employees.forEach(employee => {
            const row = rangePayrollTableBody.insertRow();
            row.dataset.employeeId = employee.id;

            const dailyWage = parseFloat(employee.dailyWage) || 0;
            const hourlyWage = dailyWage / 8;

            row.insertCell().textContent = employee.name;
            row.insertCell().textContent = employee.specialty;
            row.insertCell().textContent = formatCurrency(dailyWage);
            row.insertCell().textContent = formatCurrency(hourlyWage);

            let totalHoursForEmployee = 0;
            const employeeSavedHours = savedRangeData[employee.id] || {};

            datesInRange.forEach(date => {
                const hoursInputCell = row.insertCell();
                const hoursInput = document.createElement('input');
                hoursInput.type = 'number';
                hoursInput.step = '0.5';
                hoursInput.min = '0';
                hoursInput.placeholder = 'Ώρες';
                hoursInput.classList.add('daily-hours-input');
                hoursInput.dataset.date = date;
                hoursInput.value = employeeSavedHours[date] !== undefined ? employeeSavedHours[date] : 0;

                // Διασφάλιση επεξεργασιμότητας
                hoursInput.readOnly = false;
                hoursInput.disabled = false;
                console.log(`Input for ${employee.name} on ${date}: readOnly=${hoursInput.readOnly}, disabled=${hoursInput.disabled}`);


                hoursInputCell.appendChild(hoursInput);

                totalHoursForEmployee += parseFloat(hoursInput.value) || 0;

                hoursInput.addEventListener('input', () => {
                    updateEmployeeRowTotals(row, hourlyWage);
                    updateGrandTotalPayroll();
                });
            });

            const totalHoursCell = row.insertCell();
            totalHoursCell.textContent = totalHoursForEmployee;
            totalHoursCell.classList.add('employee-total-hours');

            const totalSalaryCell = row.insertCell();
            totalSalaryCell.textContent = formatCurrency(totalHoursForEmployee * hourlyWage);
            totalSalaryCell.classList.add('employee-total-salary-cell');

            totalGrandPayroll += (totalHoursForEmployee * hourlyWage);
        });

        rangeTotalPayrollAmountTd.textContent = formatCurrency(totalGrandPayroll);
    };

    // Συνάρτηση για την ενημέρωση των συνολικών ωρών και μισθού για μια συγκεκριμένη γραμμή υπαλλήλου
    const updateEmployeeRowTotals = (row, hourlyWage) => {
        let currentEmployeeTotalHours = 0;
        row.querySelectorAll('.daily-hours-input').forEach(input => {
            currentEmployeeTotalHours += parseFloat(input.value) || 0;
        });

        const totalHoursCell = row.querySelector('.employee-total-hours');
        totalHoursCell.textContent = currentEmployeeTotalHours;

        const totalSalaryCell = row.querySelector('.employee-total-salary-cell');
        totalSalaryCell.textContent = formatCurrency(currentEmployeeTotalHours * hourlyWage);
    };

    // Συνάρτηση για την ενημέρωση του Γενικού Συνόλου Μισθοδοσίας Εύρους (κάτω στον πίνακα)
    const updateGrandTotalPayroll = () => {
        let grandTotal = 0;
        document.querySelectorAll('.employee-total-salary-cell').forEach(cell => {
            const amount = parseFloat(cell.textContent.replace('€', '').replace(',', '.'));
            grandTotal += amount;
        });
        rangeTotalPayrollAmountTd.textContent = formatCurrency(grandTotal);
    };

    // --- Νέα συνάρτηση για τη φόρτωση και εμφάνιση της σύνοψης (δεξιά στήλη) ---
    const loadSummaryForRange = () => {
        const fromDateStr = summaryFromDateInput.value;
        const toDateStr = summaryToDateInput.value;

        if (!fromDateStr || !toDateStr) {
            alert('Παρακαλώ επιλέξτε "Από Ημερομηνία" και "Έως Ημερομηνία" για τη σύνοψη.');
            return;
        }

        const fromDate = new Date(fromDateStr);
        const toDate = new Date(toDateStr);
        toDate.setHours(23, 59, 59, 999);

        if (fromDate > toDate) {
            alert('Η "Από Ημερομηνία" δεν μπορεί να είναι μετά την "Έως Ημερομηνία" για τη σύνοψη.');
            return;
        }

        const payrollData = getPayrollData();
        const employees = getAllEmployees();
        const aggregatedEmployeePayroll = {};

        // Αρχικοποίηση aggregatedEmployeePayroll
        employees.forEach(emp => {
            aggregatedEmployeePayroll[emp.id] = {
                name: emp.name,
                specialty: emp.specialty,
                dailyWage: parseFloat(emp.dailyWage) || 0,
                hourlyWage: (parseFloat(emp.dailyWage) || 0) / 8,
                totalHours: 0,
                totalSalary: 0
            };
        });

        // Επανάληψη σε όλα τα αποθηκευμένα εβδομαδιαία εύρη
        for (const rangeKey in payrollData.rangeEntries) {
            const [weekMondayStr, weekSundayStr] = rangeKey.split('_');
            const weekMonday = new Date(weekMondayStr);
            const weekSunday = new Date(weekSundayStr);
            weekSunday.setHours(23, 59, 59, 999);

            // Έλεγχος αν το εβδομαδιαίο εύρος επικαλύπτεται με το εύρος σύνοψης
            if (weekMonday <= toDate && weekSunday >= fromDate) {
                const weeklyEmployeeHours = payrollData.rangeEntries[rangeKey];

                for (const employeeId in weeklyEmployeeHours) {
                    if (aggregatedEmployeePayroll[employeeId]) { // Βεβαιωθείτε ότι ο υπάλληλος υπάρχει
                        const employeeDailyHours = weeklyEmployeeHours[employeeId];
                        let currentWeekEmployeeHours = 0;
                        for (const date in employeeDailyHours) {
                            // Προσθέτουμε ώρες μόνο αν η ημερομηνία της ημέρας είναι εντός του εύρους σύνοψης
                            const currentDayDate = new Date(date);
                            if (currentDayDate >= fromDate && currentDayDate <= toDate) {
                                currentWeekEmployeeHours += parseFloat(employeeDailyHours[date]) || 0;
                            }
                        }
                        const hourlyWage = aggregatedEmployeePayroll[employeeId].hourlyWage;
                        aggregatedEmployeePayroll[employeeId].totalHours += currentWeekEmployeeHours;
                        aggregatedEmployeePayroll[employeeId].totalSalary += (currentWeekEmployeeHours * hourlyWage);
                    }
                }
            }
        }

        // Εμφάνιση αποτελεσμάτων στη σύνοψη
        payrollSummaryTableBody.innerHTML = '';
        let summaryGrandTotal = 0;

        // Μετατρέπουμε το αντικείμενο σε πίνακα για ταξινόμηση
        const sortedAggregatedPayroll = Object.values(aggregatedEmployeePayroll).sort((a, b) => a.name.localeCompare(b.name, 'el-GR'));

        if (sortedAggregatedPayroll.length === 0) {
            noSummaryDataMessage.style.display = 'block';
            payrollSummaryContainer.style.display = 'none';
            summaryGrandTotalTd.textContent = formatCurrency(0);
            return;
        }


        sortedAggregatedPayroll.forEach(emp => {
            const summaryRow = payrollSummaryTableBody.insertRow();
            summaryRow.insertCell().textContent = emp.name;
            summaryRow.insertCell().textContent = formatCurrency(emp.totalSalary);
            summaryGrandTotal += emp.totalSalary;
        });
        summaryGrandTotalTd.textContent = formatCurrency(summaryGrandTotal);

        noSummaryDataMessage.style.display = 'none';
        payrollSummaryContainer.style.display = 'block';
    };


    // --- Event Listeners ---

    // Event Listener για το κουμπί "Φόρτωση Υπαλλήλων" (αριστερή στήλη)
    loadEmployeesForRangeButton.addEventListener('click', loadEmployeesForRangePayroll);

    // Event Listener για το κουμπί "Αποθήκευση Μισθοδοσίας Εύρους"
    saveRangePayrollButton.addEventListener('click', () => {
        const selectedDateStr = rangeFromDateInput.value;
        if (!selectedDateStr) {
            alert('Παρακαλώ επιλέξτε μια ημερομηνία για να καθορίσετε την εβδομάδα πριν την αποθήκευση.');
            return;
        }
        const { monday, sunday } = getWeekRange(selectedDateStr);
        const fromDateStr = monday;
        const toDateStr = sunday;


        const payrollData = getPayrollData();
        const rangeKey = `${fromDateStr}_${toDateStr}`;
        payrollData.rangeEntries[rangeKey] = {}; // Δημιουργούμε ένα νέο αντικείμενο για το εύρος, ώστε να διαγράψουμε τυχόν παλιά δεδομένα

        let allInputsValid = true;

        document.querySelectorAll('#range-payroll-table tbody tr').forEach(row => {
            const employeeId = row.dataset.employeeId;
            const employeeDailyHours = {};

            row.querySelectorAll('.daily-hours-input').forEach(input => {
                const date = input.dataset.date;
                const hours = parseFloat(input.value);

                if (isNaN(hours) || hours < 0) {
                    allInputsValid = false;
                    input.style.borderColor = 'red';
                    input.title = 'Οι ώρες πρέπει να είναι αριθμός >= 0';
                } else {
                    input.style.borderColor = '';
                    input.title = '';
                    employeeDailyHours[date] = hours;
                }
            });
            payrollData.rangeEntries[rangeKey][employeeId] = employeeDailyHours;
        });

        if (!allInputsValid) {
            alert('Παρακαλώ διορθώστε τις ώρες εργασίας. Πρέπει να είναι έγκυροι αριθμοί (>= 0).');
            return;
        }

        savePayrollData(payrollData);
        alert('Η μισθοδοσία εύρους ημερομηνιών αποθηκεύτηκε επιτυχώς!');
    });

    // Event Listener για το κουμπί "Φόρτωση Σύνοψης" (δεξιά στήλη)
    loadSummaryButton.addEventListener('click', loadSummaryForRange);

    // Event Listener για το κουμπί "Εξαγωγή Λεπτομερούς Αναφοράς σε PDF"
    exportDetailedPayrollPdfButton.addEventListener('click', () => {
        const fromDateStr = summaryFromDateInput.value; // Χρησιμοποιούμε τα date pickers της σύνοψης
        const toDateStr = summaryToDateInput.value;

        if (!fromDateStr || !toDateStr) {
            alert('Παρακαλώ επιλέξτε "Από Ημερομηνία" και "Έως Ημερομηνία" για την εξαγωγή σε PDF.');
            return;
        }

        const fromDate = new Date(fromDateStr);
        const toDate = new Date(toDateStr);
        toDate.setHours(23, 59, 59, 999);

        if (fromDate > toDate) {
            alert('Η "Από Ημερομηνία" δεν μπορεί να είναι μετά την "Έως Ημερομηνία" για την εξαγωγή σε PDF.');
            return;
        }

        const payrollData = getPayrollData();
        const employees = getAllEmployees();
        const aggregatedEmployeePayroll = {};

        // Αρχικοποίηση aggregatedEmployeePayroll
        employees.forEach(emp => {
            aggregatedEmployeePayroll[emp.id] = {
                name: emp.name,
                specialty: emp.specialty,
                dailyWage: parseFloat(emp.dailyWage) || 0,
                hourlyWage: (parseFloat(emp.dailyWage) || 0) / 8,
                totalHours: 0,
                totalSalary: 0,
                dailyHours: {} // Για να αποθηκεύσουμε τις ώρες ανά ημέρα για το PDF
            };
        });

        // Συγκέντρωση δεδομένων από όλα τα αποθηκευμένα εβδομαδιαία εύρη
        for (const rangeKey in payrollData.rangeEntries) {
            const [weekMondayStr, weekSundayStr] = rangeKey.split('_');
            const weekMonday = new Date(weekMondayStr);
            const weekSunday = new Date(weekSundayStr);
            weekSunday.setHours(23, 59, 59, 999);

            if (weekMonday <= toDate && weekSunday >= fromDate) {
                const weeklyEmployeeHours = payrollData.rangeEntries[rangeKey];

                for (const employeeId in weeklyEmployeeHours) {
                    if (aggregatedEmployeePayroll[employeeId]) {
                        const employeeDailyHours = weeklyEmployeeHours[employeeId];
                        for (const date in employeeDailyHours) {
                            const currentDayDate = new Date(date);
                            if (currentDayDate >= fromDate && currentDayDate <= toDate) {
                                const hours = parseFloat(employeeDailyHours[date]) || 0;
                                aggregatedEmployeePayroll[employeeId].dailyHours[date] = (aggregatedEmployeePayroll[employeeId].dailyHours[date] || 0) + hours;
                                aggregatedEmployeePayroll[employeeId].totalHours += hours;
                            }
                        }
                    }
                }
            }
        }

        // Υπολογισμός συνολικού μισθού μετά τη συγκέντρωση ωρών
        Object.values(aggregatedEmployeePayroll).forEach(emp => {
            emp.totalSalary = emp.totalHours * emp.hourlyWage;
        });

        // Λίστα ημερομηνιών για το PDF (μόνο αυτές που είναι στο εύρος σύνοψης)
        const pdfDatesInRange = [];
        let tempDate = new Date(fromDate);
        while (tempDate <= toDate) {
            pdfDatesInRange.push(formatDate(tempDate));
            tempDate.setDate(tempDate.getDate() + 1);
        }

        const tableBody = [];
        // Headers για το PDF
        const pdfHeaders = [
            { text: 'Ονοματεπώνυμο', style: 'tableHeader' },
            { text: 'Ειδικότητα', style: 'tableHeader' },
            { text: 'Ημερομίσθιο (€)', style: 'tableHeader' },
            { text: 'Ωρομίσθιο (€)', style: 'tableHeader' }
        ];
        pdfDatesInRange.forEach(date => {
            pdfHeaders.push({ text: date.substring(5), style: 'tableHeader' }); // ΜΜ-ΗΗ
        });
        pdfHeaders.push({ text: 'Συνολικές Ώρες', style: 'tableHeader' });
        pdfHeaders.push({ text: 'Συνολικός Μισθός (€)', style: 'tableHeader' });
        tableBody.push(pdfHeaders);

        let totalGrandPayroll = 0;

        // Μετατρέπουμε το αντικείμενο σε πίνακα για ταξινόμηση
        const sortedAggregatedPayroll = Object.values(aggregatedEmployeePayroll).sort((a, b) => a.name.localeCompare(b.name, 'el-GR'));

        sortedAggregatedPayroll.forEach(emp => {
            const employeeRowData = [
                emp.name,
                emp.specialty,
                formatCurrency(emp.dailyWage),
                formatCurrency(emp.hourlyWage)
            ];

            pdfDatesInRange.forEach(date => {
                const hours = emp.dailyHours[date] !== undefined ? emp.dailyHours[date] : 0;
                employeeRowData.push(hours);
            });

            employeeRowData.push(emp.totalHours);
            employeeRowData.push(formatCurrency(emp.totalSalary));

            tableBody.push(employeeRowData);
            totalGrandPayroll += emp.totalSalary;
        });

        if (tableBody.length <= 1) { // Μόνο η γραμμή header υπάρχει
            alert('Δεν υπάρχουν δεδομένα μισθοδοσίας για εξαγωγή σε PDF για αυτό το εύρος.');
            return;
        }

        // Προσθήκη γραμμής γενικού συνόλου
        const numColsForGrandTotalLabel = pdfHeaders.length - 1;
        const totalRowForPdf = [];
        totalRowForPdf.push({
            text: 'Γενικό Σύνολο Μισθοδοσίας Εύρους:',
            colSpan: numColsForGrandTotalLabel,
            alignment: 'right',
            style: 'totalRow'
        });
        for (let i = 0; i < numColsForGrandTotalLabel - 1; i++) {
            totalRowForPdf.push({}); // Προσθέτουμε κενά κελιά για να γεμίσουμε το colSpan
        }
        totalRowForPdf.push({ text: formatCurrency(totalGrandPayroll), style: 'totalRow' });
        tableBody.push(totalRowForPdf);

        // Δυναμική προσαρμογή μεγέθους γραμματοσειράς
        let pdfFontSize = 10; // Προεπιλεγμένο μέγεθος
        const totalPdfColumns = pdfHeaders.length;

        // Πιο επιθετική μείωση μεγέθους γραμματοσειράς
        if (totalPdfColumns > 8) {
            pdfFontSize = 9;
        }
        if (totalPdfColumns > 15) {
            pdfFontSize = 8;
        }
        if (totalPdfColumns > 25) {
            pdfFontSize = 7;
        }
        if (totalPdfColumns > 35) {
            pdfFontSize = 6;
        }
        if (totalPdfColumns > 45) {
            pdfFontSize = 5; // Πολύ μικρό, αλλά απαραίτητο για πολύ μεγάλα εύρη
        }
        // Μπορείτε να προσθέσετε περισσότερες συνθήκες αν χρειαστεί

        // Ορισμός πλάτους στηλών για το PDF
        const dynamicWidths = [
            'auto', // Ονοματεπώνυμο (θα προσαρμοστεί αυτόματα)
            'auto', // Ειδικότητα (θα προσαρμοστεί αυτόματα)
            30,     // Ημερομίσθιο (€) - σταθερό πλάτος, μικρότερο
            30,     // Ωρομίσθιο (€) - σταθερό πλάτος, μικρότερο
        ];

        // Προσθήκη πλάτους για τις στήλες ημερομηνιών
        pdfDatesInRange.forEach(() => {
            dynamicWidths.push(12); // Σταθερό πλάτος για κάθε στήλη ημερομηνίας, ακόμα μικρότερο
        });

        dynamicWidths.push(20);     // Συνολικές Ώρες - σταθερό πλάτος, μικρότερο
        dynamicWidths.push(40);     // Συνολικός Μισθός (€) - σταθερό πλάτος, μικρότερο


        const docDefinition = {
            pageOrientation: 'landscape', // Οριζόντια μορφή
            content: [{
                    text: `Λεπτομερής Αναφορά Μισθοδοσίας: ${fromDateStr} έως ${toDateStr}`,
                    style: 'header'
                },
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: dynamicWidths, // Χρήση των δυναμικά υπολογισμένων πλατών
                        body: tableBody
                    },
                    layout: {
                        hLineWidth: function(i, node) { return (i === 0 || i === node.table.body.length) ? 2 : 1; },
                        vLineWidth: function(i, node) { return (i === 0 || i === node.table.widths.length) ? 2 : 1; },
                        hLineColor: function(i, node) { return (i === 0 || i === node.table.body.length) ? '#000000' : '#cccccc'; },
                        vLineColor: function(i, node) { return (i === 0 || i === node.table.widths.length) ? '#000000' : '#cccccc'; },
                        paddingLeft: function(i, node) { return 8; },
                        paddingRight: function(i, node) { return 8; },
                        paddingTop: function(i, node) { return 8; },
                        paddingBottom: function(i, node) { return 8; }
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10],
                    alignment: 'center'
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: pdfFontSize, // Χρήση δυναμικού μεγέθους γραμματοσειράς
                    color: 'white',
                    fillColor: '#6c757d',
                },
                totalRow: {
                    bold: true,
                    fillColor: '#f2f2f2'
                }
            },
            defaultStyle: {
                font: 'Roboto',
                fontSize: pdfFontSize // Χρήση δυναμικού μεγέθους γραμματοσειράς
            }
        };

        if (typeof pdfMake.fonts === 'undefined' || !pdfMake.fonts.Roboto) {
            pdfMake.fonts = {
                Roboto: {
                    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
                    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
                    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
                    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
                }
            };
        }
        pdfMake.createPdf(docDefinition).download(`Λεπτομερής_Μισθοδοσία_${fromDateStr}_έως_${toDateStr}.pdf`);
    });

    // ΝΕΟΣ Event Listener για το κουμπί "Διαγραφή Δεδομένων Μισθοδοσίας"
    clearPayrollDataButton.addEventListener('click', clearAllPayrollData);

    // Αρχικοποίηση κατά τη φόρτωση της σελίδας
    const today = new Date();
    rangeFromDateInput.value = formatDate(today); // Αρχικοποίηση αριστερού date picker
    summaryFromDateInput.value = formatDate(today); // Αρχικοποίηση δεξιού date picker
    summaryToDateInput.value = formatDate(today);   // Αρχικοποίηση δεξιού date picker
});