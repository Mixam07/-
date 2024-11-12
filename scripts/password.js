class PasswordService {
    constructor() {
        this.saltRounds = 10;
    }
  
    hashPassword(password) {
        return bcrypt.hashSync(password, this.saltRounds);
    }
  
    comparePasswords(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    }
}

class App {
    constructor(passwordService) {
        this.passwordService = passwordService;
        this.title = document.getElementById("title");
        this.form = document.getElementById("form");
        this.password = document.getElementById("password");
        this.error = document.getElementById("error");
        this.init();
    }

    init() {
        this.setTitle();
        this.form.addEventListener("submit", (e) => this.onSubmit(e));
    }

    setTitle() {
        const isPasswordEmpty = !localStorage.getItem("password");

        if (isPasswordEmpty) {
            this.title.innerHTML = "Введіть новий пароль";
        } else {
            this.title.innerHTML = "Введіть пароль для перегляду ваших записів";
        }
    }

    onSubmit(e) {
        e.preventDefault();

        if (this.password.value.length <= 0) return

        if (!localStorage.getItem("password")){
            this.registration();
        } else {
            this.loginization();
        }
    }

    registration() {
        const hashedPassword = this.passwordService.hashPassword(this.password.value);

        localStorage.setItem("password", hashedPassword);
        localStorage.setItem("isBlocked", false);
        window.location.href = '/';
    }

    loginization() {
        const hashedPassword = localStorage.getItem("password");
        const result = this.passwordService.comparePasswords(this.password.value, hashedPassword);

        if (!result) return this.error.innerHTML = "Не правильний пароль";

        localStorage.setItem("isBlocked", false);
        window.location.href = '/';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const passwordService = new PasswordService();
    const app = new App(passwordService);
});