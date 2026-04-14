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

    // --- Αναφορές στα στοιχεία της φόρμας και του πίνακα ---
    const employeeForm = document.getElementById('employee-form');
    // Only proceed with DOM-related operations if the employeeForm exists
    if (employeeForm) {
        const editingEmployeeIdInput = document.getElementById('editing-employee-id');
        const employeeNameInput = document.getElementById('employee-name');
        const employeeSpecialtyInput = document.getElementById('employee-specialty');
        const employeeDailyWageInput = document.getElementById('employee-daily-wage');
        const employeePhoneInput = document.getElementById('employee-phone');
        const submitEmployeeButton = document.getElementById('submit-employee-button');
        const employeesTableBody = document.querySelector('#employees-table tbody');
        const employeeSearchInput = document.getElementById('employee-search');
        const noEmployeesMessage = document.getElementById('no-employees-message');

        // --- Λειτουργίες Local Storage ---
        const getAllEmployees = () => {
            const data = localStorage.getItem('employees');
            return data ? JSON.parse(data) : [];
        };

        const saveAllEmployees = (employees) => {
            localStorage.setItem('employees', JSON.stringify(employees));
        };

        const addEmployee = (employee) => {
            const employees = getAllEmployees();
            employees.push(employee);
            saveAllEmployees(employees);
        };

        const updateEmployee = (id, updatedEmployee) => {
            let employees = getAllEmployees();
            employees = employees.map(emp => emp.id === id ? updatedEmployee : emp);
            saveAllEmployees(employees);
        };

        const deleteEmployee = (id) => {
            let employees = getAllEmployees();
            employees = employees.filter(emp => emp.id !== id);
            saveAllEmployees(employees);
        };

        // --- Εμφάνιση υπαλλήλων στον πίνακα ---
        const displayEmployees = (filter = '') => {
            const employees = getAllEmployees();
            employeesTableBody.innerHTML = ''; // Καθαρισμός πίνακα
            noEmployeesMessage.style.display = 'none';

            const filteredEmployees = employees.filter(emp =>
                emp.name.toLowerCase().includes(filter.toLowerCase()) ||
                emp.specialty.toLowerCase().includes(filter.toLowerCase()) ||
                (emp.phone && emp.phone.toLowerCase().includes(filter.toLowerCase())) // Check if phone exists
            );

            if (filteredEmployees.length === 0) {
                noEmployeesMessage.style.display = 'block';
                return;
            }

            filteredEmployees.sort((a, b) => a.name.localeCompare(b.name, 'el-GR')); // Ταξινόμηση αλφαβητικά

            filteredEmployees.forEach(employee => {
                const row = employeesTableBody.insertRow();
                row.dataset.id = employee.id;

                row.insertCell().textContent = employee.name;
                row.insertCell().textContent = employee.specialty;
                row.insertCell().textContent = formatCurrency(employee.dailyWage);
                row.insertCell().textContent = employee.phone;

                const actionsCell = row.insertCell();
                const editButton = document.createElement('button');
                editButton.textContent = 'Επεξεργασία';
                editButton.classList.add('edit-btn');
                editButton.addEventListener('click', () => editEmployee(employee.id));
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Διαγραφή';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => {
                    if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον υπάλληλο ${employee.name};`)) {
                        deleteEmployee(employee.id);
                        displayEmployees(employeeSearchInput.value); // Επανεμφάνιση πίνακα με φίλτρο
                    }
                });
                actionsCell.appendChild(deleteButton);
            });
        };

        // --- Λειτουργία επεξεργασίας υπαλλήλου ---
        const editEmployee = (id) => {
            const employees = getAllEmployees();
            const employeeToEdit = employees.find(emp => emp.id === id);

            if (employeeToEdit) {
                editingEmployeeIdInput.value = employeeToEdit.id;
                employeeNameInput.value = employeeToEdit.name;
                employeeSpecialtyInput.value = employeeToEdit.specialty;
                employeeDailyWageInput.value = employeeToEdit.dailyWage;
                employeePhoneInput.value = employeeToEdit.phone;
                submitEmployeeButton.textContent = 'Ενημέρωση Υπαλλήλου';
            }
        };

        // --- Event Listeners ---

        // Όταν υποβάλλεται η φόρμα
        employeeForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = employeeNameInput.value.trim();
            const specialty = employeeSpecialtyInput.value.trim();
            const dailyWage = parseFloat(employeeDailyWageInput.value) || 0;
            const phone = employeePhoneInput.value.trim();

            if (!name || dailyWage <= 0) {
                alert("Παρακαλώ συμπληρώστε Ονοματεπώνυμο και έγκυρο Ημερομίσθιο.");
                return;
            }

            const editingId = editingEmployeeIdInput.value;
            const newOrUpdatedEmployee = {
                id: editingId ? parseInt(editingId, 10) : Date.now(),
                name: name,
                specialty: specialty,
                dailyWage: dailyWage,
                phone: phone
            };

            if (editingId) {
                updateEmployee(parseInt(editingId, 10), newOrUpdatedEmployee);
            } else {
                // Έλεγχος για διπλότυπο όνομα (προαιρετικό αλλά καλό)
                const existingEmployees = getAllEmployees();
                if (existingEmployees.some(emp => emp.name.toLowerCase() === name.toLowerCase())) {
                    alert('Υπάρχει ήδη υπάλληλος με αυτό το ονοματεπώνυμο. Παρακαλώ χρησιμοποιήστε διαφορετικό ή επεξεργαστείτε τον υπάρχοντα.');
                    return;
                }
                addEmployee(newOrUpdatedEmployee);
            }

            displayEmployees(employeeSearchInput.value); // Εμφάνιση των ενημερωμένων καταχωρήσεων
            employeeForm.reset(); // Καθαρισμός φόρμας
            editingEmployeeIdInput.value = '';
            submitEmployeeButton.textContent = 'Προσθήκη Υπαλλήλου';
        });

        // Αναζήτηση υπαλλήλων
        employeeSearchInput.addEventListener('input', (event) => {
            displayEmployees(event.target.value);
        });

        // --- Αρχικοποίηση κατά τη φόρτωση της σελίδας ---
        displayEmployees();
        console.log("Το employees.js φορτώθηκε επιτυχώς.");
    } else {
        console.log("employees.js: Employee form not found, skipping DOM initialization.");
    }
});
