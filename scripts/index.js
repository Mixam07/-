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

        this.menu = [];
        this.button = [];
        this.edit = [];
        this.pin = [];
        this.delete = [];
        this.notes = [];
        this.init();
    }

    init() {
        this.checkNavigation();
        this.refreshPage();

        localStorage.removeItem("editKey");
    }

    checkNavigation() {
        if (performance.navigation.type === 1 || localStorage.getItem("isBlocked") == "true" || !localStorage.getItem("isBlocked")) {
            localStorage.setItem("isBlocked", true);
            window.location.href = '/password.html';
        }
    }

    refreshPage() {
        this.getNotes();
        this.renderNotes();
        this.attachEvents();
    }

    getNotes() {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        const password = localStorage.getItem("password");

        this.notes = notes.map((item, i) => {
            const decrypted = this.cryptoService.decrypt(item, password);
            return { ...JSON.parse(decrypted), key: i };
        });
    }

    renderNotes() {
        if (!this.notes.length) return;

        const wrapper = document.getElementById("wrapper");
        wrapper.classList.remove("flex", "min-h-full");
        wrapper.classList.add("grid", "gap-4", "md:gap-6");
        wrapper.innerHTML = "";

        const pin = this.notes.filter(item => item.isPin);
        const unpin = this.notes.filter(item => !item.isPin);
        const sortedNotes = pin.concat(unpin);

        sortedNotes.forEach((note, i) => {
            wrapper.innerHTML += this.createNoteHTML(note);
        });

        this.addFloatingButton();
        this.cacheElements();
    }

    createNoteHTML(note) {
        return `
            <div class="${note.isPin ? "bg-[#3A3644]/25" : "bg-[#3A3644]"} p-4 md:p-6 rounded-xl w-full relative">
                <div class="text-xl md:text-3xl font-light pb-2 md:pb-6 relative before:content-[''] before:absolute before:bottom-0 before:left-0
                    before:w-full before:h-[1px] before:bg-[#77747D] overflow-hidden text-ellipsis whitespace-nowrap">${note.value}</div>
                <div class="flex mt-2 flex justify-between items-center">
                    <div class="md:text-xl font-light">${note.data}</div>
                    <button data-button class="py-2">
                        <img src="./assets/icons/points.svg" alt="points" />
                    </button>
                </div>
                <div data-menu class="absolute bottom-[-7px] right-0 z-[2] opacity-0 pointer-events-none duration-500">
                    <div class="bg-[#2F2C33] rounded-[25px] mb-2 flex p-3.5 gap-x-4 items-center">
                        <button data-edit>
                            <img class="w-4 md:w-6" src="./assets/icons/pencil.svg" alt="pencil" />
                        </button>
                        <button data-pin data-key="${note.key}" class="button relative ${note.isPin && "active"}">
                            <img class="w-4 md:w-6" src="./assets/icons/unpin.svg" alt="save" />
                            <img class="w-4 md:w-6 absolute top-0 left-0 duration-500 opacity-0" src="./assets/icons/pin.svg" alt="save" />
                        </button>
                        <button data-delete data-id="${note.key}">
                            <img class="w-4 md:w-6" src="./assets/icons/trash.svg" alt="trash" />
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addFloatingButton() {
        document.querySelector("body").innerHTML += `
            <a href="./edit.html" class="absolute bottom-4 left-2/4 -translate-x-2/4 block h-16 md:h-24 w-16 md:w-24 rounded-full bg-[#9990A1] flex
                items-center justify-center">
                <img src="./assets/icons/plus.svg" alt="plus">
            </a>
        `;
    }

    cacheElements() {
        this.menu = document.querySelectorAll("[data-menu]");
        this.button = document.querySelectorAll("[data-button]");
        this.edit = document.querySelectorAll("[data-edit]");
        this.pin = document.querySelectorAll("[data-pin]");
        this.delete = document.querySelectorAll("[data-delete]");
    }

    attachEvents() {
        document.addEventListener("click", (e) => this.handleOutsideClick(e));

        this.button.forEach((button, i) => {
            button.addEventListener("click", () => this.toggleMenu(i));
        });

        this.delete.forEach(deleteBtn => {
            deleteBtn.addEventListener("click", () => this.deleteNote(deleteBtn.dataset.id));
        });

        this.edit.forEach((edit, i) => {
            edit.addEventListener("click", () => this.editNote(i));
        });

        this.pin.forEach(pin => {
            pin.addEventListener("click", () => this.togglePin(pin.dataset.key));
        });
    }

    handleOutsideClick(e) {
        if (!e.target.closest("[data-menu]") && !e.target.closest("[data-button]")) {
            this.menu.forEach(menu => {
                menu.classList.add("opacity-0", "pointer-events-none");
            });
        }
    }

    toggleMenu(index) {
        this.menu.forEach((menu, i) => {
            if (i !== index) {
                menu.classList.add("opacity-0", "pointer-events-none");
            }
        });

        this.menu[index].classList.toggle("opacity-0");
        this.menu[index].classList.toggle("pointer-events-none");
    }

    deleteNote(index) {
        const notes = JSON.parse(localStorage.getItem("notes")).filter((_, i) => i !== +index);
        localStorage.setItem("notes", JSON.stringify(notes));
        this.refreshPage();
    }

    editNote(index) {
        localStorage.setItem("editKey", index);
        window.location.href = 'edit.html';
    }

    togglePin(index) {
        const password = localStorage.getItem("password");

        const updatedNotes = this.notes.map((note, i) => {
            if (+index === i) {
                return CryptoJS.AES.encrypt(JSON.stringify({ ...note, isPin: !note.isPin }), password).toString();
            }
            return CryptoJS.AES.encrypt(JSON.stringify(note), password).toString();
        });

        localStorage.setItem("notes", JSON.stringify(updatedNotes));
        this.refreshPage();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cryptoService = new CryptoService();
    const app = new App(cryptoService);
});