import { specialUsers, fetchLocalJsonData, searchEmployeeRuns, displaySearchResults } from './common.js';

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const signOutButton = document.getElementById('signOutButton');

  // Check for saved login
  const savedUsername = localStorage.getItem('username');
  const savedSearchName = localStorage.getItem('searchName');
  if (savedUsername && savedUsername !== 'admin') {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'block';
    fetchLocalJsonData((json) => {
      const results = searchEmployeeRuns(json, savedSearchName);
      displaySearchResults(results, savedSearchName);
    });
    document.getElementById('signOutButton').style.display = 'block';
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
        if (username === 'admin') {
          document.getElementById('uploadSection').style.display = 'block';
          document.getElementById('searchSection').style.display = 'block';
          document.getElementById('searchForm').style.display = 'block';
        } else {
          document.getElementById('searchSection').style.display = 'block';
          fetchLocalJsonData((json) => {
            const results = searchEmployeeRuns(json, user.searchName);
            displaySearchResults(results, user.searchName);
          });
        }
        document.getElementById('signOutButton').style.display = 'block';
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
      document.getElementById('searchSection').style.display = 'none';
      document.getElementById('signOutButton').style.display = 'none';
    });
  }
});
