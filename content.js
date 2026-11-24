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

        <button id="scanChats">🔄 Scan Chats</button>
        <button id="selectAll">✅ Select All</button>
        <button id="deleteSelected">🗑 Delete Selected</button>

        <div id="chatCount">Found: 0</div>
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

// --------------------------------------------------
// 1. SCAN CHATS
// --------------------------------------------------

function scanChats() {
  document.querySelectorAll(".gptCheckbox").forEach((box) => box.remove());

  const candidates = document.querySelectorAll(
    '[data-sidebar-cycle-item][role="group"]',
  );

  const rows = [...new Set(candidates)].filter((row) => {
    const href =
      row
        .querySelector('a[data-interactive-row-link="true"]')
        ?.getAttribute("href") || "";

    return /^\/c\/[^/?#]+/.test(href);
  });

  let count = 0;

  rows.forEach((row) => {
    if (row.querySelector(".gptCheckbox")) return;

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "gptCheckbox";
    checkbox.setAttribute("aria-label", "Select conversation");

    const styles = {
      appearance: "auto",
      display: "inline-block",
      visibility: "visible",
      opacity: "1",
      position: "relative",
      zIndex: "2",
      width: "18px",
      height: "18px",
      minWidth: "18px",
      minHeight: "18px",
      margin: "0 10px 0 0",
      padding: "0",
      accentColor: "#10a37f",
      cursor: "pointer",
      flex: "0 0 18px",
      pointerEvents: "auto",
    };

    Object.entries(styles).forEach(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

      checkbox.style.setProperty(cssKey, value, "important");
    });

    ["click", "mousedown", "mouseup", "pointerdown", "pointerup"].forEach(
      (eventName) => {
        checkbox.addEventListener(eventName, (event) => {
          event.stopPropagation();
        });
      },
    );

    const container = row.querySelector(":scope > div > div.flex");

    if (!container) return;

    container.insertBefore(checkbox, container.firstChild);

    count++;
  });

  const countElement = document.getElementById("chatCount");

  if (countElement) {
    countElement.textContent = count
      ? `Found: ${count}`
      : "Found: 0 — expand the sidebar and try again.";
  }

  console.log("[ChatSweep] Scan complete:", {
    candidateLinks: candidates.length,
    conversationRows: rows.length,
    checkboxesAdded: count,
  });
}

// --------------------------------------------------
// 2. SELECT ALL
// --------------------------------------------------

function selectAll() {
  document
    .querySelectorAll(".gptCheckbox")
    .forEach((box) => (box.checked = true));
}

// --------------------------------------------------
// 3. HELPERS
// --------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min = 500, max = 1200) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;

  return sleep(delay);
}

async function waitUntil(callback, timeout = 5000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = callback();

    if (result) return result;

    await sleep(100);
  }

  return null;
}

function updateProgress(current, total) {
  const percent = Math.round((current / total) * 100);

  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");

  if (progressBar) {
    progressBar.style.display = "block";
  }

  if (progressFill) {
    progressFill.style.width = percent + "%";
  }

  const progressText = document.getElementById("progressText");

  if (progressText) {
    progressText.textContent = `Deleting ${current} / ${total}`;
  }
}

// --------------------------------------------------
// 4. FIND CHAT
// --------------------------------------------------

function findChat(id) {
  return [
    ...document.querySelectorAll('[data-sidebar-cycle-item][role="group"]'),
  ].find((chat) => {
    const link = chat.querySelector('a[data-interactive-row-link="true"]');

    return link?.getAttribute("href") === `/c/${id}`;
  });
}

// --------------------------------------------------
// 5. MAIN DELETE WORKFLOW
// --------------------------------------------------

async function deleteSelected() {
  // Collect selected conversation IDs
  const selected = [...document.querySelectorAll(".gptCheckbox:checked")];

  const ids = selected
    .map((box) => {
      const chat = box.closest('[data-sidebar-cycle-item][role="group"]');

      const link = chat?.querySelector('a[data-interactive-row-link="true"]');

      return link?.getAttribute("href")?.match(/^\/c\/([^/?#]+)/)?.[1];
    })
    .filter(Boolean);

  const uniqueIds = [...new Set(ids)];

  if (!uniqueIds.length) {
    alert("No conversations selected.");
    return;
  }

  // Initial confirmation
  if (
    !confirm(
      `Delete ${uniqueIds.length} selected conversations?\n\nThis cannot be undone.`,
    )
  ) {
    return;
  }

  let deleted = 0;
  let failed = 0;

  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");

  if (progressBar) {
    progressBar.style.display = "block";
  }

  // Process conversations sequentially
  for (let i = 0; i < uniqueIds.length; i++) {
    const id = uniqueIds[i];
    let stage = "finding chat";

    try {
      console.log(`[ChatSweep] Processing ${i + 1}/${uniqueIds.length}`, id);

      // ------------------------------------------
      // STEP 1: FIND CHAT
      // ------------------------------------------

      let chat = findChat(id);

      if (!chat) {
        throw new Error("Conversation not found");
      }

      // ------------------------------------------
      // STEP 2: SCROLL INTO VIEW
      // ------------------------------------------

      stage = "scrolling";

      chat.scrollIntoView({
        block: "center",
        behavior: "instant",
      });

      await randomDelay(400, 800);

      // ------------------------------------------
      // STEP 3: FIND THREE-DOT BUTTON
      // ------------------------------------------

      stage = "finding chat actions";

      chat = findChat(id);

      const actionButton = chat?.querySelector(
        'button[aria-label="Chat actions"]',
      );

      if (!actionButton) {
        throw new Error("Three-dot button not found");
      }

      // ------------------------------------------
      // STEP 4: OPEN THREE-DOT MENU
      // EXACT WORKING METHOD: .click()
      // ------------------------------------------

      stage = "opening chat actions";

      actionButton.click();

      await sleep(800);

      console.log("[ChatSweep] Menu opened.");

      // ------------------------------------------
      // STEP 5: FIND VISIBLE DELETE OPTION
      // SEARCH ALL MENU CONTAINERS
      // ------------------------------------------

      stage = "finding Delete";

      const deleteItem = await waitUntil(() =>
        [
          ...document.querySelectorAll('[role="menu"] *, [role="menuitem"]'),
        ].find(
          (el) =>
            el.textContent.trim().toLowerCase() === "delete" &&
            el.getClientRects().length > 0,
        ),
      );

      if (!deleteItem) {
        throw new Error("Delete option not found");
      }

      console.log("[ChatSweep] Found Delete option:", deleteItem);

      await randomDelay(300, 600);

      // ------------------------------------------
      // STEP 6: CLICK DELETE
      // ------------------------------------------

      stage = "clicking Delete";

      deleteItem.click();

      console.log("[ChatSweep] Delete selected.");

      // ------------------------------------------
      // STEP 7: WAIT FOR CONFIRMATION DIALOG
      // ------------------------------------------

      stage = "waiting for Delete chat popup";

      const finalDeleteButton = await waitUntil(() =>
        [...document.querySelectorAll('button[type="submit"]')].find(
          (button) =>
            button.textContent.trim() === "Delete chat" &&
            !button.disabled &&
            button.getAttribute("aria-disabled") !== "true" &&
            button.getClientRects().length > 0,
        ),
      );

      if (!finalDeleteButton) {
        throw new Error("Delete chat confirmation not found");
      }

      console.log("[ChatSweep] Confirmation dialog opened.");

      await randomDelay(400, 800);

      // ------------------------------------------
      // STEP 8: CLICK FINAL DELETE CHAT
      // EXACT WORKING METHOD: .click()
      // ------------------------------------------

      stage = "clicking Delete chat";

      finalDeleteButton.click();

      console.log("[ChatSweep] Final Delete chat clicked.");

      // ------------------------------------------
      // STEP 9: VERIFY DELETION
      // ------------------------------------------

      stage = "verifying deletion";

      const removed = await waitUntil(() => !findChat(id), 7000);

      if (!removed) {
        throw new Error("Conversation still appears in sidebar");
      }

      deleted++;

      console.log("[ChatSweep] Deleted successfully:", id);
    } catch (error) {
      failed++;

      console.error(`[ChatSweep] Failed at "${stage}" for ${id}:`, error);
    }

    // ------------------------------------------
    // STEP 10: UPDATE PROGRESS
    // ------------------------------------------

    const percent = Math.round(((i + 1) / uniqueIds.length) * 100);

    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent =
        `Processed ${i + 1}/${uniqueIds.length} | ` +
        `Deleted: ${deleted} | Failed: ${failed}`;
    }

    await randomDelay(600, 1100);
  }

  // ----------------------------------------------
  // STEP 11: FINISH
  // ----------------------------------------------

  if (progressText) {
    progressText.textContent = `Finished! Deleted: ${deleted} | Failed: ${failed}`;
  }

  if (progressFill) {
    progressFill.style.width = "100%";
  }

  console.log("[ChatSweep] Final result:", {
    total: uniqueIds.length,
    deleted,
    failed,
  });
}
