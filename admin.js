import { specialUsers, fetchLocalJsonData, searchEmployeeRuns, displaySearchResults } from './common.js';

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const fileInput = document.getElementById('fileInput');
  const fetchLocalJson = document.getElementById('fetchLocalJson');
  const searchForm = document.getElementById('searchForm');
  const signOutButton = document.getElementById('signOutButton'); // Sign Out button

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  // Check for saved login
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('signOutButton').style.display = 'block';
    if (savedUsername === 'admin') {
      document.getElementById('searchForm').style.display = 'block';
    } else {
      fetchLocalJsonData((json) => {
        const results = searchEmployeeRuns(json, localStorage.getItem('searchName'));
        displaySearchResults(results, localStorage.getItem('searchName'));
      });
    }
  } else {
    document.getElementById('signOutButton').style.display = 'none';
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const username = document.getElementById('username').value.toLowerCase();
      const password = document.getElementById('password').value;

      const user = specialUsers.find((user) => user.username === username && user.password === password);
      if (user) {
        localStorage.setItem('username', username);
        localStorage.setItem('searchName', user.searchName);
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('searchSection').style.display = 'block';
        document.getElementById('signOutButton').style.display = 'block';
        if (username === 'admin') {
          document.getElementById('searchForm').style.display = 'block';
        } else {
          fetchLocalJsonData((json) => {
            const results = searchEmployeeRuns(json, user.searchName);
            displaySearchResults(results, user.searchName);
          });
        }
      } else {
        document.getElementById('loginError').textContent = 'Invalid username or password';
      }
    });
  }

  // Handle sign out
  if (signOutButton) {
    signOutButton.addEventListener('click', function () {
      localStorage.removeItem('username');
      localStorage.removeItem('searchName');
      document.getElementById('loginSection').style.display = 'block';
      document.getElementById('uploadSection').style.display = 'none';
      document.getElementById('searchSection').style.display = 'none';
      document.getElementById('signOutButton').style.display = 'none';
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
    });
  }

  // Handle dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
      } else {
        localStorage.setItem('darkMode', 'disabled');
      }
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
      fetchLocalJsonData((json) => {
        const searchName = localStorage.getItem('searchName');
        const results = searchEmployeeRuns(json, searchName);
        displaySearchResults(results, searchName);
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
        document.getElementById('employeeNameHeader').textContent = `Results for: ${employeeName.toUpperCase()}`;
        document.getElementById('employeeName').value = '';
      }
    });
  }
});
