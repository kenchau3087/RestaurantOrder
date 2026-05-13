using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure CORS so React can talk to this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// 2. Configure Database connection
var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "";
var dbName = Environment.GetEnvironmentVariable("DB_NAME") ?? "";
var dbUser = Environment.GetEnvironmentVariable("DB_USER") ?? "";
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "";

// Build the connection string using the values
var connectionString =
    $"Server={dbHost};Database={dbName};User={dbUser};Password={dbPassword};";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();
app.UseCors("AllowReact");

// 3. API Endpoints

// GET: Fetch the menu
app.MapGet("/api/menu", async (AppDbContext db) =>
    await db.MenuItems.ToListAsync());

// POST: Submit a new order
app.MapPost("/api/orders", async (Order order, AppDbContext db) =>
{
    order.OrderTime = DateTime.Now;
    order.Status = "Pending";
    db.Orders.Add(order);
    await db.SaveChangesAsync();
    return Results.Created($"/api/orders/{order.Id}", order);
});

// GET: Fetch all active orders (for the kitchen)
app.MapGet("/api/orders", async (AppDbContext db) =>
    await db.Orders.OrderByDescending(o => o.OrderTime).ToListAsync());

// PUT: Update order status (e.g., Pending -> Served)
app.MapPut("/api/orders/{id}/status", async (int id, string status, AppDbContext db) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order == null) return Results.NotFound();

    order.Status = status;
    await db.SaveChangesAsync();
    return Results.Ok(order);
});

app.Run();

// 4. Models and DbContext
public class MenuItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class Order
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int TableNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime OrderTime { get; set; }
    public string Status { get; set; } = "Pending";
    public string Items { get; set; } = string.Empty; // <-- ADD THIS LINE
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
}