document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const searchForm = document.getElementById('searchForm');
  const signOutButton = document.getElementById('signOutButton');
  const searchInputGroup = document.getElementById('searchInputGroup');
  const backgroundName = document.getElementById('backgroundName');
  const togglePassedDaysButton = document.getElementById('togglePassedDays');
  const calendarToggle = document.getElementById('calendarToggle');
  const calendarContainer = document.getElementById('calendarContainer');
  const calendar = document.getElementById('calendar');
  let showPassedDays = false;

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
  }

  // Check for saved login
  const savedUsername = localStorage.getItem('username');
  const savedUserType = localStorage.getItem('userType');
  const savedUserDisplayName = localStorage.getItem('userDisplayName');

  if (savedUsername) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signOutButton').style.display = 'block';

    fetchLocalJson(); // Fetch local JSON automatically

    if (savedUserType === 'admin') {
      document.getElementById('searchSection').style.display = 'block';
    } else {
      document.getElementById('searchSection').style.display = 'block';
      document.getElementById('searchTitle').style.display = 'none';
      document.getElementById('searchButton').style.display = 'none';
      searchInputGroup.style.display = 'none';
      const employeeNameHeader = document.getElementById('employeeNameHeader');
      employeeNameHeader.textContent = `${savedUserDisplayName.toUpperCase()}`;
      performSearch(savedUserDisplayName); // Perform search for the logged-in user
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

      // Load user data from external file
      fetch('formatted_users.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((users) => {
          console.log(users); // Log users data for debugging
          const user = users.find((user) => user.username === username && user.password === password);

          if (user) {
            localStorage.setItem('username', username);
            localStorage.setItem('userType', user.type);
            localStorage.setItem('userDisplayName', user.firstName || username);
            localStorage.setItem('userOffice', user.office);
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('signOutButton').style.display = 'block';

            fetchLocalJson(); // Fetch local JSON automatically

            if (user.type === 'admin') {
              document.getElementById('searchSection').style.display = 'block';
            } else {
              document.getElementById('searchSection').style.display = 'block';
              searchInputGroup.style.display = 'none';
              const employeeNameHeader = document.getElementById('employeeNameHeader');
              employeeNameHeader.textContent = `Results for: ${user.displayName.toUpperCase()}`;
              performSearch(user.displayName); // Perform search for the logged-in user
            }

            location.reload(); // Refresh the screen after login
          } else {
            document.getElementById('loginError').textContent = 'Invalid username or password';
          }
        })
        .catch((error) => {
          console.error('Error fetching users data:', error);
          document.getElementById('loginError').textContent = 'Error fetching users data';
        });
    });
  }

  // Handle sign out
  if (signOutButton) {
    signOutButton.addEventListener('click', function () {
      localStorage.removeItem('username');
      localStorage.removeItem('userType');
      localStorage.removeItem('userDisplayName');
      localStorage.removeItem('userOffice');
      document.getElementById('loginSection').style.display = 'block';
      document.getElementById('searchSection').style.display = 'none';
      document.getElementById('signOutButton').style.display = 'none';
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      backgroundName.style.display = 'none';
      calendarContainer.style.display = 'none';
      calendarToggle.textContent = 'View Calendar';

      // Clear login error message
      document.getElementById('loginError').textContent = '';
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

  // Fetch local JSON
  function fetchLocalJson() {
    fetch('store_runs.json')
      .then((response) => response.json())
      .then((json) => {
        localStorage.setItem('jsonData', JSON.stringify(json));
      })
      .catch((error) => {
        console.error('Error fetching local JSON:', error);
        document.getElementById('jsonOutput').textContent = 'Error fetching local JSON file.';
      });
  }

  // Handle search form submission
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const employeeName = document.getElementById('employeeName').value.trim().toLowerCase();
      if (employeeName === 'all stores') {
        displayAllStores(); // Call the function to display all stores
        calendarContainer.style.display = 'none';
        calendarToggle.textContent = 'View Calendar';
      } else if (employeeName) {
        performSearch(employeeName);
        document.getElementById('employeeNameHeader').textContent = `${employeeName.toUpperCase()}`;
        calendarContainer.style.display = 'none';
        calendarToggle.textContent = 'View Calendar';
      }
    });
  }

  function performSearch(employeeName) {
    let jsonData = localStorage.getItem('jsonData');
    if (!jsonData) {
      fetchLocalJson(); // Fetch the JSON data again if it's null
      jsonData = localStorage.getItem('jsonData');
    }

    if (jsonData) {
      const results = searchEmployeeRuns(JSON.parse(jsonData), employeeName);
      const suggestionsContainer = document.getElementById('suggestions');

      // Extract office information and update local storage
      const office = extractOfficeInfo(results, employeeName);
      if (office) {
        localStorage.setItem('userOffice', office);
      }

      displaySearchResults(results, employeeName, office);

      document.getElementById('employeeName').value = ''; // Clear the textbox
      suggestionsContainer.innerHTML = '';
    } else {
      document.getElementById('resultsContainer').textContent = 'No data available for search.';
    }
  }

  function extractOfficeInfo(results, employeeName) {
    for (let run of results) {
      for (let employee in run.employee_list) {
        if (employee.toLowerCase() === employeeName.toLowerCase()) {
          return run.employee_list[employee][2]; // Assuming the office information is at index 2
        }
      }
    }
    return null;
  }

  // Search for employee runs
  function searchEmployeeRuns(json, employeeName) {
    const regex = new RegExp(`\\b${employeeName}\\b`);
    return json.filter((run) => {
      return Object.keys(run.employee_list).some((employee) => employee.toLowerCase() === employeeName.toLowerCase());
    });
  }

  function displayAllStores() {
    let jsonData = localStorage.getItem('jsonData');
    if (!jsonData) {
      fetchLocalJson(); // Fetch the JSON data again if it's null
      jsonData = localStorage.getItem('jsonData');
    }

    if (jsonData) {
      const results = JSON.parse(jsonData);
      displaySearchResults(results, 'all stores', null, true); // Pass true to indicate all stores search
    } else {
      document.getElementById('resultsContainer').textContent = 'No data available for search.';
    }
  }

  togglePassedDaysButton.addEventListener('click', function () {
    showPassedDays = !showPassedDays;
    togglePassedDaysButton.textContent = showPassedDays ? 'Hide Passed Days' : 'Show Passed Days';
    togglePassedDaysVisibility(showPassedDays);
  });

  function togglePassedDaysVisibility(show) {
    const passedDays = document.querySelectorAll('.passed-day');
    passedDays.forEach((day) => {
      day.style.display = show ? 'block' : 'none';
    });
  }

  function displaySearchResults(results, employeeName, office, isAllStoresSearch = false) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    const jsonData = JSON.parse(localStorage.getItem('jsonData'));

    const allDates = new Set(jsonData.map((run) => run.date));

    const groupedByDate = results.reduce((acc, run) => {
      (acc[run.date] = acc[run.date] || []).push(run);
      return acc;
    }, {});

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const searchNameOffice = localStorage.getItem('userOffice');

    allDates.forEach((date) => {
      const runDate = new Date(date + ' ' + new Date().getFullYear());
      runDate.setHours(0, 0, 0, 0);

      const dateCard = document.createElement('div');
      dateCard.classList.add('card');

      const dateHeader = document.createElement('h3');
      dateHeader.textContent = date;
      dateCard.appendChild(dateHeader);

      const runsForDate = groupedByDate[date] || [];

      runsForDate.sort((a, b) => {
        const aContainsAfter = Object.keys(a.employee_list).some((employee) => a.employee_list[employee][1].toLowerCase().includes('after'));
        const bContainsAfter = Object.keys(b.employee_list).some((employee) => b.employee_list[employee][1].toLowerCase().includes('after'));
        if (aContainsAfter && !bContainsAfter) return 1;
        if (!aContainsAfter && bContainsAfter) return -1;
        return 0;
      });

      let foundEmployee = false;
      runsForDate.forEach((run, index) => {
        const runElement = document.createElement('div');
        runElement.classList.add('run-details');

        if (index % 2 === 0) {
          // Optional: Add class for alternating background colors
        } else {
          runElement.classList.add('odd');
        }

        if (index === 0) {
          if (Array.isArray(run.meet_time)) {
            const filteredMeetTimes = filterMeetTimes(run.meet_time, searchNameOffice);
            if (filteredMeetTimes.length > 0) {
              const meetTime = document.createElement('p');
              meetTime.innerHTML = `<strong>Meet Time:</strong> ${filteredMeetTimes.join(', ')}`;
              runElement.appendChild(meetTime);
            }
          } else if (run.meet_time) {
            const meetTime = document.createElement('p');
            meetTime.innerHTML = `<strong>Meet Time:</strong> ${run.meet_time}`;
            runElement.appendChild(meetTime);
          }

          if (run.start_time) {
            const startTime = document.createElement('p');
            startTime.innerHTML = `<strong>Start Time:</strong> ${run.start_time}`;
            runElement.appendChild(startTime);
          }
        }

        let supervisor = '';
        let drivers = [];
        let searchNameNote = '';
        Object.keys(run.employee_list).forEach((employee) => {
          const [number, note, office] = run.employee_list[employee];
          if (employee.toLowerCase() === employeeName.toLowerCase()) {
            searchNameNote = note;
            foundEmployee = true;
          }
          if (number === '1)') {
            supervisor = employee;

            if (employeeName.toLowerCase() == employee.toLowerCase()) {
              const crownImage = document.createElement('img');
              crownImage.src = 'crown.png';
              crownImage.classList.add('crown-logo');
              dateCard.appendChild(crownImage);
            }
          }
          if (note.toLowerCase().includes('driver')) {
            if (employee.toLowerCase() !== employeeName.toLowerCase()) {
              const noteParts = note.split(',');
              const vehicle = noteParts[1].trim();
              drivers.push(`${employee} <span style="color: green;">(${vehicle})</span>`);
            } else {
              const carLogoLight = document.createElement('img');
              carLogoLight.src = 'car_logo_light.png';
              carLogoLight.classList.add('car-logo', 'car-logo-light');
              dateCard.appendChild(carLogoLight);

              const carLogoDark = document.createElement('img');
              carLogoDark.src = 'car_logo_dark.png';
              carLogoDark.classList.add('car-logo', 'car-logo-dark');
              dateCard.appendChild(carLogoDark);
            }
          }
        });

        if (supervisor && supervisor.toLowerCase() !== employeeName.toLowerCase()) {
          const supervisorElement = document.createElement('p');
          supervisorElement.innerHTML = `<strong>Supervisor:</strong> ${supervisor}`;
          runElement.appendChild(supervisorElement);
        }

        if (index === 0 && run.meet_time && drivers.length > 0 && !isAllStoresSearch) {
          const driversElement = document.createElement('p');
          driversElement.innerHTML = `<strong>Drivers:</strong> ${drivers.join(' | ')}`;
          runElement.appendChild(driversElement);
        }

        let otherEmployeesWithRx = [];
        Object.keys(run.employee_list).forEach((employee) => {
          const [number, note, office] = run.employee_list[employee];
          if (note.toLowerCase().includes('rx') && employee.toLowerCase() !== employeeName.toLowerCase()) {
            otherEmployeesWithRx.push(`${employee}`);
          }
        });

        if (otherEmployeesWithRx.length > 0 && searchNameNote.toLowerCase().includes('rx')) {
          const otherEmployeesElement = document.createElement('p');
          otherEmployeesElement.innerHTML = `<strong>RX:</strong> ${otherEmployeesWithRx.join(' | ')}`;
          runElement.appendChild(otherEmployeesElement);
        } else if (otherEmployeesWithRx.length > 0 && employeeName.toLowerCase() == supervisor.toLowerCase()) {
          const otherEmployeesElement = document.createElement('p');
          otherEmployeesElement.innerHTML = `<strong>RX:</strong> ${otherEmployeesWithRx.join(' | ')}`;
          runElement.appendChild(otherEmployeesElement);
        }

        if (searchNameNote) {
          const searchNameNoteElement = document.createElement('p');
          searchNameNoteElement.id = 'searchNameNote';
          searchNameNoteElement.innerHTML = `${searchNameNote}`;
          runElement.appendChild(searchNameNoteElement);
        }

        const storeCardContainer = document.createElement('div');
        storeCardContainer.classList.add('store-card-container');
        if (run.store_name.length > 1 && !isAllStoresSearch) {
          storeCardContainer.classList.add('hidden');
        }

        run.store_name.forEach((store, index) => {
          const storeCard = document.createElement('div');
          storeCard.classList.add('store-card');

          const storeName = document.createElement('p');
          storeName.innerHTML = `<strong>${store}</strong>`;
          storeCard.appendChild(storeName);

          if (run.store_note[index] !== undefined) {
            const storeNote = document.createElement('p');
            storeNote.innerHTML = `${run.store_note[index]}`;
            storeNote.style.color = 'red';
            storeCard.appendChild(storeNote);
          }

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

        if (run.store_name.length > 1 && !isAllStoresSearch) {
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
          if (employee.toLowerCase() === employeeName.toLowerCase()) {
            const [number, note, office] = run.employee_list[employee];
            const searchNameOffice = localStorage.getItem('userOffice');
            return number === '1)' || (note.toLowerCase().includes('driver') && !note.toLowerCase().includes('@ store'));
          }
          return false;
        });

        if (isSpecialEmployee) {
          Object.keys(run.employee_list).forEach((employee) => {
            const [number, note, office] = run.employee_list[employee];
            const searchNameOffice = localStorage.getItem('userOffice');
            if (
              employee.toLowerCase() !== employeeName.toLowerCase() &&
              !note.toLowerCase().includes('@ store') &&
              number !== '#' &&
              !note.toLowerCase().includes('driver')
            ) {
              const listItem = document.createElement('li');
              listItem.innerHTML = `<strong>${employee}</strong>`;
              employeeList.appendChild(listItem);
            }
          });
        }

        let isSupervisor = false;
        Object.keys(run.employee_list).forEach((employee) => {
          const [number] = run.employee_list[employee];
          if (employee.toLowerCase() === employeeName.toLowerCase() && number === '1)') {
            isSupervisor = true;
          }
        });

        if (isSupervisor) {
          employeeList.innerHTML = '';
          Object.keys(run.employee_list).forEach((employee) => {
            const [number, note] = run.employee_list[employee];
            if (employee.toLowerCase() !== employeeName.toLowerCase() && number !== '#') {
              const listItem = document.createElement('li');
              if (note !== '') {
                listItem.innerHTML = `<strong>${employee}</strong> - <small style="color: green;">${note}</small>`;
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
        dateCard.appendChild(runElement);

        const separator = document.createElement('hr');
        dateCard.appendChild(separator);
      });

      if (runDate < currentDate) {
        localStorage.setItem('rundate', runDate);
        localStorage.setItem('currentdate', currentDate);
        dateCard.classList.add('passed-day');
        dateCard.style.display = 'none';
      }

      if (runsForDate.length === 0 || !foundEmployee) {
        const noRunsMessage = document.createElement('p');
        dateCard.appendChild(noRunsMessage);
      }

      resultsContainer.appendChild(dateCard);
    });

    const dateCards = Array.from(resultsContainer.getElementsByClassName('card'));
    dateCards.sort((a, b) => new Date(a.querySelector('h3').textContent) - new Date(b.querySelector('h3').textContent));

    resultsContainer.innerHTML = '';
    dateCards.forEach((card) => resultsContainer.appendChild(card));

    document.querySelectorAll('.employee-list li').forEach((li) => {
      li.addEventListener('click', function () {
        li.classList.toggle('strikethrough');
      });
    });
  }

  function filterMeetTimes(meetTimes, office) {
    return meetTimes
      .filter((time) => {
        if (time.includes('M:') && office === 'Milwaukee') return true;
        if (time.includes('IL:') && office === 'Rockford') return true;
        if (time.includes('FV:') && office === 'Fox Valley') return true;
        if (time.includes('MD:') && office === 'Madison') return true;
        if (!time.includes('M:') && !time.includes('IL:') && !time.includes('FV:') && !time.includes('MD:')) return true;
        return false;
      })
      .map((time) => {
        return time.replace('M:', '').replace('IL:', '').replace('FV:', '').replace('MD:', '').trim();
      });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('employeeName');
  const suggestionsContainer = document.getElementById('suggestions');

  searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();
    if (query.length > 0) {
      showSuggestions(query);
    } else {
      suggestionsContainer.innerHTML = '';
    }
  });

  function showSuggestions(query) {
    let jsonData = localStorage.getItem('jsonData');
    if (!jsonData) {
      fetchLocalJson();
      jsonData = localStorage.getItem('jsonData');
    }

    if (jsonData) {
      const data = JSON.parse(jsonData);
      const employeeNames = new Set();
      data.forEach((run) => {
        Object.keys(run.employee_list).forEach((name) => {
          if (name.toLowerCase().includes(query)) {
            employeeNames.add(name);
          }
        });
      });

      displaySuggestions(Array.from(employeeNames));
    }
  }

  function displaySuggestions(names) {
    suggestionsContainer.innerHTML = '';
    names.forEach((name, index) => {
      const suggestion = document.createElement('div');
      suggestion.classList.add('suggestion');
      suggestion.textContent = name;
      suggestion.addEventListener('click', () => {
        searchInput.value = name;
        suggestionsContainer.innerHTML = '';
      });
      suggestionsContainer.appendChild(suggestion);

      if (index < names.length - 1) {
        const separator = document.createElement('hr');
        separator.classList.add('suggestion-separator');
        suggestionsContainer.appendChild(separator);
      }
    });
  }

  // Toggle calendar visibility
  calendarToggle.addEventListener('click', function () {
    if (calendarContainer.style.display === 'none') {
      calendarContainer.style.display = 'block';
      generateCalendar();
      calendarToggle.textContent = 'Hide Calendar';
    } else {
      calendarContainer.style.display = 'none';
      calendarToggle.textContent = 'View Calendar';
    }
  });

  // Helper function to parse date from card title
  function parseDateFromTitle(title) {
    const date = new Date(title + ' ' + new Date().getFullYear());
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // Function to get the month name
  function getMonthName(monthIndex) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthIndex];
  }

  function isPayday(day, month, year) {
    const startDate = new Date(2024, 6, 5); // July 5, 2024
    const currentDate = new Date(year, month, day);
    const diffTime = Math.abs(currentDate - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % 14 === 0;
  }

  // Function to generate the calendar
  function generateCalendar() {
    const cardElements = document.querySelectorAll('.card');
    const dateStatuses = {};

    cardElements.forEach((card) => {
      const dateTitle = card.querySelector('h3').textContent;
      const dateKey = parseDateFromTitle(dateTitle);
      const hasStoreCard = card.querySelector('.store-card') !== null;

      if (!dateStatuses[dateKey]) {
        dateStatuses[dateKey] = { hasStoreCard: false };
      }

      if (hasStoreCard) {
        dateStatuses[dateKey].hasStoreCard = true;
      }
    });

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = getMonthName(month);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = '';

    // Add month name
    const monthNameElement = document.createElement('div');
    monthNameElement.id = 'monthName';
    monthNameElement.textContent = monthName;
    calendar.appendChild(monthNameElement);

    // Add days of the week headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdaysRow = document.createElement('div');
    weekdaysRow.classList.add('weekdays');
    weekdays.forEach((day) => {
      const weekday = document.createElement('div');
      weekday.classList.add('weekday');
      weekday.textContent = day;
      weekdaysRow.appendChild(weekday);
    });
    calendar.appendChild(weekdaysRow);

    // Add empty days to align the first day of the month correctly
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.classList.add('calendar-day', 'empty');
      calendar.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month + 1}/${day}`;
      const calendarDay = document.createElement('div');
      calendarDay.classList.add('calendar-day');
      calendarDay.textContent = day;

      // Highlight the current day
      if (day === currentDay) {
        calendarDay.classList.add('current-day');
      }

      // Highlight paydays
      if (isPayday(day, month, year)) {
        calendarDay.classList.add('payday');
      }

      if (dateStatuses[date]) {
        if (dateStatuses[date].hasStoreCard) {
          calendarDay.classList.add('red');
        } else {
          calendarDay.classList.add('green');
        }
      } else {
        calendarDay.classList.add('gray');
      }

      calendar.appendChild(calendarDay);
    }
  }

  // Fetch local JSON
  function fetchLocalJson() {
    fetch('store_runs.json')
      .then((response) => response.json())
      .then((json) => {
        localStorage.setItem('jsonData', JSON.stringify(json));
      })
      .catch((error) => {
        console.error('Error fetching local JSON:', error);
      });
  }

  // Initial data fetch
  fetchLocalJson();
});
