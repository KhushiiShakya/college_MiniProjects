<script>
        let account = {};
        let expenses = [];

        async function loadAccount() {
            const res = await fetch("/api/account");
            account = await res.json();
            document.getElementById("accName").innerText = account.name;
            document.getElementById("accEmail").innerText = account.email;
            document.getElementById("balanceDisplay").innerText = account.balance.toFixed(2);
            updateRemaining();
        }

        async function loadExpenses() {
            const res = await fetch("/api/expenses");
            expenses = await res.json();
            renderTable();
        }

        function renderTable() {
            const table = document.getElementById("expenseTable");
            table.innerHTML = "";
            let total = 0;
            expenses.forEach((e, idx) => {
                const row = table.insertRow();
                row.insertCell(0).innerText = e.description;
                row.insertCell(1).innerText = e.category;
                row.insertCell(2).innerText = "₹ " + e.amount.toFixed(2);

                const editCell = row.insertCell(3);
                const editBtn = document.createElement("button");
                editBtn.innerText = "Edit";
                editBtn.style.background = "#457b9d";
                editBtn.style.color = "white";
                editBtn.onclick = async () => {
                    const input = document.createElement("input");
                    input.type = "number";
                    input.value = e.amount;
                    input.style.width = "80px";
                    row.cells[2].innerHTML = "";
                    row.cells[2].appendChild(input);
                    input.focus();
                    input.onblur = async () => {
                        const newAmount = parseFloat(input.value);
                        if (isNaN(newAmount) || newAmount < 0) {
                            renderTable();
                            return;
                        }
                        await fetch(`/api/expense/${idx}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ amount: newAmount }),
                        });
                        await loadExpenses();
                    };
                };
                editCell.appendChild(editBtn);

                const delCell = row.insertCell(4);
                const delBtn = document.createElement("button");
                delBtn.innerText = "Delete";
                delBtn.style.background = "#e63946";
                delBtn.style.color = "white";
                delBtn.onclick = async () => {
                    await fetch(`/api/expense/${idx}`, { method: "DELETE" });
                    await loadExpenses();
                };
                delCell.appendChild(delBtn);

                total += e.amount;
            });
            document.getElementById("totalExpense").innerText = total.toFixed(2);
            updateRemaining(total);
        }

        async function setBalance() {
            const bal = parseFloat(document.getElementById("initialBalance").value) || 0;
            const res = await fetch("/api/balance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ balance: bal }),
            });
            if (res.ok) {
                await loadAccount();
            }
        }

        async function addExpense() {
            const description = document.getElementById("description").value;
            const category = document.getElementById("category").value;
            const amount = parseFloat(document.getElementById("amount").value);
            if (!description || !category || isNaN(amount) || amount < 0) return alert("Enter valid details");

            await fetch("/api/expense", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, category, amount }),
            });
            document.getElementById("description").value = "";
            document.getElementById("category").value = "";
            document.getElementById("amount").value = "";
            await loadExpenses();
        }

        function updateRemaining(total = 0) {
            const bal = account.balance || 0;
            document.getElementById("remainingBalance").innerText = (bal - total).toFixed(2);
        }

        // Menu toggle
        function toggleMenu() {
            const menu = document.getElementById("menu");
            menu.style.display = menu.style.display === "flex" ? "none" : "flex";
        }
        function showSection(sectionId) {
            document.querySelectorAll(".section").forEach(s => s.style.display = "none");
            document.getElementById(sectionId).style.display = "block";
            if (window.innerWidth <= 768) toggleMenu();
        }
        function logout() {
            alert("Logged out!");
            location.reload();
        }

        // Init
        loadAccount();
        loadExpenses();
    </script>