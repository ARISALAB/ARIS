// Βοηθητική συνάρτηση μορφοποίησης νομισματικών τιμών
const formatCurrency = (amount) => {
    const number = parseFloat(amount) || 0;
    return number.toLocaleString('el-GR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
};

// Βοηθητική συνάρτηση για τη λήψη όλων των εξόδων (χρειάζεται για την εύρεση συναλλαγών προμηθευτή)
const getAllExpensesData = () => {
    const data = localStorage.getItem('expenseData');
    return data ? JSON.parse(data) : {};
};


document.addEventListener('DOMContentLoaded', () => {
    // Αναφορές σε στοιχεία της σελίδας
    const supplierForm = document.getElementById('supplier-form');
    const editingSupplierIdInput = document.getElementById('editing-supplier-id');
    const supplierNameInput = document.getElementById('supplier-name');
    const supplierPhoneInput = document.getElementById('supplier-phone');
    const supplierTaxIdInput = document.getElementById('supplier-tax-id');
    const supplierTypeInput = document.getElementById('supplier-type');
    const suppliersTableBody = document.querySelector('#suppliers-table tbody');
    const noSuppliersMessage = document.getElementById('no-suppliers-message');
    const noSearchResultsMessage = document.getElementById('no-search-results-message');
    const submitSupplierButton = document.getElementById('submit-supplier-button');
    const supplierSearchInput = document.getElementById('supplier-search');

    // Αναφορές στα στοιχεία του Modal
    const modal = document.getElementById('supplier-transactions-modal');
    const modalSupplierName = document.getElementById('modal-supplier-name');
    const modalTransactionsTableBody = document.querySelector('#supplier-transactions-table tbody');
    const modalTransactionsTotal = document.getElementById('modal-transactions-total'); // Κελί για το ΤΕΛΙΚΟ αθροιστικό υπόλοιπο
    const modalTotalCashOrCreditTd = document.getElementById('modal-total-cash-credit'); // Κελί για το σύνολο τιμολογίων εκτός καρτών
    const closeModalButton = document.querySelector('.modal .close-button');
    const noTransactionsMessage = document.getElementById('no-transactions-message');
    const exportSupplierTransactionsPdfButton = document.getElementById('export-supplier-transactions-pdf-button'); // Κουμπί εξαγωγής PDF modal


    // --- Λειτουργίες Local Storage για Προμηθευτές ---
    const getAllSuppliers = () => {
        const data = localStorage.getItem('suppliers');
        return data ? JSON.parse(data) : [];
    };

    const saveAllSuppliers = (suppliers) => {
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    };

    const addSupplier = (supplier) => {
        const suppliers = getAllSuppliers();
        if (supplier.name.trim() === '') {
            alert('Παρακαλώ εισάγετε όνομα προμηθευτή.');
            return false;
        }
        if (suppliers.some(s =>
            typeof s === 'object' && s !== null && typeof s.name === 'string' &&
            s.name.toLowerCase() === supplier.name.trim().toLowerCase()
        )) {
            alert(`Ο προμηθευτής "${supplier.name.trim()}" υπάρχει ήδη.`);
            return false;
        }
        const newSupplier = {
            id: Date.now(),
            name: supplier.name.trim(),
            phone: supplier.phone.trim(),
            taxId: supplier.taxId.trim(),
            type: supplier.type.trim()
        };
        suppliers.push(newSupplier);
        saveAllSuppliers(suppliers);
        return true;
    };

    const deleteSupplier = (idToDelete) => {
        let suppliers = getAllSuppliers();
        suppliers = suppliers.filter(supplier => supplier.id !== idToDelete);
        saveAllSuppliers(suppliers);
        loadAndDisplaySuppliers();
        console.log(`Διαγράφηκε προμηθευτής με ID: ${idToDelete}`);
        if (parseInt(editingSupplierIdInput.value, 10) === idToDelete) {
            resetSupplierForm();
        }
    };

    const findSupplierById = (id) => {
        const suppliers = getAllSuppliers();
        return suppliers.find(supplier => supplier.id === id);
    };

    const updateSupplier = (idToUpdate, updatedSupplier) => {
        const suppliers = getAllSuppliers();
        const supplierIndex = suppliers.findIndex(supplier => supplier.id === idToUpdate);
        if (supplierIndex !== -1) {
            const nameExists = suppliers.some(s =>
                s.id !== idToUpdate &&
                typeof s === 'object' && s !== null && typeof s.name === 'string' &&
                s.name.toLowerCase() === updatedSupplier.name.trim().toLowerCase()
            );
            if (nameExists) {
                alert(`Ο προμηθευτής "${updatedSupplier.name.trim()}" υπάρχει ήδη.`);
                return false;
            }
            suppliers[supplierIndex] = { ...updatedSupplier, id: idToUpdate };
            saveAllSuppliers(suppliers);
            console.log(`Ενημερώθηκε προμηθευτής με ID: ${idToUpdate}`);
            loadAndDisplaySuppliers();
            return true;
        } else {
            console.error(`Δεν βρέθηκε προμηθευτής με ID: ${idToUpdate} για ενημέρωση.`);
            return false;
        }
    };

    const editSupplier = (id) => {
        const supplierToEdit = findSupplierById(id);
        if (supplierToEdit) {
            supplierNameInput.value = supplierToEdit.name;
            supplierPhoneInput.value = supplierToEdit.phone;
            supplierTaxIdInput.value = supplierToEdit.taxId;
            supplierTypeInput.value = supplierToEdit.type;
            editingSupplierIdInput.value = supplierToEdit.id;
            submitSupplierButton.textContent = 'Ενημέρωση Προμηθευτή';
        } else {
            console.error(`Δεν βρέθηκε προμηθευτής με ID: ${id} για επεξεργασία.`);
        }
    };

    const resetSupplierForm = () => {
        supplierForm.reset();
        editingSupplierIdInput.value = '';
        submitSupplierButton.textContent = 'Προσθήκη Προμηθευτή';
    };

    // --- Λειτουργία Αναζήτησης και Ταξινόμησης ---
    const sortSuppliersAlphabetically = (suppliers) => {
        const sortedSuppliers = [...suppliers];
        sortedSuppliers.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        return sortedSuppliers;
    };

    const filterSuppliers = (suppliers, searchTerm) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return suppliers;
        return suppliers.filter(supplier => {
            // Ελέγχουμε αν το όνομα ή το είδος (type) περιέχει τον όρο αναζήτησης
            return (supplier.name || '').toLowerCase().includes(term) ||
                   (supplier.type || '').toLowerCase().includes(term);
        });
    };

    const loadAndDisplaySuppliers = () => {
        const allSuppliers = getAllSuppliers();
        const searchTerm = supplierSearchInput.value;
        const filteredSuppliers = filterSuppliers(allSuppliers, searchTerm);
        const sortedSuppliers = sortSuppliersAlphabetically(filteredSuppliers);
        displaySuppliers(sortedSuppliers);
    };

    // --- Λειτουργίες Εμφάνισης Κύριου Πίνακα Προμηθευτών ---
    const displaySuppliers = (suppliersToDisplay) => {
        suppliersTableBody.innerHTML = '';
        const hasSuppliers = getAllSuppliers().length > 0;
        const hasSearchResults = suppliersToDisplay && suppliersToDisplay.length > 0;

        noSuppliersMessage.style.display = hasSuppliers ? 'none' : 'block';
        noSearchResultsMessage.style.display = (!hasSearchResults && supplierSearchInput.value.trim() !== '') ? 'block' : 'none';

        if (hasSearchResults) {
            suppliersToDisplay.forEach(supplier => {
                const row = suppliersTableBody.insertRow();
                row.dataset.id = supplier.id;
                row.insertCell(0).textContent = supplier.name || '-';
                row.insertCell(1).textContent = supplier.phone || '-';
                row.insertCell(2).textContent = supplier.taxId || '-';
                row.insertCell(3).textContent = supplier.type || '-';
                const actionsCell = row.insertCell(4);
                actionsCell.classList.add('action-buttons');

                const editButton = document.createElement('button');
                editButton.textContent = 'Επεξεργασία';
                editButton.classList.add('edit-button');
                editButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    editSupplier(supplier.id);
                });
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Διαγραφή';
                deleteButton.classList.add('delete-button');
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον προμηθευτή "${supplier.name}";`)) {
                        deleteSupplier(supplier.id);
                    }
                });
                actionsCell.appendChild(deleteButton);

                row.addEventListener('click', (event) => {
                    const isActionCellClick = actionsCell.contains(event.target);
                    const isRowClick = event.target === row || event.target.tagName === 'TD';
                    if (isRowClick && !isActionCellClick) {
                        showTransactionsModal(supplier.id);
                    }
                });
            });
        }
        if(getAllSuppliers().length === 0 && supplierSearchInput.value.trim() === '') {
            noSuppliersMessage.style.display = 'block';
        }
    };

    // --- Λειτουργίες Modal Συναλλαγών ---

    // Εύρεση συναλλαγών (εξόδων) ενός προμηθευτή σε όλες τις ημερομηνίες
    const getTransactionsBySupplierId = (supplierId) => {
        const supplier = findSupplierById(supplierId);
        if (!supplier) return [];
        const supplierName = supplier.name;
        const allExpenses = getAllExpensesData();
        const supplierTransactions = [];

        for (const date in allExpenses) {
            if (Object.hasOwnProperty.call(allExpenses, date)) {
                const dailyEntries = allExpenses[date];
                const transactionsForDate = dailyEntries.filter(entry =>
                    entry.supplier && (entry.supplier || '').toLowerCase() === supplierName.toLowerCase()
                );
                transactionsForDate.forEach(entry => {
                    supplierTransactions.push({ ...entry, date: date });
                });
            }
        }
        supplierTransactions.sort((a, b) => {
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;
            const timeA = a.time ? parseInt(a.time.replace(':', ''), 10) : 0;
            const timeB = b.time ? parseInt(b.time.replace(':', ''), 10) : 0;
            return timeA - timeB;
        });
        return supplierTransactions;
    };

    // Εμφάνιση των συναλλαγών στον πίνακα μέσα στο modal παράθυρο
    const displayTransactionsInModal = (transactions) => {
        modalTransactionsTableBody.innerHTML = '';
        let cumulativeRunningBalance = 0; // Αθροιστικό (running) υπόλοιπο που θα εμφανίζεται σε κάθε γραμμή
        let totalCashOrCreditAmount = 0; // Σύνολο τιμολογίων εκτός καρτών


        if (transactions.length === 0) {
            noTransactionsMessage.style.display = 'block';
        } else {
            noTransactionsMessage.style.display = 'none';

            transactions.forEach(transaction => {
                const row = modalTransactionsTableBody.insertRow();

                row.insertCell(0).textContent = transaction.date || '-';
                row.insertCell(1).textContent = transaction.time || '-';
                row.insertCell(2).textContent = transaction.paymentMethod || '-';
                row.insertCell(3).textContent = transaction.invoiceNumber || '-';
                row.insertCell(4).textContent = formatCurrency(transaction.amount);

                let cashAmount = 0;
                let cardAmount = 0;
                let creditAmount = 0;
                // transactionOutstandingAmount = 0; // Δεν χρειαζόμαστε πια αυτή τη μεταβλητή για το υπόλοιπο γραμμής

                // Καθορισμός ποσών ανά τρόπο πληρωμής και ενημέρωση αθροιστικού υπολοίπου
                if (transaction.paymentMethod === 'cash') {
                    cashAmount = transaction.amount || 0;
                    // Εάν είναι Μετρητά, το αθροιστικό υπόλοιπο ΔΕΝ αλλάζει από αυτό το ποσό
                    // cumulativeRunningBalance = cumulativeRunningBalance; // Παραμένει το ίδιο
                } else if (transaction.paymentMethod === 'card') {
                    cardAmount = transaction.amount || 0;
                    // Εάν είναι Κάρτα, αφαιρούμε το ποσό από το αθροιστικό υπόλοιπο
                    cumulativeRunningBalance -= cardAmount;
                } else if (transaction.paymentMethod === 'credit') {
                    creditAmount = transaction.amount || 0;
                    // Εάν είναι Πίστωση, προσθέτουμε το ποσό στο αθροιστικό υπόλοιπο
                    cumulativeRunningBalance += creditAmount;
                }

                // Προσθήκη των στηλών Μετρητά, Κάρτα, Επί Πίστωση
                row.insertCell(5).textContent = formatCurrency(cashAmount);
                row.insertCell(6).textContent = formatCurrency(cardAmount);
                row.insertCell(7).textContent = formatCurrency(creditAmount);

                // Προσθήκη της στήλης Υπολοίπου με το ΤΡΕΧΟΝ αθροιστικό υπόλοιπο
                const balanceCell = row.insertCell(8);
                balanceCell.textContent = formatCurrency(cumulativeRunningBalance);
                // Προαιρετικά: Προσθήκη κλάσης για χρώμα στο υπόλοιπο
                // balanceCell.classList.add(cumulativeRunningBalance >= 0 ? 'positive' : 'negative');


                // Υπολογισμός συνόλου τιμολογίων εκτός καρτών (για το footer)
                if (transaction.paymentMethod === 'cash' || transaction.paymentMethod === 'credit') {
                    totalCashOrCreditAmount += transaction.amount || 0;
                }
            });
        }

        // Εμφάνιση του ΤΕΛΙΚΟΥ αθροιστικού υπολοίπου στο footer
        modalTransactionsTotal.textContent = formatCurrency(cumulativeRunningBalance);
        // Εμφάνιση του συνόλου τιμολογίων εκτός καρτών στο footer
        modalTotalCashOrCreditTd.textContent = formatCurrency(totalCashOrCreditAmount);
    };

    // Εμφάνιση του modal παραθύρου συναλλαγών
    const showTransactionsModal = (supplierId) => {
        const supplier = findSupplierById(supplierId);
        if (!supplier) {
            console.error('Προμηθευτής δεν βρέθηκε για modal.');
            return;
        }

        modalSupplierName.textContent = `Συναλλαγές Προμηθευτή: ${supplier.name}`;

        const transactions = getTransactionsBySupplierId(supplier.id);
        displayTransactionsInModal(transactions);

        modal.style.display = 'block';
    };

    // Απόκρυψη του modal παραθύρου συναλλαγών
    const hideTransactionsModal = () => {
        modal.style.display = 'none';
    };


    // --- Λειτουργία Εξαγωγής Συναλλαγών Προμηθευτή σε PDF ---
    const exportSupplierTransactionsToPdf = () => {
        const supplierName = modalSupplierName.textContent.replace('Συναλλαγές Προμηθευτή: ', ''); // Παίρνουμε το όνομα από τον τίτλο του modal
        const supplier = getAllSuppliers().find(s => s.name === supplierName); // Βρίσκουμε τον προμηθευτή
        if (!supplier) {
            alert('Δεν βρέθηκαν στοιχεία προμηθευτή για εξαγωγή.');
            return;
        }

        const transactions = getTransactionsBySupplierId(supplier.id); // Παίρνουμε τις ταξινομημένες συναλλαγές

        if (transactions.length === 0) {
            alert(`Δεν υπάρχουν καταχωρημένες συναλλαγές για τον προμηθευτή "${supplierName}" για εξαγωγή.`);
            return;
        }

        // Δημιουργία του πίνακα περιεχομένου για το PDF
        const tableBody = [
            // Επικεφαλίδα πίνακα
            [{ text: 'Ημερομηνία', style: 'tableHeader' }, { text: 'Ώρα', style: 'tableHeader' },
             { text: 'Τρόπος Πληρωμής', style: 'tableHeader' }, { text: 'Αρ. Τιμολογίου', style: 'tableHeader' },
             { text: 'Ποσό (€)', style: 'tableHeader', alignment: 'right' }, // Δεξιά στοίχιση για ποσά
             { text: 'Μετρητά (€)', style: 'tableHeader', alignment: 'right' },
             { text: 'Κάρτα (€)', style: 'tableHeader', alignment: 'right' },
             { text: 'Επί Πίστωση (€)', style: 'tableHeader', alignment: 'right' },
             { text: 'Υπόλοιπο (€)', style: 'tableHeader', alignment: 'right' }] // Δεξιά στοίχιση για ποσά (Αθροιστικό Υπόλοιπο)
        ];

        let cumulativeRunningBalance = 0; // Υπολογισμός αθροιστικού υπολοίπου για το PDF
        let totalCashOrCreditAmount = 0; // Υπολογισμός συνόλου τιμολογίων εκτός καρτών για το PDF

        // Προσθήκη γραμμών για κάθε συναλλαγή
        transactions.forEach(transaction => {
            // Υπολογισμός ποσών ανά τρόπο πληρωμής
            let cashAmount = 0;
            let cardAmount = 0;
            let creditAmount = 0;

            // Καθορισμός ποσών ανά τρόπο πληρωμής και ενημέρωση αθροιστικού υπολοίπου
            if (transaction.paymentMethod === 'cash') {
                cashAmount = transaction.amount || 0;
                // Εάν είναι Μετρητά, το αθροιστικό υπόλοιπο ΔΕΝ αλλάζει
                // cumulativeRunningBalance = cumulativeRunningBalance; // Παραμένει το ίδιο
            } else if (transaction.paymentMethod === 'card') {
                cardAmount = transaction.amount || 0;
                // Εάν είναι Κάρτα, αφαιρούμε το ποσό
                cumulativeRunningBalance -= cardAmount;
            } else if (transaction.paymentMethod === 'credit') {
                creditAmount = transaction.amount || 0;
                // Εάν είναι Πίστωση, προσθέτουμε το ποσό
                cumulativeRunningBalance += creditAmount;
            }

            // Υπολογισμός συνόλου τιμολογίων εκτός καρτών (για το footer)
             if (transaction.paymentMethod === 'cash' || transaction.paymentMethod === 'credit') {
                 totalCashOrCreditAmount += transaction.amount || 0;
             }

            tableBody.push([
                transaction.date || '-',
                transaction.time || '-',
                transaction.paymentMethod || '-',
                transaction.invoiceNumber || '-',
                { text: formatCurrency(transaction.amount), alignment: 'right' },
                { text: formatCurrency(cashAmount), alignment: 'right' },
                { text: formatCurrency(cardAmount), alignment: 'right' },
                { text: formatCurrency(creditAmount), alignment: 'right' },
                { text: formatCurrency(cumulativeRunningBalance), alignment: 'right' } // Εμφάνιση ΤΡΕΧΟΝΤΟΣ αθροιστικού υπολοίπου
            ]);
        });

        // Προσθήκη γραμμών συνόλου στο footer του PDF πίνακα
        tableBody.push([
            { text: 'Τελικό Υπόλοιπο:', colSpan: 8, alignment: 'right', bold: true, margin: [0,5,0,5] },
            '', '', '', '', '', '', '',
            { text: formatCurrency(cumulativeRunningBalance), alignment: 'right', bold: true, margin: [0,5,0,5] } // ΤΕΛΙΚΟ αθροιστικό υπόλοιπο
        ]);
        tableBody.push([ // Δεύτερη γραμμή footer
            { text: 'Σύνολο Τιμολογίων (Εκτός Καρτών):', colSpan: 8, alignment: 'right', bold: true, margin: [0,5,0,5] },
            '', '', '', '', '', '', '',
            { text: formatCurrency(totalCashOrCreditAmount), alignment: 'right', bold: true, margin: [0,5,0,5] } // Σύνολο τιμολογίων εκτός καρτών
        ]);


        // Ορισμός του PDF document definition
        const docDefinition = {
            defaultStyle: {
                font: 'Roboto',
                fontSize: 9 // Λίγο μικρότερο font για να χωράει ο πίνακας
            },
            content: [
                { text: `Συναλλαγές Προμηθευτή: ${supplierName}`, style: 'header' },
                { text: `Αναφορά όλων των συναλλαγών μέχρι ${new Date().toLocaleDateString('el-GR')}`, style: 'subheader' },
                {
                    table: {
                        headerRows: 1,
                        // Προσαρμόζουμε τα πλάτη για να προσπαθήσουμε να χωρέσει
                        widths: ['auto', 'auto', 'auto', 'auto', '*', '*', '*', '*', '*'], // Αυτόματο για τα πρώτα, υπόλοιπο μοιράζεται
                        body: tableBody
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
                }
            ],
            styles: {
                header: {
                    fontSize: 16, // Λίγο μικρότερος τίτλος
                    bold: true,
                    margin: [0, 0, 0, 15],
                    alignment: 'center'
                },
                subheader: {
                    fontSize: 10, // Μικρότερο subheader
                    margin: [0, 0, 0, 10],
                    alignment: 'center'
                },
                tableHeader: {
                    bold: true,
                    fontSize: 9, // Μικρότερο font στην επικεφαλίδα πίνακα
                    color: 'white',
                    fillColor: '#007bff',
                    alignment: 'center', // Κεντράρισμα επικεφαλίδων
                    padding: [4, 4, 4, 4] // Μικρότερο padding
                }
            },
            info: {
                title: `Συναλλαγές Προμηθευτή - ${supplierName}`,
                author: 'Η Εφαρμογή μου',
            },
            // Προσανατολισμός σελίδας σε landscape αν ο πίνακας είναι πολύ φαρδύς
            // pageSize: 'A4',
            // pageOrientation: 'landscape'
        };

        // Δημιουργία του PDF και εξαγωγή σε Base64 Data URL
        pdfMake.createPdf(docDefinition).getDataUrl(function(dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Συναλλαγές_${supplierName.replace(/\s+/g, '_')}.pdf`; // Όνομα αρχείου με underscore αντί για κενά
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };


    // --- Event Listeners ---

    supplierForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const supplier = {
            name: supplierNameInput.value,
            phone: supplierPhoneInput.value,
            taxId: supplierTaxIdInput.value,
            type: supplierTypeInput.value
        };

        const editingId = editingSupplierIdInput.value;

        if (editingId) { // Αν υπάρχει ID στο κρυφό πεδίο, σημαίνει επεξεργασία
            // Καλούμε τη συνάρτηση ενημέρωσης προμηθευτή
            if (updateSupplier(parseInt(editingId, 10), supplier)) {
                resetSupplierForm(); // Αν η ενημέρωση ήταν επιτυχής, καθαρίζουμε τη φόρμα
            }
        } else { // Αλλιώς, σημαίνει προσθήκη νέου προμηθευτή
            // Καλούμε τη συνάρτηση προσθήκης προμηθευτή
            if (addSupplier(supplier)) {
                resetSupplierForm(); // Αν η προσθήκη ήταν επιτυχής, καθαρίζουμε τη φόρμα
            }
        }
        loadAndDisplaySuppliers(); // Φορτώνουμε και εμφανίζουμε ξανά τους προμηθευτές
    });

    supplierSearchInput.addEventListener('input', () => {
        loadAndDisplaySuppliers(); // Φορτώνουμε και εμφανίζουμε τους προμηθευτές με βάση τον όρο αναζήτησης
    });

    closeModalButton.addEventListener('click', hideTransactionsModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideTransactionsModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            hideTransactionsModal();
        }
    });

    // Event listener για το κουμπί εξαγωγής PDF στο modal
    exportSupplierTransactionsPdfButton.addEventListener('click', exportSupplierTransactionsToPdf);


    // --- Αρχικοποίηση κατά τη φόρτωσης της σελίδας ---

    loadAndDisplaySuppliers(); // Φόρτωση και εμφάνιση των προμηθευτών
    resetSupplierForm(); // Βεβαιωνόμαστε ότι η φόρμα είναι στην αρχική κατάσταση "Προσθήκη"

    console.log("Το suppliers.js φορτώθηκε επιτυχώς.");
});