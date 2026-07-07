console.log("Bulk Delete Loaded");

if (document.getElementById("gptBulkPanel")) {
    document.getElementById("gptBulkPanel").remove();
} else {
    init();
}
function init() {

    const panel = document.createElement("div");
    panel.id = "gptBulkPanel";

    panel.innerHTML = `
        <h3>🗑️ Bulk Delete</h3>

        <button id="scanChats">
            🔄 Scan Chats
        </button>

        <button id="selectAll">
            ✅ Select All
        </button>

        <button id="deleteSelected">
            🗑 Delete Selected
        </button>

        <div id="chatCount">
            Found : 0
        </div>

        <div id="progressText"></div>

        <div id="progressBar" style="
            display:none;
            width:100%;
            height:8px;
            margin-top:10px;
            background:#444;
            border-radius:999px;
            overflow:hidden;
        ">
            <div id="progressFill" style="
                width:0%;
                height:100%;
                background:#10a37f;
                transition:width .2s;
            "></div>
        </div>

        <div style="
            margin-top:14px;
            padding:10px;
            border-radius:10px;
            background:rgba(255,255,255,.05);
            border:1px solid rgba(255,255,255,.08);
            font-size:12px;
            line-height:1.45;
            color:#cfcfcf;
        ">
            <strong>⚠️ During deletion:</strong>
            <ul style="margin:8px 0 0 18px;padding:0;">
                <li>Keep this ChatGPT tab active.</li>
                <li>Don't switch tabs or windows.</li>
                <li>Don't scroll or click anywhere.</li>
                <li>Don't refresh or close the page.</li>
                <li>Wait until the progress bar shows <b>Finished</b>.</li>
                <li>Deleted chats cannot be recovered.</li>
            </ul>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById("scanChats").onclick = scanChats;
    document.getElementById("selectAll").onclick = selectAll;
    document.getElementById("deleteSelected").onclick = deleteSelected;
}

function scanChats() {

    // Remove old checkboxes
    document.querySelectorAll(".gptCheckbox").forEach(box => {
        box.remove();
    });

    const rows = document.querySelectorAll(
        '[data-sidebar-item="true"]'
    );

    let count = 0;

    rows.forEach(row => {

        // Don't add twice
        if (row.querySelector(".gptCheckbox"))
            return;

        const box = document.createElement("input");

        box.type = "checkbox";
        box.className = "gptCheckbox";

        Object.assign(box.style, {
            width: "18px",
            height: "18px",
            marginRight: "10px",
            accentColor: "#10a37f",
            cursor: "pointer",
            flexShrink: "0",
            zIndex: "99999",
            position: "relative"
        });

        // Prevent opening the chat
        ["click", "mousedown", "mouseup"].forEach(evt => {
            box.addEventListener(evt, e => {
                e.stopPropagation();
            });
        });

        // Insert before the first child
        row.insertBefore(box, row.firstChild);

        count++;
    });

    document.getElementById("chatCount").textContent =
        `Found : ${count}`;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function selectAll() {

    document
        .querySelectorAll(".gptCheckbox")
        .forEach(box => box.checked = true);

}

function updateProgress(current, total) {

    const percent = Math.round((current / total) * 100);

    document.getElementById("progressBar").style.display = "block";

    document.getElementById("progressFill").style.width =
        percent + "%";

    document.getElementById("progressText").textContent =
        `Deleting ${current} / ${total}`;
}

async function deleteSelected() {

    // Collect selected conversation IDs first
    const ids = [];

    document.querySelectorAll(".gptCheckbox:checked").forEach(box => {

        const row = box.closest("[data-sidebar-item='true']");
        if (!row) return;

        const menuBtn = row.querySelector(
            "[data-conversation-options-trigger]"
        );

        if (!menuBtn) return;

        ids.push(
            menuBtn.getAttribute("data-conversation-options-trigger")
        );
    });

    if (!ids.length) {
        alert("Select chats first.");
        return;
    }

    if (!confirm(
    `Delete ${ids.length} conversations?

    This action cannot be undone.

    During deletion:
    • Keep this ChatGPT tab open.
    • Don't switch tabs or windows.
    • Don't scroll or click anywhere.
    • Wait until the progress bar says Finished.`
    )) {
        return;
    }

    console.log("Deleting", ids.length, "conversations");

    for (let i = 0; i < ids.length; i++) {

        const id = ids[i];

        updateProgress(i + 1, ids.length);

        console.log(`Deleting ${i + 1}/${ids.length}`);

        // Wait until sidebar settles
        await sleep(800);

        // Find the row AGAIN after React rerender
        const menuBtn = document.querySelector(
            `[data-conversation-options-trigger="${id}"]`
        );

        if (!menuBtn) {
            console.log("Already gone:", id);
            continue;
        }

        const row = menuBtn.closest(
            "[data-sidebar-item='true']"
        );

        row.scrollIntoView({
            block: "center",
            behavior: "instant"
        });

        await sleep(250 + Math.random() * 250);

        // Hover
        ["mouseenter","mouseover","mousemove"].forEach(type=>{
            row.dispatchEvent(new MouseEvent(type,{
                bubbles:true,
                cancelable:true,
                view:window
            }));
        });

        await sleep(250 + Math.random() * 250);

        // Open menu
        menuBtn.click();

        await sleep(350 + Math.random() * 250);

        // Click Delete
        const deleteItem =
            [...document.querySelectorAll('[role="menuitem"]')]
            .find(el => el.textContent.trim() === "Delete");

        if (!deleteItem) {
            console.log("Delete menu not found");
            continue;
        }

        deleteItem.click();

        await sleep(400 + Math.random() * 250);

        // Confirm
        const confirmBtn = document.querySelector(
            '[data-testid="delete-conversation-confirm-button"]'
        );

        if (!confirmBtn) {
            console.log("Confirm button missing");
            continue;
        }

        confirmBtn.click();

        console.log("Deleted");

        // Wait for React to finish
        await sleep(1800 + Math.random() * 1200);
    }

    document.getElementById("progressText").textContent =
        "✅ Finished";

    document.getElementById("progressFill").style.width = "100%";

    console.log("Finished");
}