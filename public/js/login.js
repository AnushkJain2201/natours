const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) {
        el.parentElement.removeChild(el);
    }
}

const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div className="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
}

const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });

        if (res.data.status === 'success') {
            location.reload(true);
        }
    } catch (err) {
        console.log(err.message);
        showAlert('error', "There is an error loggin out, try again");
    }
}

const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password,
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }

}

const logoutBTN = document.querySelector(".nav__el--logout");

if (logoutBTN) {
    logoutBTN.addEventListener('click', () => {
        logout();
    })
}

const loginForm = document.querySelector(".form");

if(loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
    
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
    
        login(email, password);
    
    });
}

