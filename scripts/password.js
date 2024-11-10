class BcryptHasher {
    hash(value, callback) {
        bcrypt.hash(value, 10, (err, hashedPassword) => {
            if (err) {
                return console.error('Error:', err);
            }
    
            callback(hashedPassword);
        })
    }
  
    compare(value, password, callback) {
        bcrypt.compare(value, password, (err, result) => {
            if (err) {
                return console.error('Error:', err);
            }
    
            callback(result);
        });
    }
}

class App {
    constructor(hasher) {
        this.hasher = hasher;
        this.form = document.getElementById("form");
        this.password = document.getElementById("password");
        this.error = document.getElementById("error");
        this.init();
    }

    init() {
        this.form.addEventListener("submit", (e) => this.onSubmit(e));
    }

    async onSubmit(e) {
        e.preventDefault();

        if (this.password.value.length <= 0) return

        if (!localStorage.getItem("password")){
            this.hasher.hash(this.password.value, (result) => {
                localStorage.setItem("password", result);
                localStorage.setItem("isBlocked", false);
                window.location.href = '/';
            });
        } else {
            const password = localStorage.getItem("password");

            this.hasher.compare(this.password.value, password, (result) => {
                if (result) {
                    localStorage.setItem("isBlocked", false);
                    window.location.href = '/';
                } else {
                    this.error.innerHTML = "Не правильний пароль";
                }
            })
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const hasher = new BcryptHasher();
    const app = new App(hasher);
});