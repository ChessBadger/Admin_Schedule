// common.js

export const specialUsers = [
  { username: 'lclark@badgerinventory.com', password: '3684', searchName: 'lashaun' },
  { username: 'admin', password: 'admin', searchName: '' },
];

// Fetch local JSON data
export function fetchLocalJsonData(callback) {
  fetch('store_runs.json')
    .then((response) => response.json())
    .then((json) => {
      localStorage.setItem('jsonData', JSON.stringify(json));
      callback(json);
    })
    .catch((error) => {
      console.error('Error fetching local JSON:', error);
      document.getElementById('jsonOutput').textContent = 'Error fetching local JSON file.';
    });
}

// Search for employee runs
export function searchEmployeeRuns(json, employeeName) {
  return json.filter((run) => {
    return Object.keys(run.employee_list).some((employee) => employee.toLowerCase().includes(employeeName.toLowerCase()));
  });
}

// Display search results
export function displaySearchResults(results, employeeName) {
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.textContent = 'No runs found for the specified employee.';
    return;
  }

  // Group runs by date
  const groupedByDate = results.reduce((acc, run) => {
    (acc[run.date] = acc[run.date] || []).push(run);
    return acc;
  }, {});

  // Create a card for each date
  Object.keys(groupedByDate).forEach((date) => {
    const dateCard = document.createElement('div');
    dateCard.classList.add('card');

    const dateHeader = document.createElement('h3');
    dateHeader.textContent = date;
    dateCard.appendChild(dateHeader);

    // Add runs of the date to the card
    groupedByDate[date].forEach((run) => {
      const runElement = document.createElement('div');
      runElement.classList.add('run-details');

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
        const [number, note] = run.employee_list[employee];
        if (employee.toLowerCase().includes(employeeName.toLowerCase())) {
          searchNameNote = note;
        }
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

      if (searchNameNote) {
        const searchNameNoteElement = document.createElement('p');
        searchNameNoteElement.innerHTML = `<strong>Note:</strong> ${searchNameNote}`;
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
            listItem.innerHTML = `<strong>${employee}</strong>`;
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
              listItem.innerHTML = `<strong>${employee}</strong> - ${note}`;
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

    resultsContainer.appendChild(dateCard);
  });
}
