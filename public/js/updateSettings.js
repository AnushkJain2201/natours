const settingForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
console.log(passwordForm);

const hideAlerts = () => {
    const el = document.querySelector('.alert');
    if (el) {
        el.parentElement.removeChild(el);
    }
}

const showAlerts = (type, msg) => {
    hideAlerts();
    const markup = `<div className="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
}

const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'success') {
            showAlerts('success', `${type === 'password' ? "Password updated successfully" : "Data updated successfully"}`);
            // location.reload();
        }
    } catch (err) {
        showAlerts('error', err.response.data.message);
    }

}

if (settingForm) {
    settingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("asaliu");

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;

        updateSettings({ name, email }, "data");

    })
}

if (passwordForm) {

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("jeeeehfehfoe")
        const passwordCurrent = document.getElementById("password-current").value;
        const password = document.getElementById("password").value;
        const passwordConfirm = document.getElementById("password-confirm").value;

        console.log(passwordConfirm);
        console.log(password);
        console.log(passwordCurrent);

        updateSettings({ passwordCurrent, password, passwordConfirm }, "password");

    })
}
