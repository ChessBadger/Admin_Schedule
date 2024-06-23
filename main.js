import { handleLogin, handleSignOut, toggleDarkMode, fetchLocalJson, performSearch } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const searchForm = document.getElementById('searchForm');
  const signOutButton = document.getElementById('signOutButton');
  const searchInputGroup = document.getElementById('searchInputGroup');
  const backgroundName = document.getElementById('backgroundName');

  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  const savedUsername = localStorage.getItem('username');
  const savedUserType = localStorage.getItem('userType');
  const savedUserDisplayName = localStorage.getItem('userDisplayName');

  if (savedUsername) {
    showUserInterface(savedUserType, savedUserDisplayName);
    fetchLocalJson();
  } else {
    document.getElementById('signOutButton').style.display = 'none';
  }

  loginForm.addEventListener('submit', handleLogin);
  signOutButton.addEventListener('click', handleSignOut);
  darkModeToggle.addEventListener('click', toggleDarkMode);
  searchForm.addEventListener('submit', handleSearch);

  function handleSearch(event) {
    event.preventDefault();
    const employeeName = document.getElementById('employeeName').value.trim().toLowerCase();
    if (employeeName) {
      performSearch(employeeName);
    }
  }
});
