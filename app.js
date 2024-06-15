document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const fileInput = document.getElementById('fileInput');
  const fetchLocalJson = document.getElementById('fetchLocalJson');
  const searchForm = document.getElementById('searchForm');
  const signOutButton = document.getElementById('signOutButton'); // Sign Out button

  // Check for saved login
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('username', username); // Save username to localStorage
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
      } else {
        document.getElementById('loginError').textContent = 'Invalid username or password';
      }
    });
  }

  // Handle sign out
  if (signOutButton) {
    signOutButton.addEventListener('click', function () {
      localStorage.removeItem('username'); // Clear username from localStorage
      document.getElementById('loginSection').style.display = 'block';
      document.getElementById('uploadSection').style.display = 'none';
    });
  }

  // Handle dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
    });
  }

  // Handle file input change
  if (fileInput) {
    fileInput.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const json = JSON.parse(e.target.result);
            localStorage.setItem('jsonData', JSON.stringify(json));
            document.getElementById('searchSection').style.display = 'block';
          } catch (error) {
            console.error('Error parsing JSON:', error);
            document.getElementById('jsonOutput').textContent = 'Error parsing JSON file.';
          }
        };
        reader.readAsText(file);
      } else {
        document.getElementById('jsonOutput').textContent = 'Please upload a valid JSON file.';
      }
    });
  }

  // Handle fetch local JSON
  if (fetchLocalJson) {
    fetchLocalJson.addEventListener('click', function () {
      fetch('store_runs.json')
        .then((response) => response.json())
        .then((json) => {
          localStorage.setItem('jsonData', JSON.stringify(json));
          document.getElementById('searchSection').style.display = 'block';
        })
        .catch((error) => {
          console.error('Error fetching local JSON:', error);
          document.getElementById('jsonOutput').textContent = 'Error fetching local JSON file.';
        });
    });
  }

  // Handle search form submission
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const employeeName = document.getElementById('employeeName').value.trim();
      if (employeeName) {
        const jsonData = JSON.parse(localStorage.getItem('jsonData'));
        const results = searchEmployeeRuns(jsonData, employeeName);
        displaySearchResults(results, employeeName);
        employeeNameHeader.textContent = `Results for: ${employeeName.toUpperCase()}`; // Set the h2 text
        document.getElementById('employeeName').value = ''; // Clear the textbox
      }
    });
  }
});

// Search for employee runs
function searchEmployeeRuns(json, employeeName) {
  return json.filter((run) => {
    return Object.keys(run.employee_list).some((employee) => employee.toLowerCase().includes(employeeName.toLowerCase()));
  });
}

// Display search results
function displaySearchResults(results, employeeName) {
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.textContent = 'No runs found for the specified employee.';
    return;
  }

  results.forEach((run) => {
    const runElement = document.createElement('div');
    runElement.classList.add('card');

    const date = document.createElement('h3');
    date.textContent = run.date;
    runElement.appendChild(date);

    if (run.meet_time) {
      const meetTime = document.createElement('p');
      meetTime.innerHTML = `<strong>Meet Time:</strong> ${run.meet_time}`;
      runElement.appendChild(meetTime);
    }

    if (run.start_time) {
      const startTime = document.createElement('p');
      startTime.innerHTML = `<strong>Start Time:</strong> ${run.start_time}`;
      runElement.appendChild(startTime);
    }

    if (run.store_note) {
      const storeNote = document.createElement('p');
      storeNote.innerHTML = `<strong>Note:</strong> ${run.store_note}`;
      runElement.appendChild(storeNote);
    }

    let supervisor = '';
    let drivers = [];
    Object.keys(run.employee_list).forEach((employee) => {
      const [number, note] = run.employee_list[employee];
      if (number === '1)') {
        supervisor = employee;
      }
      if (note.toLowerCase().includes('driver')) {
        drivers.push(employee);
      }
    });

    if (supervisor) {
      const supervisorElement = document.createElement('p');
      supervisorElement.innerHTML = `<strong>Supervisor:</strong> ${supervisor}`;
      runElement.appendChild(supervisorElement);
    }

    if (run.meet_time && drivers.length > 0) {
      const driversElement = document.createElement('p');
      driversElement.innerHTML = `<strong>Drivers:</strong> ${drivers.join(' | ')}`;
      runElement.appendChild(driversElement);
    }

    const storeCardContainer = document.createElement('div');
    storeCardContainer.classList.add('store-card-container');
    if (run.store_name.length > 1) {
      storeCardContainer.classList.add('hidden');
    }

    run.store_name.forEach((store, index) => {
      const storeCard = document.createElement('div');
      storeCard.classList.add('store-card');

      const storeName = document.createElement('p');
      storeName.innerHTML = `<strong>${store}</strong>`;
      storeCard.appendChild(storeName);

      if (run.inv_type[index] !== undefined) {
        const invType = document.createElement('p');
        invType.innerHTML = `${run.inv_type[index]}`;
        storeCard.appendChild(invType);
      }

      const link = document.createElement('a');
      link.href = run.link[index];
      link.textContent = run.address[index];
      storeCard.appendChild(link);

      storeCardContainer.appendChild(storeCard);
    });

    if (run.store_name.length > 1) {
      const toggleStoreButton = document.createElement('button');
      toggleStoreButton.textContent = 'Toggle Stores';
      toggleStoreButton.classList.add('show-all');
      toggleStoreButton.addEventListener('click', () => {
        storeCardContainer.classList.toggle('hidden');
      });
      runElement.appendChild(toggleStoreButton);
    }

    runElement.appendChild(storeCardContainer);

    const employeeList = document.createElement('ul');
    employeeList.classList.add('employee-list', 'hidden');
    const isSpecialEmployee = Object.keys(run.employee_list).some((employee) => {
      if (employee.toLowerCase().includes(employeeName.toLowerCase())) {
        const [number, note] = run.employee_list[employee];
        return number === '1)' || (note.toLowerCase().includes('driver') && !note.toLowerCase().includes('@ store'));
      }
      return false;
    });

    if (isSpecialEmployee) {
      Object.keys(run.employee_list).forEach((employee) => {
        const [number, note] = run.employee_list[employee];
        if (employee.toLowerCase() !== employeeName.toLowerCase() && !note.toLowerCase().includes('@ store')) {
          const listItem = document.createElement('li');
          listItem.innerHTML = `<strong>${employee}</strong>`; // Only display the employee name
          employeeList.appendChild(listItem);
        }
      });
    }

    let isSupervisor = false;
    Object.keys(run.employee_list).forEach((employee) => {
      const [number] = run.employee_list[employee];
      if (employee.toLowerCase().includes(employeeName.toLowerCase()) && number === '1)') {
        isSupervisor = true;
      }
    });

    if (isSupervisor) {
      employeeList.innerHTML = '';
      Object.keys(run.employee_list).forEach((employee) => {
        const [number, note] = run.employee_list[employee];
        if (employee.toLowerCase() !== employeeName.toLowerCase()) {
          const listItem = document.createElement('li');
          if (note != '') {
            listItem.innerHTML = `<strong>${employee}</strong> - ${note}`; // Display the employee name and note separated by hyphen
          } else {
            listItem.innerHTML = `<strong>${employee}</strong>`;
          }
          employeeList.appendChild(listItem);
        }
      });
    }

    if (employeeList.childElementCount > 0) {
      const toggleEmployeeButton = document.createElement('button');
      toggleEmployeeButton.textContent = 'Toggle Employees';
      toggleEmployeeButton.addEventListener('click', () => {
        employeeList.classList.toggle('hidden');
      });
      runElement.appendChild(toggleEmployeeButton);
    }

    runElement.appendChild(employeeList);
    resultsContainer.appendChild(runElement);
  });
}
