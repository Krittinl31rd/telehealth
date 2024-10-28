const configBtn = document.querySelector('.config-btn');
const saveBtn = document.querySelector('.save');

const username = document.getElementById('mcnUsername');
const password = document.getElementById('mcnPassword');

username.value = localStorage.getItem("mcnUsername") || "G240416165614686";
password.value = localStorage.getItem("mcnPassword") || "TLH_2024";

// Id.value = getCookie('machineId');
// username.value = getCookie('mcnUsername');
// password.value = getCookie('mcnPassword');

configBtn.addEventListener('click', async () => {
    configContainer = document.querySelector('.form-config');
    configContainer.classList.toggle('d-block');
})

saveBtn.addEventListener('click', () => {
    localStorage.setItem("mcnUsername", username.value)
    localStorage.setItem("mcnPassword", password.value)
    // setCookie('mcnUsername', username.value);
    // setCookie('mcnPassword', password.value);
})


function setCookie(name, value) {
    document.cookie = name + "=" + encodeURIComponent(value) + "; path=/"; // Save the cookie
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookiesArray = document.cookie.split(';'); // Split cookies into an array

    for (let cookie of cookiesArray) {
        cookie = cookie.trim(); // Remove whitespace
        if (cookie.indexOf(nameEQ) === 0) { // Check if this cookie starts with the name we are looking for
            return decodeURIComponent(cookie.substring(nameEQ.length)); // Return the cookie value
        }
    }
    return null; // Return null if the cookie is not found
}