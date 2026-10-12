
const ADMIN_PASSWORD = "1111";
const STORAGE_KEY = "toti_rewards_app_v1";

const defaultData = {
    points: 0,
    rewards: [
        { id: 1, name: "طلب من اختيارك 🍟", cost: 50, description: "اختاري أكلك المفضل وأنا أجيبهولك." },
        { id: 2, name: "خروجة حلوة 🌷", cost: 100, description: "يوم مميز نختار فيه مكان حلو." },
        { id: 3, name: "هدية مفاجأة 🎁", cost: 200, description: "هدية مخصوص ليكي من أحمد." },
        { id: 4, name: "طلب خاص من توتي 💗", cost: 300, description: "اختاري حاجة نفسك فيها ونتفق عليها." }
    ],
    redemptions: [],
    history: []
};

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return JSON.parse(JSON.stringify(defaultData));

        const parsed = JSON.parse(saved);

        if (
            !parsed ||
            !Number.isFinite(parsed.points) ||
            parsed.points < 0 ||
            !Array.isArray(parsed.rewards) ||
            !Array.isArray(parsed.redemptions) ||
            !Array.isArray(parsed.history)
        ) throw new Error("Invalid data");

        return parsed;
    } catch {
        alert("تعذر قراءة البيانات المحفوظة.");
        return JSON.parse(JSON.stringify(defaultData));
    }
}

let data = loadData();
let isAdmin = false;
let toastTimer;

const $ = id => document.getElementById(id);

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch {
        showToast("تعذر حفظ البيانات.");
        return false;
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showToast(message) {
    const toast = $("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);

    toastTimer = setTimeout(
        () => toast.classList.remove("show"),
        2800
    );
}

function render() {
    if ($("points")) $("points").textContent = data.points;
    if ($("adminPoints")) $("adminPoints").textContent = data.points;

    renderRewards();
    renderRedemptions();
    renderAdminRedemptions();
    renderAdminRewards();
}

function renderRewards() {
    const container = $("rewards");
    if (!container) return;

    if (!data.rewards.length) {
        container.innerHTML =
            '<div class="empty">مفيش مكافآت دلوقتي 💗</div>';
        return;
    }

    container.innerHTML = data.rewards.map(reward => `
        <article class="reward-card">
            <div class="reward-icon">🎁</div>
            <h3>${escapeHTML(reward.name)}</h3>
            <p>${escapeHTML(reward.description)}</p>
            <span class="reward-cost">✨ ${reward.cost} نقطة</span>
            <button class="primary-btn"
                data-redeem="${reward.id}"
                ${data.points < reward.cost ? "disabled" : ""}>
                ${data.points < reward.cost
                    ? "اجمعي نقاط أكتر"
                    : "استبدلي المكافأة 💗"}
            </button>
        </article>
    `).join("");
}

function renderRedemptions() {
    const container = $("redemptions");
    if (!container) return;

    if (!data.redemptions.length) {
        container.innerHTML =
            '<div class="empty">لسه مفيش طلبات استبدال 💌</div>';
        return;
    }

    container.innerHTML = [...data.redemptions].reverse().map(item => `
        <div class="redemption-item">
            <div>
                <strong>${escapeHTML(item.name)}</strong>
                <div class="muted">
                    ${item.cost} نقطة · ${escapeHTML(item.date)}
                </div>
            </div>
            <span class="status">
                ${item.status === "pending"
                    ? "⏳ في انتظار التنفيذ"
                    : item.status === "approved"
                        ? "💗 تم تنفيذ المكافأة"
                        : "تم إلغاء الطلب"}
            </span>
        </div>
    `).join("");
}

function renderAdminRedemptions() {
    const container = $("adminRedemptions");
    if (!container) return;

    if (!data.redemptions.length) {
        container.innerHTML =
            '<div class="empty">مفيش طلبات لحد دلوقتي.</div>';
        return;
    }

    container.innerHTML = [...data.redemptions].reverse().map(item => `
        <div class="admin-request">
            <strong>${escapeHTML(item.name)}</strong>
            <p>${item.cost} نقطة</p>
            <p class="status">
                ${item.status === "pending"
                    ? "⏳ طلب جديد"
                    : item.status === "approved"
                        ? "✅ تم التنفيذ"
                        : "❌ ملغي"}
            </p>

            ${item.status === "pending" ? `
                <button class="primary-btn"
                    data-approve="${item.id}">تم التنفيذ</button>
                <button class="danger-btn"
                    data-cancel="${item.id}">
                    إلغاء واسترجاع النقاط
                </button>
            ` : ""}
        </div>
    `).join("");
}

// عرض المكافآت في لوحة أحمد
function renderAdminRewards() {
    const container = $("adminRewards");
    if (!container) return;

    if (!data.rewards.length) {
        container.innerHTML =
            '<div class="empty">مفيش مكافآت مضافة.</div>';
        return;
    }

    container.innerHTML = data.rewards.map(reward => `
        <div class="admin-request">
            <strong>${escapeHTML(reward.name)}</strong>
            <p>${reward.cost} نقطة</p>
            <p>${escapeHTML(reward.description)}</p>

            <button class="primary-btn"
                data-edit-reward="${reward.id}">
                ✏️ تعديل
            </button>

            <button class="danger-btn"
                data-delete-reward="${reward.id}">
                🗑️ حذف
            </button>
        </div>
    `).join("");
}

// فتح لوحة أحمد
$("adminBtn")?.addEventListener("click", () => {
    $("adminModal")?.classList.remove("hidden");
    $("loginArea")?.classList.remove("hidden");
    $("dashboard")?.classList.add("hidden");

    if ($("loginError")) $("loginError").textContent = "";
    if ($("adminPassword")) $("adminPassword").value = "";
});

// إغلاق اللوحة
$("closeAdmin")?.addEventListener("click", () => {
    $("adminModal")?.classList.add("hidden");
    isAdmin = false;
});

$("adminModal")?.addEventListener("click", event => {
    if (event.target === $("adminModal")) {
        $("adminModal").classList.add("hidden");
        isAdmin = false;
    }
});

// تسجيل الدخول
$("loginForm")?.addEventListener("submit", event => {
    event.preventDefault();

    if ($("adminPassword")?.value !== ADMIN_PASSWORD) {
        if ($("loginError"))
            $("loginError").textContent = "كلمة المرور غير صحيحة.";
        return;
    }

    isAdmin = true;
    $("loginArea")?.classList.add("hidden");
    $("dashboard")?.classList.remove("hidden");
    render();
});

// تسجيل الخروج
$("logoutBtn")?.addEventListener("click", () => {
    isAdmin = false;
    $("adminModal")?.classList.add("hidden");
});

// إضافة نقاط
$("addPoints")?.addEventListener("click", () => {
    if (!isAdmin) return;

    const amount = Number($("pointAmount")?.value);
    const reason = $("pointReason")?.value.trim() || "";

    if (!Number.isSafeInteger(amount) || amount < 1) {
        showToast("اكتب عدد نقاط صحيح.");
        return;
    }

    data.points += amount;
    data.history.push({
        type: "add",
        amount,
        reason,
        date: new Date().toLocaleString("ar-EG")
    });

    if (!saveData()) {
        data.points -= amount;
        data.history.pop();
        return;
    }

    $("pointAmount").value = "";
    $("pointReason").value = "";
    render();
    showToast(`تمت إضافة ${amount} نقطة لتوتي 💗`);
});

// خصم نقاط
$("removePoints")?.addEventListener("click", () => {
    if (!isAdmin) return;

    const amount = Number($("pointAmount")?.value);
    const reason = $("pointReason")?.value.trim() || "";

    if (!Number.isSafeInteger(amount) || amount < 1) {
        showToast("اكتب عدد نقاط صحيح.");
        return;
    }

    if (amount > data.points) {
        showToast("رصيد توتي مش كفاية للخصم.");
        return;
    }

    data.points -= amount;
    data.history.push({
        type: "remove",
        amount,
        reason,
        date: new Date().toLocaleString("ar-EG")
    });

    if (!saveData()) {
        data.points += amount;
        data.history.pop();
        return;
    }

    $("pointAmount").value = "";
    $("pointReason").value = "";
    render();
    showToast(`تم خصم ${amount} نقطة.`);
});

// إضافة مكافأة
$("addReward")?.addEventListener("click", () => {
    if (!isAdmin) return;

    const name = $("rewardName")?.value.trim() || "";
    const cost = Number($("rewardCost")?.value);
    const description =
        $("rewardDescription")?.value.trim() || "";

    if (!name || !Number.isSafeInteger(cost) || cost < 1) {
        showToast("اكتب اسم المكافأة وسعرها بالنقاط.");
        return;
    }

    const reward = {
        id: Date.now(),
        name,
        cost,
        description: description || "مكافأة مخصوصة لتوتي 💗"
    };

    data.rewards.push(reward);

    if (!saveData()) {
        data.rewards.pop();
        return;
    }

    $("rewardName").value = "";
    $("rewardCost").value = "";
    $("rewardDescription").value = "";

    render();
    showToast("المكافأة الجديدة جاهزة لتوتي 🎁");
});

// استبدال مكافأة
$("rewards")?.addEventListener("click", event => {
    const button = event.target.closest("[data-redeem]");
    if (!button) return;

    const reward = data.rewards.find(
        item => item.id === Number(button.dataset.redeem)
    );

    if (!reward) return;

    if (data.points < reward.cost) {
        showToast("لسه محتاجة تجمعي نقاط أكتر 💗");
        return;
    }

    if (!confirm(
        `تأكيد استبدال "${reward.name}" مقابل ${reward.cost} نقطة؟`
    )) return;

    const oldPoints = data.points;

    const request = {
        id: Date.now(),
        name: reward.name,
        cost: reward.cost,
        date: new Date().toLocaleString("ar-EG"),
        status: "pending"
    };

    data.points -= reward.cost;
    data.redemptions.push(request);

    if (!saveData()) {
        data.points = oldPoints;
        data.redemptions.pop();
        return;
    }

    render();
    showToast("طلبك وصل لأحمد 💌");
});

// اعتماد أو إلغاء طلب
$("adminRedemptions")?.addEventListener("click", event => {
    if (!isAdmin) return;

    const approveButton = event.target.closest("[data-approve]");
    const cancelButton = event.target.closest("[data-cancel]");

    if (!approveButton && !cancelButton) return;

    const id = Number(
        approveButton
            ? approveButton.dataset.approve
            : cancelButton.dataset.cancel
    );

    const request = data.redemptions.find(item => item.id === id);

    if (!request || request.status !== "pending") return;

    if (approveButton) {
        request.status = "approved";

        if (!saveData()) {
            request.status = "pending";
            return;
        }

        render();
        showToast("تم تسجيل تنفيذ المكافأة 💗");
        return;
    }

    data.points += request.cost;
    request.status = "cancelled";

    if (!saveData()) {
        data.points -= request.cost;
        request.status = "pending";
        return;
    }

    render();
    showToast("تم إلغاء الطلب وإرجاع النقاط لتوتي.");
});

// تعديل أو حذف مكافأة
$("adminRewards")?.addEventListener("click", event => {
    if (!isAdmin) return;

    const editButton = event.target.closest("[data-edit-reward]");
    const deleteButton = event.target.closest("[data-delete-reward]");

    if (editButton) {
        const reward = data.rewards.find(
            item => item.id === Number(editButton.dataset.editReward)
        );

        if (!reward) return;

        const name = prompt("اسم المكافأة:", reward.name);
        if (name === null || !name.trim()) return;

        const costText = prompt("عدد النقاط:", reward.cost);
        if (costText === null) return;

        const cost = Number(costText);

        if (!Number.isSafeInteger(cost) || cost < 1) {
            showToast("اكتب عدد نقاط صحيح.");
            return;
        }

        const description = prompt(
            "وصف المكافأة:",
            reward.description
        );

        if (description === null) return;

        const oldReward = { ...reward };

        Object.assign(reward, {
            name: name.trim(),
            cost,
            description: description.trim()
        });

        if (!saveData()) {
            Object.assign(reward, oldReward);
            return;
        }

        render();
        showToast("تم تعديل المكافأة 💗");
        return;
    }

    if (deleteButton) {
        const index = data.rewards.findIndex(
            item => item.id === Number(deleteButton.dataset.deleteReward)
        );

        if (index < 0) return;

        if (!confirm("متأكد إنك عايز تحذف المكافأة؟")) return;

        const removed = data.rewards.splice(index, 1)[0];

        if (!saveData()) {
            data.rewards.splice(index, 0, removed);
            return;
        }

        render();
        showToast("تم حذف المكافأة.");
    }
});

// تشغيل الموقع
render();
