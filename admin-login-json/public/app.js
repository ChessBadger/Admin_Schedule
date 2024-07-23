document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        fetchJsonData();
      } else {
        document.getElementById('loginError').textContent = 'Invalid username or password';
      }
    })
    .catch((error) => console.error('Error:', error));
});

document.getElementById('uploadForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append('file', document.getElementById('fileInput').files[0]);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById('jsonOutput').textContent = JSON.stringify(data.data, null, 2);
      } else {
        document.getElementById('jsonOutput').textContent = 'Error uploading JSON file';
      }
    })
    .catch((error) => console.error('Error:', error));
});

function fetchJsonData() {
  fetch('/data')
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById('jsonOutput').textContent = JSON.stringify(data.data, null, 2);
      }
    })
    .catch((error) => console.error('Error:', error));
}
