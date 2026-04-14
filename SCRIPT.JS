// Αυτό το αρχείο JavaScript μπορεί να χρησιμοποιηθεί για την προσθήκη λειτουργικότητας.
// Προς το παρόν, δεν περιέχει κώδικα για την αποθήκευση ή εμφάνιση δεδομένων,
// καθώς αυτό απαιτεί πιο προχωρημένη λογική (π.χ. χρήση Local Storage, backend, κλπ.).

// Ένα παράδειγμα για το πώς θα μπορούσατε να προσθέσετε έναν event listener σε μια φόρμα:

// document.addEventListener('DOMContentLoaded', () => {
//     const incomeForm = document.getElementById('income-form');
//     if (incomeForm) {
//         incomeForm.addEventListener('submit', (event) => {
//             event.preventDefault(); // Αποτροπή της προεπιλεγμένης υποβολής της φόρμας
//             const description = document.getElementById('income-description').value;
//             const amount = document.getElementById('income-amount').value;

//             console.log('Νέο Έσοδο:', { description, amount });

//             // Εδώ θα προσθέτατε κώδικα για:
//             // 1. Αποθήκευση των δεδομένων (π.χ. στο Local Storage ή σε server)
//             // 2. Εμφάνιση του νέου εσόδου στη λίστα
//             // 3. Εκκαθάριση της φόρμας
//         });
//     }

//     const expenseForm = document.getElementById('expense-form');
//     if (expenseForm) {
//         expenseForm.addEventListener('submit', (event) => {
//             event.preventDefault(); // Αποτροπή της προεπιλεγμένης υποβολής της φόρμας
//             const description = document.getElementById('expense-description').value;
//             const amount = document.getElementById('expense-amount').value;

//             console.log('Νέο Έξοδο:', { description, amount });

//             // Εδώ θα προσθέτατε κώδικα για:
//             // 1. Αποθήκευση των δεδομένων
//             // 2. Εμφάνιση του νέου εξόδου στη λίστα
//             // 3. Εκκαθάριση της φόρμας
//         });
//     }

//     // Εδώ θα προσθέτατε κώδικα για τη φόρτωση των ήδη αποθηκευμένων δεδομένων
//     // όταν φορτώνει η σελίδα (π.χ. από Local Storage)
// });

console.log("Το script.js φορτώθηκε επιτυχώς.");