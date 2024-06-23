export function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.toLowerCase();
  const password = document.getElementById('password').value;

  fetch('users.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((users) => {
      const user = users.find((user) => user.username === username && user.password === password);

      if (user) {
        localStorage.setItem('username', username);
        localStorage.setItem('userType', user.type);
        localStorage.setItem('userDisplayName', user.displayName || username);
        showUserInterface(user.type, user.displayName);
        fetchLocalJson();
      } else {
        showError('Invalid username or password');
      }
    })
    .catch((error) => {
      console.error('Error fetching users data:', error);
      showError('Error fetching users data');
    });
}

export function handleSignOut() {
  localStorage.removeItem('username');
  localStorage.removeItem('userType');
  localStorage.removeItem('userDisplayName');
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('searchSection').style.display = 'none';
  document.getElementById('signOutButton').style.display = 'none';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  clearError();
}

export function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
}

export function fetchLocalJson() {
  fetch('store_runs.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((json) => {
      localStorage.setItem('jsonData', JSON.stringify(json));
      cleanUpOldLocalStorage();
    })
    .catch((error) => {
      console.error('Error fetching local JSON:', error);
      showError('Error fetching local JSON file.');
    });
}

function cleanUpOldLocalStorage() {
  const currentData = JSON.parse(localStorage.getItem('jsonData'));
  const currentDate = new Date();

  const filteredData = currentData.filter((run) => {
    const runDate = new Date(run.date + ' ' + new Date().getFullYear());
    return runDate >= currentDate.setHours(0, 0, 0, 0);
  });

  localStorage.setItem('jsonData', JSON.stringify(filteredData));
}

export function performSearch(employeeName) {
  const jsonData = JSON.parse(localStorage.getItem('jsonData'));
  const results = searchEmployeeRuns(jsonData, employeeName);
  displaySearchResults(results, employeeName);
  document.getElementById('employeeName').value = '';
}

function searchEmployeeRuns(json, employeeName) {
  const regex = new RegExp(`\\b${employeeName}\\b`);
  return json.filter((run) => {
    return Object.keys(run.employee_list).some((employee) => regex.test(employee.toLowerCase()));
  });
}

function displaySearchResults(results, employeeName) {
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = '';
  // Display results logic here
}

function showError(message) {
  document.getElementById('loginError').textContent = message;
}

function clearError() {
  document.getElementById('loginError').textContent = '';
}

function showUserInterface(userType, displayName) {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('signOutButton').style.display = 'block';

  if (userType === 'admin') {
    document.getElementById('searchSection').style.display = 'block';
  } else {
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('searchTitle').style.display = 'none';
    document.getElementById('searchButton').style.display = 'none';
    const searchInputGroup = document.getElementById('searchInputGroup');
    searchInputGroup.style.display = 'none';
    const employeeNameHeader = document.getElementById('employeeNameHeader');
    employeeNameHeader.textContent = `${displayName.toUpperCase()}`;
    performSearch(displayName);
  }
}
