class CryptoService {
    encrypt(decryptedNote, password) {
        return CryptoJS.AES.encrypt(decryptedNote, password).toString();
    }

    decrypt(encryptedNote, password) {
        const decrypted = CryptoJS.AES.decrypt(encryptedNote, password);
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        return decryptedText;
    }
}

class App {
    constructor(cryptoService) {
        this.cryptoService = cryptoService;

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
        this.checkNavigation();
        this.attachEventListeners();
        this.loadData();
    }

    checkNavigation() {
        if (performance.navigation.type === 1 || localStorage.getItem("isBlocked") == "true" || !localStorage.getItem("isBlocked")) {
            localStorage.setItem("isBlocked", true);
            window.location.href = '/password.html';
        }
    }

    attachEventListeners() {
        this.saveButton.addEventListener("click", () => this.saveNote());
        this.pinBtn.addEventListener("click", () => this.togglePinState());
    }

    loadData() {
        if (this.isEditMode()) {
            this.loadExistingNote();
        } else {
            this.generateNewNoteDate();
        }
    }

    isEditMode() {
        return localStorage.getItem("editKey") !== null;
    }

    loadExistingNote() {
        this.editKey = localStorage.getItem("editKey");
        const password = localStorage.getItem("password");
        const notes = JSON.parse(localStorage.getItem("notes"));
        const encryptedNote = notes[this.editKey];

        if (!password || !encryptedNote) 
            return console.error("Не вдалося знайти пароль або нотатку.")

        const note = JSON.parse(this.cryptoService.decrypt(encryptedNote, password));

        this.populateNoteData(note);
    }

    populateNoteData(note) {
        this.textarea.value = note.value;
        this.dataWrapper.innerHTML = note.data;
        this.data = note.data;
        this.isPin = note.isPin;

        if (this.isPin) {
            this.pinBtn.classList.add("active");
        }
    }

    generateNewNoteDate() {
        const now = new Date();
        const day = this.getDayName(now.getDay());
        const date = now.getDate();
        const month = this.getMonthName(now.getMonth());

        const formattedDate = `${day}, ${date} ${month}`;
        this.dataWrapper.innerHTML = formattedDate;
        this.data = formattedDate;
    }

    getDayName(dayIndex) {
        const days = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
        return days[dayIndex];
    }

    getMonthName(monthIndex) {
        const months = ["січ.", "лют.", "берез.", "квіт.", "трав.", "черв.", "лип.", "серп.", "верес.", "жовт.", "лист.", "груд."];
        return months[monthIndex];
    }

    saveNote() {
        const noteData = {
            isPin: this.isPin,
            data: this.data,
            value: this.textarea.value,
        };

        const password = localStorage.getItem("password");
        if (!password) {
            console.error("Пароль не знайдено");
            return;
        }

        const encryptedNote = this.cryptoService.encrypt(JSON.stringify(noteData), password);

        if (this.isEditMode()) {
            this.updateNoteInStorage(encryptedNote);
        } else {
            this.addNewNoteToStorage(encryptedNote);
        }

        this.finishSaving();
    }

    updateNoteInStorage(encryptedNote) {
        const notes = JSON.parse(localStorage.getItem("notes")).map((note, index) =>
            index === +this.editKey ? encryptedNote : note
        );
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    addNewNoteToStorage(encryptedNote) {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.push(encryptedNote);
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    finishSaving() {
        localStorage.removeItem("editKey");
        window.location.href = '/';
    }

    togglePinState() {
        this.isPin = !this.isPin;
        this.pinBtn.classList.toggle("active");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cryptoService = new CryptoService();
    const app = new App(cryptoService);
});
