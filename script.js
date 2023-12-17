document.addEventListener('DOMContentLoaded', function() {
    
    var request = indexedDB.open('fitnessDatabase', 1);

    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        var objectStore = db.createObjectStore('users', { keyPath: 'email' });

        objectStore.createIndex('email', 'email', { unique: true });
    };

    request.onsuccess = function(event) {
        
        console.log('Database opened successfully');
        displayUserData();
    };

    request.onerror = function(event) {
        console.error('Error opening database', event.target.errorCode);
    };
});

function submitForm() {
    var username = document.getElementById('username').value;
    var email = document.getElementById('email').value;
    var height = document.getElementById('height').value;
    var weight = document.getElementById('weight').value;
    var goal = document.getElementById('goal').value;

    var request = indexedDB.open('fitnessDatabase', 1);

    request.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction('users', 'readwrite');
        var objectStore = transaction.objectStore('users');

        var getUserRequest = objectStore.get(email);

        getUserRequest.onsuccess = function(event) {
            if (event.target.result) {
                alert('User already exists!');
            } else {
                var addUserRequest = objectStore.add({
                    username: username,
                    email: email,
                    height: height,
                    weight: weight,
                    goal: goal
                });

                addUserRequest.onsuccess = function(event) {
                    alert('User data inserted successfully! Diet and workout plan will be sent to your email.');
                    sendEmail(email, goal); 
                    displayUserData(); 
                };

                addUserRequest.onerror = function(event) {
                    console.error('Error adding user to the database', event.target.errorCode);
                };
            }
        };
    };
}

function displayUserData() {
    var tableBody = document.getElementById('userDataBody');
    tableBody.innerHTML = '';

    var request = indexedDB.open('fitnessDatabase', 1);

    request.onsuccess = function(event) {
        var db = event.target.result;
        var transaction = db.transaction('users', 'readonly');
        var objectStore = transaction.objectStore('users');
        var cursorRequest = objectStore.openCursor();

        cursorRequest.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                var userData = cursor.value;
                var row = tableBody.insertRow();
                row.insertCell(0).textContent = userData.username;
                row.insertCell(1).textContent = userData.email;
                row.insertCell(2).textContent = userData.height;
                row.insertCell(3).textContent = userData.weight;
                row.insertCell(4).textContent = userData.goal;
                cursor.continue();
            }
        };
    };
}

function sendEmail(email, goal) {
    console.log(`Email sent to ${email} with ${goal} plan.`);
}
