import React from "react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { fetchExpenses } from "./services/expenseService";
import "./App.css";

const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Bills",
    "Shopping",
    "Health",
    "Other"
];

const icons = {
    Food: "🍜",
    Transport: "🚗",
    Entertainment: "🎬",
    Bills: "💡",
    Shopping: "🛍️",
    Health: "💊",
    Other: "📦"
};

const money = n =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(n);

const today = () => new Date().toISOString().slice(0, 10);

export default function App() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [date, setDate] = useState(today());
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [budget, setBudget] = useState(15000);
    const [budgetInput, setBudgetInput] = useState("15000");
    const [editing, setEditing] = useState(null);
    const [dark, setDark] = useState(false);

    const titleRef = useRef(null);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const data = await fetchExpenses();
                if (active) setExpenses(data);
            } catch (e) {
                console.error(e);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const total = useMemo(
        () => expenses.reduce((s, e) => s + Number(e.amount), 0),
        [expenses]
    );

    const monthTotal = useMemo(() => {
        const now = new Date();

        return expenses
            .filter(e => {
                const d = new Date(e.date + "T00:00:00");
                return (
                    d.getMonth() === now.getMonth() &&
                    d.getFullYear() === now.getFullYear()
                );
            })
            .reduce((s, e) => s + Number(e.amount), 0);
    }, [expenses]);

    const avg = useMemo(
        () => (expenses.length ? total / expenses.length : 0),
        [total, expenses.length]
    );

    const filtered = useMemo(
        () =>
            expenses
                .filter(
                    e =>
                        e.title.toLowerCase().includes(search.toLowerCase()) &&
                        (filter === "All" || e.category === filter)
                )
                .sort((a, b) => b.date.localeCompare(a.date)),
        [expenses, search, filter]
    );

    const categoryTotals = useMemo(
        () =>
            categories
                .map(c => ({
                    name: c,
                    value: expenses
                        .filter(e => e.category === c)
                        .reduce((s, e) => s + Number(e.amount), 0)
                }))
                .filter(x => x.value > 0)
                .sort((a, b) => b.value - a.value),
        [expenses]
    );

    const trend = useMemo(() => {
        const now = new Date();

        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);

            const value = expenses
                .filter(e => {
                    const x = new Date(e.date + "T00:00:00");
                    return (
                        x.getMonth() === d.getMonth() &&
                        x.getFullYear() === d.getFullYear()
                    );
                })
                .reduce((s, e) => s + Number(e.amount), 0);

            return {
                label: d.toLocaleString("en-IN", { month: "short" }),
                value
            };
        });
    }, [expenses]);

    const maxTrend = Math.max(...trend.map(x => x.value), 1);
    const maxCategory = Math.max(...categoryTotals.map(x => x.value), 1);

    const reset = () => {
        setTitle("");
        setAmount("");
        setCategory("Food");
        setDate(today());
        setEditing(null);
        titleRef.current?.focus();
    };

    const save = useCallback(
        e => {
            e.preventDefault();

            if (!title.trim() || !amount || Number(amount) <= 0) return;

            const item = {
                id: editing ?? Date.now(),
                title: title.trim(),
                amount: Number(amount),
                category,
                date
            };

            setExpenses(prev =>
                editing
                    ? prev.map(x => (x.id === editing ? item : x))
                    : [item, ...prev]
            );

            reset();
        },
        [title, amount, category, date, editing]
    );

    const remove = useCallback(
        id => setExpenses(prev => prev.filter(x => x.id !== id)),
        []
    );

    const edit = useCallback(e => {
        setEditing(e.id);
        setTitle(e.title);
        setAmount(String(e.amount));
        setCategory(e.category);
        setDate(e.date);
        titleRef.current?.focus();
    }, []);

    const setBudgetValue = () => {
        const v = Number(budgetInput);
        if (v > 0) setBudget(v);
    };

    const remaining = budget - monthTotal;

    return (
        <div className={`app ${dark ? "dark" : ""}`}>
            <header className="topbar">
                <div className="brand">
                    <div className="logo">₹</div>
                    <div>
                        <strong>Spendly</strong>
                        <small>Personal finance, simplified</small>
                    </div>
                </div>

                <button className="theme" onClick={() => setDark(v => !v)}>
                    {dark ? "☀️ Light mode" : "🌙 Dark mode"}
                </button>
            </header>

            <main className="wrap">
                <section className="hero">
                    <div>
                        <span className="kicker">
                            YOUR FINANCIAL OVERVIEW
                        </span>
                        <h1>Money clarity starts here.</h1>
                        <p>
                            Track spending, build better habits and stay in
                            control.
                        </p>
                    </div>

                    <div className="hero-art">
                        ✦
                        <span>₹</span>
                    </div>
                </section>

                <section className="stats">
                    <article className="stat primary">
                        <span>Total expenses</span>
                        <h2>{money(total)}</h2>
                        <small>Across all records</small>
                        <div className="stat-symbol">↗</div>
                    </article>

                    <article className="stat">
                        <span>This month</span>
                        <h2>{money(monthTotal)}</h2>
                        <small>Spending this month</small>
                        <div className="stat-symbol">▦</div>
                    </article>

                    <article className="stat">
                        <span>Transactions</span>
                        <h2>{expenses.length}</h2>
                        <small>Expense entries</small>
                        <div className="stat-symbol">≋</div>
                    </article>

                    <article className="stat">
                        <span>Average expense</span>
                        <h2>{money(avg)}</h2>
                        <small>Per transaction</small>
                        <div className="stat-symbol">⌁</div>
                    </article>
                </section>

                <section className="insights">
                    <article className="panel budget">
                        <div className="section-head">
                            <div>
                                <h3>Monthly budget</h3>
                                <p>Keep spending within your limit</p>
                            </div>
                            <span className="chip">Budget</span>
                        </div>

                        <div className="budget-row">
                            <div>
                                <small>Spent this month</small>
                                <h2>{money(monthTotal)}</h2>
                            </div>

                            <div className="budget-right">
                                <small>Budget limit</small>
                                <strong>{money(budget)}</strong>
                            </div>
                        </div>

                        <div className="progress">
                            <div
                                style={{
                                    width: `${Math.min(
                                        (monthTotal / budget) * 100,
                                        100
                                    )}%`
                                }}
                            />
                        </div>

                        <div className="budget-foot">
                            <span>{money(Math.max(remaining, 0))} remaining</span>
                            <span>
                                {Math.round((monthTotal / budget) * 100)}% used
                            </span>
                        </div>

                        <div className="budget-edit">
                            <input
                                type="number"
                                value={budgetInput}
                                onChange={e => setBudgetInput(e.target.value)}
                                aria-label="Budget amount"
                            />
                            <button onClick={setBudgetValue}>
                                Update budget
                            </button>
                        </div>

                        {remaining < 0 && (
                            <p className="warning">
                                You've exceeded your budget by{" "}
                                {money(Math.abs(remaining))}.
                            </p>
                        )}
                    </article>

                    <article className="panel chart">
                        <div className="section-head">
                            <div>
                                <h3>Monthly trend</h3>
                                <p>Spending over the last six months</p>
                            </div>
                        </div>

                        <div className="bars">
                            {trend.map((m, i) => (
                                <div className="bar-col" key={i}>
                                    <div className="bar-value">
                                        {m.value ? money(m.value) : ""}
                                    </div>

                                    <div className="bar-track">
                                        <div
                                            className={`bar ${
                                                i === 5 ? "current" : ""
                                            }`}
                                            style={{
                                                height: `${Math.max(
                                                    (m.value / maxTrend) * 100,
                                                    3
                                                )}%`
                                            }}
                                        />
                                    </div>

                                    <span>{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                <section className="lower">
                    <article className="panel categories">
                        <div className="section-head">
                            <div>
                                <h3>Spending by category</h3>
                                <p>Where your money goes</p>
                            </div>
                        </div>

                        {categoryTotals.length === 0 ? (
                            <div className="empty">
                                No category data yet.
                            </div>
                        ) : (
                            categoryTotals.map(c => (
                                <div className="cat-row" key={c.name}>
                                    <div className="cat-title">
                                        <span>
                                            {icons[c.name]} {c.name}
                                        </span>
                                        <strong>{money(c.value)}</strong>
                                    </div>

                                    <div className="cat-track">
                                        <div
                                            style={{
                                                width: `${
                                                    (c.value / maxCategory) *
                                                    100
                                                }%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </article>

                    <article className="panel list-panel">
                        <div className="section-head">
                            <div>
                                <h3>Expense history</h3>
                                <p>Manage your recent transactions</p>
                            </div>
                            <span className="chip">
                                {filtered.length} records
                            </span>
                        </div>

                        <div className="filters">
                            <input
                                placeholder="Search expenses..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />

                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            >
                                <option>All</option>
                                {categories.map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="empty">
                                Loading sample data…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="empty">
                                No expenses found. Try another search.
                            </div>
                        ) : (
                            <div className="expense-list">
                                {filtered.map(e => (
                                    <div className="expense" key={e.id}>
                                        <div className="expense-icon">
                                            {icons[e.category] || "📦"}
                                        </div>

                                        <div className="expense-details">
                                            <strong>{e.title}</strong>
                                            <small>
                                                {e.category} ·{" "}
                                                {new Date(
                                                    e.date + "T00:00:00"
                                                ).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </small>
                                        </div>

                                        <strong className="expense-price">
                                            −{money(e.amount)}
                                        </strong>

                                        <div className="actions">
                                            <button
                                                title="Edit"
                                                onClick={() => edit(e)}
                                            >
                                                ✎
                                            </button>
                                            <button
                                                title="Delete"
                                                onClick={() => remove(e.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                </section>

                <section className="panel form-panel">
                    <div className="section-head">
                        <div>
                            <h3>
                                {editing ? "Edit expense" : "Add an expense"}
                            </h3>
                            <p>
                                {editing
                                    ? "Update transaction details"
                                    : "Add a transaction to your tracker"}
                            </p>
                        </div>

                        <span className="chip">
                            {editing ? "Editing" : "New entry"}
                        </span>
                    </div>

                    <form className="expense-form" onSubmit={save}>
                        <div className="field">
                            <label>Expense name</label>
                            <input
                                ref={titleRef}
                                placeholder="e.g. Dinner, groceries…"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Amount (₹)</label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                placeholder="0"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <label>Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {categories.map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <button className="submit" type="submit">
                            {editing ? "Save changes" : "＋ Add expense"}
                        </button>

                        {editing && (
                            <button
                                className="cancel"
                                type="button"
                                onClick={reset}
                            >
                                Cancel edit
                            </button>
                        )}
                    </form>
                </section>

                <footer>
                    Spendly · Simple personal expense tracking
                </footer>
            </main>
        </div>
    );
}