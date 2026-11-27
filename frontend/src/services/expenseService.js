const sample = [
    {
        id: 1,
        title: "Weekly groceries",
        amount: 1250,
        category: "Food",
        date: "2026-11-24"
    },
    {
        id: 2,
        title: "Netflix subscription",
        amount: 499,
        category: "Entertainment",
        date: "2026-11-23"
    },
    {
        id: 3,
        title: "Uber ride",
        amount: 350,
        category: "Transport",
        date: "2026-11-22"
    },
    {
        id: 4,
        title: "Electricity bill",
        amount: 1800,
        category: "Bills",
        date: "2026-11-20"
    },
    {
        id: 5,
        title: "Coffee with friends",
        amount: 180,
        category: "Food",
        date: "2026-11-19"
    },
    {
        id: 6,
        title: "New headphones",
        amount: 2400,
        category: "Shopping",
        date: "2026-11-17"
    },
    {
        id: 7,
        title: "Pharmacy",
        amount: 650,
        category: "Health",
        date: "2026-11-15"
    },
    {
        id: 8,
        title: "Lunch",
        amount: 420,
        category: "Food",
        date: "2026-11-12"
    }
];

export async function fetchExpenses() {
    return new Promise(resolve => setTimeout(() => resolve(sample), 650));
}