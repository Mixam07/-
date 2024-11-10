class App {
    constructor() {
        this.wrapper = document.getElementById("wrapper");
        this.menu = [];
        this.button = [];
        this.edit = [];
        this.pin = [];
        this.delete = [];
        this.notes = [];
        this.init();
    }

    init() {
        console.log(performance.navigation.type)
        if (performance.navigation.type === 1 || localStorage.getItem("isBlocked") == "true" || !localStorage.getItem("isBlocked")) {
            localStorage.setItem("isBlocked", true)
            window.location.href = '/password.html';
        }

        this.createPassword();
        this.getNotes();
        this.addNotesToPage();
        this.addEventes();

        localStorage.removeItem("editKey");
    }

    generatePassword(length) {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:',.<>?";
        let password = "";
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }
        
        return password;
    }

    createPassword() {
        const isPasswordEmpty = !localStorage.getItem("password");

        if (isPasswordEmpty) {
            const password = this.generatePassword(100);

            localStorage.setItem("password", password);
        }
    }

    getNotes() {
        if (!localStorage.getItem("notes")) return

        const notes = JSON.parse(localStorage.getItem("notes"));
        const password = localStorage.getItem("password");
        const newNotesList = [];

        notes.forEach((item, i) => {
            const decrypted = CryptoJS.AES.decrypt(item, password);
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            const data = JSON.parse(decryptedText);

            newNotesList.push({
                ...data,
                key: i
            });
        });

        this.notes = newNotesList;
    }

    addNotesToPage() {
        if (this.notes.length > 0) {
            this.wrapper.classList.remove("flex", "min-h-full");
            this.wrapper.classList.add("grid", "gap-4", "md:gap-6");
            this.wrapper.innerHTML = "";
            const pin = this.notes.filter(item => item.isPin);
            const unpin = this.notes.filter(item => !item.isPin);
            const newList = pin.concat(unpin);

            newList.forEach((item, i) => {
                this.wrapper.innerHTML += `
                    <div class="${item.isPin? "bg-[#3A3644]/25": "bg-[#3A3644]"} p-4 md:p-6 rounded-xl w-full relative">
                        <div class="text-xl md:text-3xl font-light pb-2 md:pb-6 relative before:content-[''] before:absolute before:bottom-0 before:left-0
                            before:w-full before:h-[1px] before:bg-[#77747D] overflow-hidden text-ellipsis whitespace-nowrap">${item.value}</div>
                        <div class="flex mt-2 flex justify-between items-center">
                            <div class="md:text-xl font-light">${item.data}</div>
                            <button data-button class="py-2">
                                <img src="./assets/icons/points.svg" alt="points" />
                            </button>
                        </div>
                        <div data-menu class="absolute bottom-[-7px] right-0 z-[2] opacity-0 pointer-events-none duration-500">
                            <div class="bg-[#2F2C33] rounded-[25px] mb-2 flex p-3.5 gap-x-4 items-center">
                                <button data-edit>
                                    <img class="w-4 md:w-6" src="./assets/icons/pencil.svg" alt="pencil" />
                                </button>
                                <button data-pin data-key="${item.key}" class="button relative ${item.isPin && "active"}">
                                    <img class="w-4 md:w-6" src="./assets/icons/unpin.svg" alt="save" />
                                    <img class="w-4 md:w-6 absolute top-0 left-0 duration-500 opacity-0" src="./assets/icons/pin.svg" alt="save" />
                                </button>
                                <button data-delete data-id="${i}">
                                    <img class="w-4 md:w-6" src="./assets/icons/trash.svg" alt="trash" />
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.querySelector("body").innerHTML += `
                <a href="./edit.html" class="absolute bottom-4 left-2/4 -translate-x-2/4 block h-16 md:h-24 w-16 md:w-24 rounded-full bg-[#9990A1] flex
                    items-center justify-center">
                    <img src="./assets/icons/plus.svg" alt="plus">
                </a>
            `;
            
            this.menu = document.querySelectorAll("[data-menu");
            this.button = document.querySelectorAll("[data-button]");
            this.edit = document.querySelectorAll("[data-edit]");
            this.pin = document.querySelectorAll("[data-pin]");
            this.delete = document.querySelectorAll("[data-delete]");
        }
    }

    addEventes() {
        document.addEventListener("click", (e) => {
            if (!e.target.closest("[data-menu]") && !e.target.closest("[data-button]")) {
                this.menu.forEach((menu, k) => {
                    menu.classList.add("opacity-0", "pointer-events-none");
                });
            }
        })

        this.button.forEach((button, i) => {
            button.addEventListener("click", (e) => {
                this.menu.forEach((menu, k) => {
                    if (i !== k) {
                        menu.classList.add("opacity-0", "pointer-events-none")
                    }
                });

                this.menu[i].classList.toggle("opacity-0");
                this.menu[i].classList.toggle("pointer-events-none");
            });
        })

        this.delete.forEach(deleteBtn => {
            deleteBtn.addEventListener("click", (e) => {
                const newList = JSON.parse(localStorage.getItem("notes")).filter((item, i) => i !== +deleteBtn.dataset.id);

                localStorage.setItem("notes", JSON.stringify(newList));
                location.reload();
            })
        });

        this.edit.forEach((edit, i) => {
            edit.addEventListener("click", (e) => {
                localStorage.setItem("editKey", i);
                window.location.href = 'edit.html';
            })
        });

        this.pin.forEach(pin => {
            pin.addEventListener("click", (e) => {
                const password = localStorage.getItem("password");
                const newList = this.notes.map((item, i) => {
                    if(+pin.dataset.key === i){
                        const data = {
                            ...item,
                            isPin: !item.isPin
                        };
                        
                        return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString() 
                    }

                    return CryptoJS.AES.encrypt(JSON.stringify(item), password).toString()
                });

                localStorage.setItem("notes", JSON.stringify(newList));
                location.reload();
            })
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});