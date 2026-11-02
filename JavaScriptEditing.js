
const FORM_ENDPOINT = "https://jsonplaceholder.typicode.com/posts";

const OFFICE = {
    name: "Hashtag SA Unite",
    address: "13 Parow St, Parow, Cape Town, 7500",
    lat: -33.909727,
    lng: 18.575480
};

const FALLBACK_PROGRAMS = [
    {
        id: "youth",
        category: "youth",
        title: "Youth Empowerment Initiative",
        summary: "Provides skills development, mentorship, and leadership workshops to equip young people for the future.",
        target: "Youth aged 15 to 25",
        location: "Community centers across Gauteng and Western Cape"
    },
    {
        id: "community",
        category: "community",
        title: "Community Support & Outreach",
        summary: "Offers food security assistance, wellness checks, and companionship programs to support vulnerable residents.",
        target: "The elderly and low-income families",
        location: "Local township centers and mobile outreach units"
    },
    {
        id: "family",
        category: "family",
        title: "Family Unity Workshops",
        summary: "Hosts interactive counseling and activity sessions designed to strengthen family bonds and resolve community challenges.",
        target: "Families and caregivers",
        location: ""
    }
];

const CATEGORY_LABELS = {
    youth: "Youth",
    community: "Elderly and low-income",
    family: "Families"
};

/* ---------- Small helpers ---------- */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;


function el(tag, props = {}, ...children) {

    const node = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {

        if (value === null || value === undefined || value === false) return;

        if (key === "class") node.className = value;
        else if (key === "dataset") Object.assign(node.dataset, value);
        else if (key === "text") node.textContent = value;
        else if (key in node && key !== "list") node[key] = value;
        else node.setAttribute(key, value);

    });

    children.flat().forEach((child) => {
        if (child === null || child === undefined || child === false) return;
        node.append(child instanceof Node ? child : document.createTextNode(child));
    });

    return node;

}

let uniqueCounter = 0;
const uniqueId = (prefix) => `${prefix}-${++uniqueCounter}`;

/* ==========================================================================
   1. Footer year
   ========================================================================== */

function initYear() {

    const year = $("#year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

}

let revealObserver = null;

function reveal(elements) {

    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    if (!revealObserver) {

        revealObserver = new IntersectionObserver((entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }

            });

        }, { threshold: 0.12 });

    }

    elements.forEach((node, index) => {

        node.classList.add("reveal");
        node.style.transitionDelay = `${Math.min(index, 5) * 80}ms`;
        revealObserver.observe(node);

    });

}

function initScrollReveal() {

    reveal($$(".hero, .home aside, .cards > section, .toolbar, .gallery a, .accordion-item, .map, main > h2, .row img"));

}

/* ==========================================================================
   2. Tabs (About page)
   ========================================================================== */

function initTabs() {

    $$("[data-tabs]").forEach((group) => {

        const panels = Array.from(group.children).filter((child) => child.dataset.tabTitle);

        if (panels.length < 2) return;

        const tabList = el("div", {
            class: "tab-list",
            role: "tablist",
            "aria-label": group.dataset.tabs || "Sections"
        });

        const tabs = panels.map((panel) => {

            const tabId = uniqueId("tab");
            const panelId = panel.id || uniqueId("tabpanel");

            panel.id = panelId;
            panel.classList.add("tab-panel");
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", tabId);
            panel.tabIndex = 0;

            const tab = el("button", {
                type: "button",
                id: tabId,
                role: "tab",
                "aria-controls": panelId,
                text: panel.dataset.tabTitle
            });

            tabList.append(tab);

            return tab;

        });

        group.prepend(tabList);

        function select(index, moveFocus) {

            tabs.forEach((tab, i) => {

                const active = i === index;

                tab.setAttribute("aria-selected", String(active));
                tab.tabIndex = active ? 0 : -1;
                panels[i].hidden = !active;

            });

            if (moveFocus) tabs[index].focus();

        }

        tabList.addEventListener("click", (event) => {

            const tab = event.target.closest("[role=tab]");

            if (tab) select(tabs.indexOf(tab), false);

        });

        // Arrow keys, Home and End move between tabs
        tabList.addEventListener("keydown", (event) => {

            const current = tabs.indexOf(document.activeElement);

            if (current === -1) return;

            let next = null;

            if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
            if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = tabs.length - 1;

            if (next !== null) {
                event.preventDefault();
                select(next, true);
            }

        });

        select(0, false);

    });

}

/* ==========================================================================
   3. Accordion (Contact page FAQ)
   ========================================================================== */

function initAccordions() {

    $$(".accordion").forEach((accordion) => {

        $$(".accordion-item", accordion).forEach((item) => {

            const heading = $(".accordion-title", item);
            const body = $(".accordion-body", item);

            if (!heading || !body) return;

            const buttonId = uniqueId("acc-btn");
            const panelId = uniqueId("acc-panel");

            const button = el("button", {
                type: "button",
                class: "accordion-trigger",
                id: buttonId,
                "aria-expanded": "false",
                "aria-controls": panelId,
                text: heading.textContent.trim()
            });

            heading.replaceChildren(button);


            const content = el("div", { class: "accordion-content" });
            content.append(...body.childNodes);

            const inner = el("div", { class: "accordion-inner" }, content);

            body.replaceChildren(inner);
            body.id = panelId;
            body.setAttribute("role", "region");
            body.setAttribute("aria-labelledby", buttonId);
            body.classList.add("accordion-panel");
            body.inert = true;

        });

        // One listener for the whole accordion (event delegation)
        accordion.addEventListener("click", (event) => {

            const button = event.target.closest(".accordion-trigger");

            if (!button) return;

            const panel = document.getElementById(button.getAttribute("aria-controls"));
            const opening = button.getAttribute("aria-expanded") !== "true";

            button.setAttribute("aria-expanded", String(opening));
            panel.classList.toggle("open", opening);
            panel.inert = !opening;

        });

    });

}

/* ==========================================================================
   4. Modal dialog (shared)
   ========================================================================== */

let modal = null;

function openModal(title, contentNodes) {

    if (!modal) {

        const closeButton = el("button", {
            type: "button",
            class: "modal-close",
            "aria-label": "Close"
        }, "×");

        modal = el("dialog", { class: "modal", "aria-labelledby": "modal-title" },
            closeButton,
            el("div", { class: "modal-body" })
        );

        closeButton.addEventListener("click", () => modal.close());


        modal.addEventListener("click", (event) => {
            if (event.target === modal) modal.close();
        });

        document.body.append(modal);

    }

    const body = $(".modal-body", modal);

    body.replaceChildren(
        el("h2", { id: "modal-title" }, title),
        ...contentNodes
    );

    modal.showModal();

}

/* ==========================================================================
   5. Services page - dynamic content, search, filter and sort
   ========================================================================== */

async function loadPrograms() {

    try {

        const response = await fetch("data/programs.json");

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return await response.json();

    } catch (error) {

        // Not served over http, or the file is missing: use the built-in list
        return FALLBACK_PROGRAMS;

    }

}

// Returns the text with every match of `term` wrapped in <mark>
function highlight(text, term) {

    const fragment = document.createDocumentFragment();

    if (!term) {
        fragment.append(text);
        return fragment;
    }

    const lower = text.toLowerCase();
    let position = 0;
    let found = lower.indexOf(term, position);

    while (found !== -1) {

        fragment.append(text.slice(position, found));
        fragment.append(el("mark", {}, text.slice(found, found + term.length)));

        position = found + term.length;
        found = lower.indexOf(term, position);

    }

    fragment.append(text.slice(position));

    return fragment;

}

function buildProgramCard(program, term) {

    return el("section", { class: "program-card", dataset: { id: program.id } },
        el("span", { class: "tag" }, CATEGORY_LABELS[program.category] || "Program"),
        el("h3", {}, highlight(program.title, term)),
        el("p", {}, highlight(program.summary, term)),
        el("p", {}, el("strong", {}, "Target group: "), highlight(program.target, term)),
        program.location
            ? el("p", {}, el("strong", {}, "Location: "), highlight(program.location, term))
            : null,
        el("button", {
            type: "button",
            class: "details-btn",
            dataset: { id: program.id }
        }, "More details")
    );

}

function showProgramModal(program) {

    const content = [
        el("p", {}, program.summary),
        el("p", {}, el("strong", {}, "Target group: "), program.target)
    ];

    if (program.location) {
        content.push(el("p", {}, el("strong", {}, "Location: "), program.location));
    }

    content.push(
        el("a", {
            class: "button",
            href: `Enquiry_Page.html?support=${encodeURIComponent(program.title)}`
        }, "Enquire about this program")
    );

    openModal(program.title, content);

}

async function initServices() {

    const list = $("#service-list");

    if (!list) return;

    const search = $("#service-search");
    const category = $("#service-category");
    const sort = $("#service-sort");
    const count = $("#service-count");

    list.setAttribute("aria-busy", "true");
    list.replaceChildren(el("p", { class: "loading" }, "Loading programs…"));

    const programs = await loadPrograms();

    function render() {

        const term = search.value.trim().toLowerCase();

        let results = programs.filter((program) => {

            const matchesCategory = category.value === "all" || program.category === category.value;

            const haystack = [program.title, program.summary, program.target, program.location]
                .join(" ")
                .toLowerCase();

            return matchesCategory && haystack.includes(term);

        });

        results.sort((a, b) => {

            if (sort.value === "za") return b.title.localeCompare(a.title);
            if (sort.value === "target") return a.target.localeCompare(b.target);

            return a.title.localeCompare(b.title);

        });

        const fragment = document.createDocumentFragment();

        results.forEach((program) => fragment.append(buildProgramCard(program, term)));

        if (results.length === 0) {
            fragment.append(el("p", { class: "no-results" },
                "No programs match your search. Try a different word or choose \"All programs\"."));
        }

        list.replaceChildren(fragment);
        list.removeAttribute("aria-busy");

        count.textContent = results.length === 1
            ? "Showing 1 program"
            : `Showing ${results.length} programs`;

        reveal($$(".program-card", list));

    }

    search.addEventListener("input", render);
    category.addEventListener("change", render);
    sort.addEventListener("change", render);


    list.addEventListener("click", (event) => {

        const button = event.target.closest(".details-btn");

        if (!button) return;

        const program = programs.find((item) => item.id === button.dataset.id);

        if (program) showProgramModal(program);

    });

    render();

}

/* ==========================================================================
   6. Photo gallery with lightbox (About page)
   Every link inside [data-gallery] opens its picture in a larger view.
   ========================================================================== */

function initGallery() {

    const gallery = $("[data-gallery]");

    if (!gallery) return;

    const links = $$("a", gallery);

    if (links.length === 0) return;

    const image = el("img", { alt: "" });
    const caption = el("figcaption");
    const counter = el("p", { class: "lightbox-count", "aria-live": "polite" });

    const closeButton = el("button", { type: "button", class: "modal-close", "aria-label": "Close picture" }, "×");
    const prevButton = el("button", { type: "button", class: "lightbox-nav prev", "aria-label": "Previous picture" }, "‹");
    const nextButton = el("button", { type: "button", class: "lightbox-nav next", "aria-label": "Next picture" }, "›");

    const lightbox = el("dialog", { class: "lightbox", "aria-label": "Photo viewer" },
        closeButton,
        prevButton,
        el("figure", {}, image, caption),
        nextButton,
        counter
    );

    document.body.append(lightbox);

    let current = 0;
    let opener = null;

    function show(index) {

        current = (index + links.length) % links.length;

        const link = links[current];
        const thumbnail = $("img", link);

        image.src = link.href;
        image.alt = thumbnail ? thumbnail.alt : "";
        caption.textContent = link.dataset.caption || (thumbnail ? thumbnail.alt : "");
        counter.textContent = `${current + 1} of ${links.length}`;

        image.classList.remove("swap");
        void image.offsetWidth;            // restart the fade animation
        image.classList.add("swap");

    }

    gallery.addEventListener("click", (event) => {

        const link = event.target.closest("a");

        if (!link) return;

        event.preventDefault();

        opener = link;
        show(links.indexOf(link));
        lightbox.showModal();

    });

    prevButton.addEventListener("click", () => show(current - 1));
    nextButton.addEventListener("click", () => show(current + 1));
    closeButton.addEventListener("click", () => lightbox.close());

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) lightbox.close();
    });

    lightbox.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") show(current - 1);
        if (event.key === "ArrowRight") show(current + 1);
    });

    // Give focus back to the picture that was clicked
    lightbox.addEventListener("close", () => {
        if (opener) opener.focus();
    });

}



function distanceKm(lat1, lng1, lat2, lng2) {

    const toRad = (degrees) => degrees * Math.PI / 180;
    const earthRadius = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

}

function initContactMap() {

    const box = $("#office-map");

    if (!box) return;


    if (typeof L === "undefined") {

        box.replaceChildren(el("iframe", {
            src: box.dataset.fallbackSrc,
            title: "Hashtag SA Unite office location on Google Maps",
            loading: "lazy",
            allowFullscreen: true
        }));

        return;

    }

    const map = L.map(box, { scrollWheelZoom: false }).setView([OFFICE.lat, OFFICE.lng], 14);


    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>"
    }).addTo(map);

    L.marker([OFFICE.lat, OFFICE.lng])
        .addTo(map)
        .bindPopup(el("div", {},
            el("strong", {}, OFFICE.name),
            el("br"),
            OFFICE.address
        ))
        .openPopup();


    map.once("click", () => map.scrollWheelZoom.enable());

    // Location-based feature: how far is the visitor from the office?
    const locateButton = $("#locate-btn");
    const result = $("#distance-result");

    if (!locateButton || !result) return;

    let youMarker = null;

    locateButton.addEventListener("click", () => {

        if (!("geolocation" in navigator)) {
            result.textContent = "Your browser cannot share its location.";
            return;
        }

        locateButton.disabled = true;
        result.textContent = "Finding your location…";

        navigator.geolocation.getCurrentPosition(
            (position) => {

                const { latitude, longitude } = position.coords;
                const km = distanceKm(latitude, longitude, OFFICE.lat, OFFICE.lng);

                if (youMarker) youMarker.remove();

                youMarker = L.marker([latitude, longitude]).addTo(map).bindPopup("You are here");

                map.fitBounds([[latitude, longitude], [OFFICE.lat, OFFICE.lng]], { padding: [40, 40] });

                result.textContent = `You are about ${km.toFixed(1)} km from our office.`;
                locateButton.disabled = false;

            },
            () => {

                result.textContent = "We could not get your location. Please allow location access and try again.";
                locateButton.disabled = false;

            },
            { timeout: 10000 }
        );

    });

}


const OFFICE_HOURS = "Monday to Thursday 9:00 to 17:00, Friday 9:00 to 14:30";

const COST_NOTE = "Our team will confirm any costs when they contact you.";

const ENQUIRY_INFO = {

    "Youth Empowerment Initiative": {
        availability: "This program is for young people aged 15 to 25 and runs at community centers across Gauteng and the Western Cape.",
        cost: COST_NOTE
    },

    "Community Support & Outreach": {
        availability: "This program supports the elderly and low-income families through local township centers and mobile outreach units.",
        cost: COST_NOTE
    },

    "Family Unity Workshops": {
        availability: "These workshops are for families and caregivers. Our team will tell you where and when the next session takes place.",
        cost: COST_NOTE
    },

    "Become a volunteer": {
        availability: "Our programs run from community centers across Gauteng and the Western Cape and through mobile outreach units. Our team will discuss where and when you can help.",
        cost: COST_NOTE
    },

    "Become a sponsor or partner": {
        availability: "Individuals, community leaders, organizations and businesses are welcome to partner with us.",
        cost: "Our team will talk through sponsorship and partnership options and amounts with you."
    },

    "Something else": {
        availability: "Tell us more and our team will point you to the right program or person.",
        cost: "Costs depend on what you ask about. Our team will explain when they reply."
    }

};

const rules = {

    minLength: (length, label) => (value) =>
        value.trim().length < length ? `${label} must be at least ${length} characters long.` : "",

    email: (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address.",

    // Phone number is required and must be 10 digits (spaces and dashes are ignored)
    phone: (value) => {

        const digits = value.replace(/[\s-]/g, "");

        if (digits === "") return "Please enter your phone number.";

        return /^[0-9]{10}$/.test(digits) ? "" : "Phone number must contain 10 digits.";

    },

    chosen: (message) => (value) => value === "" ? message : "",

    filled: (message) => (value) => value.trim() === "" ? message : ""

};

function makeReference() {

    const now = new Date();
    const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const random = String(Math.floor(1000 + Math.random() * 9000));

    return `HSU-${day}-${random}`;

}


async function postJson(data) {

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {

        const response = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`The server answered with status ${response.status}.`);
        }

        return await response.json();

    } catch (error) {

        throw new Error(error.name === "AbortError"
            ? "The request took too long. Please try again."
            : "Sorry, your message could not be sent. Please check your connection and try again, or email info@hashtagsaunite.co.za.");

    } finally {

        clearTimeout(timer);

    }

}

function setupForm({ form, fields, status, responseBox, respond }) {

    const submitButton = $("button[type=submit]", form);
    const submitLabel = submitButton.textContent;

    const defs = fields.map((field) => ({
        ...field,
        input: document.getElementById(field.id),
        error: document.getElementById(`${field.id}-error`)
    }));


    let attempted = false;

    function clearErrors() {

        defs.forEach((item) => {

            item.error.textContent = "";
            item.input.removeAttribute("aria-invalid");
            item.input.removeAttribute("aria-describedby");

        });

        status.textContent = "";

    }

    function validate() {

        clearErrors();

        let valid = true;

        defs.forEach((item) => {

            const message = item.check(item.input.value);

            if (message) {

                item.error.textContent = message;
                item.input.setAttribute("aria-invalid", "true");
                item.input.setAttribute("aria-describedby", item.error.id);
                valid = false;

            }

        });

        return valid;

    }

    function showStatus(message, colour) {

        status.textContent = message;
        status.style.color = colour;

    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        attempted = true;
        responseBox.hidden = true;

        if (!validate()) {

            showStatus("Please correct the errors in the form.", "red");


            const firstInvalid = defs.find((item) => item.error.textContent);

            if (firstInvalid) firstInvalid.input.focus();

            return;

        }

        const data = Object.fromEntries(new FormData(form).entries());


        if (data.website) {

            showStatus("Thank you. Your message was sent.", "green");
            form.reset();
            attempted = false;

            return;

        }

        delete data.website;
        data.reference = makeReference();

        submitButton.disabled = true;
        submitButton.textContent = "Sending\u2026";
        form.setAttribute("aria-busy", "true");
        showStatus("Sending\u2026", "inherit");

        try {

            await postJson(data);

            showStatus("Sent successfully.", "green");

            // Process the data and show the visitor a response
            responseBox.replaceChildren(respond(data));
            responseBox.hidden = false;
            responseBox.focus();

            form.reset();
            attempted = false;

        } catch (error) {

            showStatus(error.message, "red");

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = submitLabel;
            form.removeAttribute("aria-busy");

        }

    });

    // Re-check as the user types, but only after the first submit attempt
    defs.forEach((item) => {

        const recheck = () => {
            if (attempted) {
                validate();
            }
        };

        item.input.addEventListener("input", recheck);
        item.input.addEventListener("change", recheck);

    });

}

function initEnquiryForm() {

    const form = $("#enquiry-form");

    if (!form) return;

    const supportSelect = $("#support-type");


    const requested = new URLSearchParams(window.location.search).get("support");

    if (requested) {

        const match = Array.from(supportSelect.options).find((option) => option.value === requested);

        if (match) supportSelect.value = match.value;

    }

    setupForm({

        form,
        status: $("#form-status"),
        responseBox: $("#enquiry-response"),

        fields: [
            { id: "name", check: rules.minLength(2, "First name") },
            { id: "surname", check: rules.minLength(2, "Last name") },
            { id: "email", check: rules.email },
            { id: "phone", check: rules.phone },
            { id: "support-type", check: rules.chosen("Please select what you would like to do.") },
            { id: "message", check: rules.filled("Please enter a message.") }
        ],


        respond: (data) => {

            const topic = data["support-type"];
            const info = ENQUIRY_INFO[topic] || ENQUIRY_INFO["Something else"];

            return el("div", {},
                el("h3", {}, `Thank you, ${data["first-name"].trim()}. We have received your enquiry.`),
                el("p", {}, el("strong", {}, "Reference number: "), data.reference),
                el("p", {}, el("strong", {}, "Your enquiry: "), topic),
                el("p", {}, el("strong", {}, "Availability: "), info.availability),
                el("p", {}, el("strong", {}, "Cost: "), info.cost),
                el("p", {}, el("strong", {}, "What happens next: "),
                    `We will reply to ${data.email.trim()} or call you on ${data.phone.trim()} during our office hours (${OFFICE_HOURS}). `,
                    "Please quote your reference number if you contact us in the meantime.")
            );

        }

    });

}

function initContactForm() {

    const form = $("#contact-form");

    if (!form) return;

    setupForm({

        form,
        status: $("#contact-status"),
        responseBox: $("#contact-response"),

        fields: [
            { id: "contact-name", check: rules.minLength(2, "Your name") },
            { id: "contact-email", check: rules.email },
            { id: "contact-subject", check: rules.minLength(3, "Subject") },
            { id: "contact-message", check: rules.minLength(10, "Message") }
        ],

        respond: (data) => el("div", {},
            el("h3", {}, `Thank you, ${data.name.trim()}. Your message has been sent.`),
            el("p", {}, el("strong", {}, "Reference number: "), data.reference),
            el("p", {}, el("strong", {}, "Subject: "), data.subject.trim()),
            el("p", {}, `We will reply to ${data.email.trim()} during our office hours (${OFFICE_HOURS}).`),
            el("p", {}, "For urgent matters, please call ",
                el("a", { href: "tel:+27768777888" }, "+27 (0)76 877 7888"), ".")
        )

    });

}

document.addEventListener("DOMContentLoaded", () => {

    initYear();
    initTabs();
    initAccordions();
    initGallery();
    initContactMap();
    initEnquiryForm();
    initContactForm();
    initServices();
    initScrollReveal();

});
