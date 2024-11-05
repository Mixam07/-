class App {
    constructor() {
        this.saveButton = document.getElementById("save");
        this.dataWrapper = document.getElementById("data");
        this.textarea = document.getElementById("textarea");
        this.pinBtn = document.getElementById("pinBtn");
        this.isPin = false;
        this.editKey = -1;
        this.data = "";
        this.init();
    }

    init() {
        this.saveButton.addEventListener("click", (e) => this.save());
        this.pinBtn.addEventListener("click", (e) => this.togglePin());
        this.getData();
    }

    getData() {
        if (localStorage.getItem("editKey")) {
            this.editKey = localStorage.getItem("editKey");
            const password = localStorage.getItem("password");
            const data = JSON.parse(localStorage.getItem("notes"))[this.editKey];

            const decrypted = CryptoJS.AES.decrypt(data, password);
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            const note = JSON.parse(decryptedText);

            this.textarea.value = note.value;
            this.dataWrapper.innerHTML = note.data;
            this.data = note.data;
            if (note.isPin) {   
                this.pinBtn.classList.add("active");
            }
            this.isPin = note.isPin;
        } else {
            const data = new Date();

            const numberDay = data.getDay(); 
            const listDays = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
            const day = listDays[numberDay];

            const date = data.getDate(); 

            const numberMonth = data.getMonth(); 
            const listMonths = ["січ.", "лют.", "берез.", "квіт.", "трав.", "черв.", "лип.", "серп.", "верес.", "жовт.", "лист.", "груд."];
            const month = listMonths[numberMonth];

            this.dataWrapper.innerHTML = `${day}, ${date} ${month}`;
            this.data = `${day}, ${date} ${month}`;
        }
    }

    save() {
        const value = this.textarea.value;
        const data = {
            isPin: this.isPin,
            data: this.data,
            value
        }
        const isNotesEmpty = !localStorage.getItem("notes");
        const password = localStorage.getItem("password");

        if (!password) return console.error("Пароль не знайдено");

        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();

        if (this.editKey >= 0) {
            const newData = JSON.parse(localStorage.getItem("notes")).map((item, i) => {
                if (i == this.editKey) {
                    return encrypted
                }

                return item;
            });

            localStorage.setItem("notes", JSON.stringify(newData));
        } else {
            if (isNotesEmpty) {
                localStorage.setItem("notes", JSON.stringify([encrypted]));
            } else {
                const newData = JSON.parse(localStorage.getItem("notes"));
                
                newData.push(encrypted);
    
                localStorage.setItem("notes", JSON.stringify(newData));
            }
        }

        localStorage.removeItem("editKey");
        window.location.href = '/';
    }

    togglePin() {
        if (this.isPin) {
            this.isPin = false;
            this.pinBtn.classList.remove("active");
        } else {
            this.isPin = true;
            this.pinBtn.classList.add("active");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});