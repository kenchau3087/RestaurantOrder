import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api"; // Ensure this matches your backend

// --- KITCHEN VIEW PAGE ---
function KitchenView() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    fetch(`${API_URL}/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, newStatus) => {
    await fetch(`${API_URL}/orders/${id}/status?status=${newStatus}`, {
      method: "PUT",
    });
    fetchOrders();
  };

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#2d3436" }}>👨‍🍳 Kitchen Dashboard</h1>
        <Link
          to="/"
          style={{
            padding: "10px 20px",
            backgroundColor: "#0984e3",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Back to Customer Menu
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {orders.length === 0 ? <p>No orders yet...</p> : null}

        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              borderTop:
                order.status === "Pending"
                  ? "5px solid #ff7675"
                  : "5px solid #00b894",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2>Table: {order.tableNumber}</h2>
            <p>
              <strong>Customer:</strong> {order.customerName}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(order.orderTime).toLocaleTimeString()}
            </p>

            {/* THIS SHOWS THE DISH NAMES */}
            <div
              style={{
                margin: "15px 0",
                padding: "10px",
                backgroundColor: "#f1f2f6",
                borderRadius: "4px",
              }}
            >
              <strong>Order Details:</strong>
              <p
                style={{
                  margin: "5px 0",
                  color: "#e17055",
                  fontWeight: "bold",
                }}
              >
                {order.items}
              </p>
            </div>

            <p>
              <strong>Status:</strong> {order.status}
            </p>

            {order.status === "Pending" && (
              <button
                onClick={() => updateStatus(order.id, "Served")}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#00b894",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Mark as Served ✔️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CUSTOMER VIEW PAGE ---
function CustomerView() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/menu`)
      .then((res) => res.json())
      .then((data) => setMenuItems(data));
  }, []);

  const addToCart = (item) => setCart([...cart, item]);
  const removeFromCart = (indexToRemove) =>
    setCart(cart.filter((_, i) => i !== indexToRemove));
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const submitOrder = async () => {
    if (!customerName || !tableNumber || cart.length === 0)
      return alert("Missing details!");

    // This creates a string like: "Cheeseburger, Fries"
    const itemNames = cart.map((item) => item.name).join(", ");

    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: customerName,
        tableNumber: parseInt(tableNumber),
        totalAmount: cartTotal,
        items: itemNames, // <-- This is the crucial part that sends the dish string!
      }),
    });

    alert("🎉 Order sent to kitchen!");
    setCart([]);
    setCustomerName("");
    setTableNumber("");
  };

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      {/* Menu Section */}
      <div style={{ flex: 2, padding: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>🍽️ Order Here</h1>
          <Link
            to="/kitchen"
            style={{
              padding: "10px 20px",
              backgroundColor: "#e17055",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Kitchen Login
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
              }}
            >
              <h3>{item.name}</h3>
              <p style={{ color: "gray" }}>{item.description}</p>
              <p style={{ fontWeight: "bold", color: "#00b894" }}>
                ${item.price.toFixed(2)}
              </p>
              <button
                onClick={() => addToCart(item)}
                style={{
                  padding: "8px",
                  backgroundColor: "#0984e3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          padding: "40px",
          borderLeft: "1px solid #ddd",
        }}
      >
        <h2>🛒 Cart (${cartTotal.toFixed(2)})</h2>
        {cart.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>{item.name}</span>
            <button
              onClick={() => removeFromCart(index)}
              style={{
                background: "#ff7675",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              X
            </button>
          </div>
        ))}
        <div style={{ marginTop: "20px" }}>
          <input
            placeholder="Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <input
            placeholder="Table Number"
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <button
            onClick={submitOrder}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#00b894",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}

// --- APP ROUTER (Ties it all together) ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerView />} />
        <Route path="/kitchen" element={<KitchenView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
