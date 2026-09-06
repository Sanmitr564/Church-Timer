"use strict";

/*
 * Timer Manager
 *
 * Implemented:
 *   - API host/port configuration
 *   - Connect button
 *   - Item selection UI
 *   - Adding timers
 *   - Removing timers
 *   - Editing timer fields
 *   - Moving timers up/down
 *   - Merging adjacent timers
 *   - Timer ordering / numbering
 *
 * API-specific behavior is intentionally left as empty handlers below.
 */

const state = {
    connected: false,
    items: [],
    selectedItem: null,
    timers: []
};

const elements = {
    apiHost: document.getElementById("api-host"),
    apiPort: document.getElementById("api-port"),
    connectButton: document.getElementById("connect-button"),
    connectionStatus: document.getElementById("connection-status"),

    refreshItemsButton: document.getElementById("refresh-items-button"),
    itemSelect: document.getElementById("item-select"),

    addTimerButton: document.getElementById("add-timer-button"),
    timerList: document.getElementById("timer-list"),
    emptyTimers: document.getElementById("empty-timers"),

    timerTemplate: document.getElementById("timer-template")
};


/* -------------------------------------------------------------------------
   Initialization
   ---------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
    elements.connectButton.addEventListener(
        "click",
        handleConnect
    );

    elements.refreshItemsButton.addEventListener(
        "click",
        handleRefreshItems
    );

    elements.itemSelect.addEventListener(
        "change",
        handleItemSelection
    );

    elements.addTimerButton.addEventListener(
        "click",
        handleAddTimer
    );

    renderTimers();
}


/* -------------------------------------------------------------------------
   API connection
   ---------------------------------------------------------------------- */

async function handleConnect() {
    const port = elements.apiPort.value.trim();

    if (!port) {
        setConnectionStatus(
            "Enter a port.",
            "error"
        );

        return;
    }

    const numericPort = Number(port);

    if (
        !Number.isInteger(numericPort) ||
        numericPort < 1 ||
        numericPort > 65535
    ) {
        setConnectionStatus(
            "Port must be between 1 and 65535.",
            "error"
        );

        return;
    }

    setConnectionStatus(
        "Connecting...",
        "pending"
    );

    try {
        await onApiConnect(
            numericPort
        );

        state.connected = true;

        elements.itemSelect.disabled = false;
        elements.refreshItemsButton.disabled = false;

        setConnectionStatus(
            `Connected to Propresenter on port ${numericPort}`,
            "connected"
        );

        await loadItems();
    } catch (error) {
        state.connected = false;

        elements.itemSelect.disabled = true;
        elements.refreshItemsButton.disabled = true;

        setConnectionStatus(
            `Connection failed: ${error.message}`,
            "error"
        );
    }
}


/* -------------------------------------------------------------------------
   Item handling
   ---------------------------------------------------------------------- */

async function handleRefreshItems() {
    if (!state.connected) {
        return;
    }

    await loadItems();
}

async function loadItems() {
    try {
        const items = await onFetchItems();

        state.items = Array.isArray(items)
            ? items
            : [];

        renderItems();
    } catch (error) {
        setConnectionStatus(
            `Unable to load items: ${error.message}`,
            "error"
        );
    }
}

function renderItems() {
    elements.itemSelect.innerHTML = "";

    if (state.items.length === 0) {
        const option = document.createElement("option");

        option.value = "";
        option.textContent = "No items available";

        elements.itemSelect.appendChild(option);

        return;
    }

    const placeholder = document.createElement("option");

    placeholder.value = "";
    placeholder.textContent = "Select an item...";

    elements.itemSelect.appendChild(placeholder);

    for (const item of state.items) {
        const option = document.createElement("option");

        const value =
            item.id ??
            item.value ??
            "";

        const label =
            item.name ??
            item.label ??
            String(value);

        option.value = String(value);
        option.textContent = label;

        elements.itemSelect.appendChild(option);
    }
}

function handleItemSelection(event) {
    const selectedValue = event.target.value;

    state.selectedItem =
        state.items.find(item => {
            const value =
                item.id ??
                item.value;

            return String(value) === selectedValue;
        }) ?? null;

    onItemSelected(state.selectedItem);
}


/* -------------------------------------------------------------------------
   Timer management
   ---------------------------------------------------------------------- */

function handleAddTimer() {
    const timer = {
        id: createId(),
        section: "",
        person: "",
        minutes: 0,
        seconds: 0,
        status: "pending"
    };

    state.timers.push(timer);

    renderTimers();
}

function removeTimer(timerId) {
    state.timers = state.timers.filter(
        timer => timer.id !== timerId
    );

    renderTimers();
}


/*
 * Move a timer one position toward the beginning of the list.
 */
function moveTimerUp(timerId) {
    const index = state.timers.findIndex(
        timer => timer.id === timerId
    );

    if (index <= 0) {
        return;
    }

    [
        state.timers[index - 1],
        state.timers[index]
    ] = [
        state.timers[index],
        state.timers[index - 1]
    ];

    renderTimers();
}


/*
 * Move a timer one position toward the end of the list.
 */
function moveTimerDown(timerId) {
    const index = state.timers.findIndex(
        timer => timer.id === timerId
    );

    if (
        index === -1 ||
        index >= state.timers.length - 1
    ) {
        return;
    }

    [
        state.timers[index],
        state.timers[index + 1]
    ] = [
        state.timers[index + 1],
        state.timers[index]
    ];

    renderTimers();
}


/*
 * Merge this timer with the timer immediately after it.
 */
function mergeTimerWithNext(timerId) {
    const index = state.timers.findIndex(
        timer => timer.id === timerId
    );

    if (
        index === -1 ||
        index >= state.timers.length - 1
    ) {
        return;
    }

    const current = state.timers[index];
    const next = state.timers[index + 1];

    const currentSeconds =
        Number(current.minutes) * 60 +
        Number(current.seconds);

    const nextSeconds =
        Number(next.minutes) * 60 +
        Number(next.seconds);

    const totalSeconds =
        currentSeconds + nextSeconds;

    current.minutes =
        Math.floor(totalSeconds / 60);

    current.seconds =
        totalSeconds % 60;

    /*
     * Section and person do not need to be preserved when merging.
     */
    current.section = "";
    current.person = "";

    state.timers.splice(index + 1, 1);

    renderTimers();
}

function updateTimer(timerId, property, value) {
    const timer = state.timers.find(
        item => item.id === timerId
    );

    if (!timer) {
        return;
    }

    if (
        property === "minutes" ||
        property === "seconds"
    ) {
        value = Number(value);

        if (!Number.isFinite(value)) {
            value = 0;
        }

        value = Math.max(
            0,
            Math.floor(value)
        );

        if (property === "seconds") {
            value = Math.min(
                value,
                59
            );
        }
    }

    timer[property] = value;
}


/* -------------------------------------------------------------------------
   Timer rendering
   ---------------------------------------------------------------------- */

function renderTimers() {
    elements.timerList.innerHTML = "";

    if (state.timers.length === 0) {
        elements.timerList.appendChild(
            elements.emptyTimers
        );

        return;
    }

    state.timers.forEach((timer, index) => {
        const fragment =
            elements.timerTemplate.content.cloneNode(true);

        const number =
            fragment.querySelector(
                ".timer-number"
            );

        const statusContainer =
            fragment.querySelector(
                ".timer-status"
            );

        const statusDot =
            fragment.querySelector(
                ".status-dot"
            );

        const statusText =
            fragment.querySelector(
                ".status-text"
            );


        const sectionInput =
            fragment.querySelector(
                ".section-name"
            );

        const personInput =
            fragment.querySelector(
                ".person-name"
            );

        const minutesInput =
            fragment.querySelector(
                ".minutes"
            );

        const secondsInput =
            fragment.querySelector(
                ".seconds"
            );

        const moveUpButton =
            fragment.querySelector(
                ".move-up-button"
            );

        const moveDownButton =
            fragment.querySelector(
                ".move-down-button"
            );

        const activateButton =
            fragment.querySelector(
                ".activate-button"
            );

        const stopButton =
            fragment.querySelector(
                ".stop-button"
            );

        const mergeButton =
            fragment.querySelector(
                ".merge-button"
            );

        const removeButton =
            fragment.querySelector(
                ".remove-button"
            );

        number.textContent = index + 1;

        const statusInfo = {
            pending: {
                text: "Not activated",
                className: "pending"
            },

            active: {
                text: "Active",
                className: "active"
            },

            completed: {
                text: "Activated",
                className: "completed"
            },

            error: {
                text: "Failed to start",
                className: "error"
            }
        };

        const currentStatus =
            statusInfo[timer.status] ??
            statusInfo.pending;

        statusContainer.classList.add(
            currentStatus.className
        );

        statusDot.classList.add(
            currentStatus.className
        );

        statusText.textContent =
            currentStatus.text;


        sectionInput.value = timer.section;
        personInput.value = timer.person;
        minutesInput.value = timer.minutes;
        secondsInput.value = timer.seconds;


        /* Editing */

        sectionInput.addEventListener(
            "input",
            event => {
                updateTimer(
                    timer.id,
                    "section",
                    event.target.value
                );
            }
        );

        personInput.addEventListener(
            "input",
            event => {
                updateTimer(
                    timer.id,
                    "person",
                    event.target.value
                );
            }
        );

        minutesInput.addEventListener(
            "input",
            event => {
                updateTimer(
                    timer.id,
                    "minutes",
                    event.target.value
                );
            }
        );

        secondsInput.addEventListener(
            "input",
            event => {
                updateTimer(
                    timer.id,
                    "seconds",
                    event.target.value
                );
            }
        );


        /* Moving */

        moveUpButton.addEventListener(
            "click",
            () => {
                moveTimerUp(timer.id);
            }
        );

        moveDownButton.addEventListener(
            "click",
            () => {
                moveTimerDown(timer.id);
            }
        );


        /* Other actions */

        activateButton.addEventListener(
            "click",
            () => {
                handleActivateTimer(timer.id);
            }
        );

        stopButton.addEventListener(
            "click",
            () => {
                handleStopTimer();
            }
        );


        removeButton.addEventListener(
            "click",
            () => {
                removeTimer(timer.id);
            }
        );

        mergeButton.addEventListener(
            "click",
            () => {
                mergeTimerWithNext(timer.id);
            }
        );


        /*
         * Disable the appropriate movement buttons.
         */

        if (index === 0) {
            moveUpButton.disabled = true;
            moveUpButton.title =
                "Timer is already first";
        }

        if (index === state.timers.length - 1) {
            moveDownButton.disabled = true;
            moveDownButton.title =
                "Timer is already last";

            /*
             * There is no timer after the final timer,
             * so there is nothing to merge with.
             */
            mergeButton.remove();
        }


        elements.timerList.appendChild(fragment);
    });
}


/* -------------------------------------------------------------------------
   Timer activation
   ---------------------------------------------------------------------- */

async function handleActivateTimer(timerId) {
    const timer = state.timers.find(
        timer => timer.id === timerId
    );

    if (!timer) {
        return;
    }

    try {
        await onActivateTimer(
            timer,
            state.selectedItem
        );

        for (const otherTimer of state.timers) {
            if (otherTimer.status === "active") {
                otherTimer.status = "completed";
            }
        }

        timer.status = "active";

        renderTimers();
    } catch (error) {
        // Timer was not activated.
        timer.status = "error";
        renderTimers();
        console.error(
            "Failed to activate timer:",
            error
        );
    }
}


async function handleStopTimer() {
    const activeTimer = state.timers.find(
        timer => timer.status === "active"
    );

    if (!activeTimer) {
        return;
    }

    try {
        await onStopTimer();

        activeTimer.status = "completed";

        renderTimers();
    } catch (error) {
        console.error(
            "Failed to stop timer:",
            error
        );
    }
}




/* -------------------------------------------------------------------------
   UNKNOWN API HANDLERS
   ---------------------------------------------------------------------- */

/**
 * Called when the user attempts to connect to the local API.
 *
 * Implement the actual API connection/test request here.
 */
async function onApiConnect(port) {
    const response = await fetch(`/api/port/set/${port}`, {
        method: "Put"
    })

    if (!response.ok) {
        throw new Error(`Could not find propresenter at port ${port}`)
    }
}


/**
 * Fetch the list of selectable items from the API.
 *
 * Expected eventual return format could be:
 *
 * [
 *     { id: "item-1", name: "Item One" },
 *     { id: "item-2", name: "Item Two" }
 * ]
 */
async function onFetchItems() {
    // TODO: Implement API request to retrieve items.

    const response = await fetch("/api/timers")

    if (!response.ok) {
        throw new Error();
    }

    return await response.json();
}


/**
 * Called when the user selects an item.
 */
function onItemSelected(item) {
    // TODO: Implement optional API behavior for item selection.
    const uuid = item.id

    const response = fetch(`/api/timers/select/${uuid}`, {
        method: "Put"
    })
}


/**
 * Called when the user activates a timer.
 */
async function onActivateTimer(timer, selectedItem) {
    // TODO: Implement API request to activate the timer.

    await fetch("/api/timers/stop", {
        method: "Put"
    })

    const payload = {
        section: timer.section,
        person: timer.person,
        minutes: timer.minutes,
        seconds: timer.seconds
    }

    const response = await fetch("/api/timers/start", {
            method: "Put",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
    
    if (!response.ok) {
        throw new Error();
    }
}

/**
 * Stop the currently active timer.
 */ 
async function onStopTimer() {
    // TODO: Implement API request to stop the current timer.
    const response = await fetch("/api/timers/stop", {
        method: "Put"
    })

    if (!response.ok) {
        throw new Error();
    }
}



/* -------------------------------------------------------------------------
   Utility functions
   ---------------------------------------------------------------------- */

function setConnectionStatus(
    message,
    type = ""
) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = "status";

    if (type) {
        elements.connectionStatus.classList.add(type);
    }
}

function createId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `timer-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}