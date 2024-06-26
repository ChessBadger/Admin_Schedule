document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const searchForm = document.getElementById('searchForm');
  const signOutButton = document.getElementById('signOutButton');
  const searchInputGroup = document.getElementById('searchInputGroup');
  const backgroundName = document.getElementById('backgroundName');

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
            localStorage.setItem('userDisplayName', user.displayName || username);
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
      if (employeeName) {
        performSearch(employeeName);
        employeeNameHeader.textContent = `${employeeName.toUpperCase()}`;
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

      displaySearchResults(results, employeeName);

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
      return Object.keys(run.employee_list).some((employee) => regex.test(employee.toLowerCase()));
    });
  }

  function displaySearchResults(results, employeeName) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    const jsonData = JSON.parse(localStorage.getItem('jsonData'));

    // Create a set of dates from the JSON data
    const allDates = new Set(jsonData.map((run) => run.date));

    const groupedByDate = results.reduce((acc, run) => {
      (acc[run.date] = acc[run.date] || []).push(run);
      return acc;
    }, {});

    // Get current date for comparison
    const currentDate = new Date();
    const searchNameOffice = localStorage.getItem('userOffice');

    // Create date cards for all dates
    allDates.forEach((date) => {
      // Parse date string to Date object
      const runDate = new Date(date + ' ' + new Date().getFullYear());

      // Check if runDate is today or in the future
      if (runDate >= currentDate.setHours(0, 0, 0, 0)) {
        const dateCard = document.createElement('div');
        dateCard.classList.add('card');

        const dateHeader = document.createElement('h3');
        dateHeader.textContent = date;
        dateCard.appendChild(dateHeader);

        const runsForDate = groupedByDate[date] || [];

        let foundEmployee = false;
        runsForDate.forEach((run) => {
          const runElement = document.createElement('div');
          runElement.classList.add('run-details');

          // Populate runElement with run details
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

          let supervisor = '';
          let drivers = [];
          let searchNameNote = '';
          Object.keys(run.employee_list).forEach((employee) => {
            const [number, note, office] = run.employee_list[employee];
            if (employee.toLowerCase() === employeeName.toLowerCase()) {
              searchNameNote = note; // Capture the note of the search name
              foundEmployee = true;
            }
            if (number === '1)') {
              supervisor = employee;
            }
            // if (note.toLowerCase().includes('driver') && searchNameOffice === office) {
            if (note.toLowerCase().includes('driver')) {
              if (employee.toLowerCase() !== employeeName.toLowerCase()) {
                drivers.push(employee);
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

          if (searchNameNote) {
            const searchNameNoteElement = document.createElement('p');
            searchNameNoteElement.id = 'searchNameNote';
            searchNameNoteElement.innerHTML = `${searchNameNote}`;
            runElement.appendChild(searchNameNoteElement);
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

            if (run.store_note) {
              const storeNote = document.createElement('p');
              storeNote.innerHTML = `${run.store_note}`;
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
            if (employee.toLowerCase() === employeeName.toLowerCase()) {
              const [number, note, office] = run.employee_list[employee];
              const searchNameOffice = localStorage.getItem('userOffice');
              return number === '1)' || (note.toLowerCase().includes('driver') && !note.toLowerCase().includes('@ store'));
              // return number === '1)' || (note.toLowerCase().includes('driver') && searchNameOffice === office && !note.toLowerCase().includes('@ store'));
            }
            return false;
          });

          if (isSpecialEmployee) {
            Object.keys(run.employee_list).forEach((employee) => {
              const [number, note, office] = run.employee_list[employee];
              const searchNameOffice = localStorage.getItem('userOffice');
              // if (employee.toLowerCase() !== employeeName.toLowerCase() && searchNameOffice === office && !note.toLowerCase().includes('@ store'))
              if (employee.toLowerCase() !== employeeName.toLowerCase() && !note.toLowerCase().includes('@ store')) {
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
              if (employee.toLowerCase() !== employeeName.toLowerCase()) {
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

        if (runsForDate.length === 0 || !foundEmployee) {
          const noRunsMessage = document.createElement('p');
          dateCard.appendChild(noRunsMessage);
        }

        resultsContainer.appendChild(dateCard);
      }
    });

    // Sort the date cards
    const dateCards = Array.from(resultsContainer.getElementsByClassName('card'));
    dateCards.sort((a, b) => new Date(a.querySelector('h3').textContent) - new Date(b.querySelector('h3').textContent));

    resultsContainer.innerHTML = '';
    dateCards.forEach((card) => resultsContainer.appendChild(card));

    // Add event listeners to employee names
    document.querySelectorAll('.employee-list li').forEach((li) => {
      li.addEventListener('click', function () {
        li.classList.toggle('strikethrough');
      });
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
