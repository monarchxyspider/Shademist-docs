/* =========================================================
   SHADEMIST WEBSITE SCRIPT
   Config driven
   ========================================================= */


/* =========================================================
   WAIT FOR PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       CHECK CONFIG
       ===================================================== */

    if (typeof ShadeMistConfig === "undefined") {

        console.error(
            "ShadeMistConfig was not found. Make sure config.js is loaded."
        );

        return;

    }


    const config = ShadeMistConfig;



    /* =====================================================
       BASIC SITE DATA
       ===================================================== */

    setText(
        "siteLogo",
        config.botName
    );


    setText(
        "footerLogo",
        config.botName
    );


    setText(
        "copyright",
        `© ${new Date().getFullYear()} ${config.botName}. All Rights Reserved.`
    );



    /* =====================================================
       IMAGE FROM CONFIG
       ===================================================== */

    const heroImage =
        document.getElementById("docsHeroImage");


    if (
        heroImage &&
        config.images &&
        config.images.docsHero
    ) {

        heroImage.src =
            config.images.docsHero;

    }



    /* =====================================================
       LINKS FROM CONFIG
       ===================================================== */

    setLink(
        "navInvite",
        config.links.invite
    );


    setLink(
        "mobileInvite",
        config.links.invite
    );


    setLink(
        "stepInvite",
        config.links.invite
    );


    setLink(
        "heroSupport",
        config.links.support
    );


    setLink(
        "mobileSupport",
        config.links.support
    );



    /* =====================================================
       CUSTOM EMOJIS
       ===================================================== */

    loadCustomEmojis(
        config.emojis
    );



    /* =====================================================
       MOBILE MENU
       ===================================================== */

    setupMobileMenu();



    /* =====================================================
       COMMAND CATEGORIES
       ===================================================== */

    renderCategories(
        config.categories
    );



    /* =====================================================
       COMMANDS
       ===================================================== */

    renderCommands();



    /* =====================================================
       UPDATES
       ===================================================== */

    renderUpdates();



    /* =====================================================
       ADMIN LOGIN
       ===================================================== */

    setupAdmin();



    /* =====================================================
       NAVBAR SCROLL
       ===================================================== */

    setupNavbarScroll();

});



/* =========================================================
   TEXT HELPER
   ========================================================= */

function setText(id, text) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent = text;
    }

}



/* =========================================================
   LINK HELPER
   ========================================================= */

function setLink(id, url) {

    const element =
        document.getElementById(id);


    if (!element || !url) return;


    element.href = url;


    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {

        element.target = "_blank";

        element.rel =
            "noopener noreferrer";

    }

}



/* =========================================================
   CUSTOM EMOJI LOADER
   ========================================================= */

function loadCustomEmojis(emojis) {

    if (!emojis) return;


    document
        .querySelectorAll("[data-emoji]")
        .forEach(element => {

            const emojiName =
                element.dataset.emoji;


            const emoji =
                emojis[emojiName];


            if (!emoji) return;


            /*
                You can use:

                1. Discord custom emoji URL

                2. Normal image URL

                3. Discord emoji markup

                Config decides what gets inserted.
            */


            if (
                emoji.startsWith("http://") ||
                emoji.startsWith("https://")
            ) {

                const img =
                    document.createElement("img");


                img.src = emoji;

                img.alt =
                    emojiName;

                img.className =
                    "config-emoji";


                element.appendChild(img);

            } else {

                element.textContent =
                    emoji;

            }

        });

}



/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const button =
        document.getElementById(
            "menuButton"
        );


    const menu =
        document.getElementById(
            "mobileMenu"
        );


    if (!button || !menu) return;


    button.addEventListener(
        "click",
        () => {

            button.classList.toggle(
                "active"
            );


            menu.classList.toggle(
                "active"
            );

        }
    );


    menu.querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    button.classList.remove(
                        "active"
                    );

                    menu.classList.remove(
                        "active"
                    );

                }
            );

        });

}



/* =========================================================
   COMMAND CATEGORIES
   ========================================================= */

function renderCategories(categories) {

    const container =
        document.getElementById(
            "commandCategories"
        );


    if (!container || !categories) return;


    container.innerHTML = "";


    categories.forEach(
        (category, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "command-category";


            if (index === 0) {
                button.classList.add(
                    "active"
                );
            }


            button.dataset.category =
                category.id;


            button.innerHTML = `

                <span class="category-emoji">
                    ${getEmojiHTML(category.emoji)}
                </span>

                <span>
                    ${escapeHTML(category.name)}
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    selectCategory(
                        category.id
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );

}



/* =========================================================
   CATEGORY SELECTION
   ========================================================= */

function selectCategory(categoryId) {

    document
        .querySelectorAll(
            ".command-category"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                categoryId
            );

        });


    document
        .querySelectorAll(
            ".command-category-content"
        )
        .forEach(section => {

            section.classList.toggle(
                "active",
                section.dataset.category ===
                categoryId
            );

        });


    const selected =
        document.querySelector(
            `.command-category-content[data-category="${categoryId}"]`
        );


    if (selected) {

        selected.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }

}



/* =========================================================
   RENDER COMMANDS
   ========================================================= */

function renderCommands() {

    const container =
        document.getElementById(
            "commandsContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    const commands =
        getStoredCommands();


    const categories =
        ShadeMistConfig.categories;


    categories.forEach(
        (category, index) => {

            const section =
                document.createElement(
                    "div"
                );


            section.className =
                "command-category-content";


            if (index === 0) {

                section.classList.add(
                    "active"
                );

            }


            section.dataset.category =
                category.id;


            const list =
                document.createElement(
                    "div"
                );


            list.className =
                "command-list";


            list.dataset.category =
                category.id;


            const categoryCommands =
                commands.filter(
                    command =>
                        command.category ===
                        category.id
                );


            if (
                categoryCommands.length ===
                0
            ) {

                list.innerHTML = `

                    <div class="command-item">

                        <div>

                            <code>
                                No commands yet
                            </code>

                            <p>
                                Commands for this category
                                will appear here.
                            </p>

                        </div>

                    </div>

                `;

            }


            categoryCommands.forEach(
                command => {

                    list.appendChild(
                        createCommandElement(
                            command
                        )
                    );

                }
            );


            section.appendChild(
                list
            );


            container.appendChild(
                section
            );

        }
    );

}



/* =========================================================
   CREATE COMMAND
   ========================================================= */

function createCommandElement(command) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "command-item";


    item.innerHTML = `

        <div>

            <code>
                ${escapeHTML(command.name)}
            </code>

            <p>
                ${escapeHTML(command.description)}
            </p>

        </div>

    `;


    return item;

}



/* =========================================================
   LOCAL COMMAND STORAGE
   ========================================================= */

function getStoredCommands() {

    const defaultCommands = [

        {
            name: "s!ban",
            description: "Ban a member from the server.",
            category: "moderation"
        },

        {
            name: "s!kick",
            description: "Kick a member from the server.",
            category: "moderation"
        },

        {
            name: "s!purge",
            description: "Delete multiple messages.",
            category: "moderation"
        },

        {
            name: "s!warn",
            description: "Warn a member.",
            category: "moderation"
        },

        {
            name: "s!mute",
            description: "Temporarily restrict a member.",
            category: "moderation"
        },

        {
            name: "s!8ball",
            description: "Ask the magic 8-ball a question.",
            category: "fun"
        },

        {
            name: "s!coinflip",
            description: "Flip a virtual coin.",
            category: "fun"
        },

        {
            name: "s!help",
            description: "View ShadeMist help.",
            category: "general"
        },

        {
            name: "s!ping",
            description: "Check bot latency.",
            category: "general"
        },

        {
            name: "s!botinfo",
            description: "View ShadeMist information.",
            category: "general"
        },

        {
            name: "s!serverinfo",
            description: "View server information.",
            category: "utility"
        },

        {
            name: "s!userinfo",
            description: "View member information.",
            category: "utility"
        },

        {
            name: "s!welcome config",
            description: "Open the welcome configuration.",
            category: "welcome"
        },

        {
            name: "s!welcome enable",
            description: "Enable the welcome system.",
            category: "welcome"
        },

        {
            name: "s!welcome disable",
            description: "Disable the welcome system.",
            category: "welcome"
        },

        {
            name: "s!welcome test",
            description: "Test the welcome system.",
            category: "welcome"
        },

        {
            name: "s!role add",
            description: "Add a role to a member.",
            category: "role"
        },

        {
            name: "s!role remove",
            description: "Remove a role from a member.",
            category: "role"
        }

    ];


    let stored;


    try {

        stored =
            JSON.parse(
                localStorage.getItem(
                    "shademist_commands"
                )
            );

    } catch {

        stored = null;

    }


    if (!Array.isArray(stored)) {

        return defaultCommands;

    }


    return [
        ...defaultCommands,
        ...stored
    ];

}



/* =========================================================
   UPDATES
   ========================================================= */

function renderUpdates() {

    const container =
        document.getElementById(
            "updatesContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    const defaultUpdates = [

        {
            title: "ShadeMist Documentation",
            description:
                "The ShadeMist documentation system is now available.",
            date: "August 29, 2026"
        }

    ];


    let updates;


    try {

        updates =
            JSON.parse(
                localStorage.getItem(
                    "shademist_updates"
                )
            );

    } catch {

        updates = null;

    }


    if (!Array.isArray(updates)) {
        updates = [];
    }


    updates =
        [
            ...updates,
            ...defaultUpdates
        ];


    updates.forEach(
        update => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "update-card";


            card.innerHTML = `

                <div class="update-badge">
                    ${getEmojiHTML("updates")}
                </div>

                <div class="update-content">

                    <span class="update-date">
                        ${escapeHTML(update.date)}
                    </span>

                    <h3>
                        ${escapeHTML(update.title)}
                    </h3>

                    <p>
                        ${escapeHTML(update.description)}
                    </p>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   ADMIN SYSTEM
   ========================================================= */

function setupAdmin() {

    const loginButton =
        document.getElementById(
            "adminLoginButton"
        );


    const password =
        document.getElementById(
            "adminPassword"
        );


    const loginBox =
        document.getElementById(
            "adminLoginBox"
        );


    const panel =
        document.getElementById(
            "adminPanel"
        );


    const error =
        document.getElementById(
            "adminError"
        );


    if (!loginButton) return;


    /*
       IMPORTANT:

       This is NOT secure authentication.

       A password stored in frontend JavaScript
       can be discovered by inspecting the website.

       Real owner authentication should use a backend
       + Discord OAuth2.
    */


    const ownerPassword =
        ShadeMistConfig.ownerPassword;


    loginButton.addEventListener(
        "click",
        () => {

            const entered =
                password.value.trim();


            if (
                entered &&
                entered === ownerPassword
            ) {

                sessionStorage.setItem(
                    "shademist_admin",
                    "true"
                );


                loginBox.style.display =
                    "none";


                panel.style.display =
                    "block";


                if (error) {
                    error.textContent = "";
                }

            } else {

                error.textContent =
                    "Incorrect owner password.";

                password.value = "";

            }

        }
    );


    if (
        sessionStorage.getItem(
            "shademist_admin"
        ) === "true"
    ) {

        loginBox.style.display =
            "none";

        panel.style.display =
            "block";

    }


    setupAdminButtons();

}



/* =========================================================
   ADMIN BUTTONS
   ========================================================= */

function setupAdminButtons() {

    const logout =
        document.getElementById(
            "adminLogout"
        );


    if (logout) {

        logout.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "shademist_admin"
                );

                location.reload();

            }
        );

    }



    const addCommand =
        document.getElementById(
            "addCommandButton"
        );


    if (addCommand) {

        addCommand.addEventListener(
            "click",
            () => {

                const name =
                    document
                        .getElementById(
                            "commandName"
                        )
                        .value
                        .trim();


                const description =
                    document
                        .getElementById(
                            "commandDescription"
                        )
                        .value
                        .trim();


                const category =
                    document
                        .getElementById(
                            "commandCategory"
                        )
                        .value;


                if (
                    !name ||
                    !description
                ) {

                    alert(
                        "Please fill in all command fields."
                    );

                    return;

                }


                const commands =
                    JSON.parse(
                        localStorage.getItem(
                            "shademist_commands"
                        ) || "[]"
                    );


                commands.push({

                    name,
                    description,
                    category

                });


                localStorage.setItem(
                    "shademist_commands",
                    JSON.stringify(
                        commands
                    )
                );


                alert(
                    "Command added successfully."
                );


                renderCommands();


                document
                    .getElementById(
                        "commandName"
                    )
                    .value = "";


                document
                    .getElementById(
                        "commandDescription"
                    )
                    .value = "";

            }
        );

    }



    const addUpdate =
        document.getElementById(
            "addUpdateButton"
        );


    if (addUpdate) {

        addUpdate.addEventListener(
            "click",
            () => {

                const title =
                    document
                        .getElementById(
                            "updateTitle"
                        )
                        .value
                        .trim();


                const description =
                    document
                        .getElementById(
                            "updateDescription"
                        )
                        .value
                        .trim();


                if (
                    !title ||
                    !description
                ) {

                    alert(
                        "Please fill in the update fields."
                    );

                    return;

                }


                const updates =
                    JSON.parse(
                        localStorage.getItem(
                            "shademist_updates"
                        ) || "[]"
                    );


                updates.unshift({

                    title,

                    description,

                    date:
                        new Date()
                            .toLocaleDateString(
                                "en-US",
                                {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                }
                            )

                });


                localStorage.setItem(
                    "shademist_updates",
                    JSON.stringify(
                        updates
                    )
                );


                alert(
                    "Update published successfully."
                );


                renderUpdates();


                document
                    .getElementById(
                        "updateTitle"
                    )
                    .value = "";


                document
                    .getElementById(
                        "updateDescription"
                    )
                    .value = "";

            }
        );

    }

}



/* =========================================================
   EMOJI HTML
   ========================================================= */

function getEmojiHTML(name) {

    const emojis =
        ShadeMistConfig.emojis || {};


    const emoji =
        emojis[name];


    if (!emoji) {
        return "";
    }


    if (
        emoji.startsWith("http://") ||
        emoji.startsWith("https://")
    ) {

        return `
            <img
                src="${escapeAttribute(emoji)}"
                alt="${escapeAttribute(name)}"
                class="config-emoji"
            >
        `;

    }


    return escapeHTML(emoji);

}



/* =========================================================
   NAVBAR SCROLL
   ========================================================= */

function setupNavbarScroll() {

    const header =
        document.querySelector(
            "header"
        );


    if (!header) return;


    window.addEventListener(
        "scroll",
        () => {

            header.classList.toggle(
                "scrolled",
                window.scrollY > 30
            );

        }
    );

}



/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}



/* =========================================================
   ATTRIBUTE ESCAPE
   ========================================================= */

function escapeAttribute(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}