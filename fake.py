from pymongo import MongoClient
from datetime import datetime, timedelta
from bson import ObjectId

# Connect to MongoDB
client = MongoClient("mongodb+srv://namansurana32:yA0gz5O0O1SvuHDr@cluster0.jbhzh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["test"]
sales_col = db["sales"]
stats_col = db["statistics"]

now = datetime.now()
cost_price = 30000
selling_price = 150000
quantity = 1

print("🚀 Inserting high-value sales and statistics (excluding March and April)...\n")

inserted_count = 0

for i in range(12):
    # 5th of the month N months ago
    sale_date = datetime(now.year, now.month, 9) - timedelta(days=30 * i)

    # Skip March (3) and April (4)
    if sale_date.month in [2, 3]:
        print(f"⏩ Skipped {sale_date.strftime('%B %Y')} (month {sale_date.month})")
        continue

    date_str = sale_date.strftime("%Y-%m-%d")

    product = {
        "product_id": ObjectId(),
        "quantity": quantity,
        "unit_price": cost_price,
        "discount": 0,
        "selling_price": selling_price,
        "cost_price": cost_price
    }

    sale_document = {
        "products": [product],
        "total_price": selling_price,
        "final_discount": 0,
        "payment_method": "Card",
        "customer_mobile": "9876543210",
        "bill_generated": True,
        "createdAt": sale_date,
        "updatedAt": sale_date,
        "__v": 0
    }

    # Insert into sales
    result = sales_col.insert_one(sale_document)

    # Calculate stats
    total_revenue = product["selling_price"] * product["quantity"]
    total_profit = (product["selling_price"] - product["cost_price"]) * product["quantity"]

    stat_doc = {
        "date": date_str,
        "totalRevenue": total_revenue,
        "totalProfit": total_profit
    }

    # Insert into statistics
    stats_col.update_one({ "date": date_str }, { "$set": stat_doc }, upsert=True)

    print(f"✅ Inserted for {date_str} → Revenue ₹{total_revenue}, Profit ₹{total_profit}")
    inserted_count += 1

print(f"\n🎉 Done! Inserted sales & stats for {inserted_count} months (excluding March & April).")
